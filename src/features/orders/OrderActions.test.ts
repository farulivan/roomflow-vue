import { screen } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { h } from "vue"
import type { VNodeChild } from "vue"

import type { Order } from "@/domain/order"
import { makeOrder } from "@/test/factories"
import { renderInHotel } from "@/test/render"

import ConfirmActionProvider from "./ConfirmActionProvider.vue"
import OrderActions from "./OrderActions.vue"

/**
 * These tests prove which actions render for a given status and that a
 * destructive one asks first. Nothing here lets a request through, so no
 * mock API is needed.
 */
function renderActions(
  order: Order,
  variant: "detail" | "row",
  before?: VNodeChild
) {
  return renderInHotel(() =>
    h(ConfirmActionProvider, null, () => [
      before,
      h(OrderActions, { order, variant }),
    ])
  )
}

describe("OrderActions", () => {
  test("New orders offer exactly Acknowledge and Cancel", async () => {
    await renderActions(makeOrder({ status: "New" }), "detail")

    expect(
      await screen.findByRole("button", { name: "Acknowledge" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    expect(screen.getAllByRole("button")).toHaveLength(2)
  })

  test("a final status offers no actions, only a status message", async () => {
    await renderActions(makeOrder({ status: "Completed" }), "detail")

    expect(
      await screen.findByText("No further actions. This order is Completed.")
    ).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  test("Cancel asks for confirmation instead of running", async () => {
    const user = userEvent.setup()
    const order = makeOrder({ status: "New" })
    await renderActions(order, "detail")

    await user.click(await screen.findByRole("button", { name: "Cancel" }))

    expect(
      await screen.findByRole("alertdialog", {
        name: new RegExp(`Cancel order ${order.id}`),
      })
    ).toBeInTheDocument()
  })

  test("an order with a declined payment asks before acknowledging", async () => {
    const user = userEvent.setup()
    const order = makeOrder({
      status: "New",
      paymentStatus: "Failed",
      amount: 40,
    })
    await renderActions(order, "detail")

    await user.click(await screen.findByRole("button", { name: "Acknowledge" }))

    const dialog = await screen.findByRole("alertdialog", {
      name: new RegExp(`Acknowledge order ${order.id}`),
    })
    expect(dialog).toHaveTextContent("payment was declined")
    // A go-ahead needs no reason; only cancelling and rejecting ask for one.
    expect(screen.queryByLabelText("Reason (optional)")).not.toBeInTheDocument()
  })
})

describe("OrderActions row menu", () => {
  // An open menu marks the page behind it with pointer-events: none;
  // happy-dom can't resolve the override on the menu itself.
  const openMenu = async (orderId: string) => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    await user.click(
      await screen.findByRole("button", { name: `Actions for ${orderId}` })
    )
    return screen.findAllByRole("menuitem")
  }

  test("an open order with a declined payment lists the payment step last", async () => {
    const order = makeOrder({
      status: "New",
      paymentStatus: "Failed",
      amount: 40,
    })
    await renderActions(order, "row")

    const items = await openMenu(order.id)
    expect(items.map((item) => item.textContent.trim())).toEqual([
      "Acknowledge",
      "Cancel",
      "Mark payment collected",
    ])
  })

  test("a delivered order still owed keeps a menu with only the payment step", async () => {
    const order = makeOrder({
      status: "Completed",
      paymentStatus: "Failed",
      amount: 40,
    })
    await renderActions(order, "row")

    const items = await openMenu(order.id)
    expect(items.map((item) => item.textContent.trim())).toEqual([
      "Mark payment collected",
    ])
  })

  test("a paid, completed order has no menu at all", async () => {
    const order = makeOrder({ status: "Completed", paymentStatus: "Paid" })
    await renderActions(order, "row", h("span", "Row rendered"))

    await screen.findByText("Row rendered")
    expect(
      screen.queryByRole("button", { name: `Actions for ${order.id}` })
    ).not.toBeInTheDocument()
  })
})
