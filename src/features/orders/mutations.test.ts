import { waitFor } from "@testing-library/vue"
import { afterEach, describe, expect, test } from "vitest"

import type { Order } from "@/domain/order"
import type { OrdersPage } from "@/domain/order-query"
import { actionsForStatus, type OrderAction } from "@/domain/order-status"
import { makeOrder } from "@/test/factories"
import { createTestQueryClient, runInSetup } from "@/test/render"

import { useCollectPayment, useUpdateOrderStatus } from "./mutations"
import { ordersKeys } from "./queries"

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

/**
 * Stub fetch with a response the test releases when it's ready. Releasing
 * before the request is even sent is fine: the response waits for it.
 */
function holdNextResponse() {
  let release: ((response: Response) => void) | undefined
  let queued: Response | undefined
  globalThis.fetch = () =>
    new Promise<Response>((resolve) => {
      if (queued) resolve(queued)
      else release = resolve
    })

  const send = (response: Response) => {
    if (release) release(response)
    else queued = response
  }
  return {
    succeed: (body: Order) => send(jsonResponse(body)),
    fail: () => send(jsonResponse({ message: "Server down." }, 500)),
  }
}

function actionTo(order: Order, label: string): OrderAction {
  const action = actionsForStatus(order.status).find((a) => a.label === label)
  if (!action) throw new Error(`${order.status} has no ${label} action`)
  return action
}

function setup() {
  const queryClient = createTestQueryClient()
  const first = makeOrder({ status: "New" })
  const second = makeOrder({ status: "Acknowledged" })
  const listKey = ordersKeys.list(first.hotelId, {})
  queryClient.setQueryData<OrdersPage>(listKey, {
    items: [first, second],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  })

  const mutation = runInSetup(() => useUpdateOrderStatus(), queryClient)

  const statusOf = (id: string) =>
    queryClient
      .getQueryData<OrdersPage>(listKey)
      ?.items.find((item) => item.id === id)?.status

  const setStatus = (id: string, status: Order["status"]) =>
    queryClient.setQueryData<OrdersPage>(
      listKey,
      (page) =>
        page && {
          ...page,
          items: page.items.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }
    )

  return { mutation, first, second, statusOf, setStatus }
}

describe("useUpdateOrderStatus", () => {
  test("an optimistic action shows at once and rolls back only its own order", async () => {
    const response = holdNextResponse()
    const { mutation, first, second, statusOf, setStatus } = setup()

    mutation.mutate({ order: first, action: actionTo(first, "Acknowledge") })
    await waitFor(() => expect(statusOf(first.id)).toBe("Acknowledged"))

    // Meanwhile another change lands on a different order.
    setStatus(second.id, "In Progress")

    response.fail()
    await waitFor(() => expect(mutation.isError.value).toBe(true))

    expect(statusOf(first.id)).toBe("New")
    expect(statusOf(second.id)).toBe("In Progress")
  })

  test("a confirmed action leaves the cache alone until the server answers", async () => {
    const response = holdNextResponse()
    const { mutation, first, statusOf } = setup()

    mutation.mutate({ order: first, action: actionTo(first, "Cancel") })
    await waitFor(() => expect(mutation.isPending.value).toBe(true))
    expect(statusOf(first.id)).toBe("New")

    response.succeed({ ...first, status: "Cancelled" })
    await waitFor(() => expect(statusOf(first.id)).toBe("Cancelled"))
  })

  test("a failed confirmed action changes nothing it has to undo", async () => {
    const response = holdNextResponse()
    const { mutation, first, statusOf } = setup()

    mutation.mutate({ order: first, action: actionTo(first, "Cancel") })
    response.fail()
    await waitFor(() => expect(mutation.isError.value).toBe(true))

    expect(statusOf(first.id)).toBe("New")
    expect(mutation.error.value?.message).toBe("Server down.")
  })
})

describe("useCollectPayment", () => {
  function setupDeclined() {
    const queryClient = createTestQueryClient()
    const declined = makeOrder({ paymentStatus: "Failed", amount: 40 })
    const listKey = ordersKeys.list(declined.hotelId, {})
    queryClient.setQueryData<OrdersPage>(listKey, {
      items: [declined],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })
    const mutation = runInSetup(() => useCollectPayment(), queryClient)
    const paymentOf = () =>
      queryClient.getQueryData<OrdersPage>(listKey)?.items[0]?.paymentStatus
    return { mutation, declined, paymentOf }
  }

  test("shows the payment as collected at once and keeps the server's answer", async () => {
    const response = holdNextResponse()
    const { mutation, declined, paymentOf } = setupDeclined()

    mutation.mutate({ order: declined })
    await waitFor(() => expect(paymentOf()).toBe("Paid"))

    response.succeed({ ...declined, paymentStatus: "Paid" })
    await waitFor(() => expect(mutation.isSuccess.value).toBe(true))
    expect(paymentOf()).toBe("Paid")
  })

  test("puts the declined payment back when the server refuses", async () => {
    const response = holdNextResponse()
    const { mutation, declined, paymentOf } = setupDeclined()

    mutation.mutate({ order: declined })
    await waitFor(() => expect(paymentOf()).toBe("Paid"))

    response.fail()
    await waitFor(() => expect(mutation.isError.value).toBe(true))
    expect(paymentOf()).toBe("Failed")
  })
})
