import { render, screen } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { h } from "vue"

import EmptyState from "./EmptyState.vue"

describe("EmptyState", () => {
  test("fires the action's callback when clicked", async () => {
    let called = false
    const user = userEvent.setup()

    render(EmptyState, {
      props: { title: "No orders yet" },
      slots: {
        action: () =>
          h("button", { onClick: () => (called = true) }, "Clear filters"),
      },
    })

    await user.click(screen.getByRole("button", { name: "Clear filters" }))

    expect(called).toBe(true)
  })
})
