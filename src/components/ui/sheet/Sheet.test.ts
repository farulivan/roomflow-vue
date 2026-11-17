import { render, screen, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { h } from "vue"
import { toast } from "vue-sonner"

import { Toaster } from "@/components/ui/sonner"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "."

describe("Sheet", () => {
  test("a toast shown over an open sheet can be closed, and the sheet stays open", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render({
      render: () => [
        h(Toaster, { closeButton: true }),
        h(Sheet, { open: true, "onUpdate:open": onOpenChange }, () =>
          h(SheetContent, null, () => [
            h(SheetTitle, null, () => "HL-1042"),
            h(SheetDescription, null, () => "Order details"),
          ])
        ),
      ],
    })
    toast("Order HL-1042 acknowledged", { duration: Infinity })

    await user.click(await screen.findByRole("button", { name: "Close toast" }))

    // A dismissed toast is marked as removed right away and leaves the
    // page a moment later; either way it no longer counts as showing.
    await waitFor(() =>
      expect(
        document.querySelectorAll(
          "[data-sonner-toast]:not([data-removed='true'])"
        )
      ).toHaveLength(0)
    )
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
