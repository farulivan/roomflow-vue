import { useQuery } from "@tanstack/vue-query"
import { computed, toValue } from "vue"
import type { MaybeRefOrGetter } from "vue"

import type { OrderQueryParams } from "@/domain/order-query"
import { appConfig } from "@/lib/config"

import { ordersApi } from "./api"

/**
 * Every orders key starts with the hotel, so each hotel keeps its own
 * cache: switching hotels can never show another hotel's rows, and
 * switching back is instant.
 */
export const ordersKeys = {
  root: ["orders"] as const,
  all: (hotelId: string) => [...ordersKeys.root, hotelId] as const,
  lists: (hotelId: string) => [...ordersKeys.all(hotelId), "list"] as const,
  list: (hotelId: string, params: OrderQueryParams) =>
    [...ordersKeys.lists(hotelId), params] as const,
  detail: (hotelId: string, id: string) =>
    [...ordersKeys.all(hotelId), "detail", id] as const,
}

// The arguments accept refs and getters as well as plain values (see
// useMetrics), so a query re-keys itself when the hotel, the filters or
// the open order change.

export function useOrders(
  hotelId: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<OrderQueryParams>
) {
  return useQuery({
    queryKey: computed(() =>
      ordersKeys.list(toValue(hotelId), toValue(params))
    ),
    queryFn: () => ordersApi.list(toValue(hotelId), toValue(params)),
    // Keep the previous page on screen while the next one loads, so
    // pagination and filter changes never flash a blank table — but only
    // within one hotel. After a hotel switch, the old hotel's rows must not
    // stand in for the new one's, so it shows a skeleton instead.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === toValue(hotelId) ? previous : undefined,
    refetchInterval: appConfig.pollIntervalMs,
  })
}

export function useOrder(
  hotelId: MaybeRefOrGetter<string>,
  id: MaybeRefOrGetter<string>
) {
  return useQuery({
    queryKey: computed(() => ordersKeys.detail(toValue(hotelId), toValue(id))),
    queryFn: () => ordersApi.get(toValue(hotelId), toValue(id)),
  })
}
