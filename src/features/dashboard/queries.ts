import { useQuery } from "@tanstack/vue-query"
import { computed, toValue } from "vue"
import type { MaybeRefOrGetter } from "vue"

import { appConfig } from "@/lib/config"

import { metricsApi } from "./api"

export const metricsKeys = {
  root: ["metrics"] as const,
  all: (hotelId: string) => [...metricsKeys.root, hotelId] as const,
}

/**
 * `hotelId` may be a plain string, a ref or a getter; `toValue` reads all
 * three. Passing a ref or getter keeps the query following the hotel:
 * when it changes, the key changes and the new hotel's metrics load.
 */
export function useMetrics(hotelId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => metricsKeys.all(toValue(hotelId))),
    queryFn: () => metricsApi.get(toValue(hotelId)),
    refetchInterval: appConfig.pollIntervalMs,
  })
}
