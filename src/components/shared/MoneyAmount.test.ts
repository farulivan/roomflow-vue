import { render, screen } from "@testing-library/vue"
import { describe, expect, test } from "vitest"

import MoneyAmount from "./MoneyAmount.vue"

describe("MoneyAmount", () => {
  test("sets the cents apart but keeps the full figure as its text", () => {
    const { container } = render(MoneyAmount, {
      props: { value: "$1,284.50" },
    })

    expect(screen.getByText(".50")).toBeInTheDocument()
    expect(container).toHaveTextContent("$1,284.50")
  })

  test.each(["$642", "Included"])("renders %s unchanged", (value) => {
    const { container } = render(MoneyAmount, { props: { value } })

    expect(screen.getByText(value)).toBeInTheDocument()
    expect(container.querySelectorAll("span")).toHaveLength(1)
  })
})
