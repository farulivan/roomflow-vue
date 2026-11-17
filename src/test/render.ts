import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query"
import { render } from "@testing-library/vue"
import { defineComponent, h } from "vue"
import type { VNodeChild } from "vue"
import { createMemoryHistory, createRouter } from "vue-router"

import type { Hotel } from "@/domain/hotel"
import CurrentHotelProvider from "@/features/hotels/CurrentHotelProvider.vue"

const testHotel: Hotel = {
  id: "harborline",
  code: "HL",
  name: "Harborline Hotel",
  city: "Portside",
}

/** A QueryClient that fails fast: no retries, nothing refetched behind a test's back. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, networkMode: "always" },
      mutations: { networkMode: "always" },
    },
  })
}

interface RenderInHotelOptions {
  /** Where the memory router starts, e.g. "/hotels/harborline/orders?status=New". */
  path?: string
  queryClient?: QueryClient
}

/**
 * Renders `ui` the way it runs in the app: with a query client, a router
 * and a current hotel. The one route matches every path below a hotel, so
 * a navigation the test didn't expect changes `router.currentRoute`
 * without unmounting what's under test.
 *
 * `ui` is a render function, usually `() => h(Component, props)`. `h`
 * builds an element in script, where a test has no template to write
 * `<Component />` in.
 */
export async function renderInHotel(
  ui: () => VNodeChild,
  {
    path = "/hotels/harborline/orders",
    queryClient = createTestQueryClient(),
  }: RenderInHotelOptions = {}
) {
  const Host = defineComponent({
    setup: () => () => h(CurrentHotelProvider, { hotel: testHotel }, ui),
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/hotels/:hotelId/:rest(.*)*", component: Host }],
  })
  await router.push(path)

  const result = render(Host, {
    global: { plugins: [[VueQueryPlugin, { queryClient }], router] },
  })

  return { ...result, router, queryClient }
}

/**
 * Runs a composable inside a mounted component, where composables are
 * meant to run, and hands back what it returned. For testing data hooks
 * on their own, without the components that use them.
 */
export function runInSetup<Result>(
  composable: () => Result,
  queryClient: QueryClient = createTestQueryClient()
): Result {
  let result!: Result

  render(
    defineComponent({
      setup() {
        result = composable()
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } }
  )

  return result
}
