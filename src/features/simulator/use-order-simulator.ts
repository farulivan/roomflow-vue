import { toValue, watchEffect } from "vue"
import type { MaybeRefOrGetter } from "vue"

import { appConfig } from "@/lib/config"
import { useDemoSettings } from "@/lib/demo-settings"

import { useCreateIncomingOrder } from "./mutations"

/**
 * Runs for as long as the calling component is mounted, entirely in the
 * background: while "New orders" demo mode is on, one realistic incoming
 * order arrives at the hotel being viewed every `simulatorIntervalMs`.
 * Call once near the app root — it returns nothing, callers only need its
 * effect.
 */
export function useOrderSimulator(hotelId: MaybeRefOrGetter<string>): void {
  const settings = useDemoSettings()
  const { mutate } = useCreateIncomingOrder()

  // watchEffect re-runs whenever a reactive value it read changes, here
  // the setting or the hotel, and calls the cleanup first. So the timer
  // restarts on a hotel switch and stops when the setting is turned off
  // or the component unmounts.
  watchEffect((onCleanup) => {
    if (!settings.value.autoOrders) return

    const id = toValue(hotelId)
    const timer = setInterval(() => mutate(id), appConfig.simulatorIntervalMs)
    onCleanup(() => clearInterval(timer))
  })
}
