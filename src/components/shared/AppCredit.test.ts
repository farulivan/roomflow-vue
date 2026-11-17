import { render, screen } from "@testing-library/vue"
import { describe, expect, test } from "vitest"

import { appConfig } from "@/lib/config"

import AppCredit from "./AppCredit.vue"

describe("AppCredit", () => {
  test("links to the author and the source, each in a new tab", () => {
    render(AppCredit)

    const author = screen.getByRole("link", { name: /^Farul/ })
    const source = screen.getByRole("link", { name: /Source on GitHub/ })

    expect(author).toHaveAttribute("href", appConfig.links.author)
    expect(source).toHaveAttribute("href", appConfig.links.source)
    for (const link of [author, source]) {
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noreferrer")
    }
  })
})
