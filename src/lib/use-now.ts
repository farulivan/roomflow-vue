import { createSharedComposable, useNow as useTickingNow } from "@vueuse/core"

import { appConfig } from "./config"

/**
 * One clock for all time-relative UI — SLA countdowns, relative timestamps.
 * Every caller reads the same `Date` ref and updates on the same tick, so
 * the list and the details sheet can never disagree about an SLA, and a
 * page of rows costs one timer, not one per row.
 *
 * `createSharedComposable` is what makes it shared: the first component to
 * call `useNow()` starts the timer, later ones get the same ref, and the
 * timer stops when the last of them unmounts.
 */
export const useNow = createSharedComposable(() =>
  useTickingNow({ interval: appConfig.clockTickMs })
)
