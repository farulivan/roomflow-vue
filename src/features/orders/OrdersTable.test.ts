import { screen, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { h } from "vue"

import { makeOrder } from "@/test/factories"
import { renderInHotel } from "@/test/render"

import ConfirmActionProvider from "./ConfirmActionProvider.vue"
import OrdersTable from "./OrdersTable.vue"

const now = new Date(2026, 2, 14, 12, 5, 0)

async function renderTable() {
  const order = makeOrder({ status: "New", guestName: "Maya Chen" })
  const view = await renderInHotel(() =>
    h(ConfirmActionProvider, null, () =>
      h(OrdersTable, { orders: [order], now })
    )
  )
  return { order, ...view }
}

describe("OrdersTable row", () => {
  test("clicking a row opens that order's details", async () => {
    const user = userEvent.setup()
    const { order, router } = await renderTable()

    await user.click(await screen.findByText("Maya Chen"))

    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe(
        `/hotels/harborline/orders/${order.id}`
      )
    )
  })

  test("typing a cancel reason from the row menu stays on the list", async () => {
    // An open menu or dialog marks the page behind it with
    // pointer-events: none; happy-dom can't resolve the overrides on top.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const { order, router } = await renderTable()

    await user.click(
      await screen.findByRole("button", { name: `Actions for ${order.id}` })
    )
    await user.click(await screen.findByRole("menuitem", { name: "Cancel" }))

    const reason = await screen.findByLabelText("Reason (optional)")
    await user.click(reason)
    await user.type(reason, "Guest changed plans")

    expect(reason).toHaveValue("Guest changed plans")
    expect(router.currentRoute.value.path).toBe("/hotels/harborline/orders")
  })
})
