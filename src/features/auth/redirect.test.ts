import { describe, expect, test } from "vitest"

import { redirectTarget } from "./redirect"

describe("redirectTarget", () => {
  test("returns to the page inside the app that asked for sign-in", () => {
    expect(
      redirectTarget({ redirect: "/hotels/harborline/orders?status=New" })
    ).toBe("/hotels/harborline/orders?status=New")
  })

  test.each([
    ["nothing to return to", {}],
    ["another site", { redirect: "https://example.com" }],
    ["a protocol-relative address", { redirect: "//example.com" }],
    ["a repeated parameter", { redirect: ["/a", "/b"] }],
  ])("falls back to home for %s", (_case, query) => {
    expect(redirectTarget(query)).toBe("/")
  })
})
