import { screen, waitFor } from "@testing-library/vue"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { defineComponent, h } from "vue"

import { renderInHotel } from "@/test/render"

import OrdersToolbar from "./OrdersToolbar.vue"
import { useOrdersSearchParams } from "./use-orders-search-params"

/** The toolbar wired to the URL exactly as OrdersPage wires it. */
const ToolbarWithUrlState = defineComponent({
  setup() {
    const { params, setParams, clearFilters, activeFilterCount } =
      useOrdersSearchParams()

    return () => [
      h(OrdersToolbar, {
        params: params.value,
        activeFilterCount: activeFilterCount.value,
        onParamsChange: setParams,
        onClearFilters: clearFilters,
      }),
      h(
        "button",
        { type: "button", onClick: () => setParams({ status: "New" }) },
        "Only new"
      ),
    ]
  },
})

const renderToolbar = (path?: string) =>
  renderInHotel(() => h(ToolbarWithUrlState), { path })

const searchBox = () =>
  screen.findByRole("textbox", { name: "Search guest, order ID, or room" })

describe("orders search and URL state", () => {
  test("a trailing space survives the debounced URL update", async () => {
    const user = userEvent.setup()
    const { router } = await renderToolbar()
    const input = await searchBox()

    await user.type(input, "Maya ")
    await waitFor(() =>
      expect(router.currentRoute.value.query).toEqual({ search: "Maya" })
    )

    // The URL holds the trimmed term, but the box keeps what was typed,
    // so the next word lands after the space: "Maya Chen", not "MayaChen".
    expect(input).toHaveValue("Maya ")
    await user.type(input, "Chen")
    expect(input).toHaveValue("Maya Chen")
  })

  test("typing replaces the history entry instead of adding one", async () => {
    const user = userEvent.setup()
    const { router } = await renderToolbar()
    const replace = vi.spyOn(router, "replace")
    const push = vi.spyOn(router, "push")

    await user.type(await searchBox(), "Ollie")
    await waitFor(() =>
      expect(router.currentRoute.value.query).toEqual({ search: "Ollie" })
    )

    expect(replace).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  test("a filter change pushes history and resets the page", async () => {
    const user = userEvent.setup()
    const { router } = await renderToolbar("/hotels/harborline/orders?page=3")
    const replace = vi.spyOn(router, "replace")
    const push = vi.spyOn(router, "push")

    await user.click(await screen.findByRole("button", { name: "Only new" }))

    await waitFor(() =>
      expect(router.currentRoute.value.query).toEqual({ status: "New" })
    )
    expect(push).toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  test("an outside URL change, like Back, replaces the search box", async () => {
    const { router } = await renderToolbar(
      "/hotels/harborline/orders?search=Priya"
    )
    const input = await searchBox()
    expect(input).toHaveValue("Priya")

    await router.push("/hotels/harborline/orders?search=Jonas")
    await waitFor(() => expect(input).toHaveValue("Jonas"))
  })
})
