import { render, screen } from "@testing-library/vue"
import { describe, expect, test } from "vitest"

import { ORDER_STATUSES } from "@/domain/order"

import StatusBadge from "./StatusBadge.vue"

describe("StatusBadge", () => {
  test.each([...ORDER_STATUSES])("renders the %s status", (status) => {
    render(StatusBadge, { props: { status } })
    expect(screen.getByText(status)).toBeInTheDocument()
  })
})
