import { computed } from "vue"
import type { ComputedRef } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { LocationQuery } from "vue-router"

import {
  parseOrderQuery,
  serializeOrderQuery,
  type OrderQueryParams,
} from "@/domain/order-query"

/** Filters counted for the "N active filters" affordance; sort is not one. */
const FILTER_KEYS = ["search", "status", "service", "payment", "sla"] as const

/** Changing any of these means "the list changed" — page 1 is the only sane page. */
const FIELDS_THAT_RESET_PAGE: readonly string[] = [...FILTER_KEYS, "sort"]

interface UseOrdersSearchParamsResult {
  params: ComputedRef<OrderQueryParams>
  /** Merges a patch into the URL; `undefined` values remove that key. */
  setParams: (patch: Partial<OrderQueryParams>) => void
  /** Drops every filter and the search text; keeps a non-default sort. */
  clearFilters: () => void
  activeFilterCount: ComputedRef<number>
}

/**
 * Vue Router hands the query string over as an object, where a repeated
 * key becomes an array. The domain codec reads a URLSearchParams, so this
 * converts, keeping the first value of a repeated key.
 */
function toSearchParams(query: LocationQuery): URLSearchParams {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first != null) searchParams.set(key, first)
  }
  return searchParams
}

/**
 * The orders list keeps no state of its own — search text, filters, sort
 * and page all live in the URL, parsed and written through the same domain
 * codec the mock API uses. That makes every list view shareable and
 * refresh-safe, and keeps this composable as the single seam other
 * components talk through instead of touching the router directly.
 */
export function useOrdersSearchParams(): UseOrdersSearchParamsResult {
  const route = useRoute()
  const router = useRouter()

  const params = computed(() => parseOrderQuery(toSearchParams(route.query)))

  function navigate(next: OrderQueryParams, replace: boolean): void {
    const query = Object.fromEntries(serializeOrderQuery(next))
    // A location with only `query` keeps the current path.
    void router[replace ? "replace" : "push"]({ query })
  }

  function setParams(patch: Partial<OrderQueryParams>): void {
    const keys = Object.keys(patch)
    // Typing in the search box shouldn't spam browser history; every
    // other change (a filter, a sort, a page) gets its own entry.
    const isSearchTextOnly = keys.length === 1 && keys[0] === "search"
    const resetsPage = keys.some((key) => FIELDS_THAT_RESET_PAGE.includes(key))

    navigate(
      // Undefined values drop out: serializeOrderQuery skips them.
      { ...params.value, ...patch, ...(resetsPage && { page: undefined }) },
      isSearchTextOnly
    )
  }

  function clearFilters(): void {
    navigate({ sort: params.value.sort }, false)
  }

  const activeFilterCount = computed(
    () => FILTER_KEYS.filter((key) => params.value[key] !== undefined).length
  )

  return { params, setParams, clearFilters, activeFilterCount }
}
