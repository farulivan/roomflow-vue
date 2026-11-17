import { render } from "@testing-library/vue"
import { describe, expect, test, vi } from "vitest"
import { defineComponent, h } from "vue"

import { useNow } from "./use-now"

describe("useNow", () => {
  test("every caller reads the same clock from a single timer", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval")
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval")

    const clocks: ReturnType<typeof useNow>[] = []
    const Clock = defineComponent({
      setup() {
        clocks.push(useNow())
        return () => null
      },
    })

    const view = render({
      render: () => [h(Clock), h(Clock), h(Clock)],
    })

    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    expect(clocks).toHaveLength(3)
    expect(new Set(clocks).size).toBe(1)

    view.unmount()
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)

    setIntervalSpy.mockRestore()
    clearIntervalSpy.mockRestore()
  })
})
