import { computed, inject, provide } from "vue"
import type { ComputedRef, InjectionKey } from "vue"

import type { Hotel } from "@/domain/hotel"
import { appConfig } from "@/lib/config"

// provide/inject hands a value to every component below the provider
// without passing it through each one as a prop. The key carries the
// value's type, so `inject` returns a typed ref.
const currentHotelKey: InjectionKey<ComputedRef<Hotel>> =
  Symbol("current-hotel")

/**
 * Makes `hotel` the current hotel for the calling component's subtree.
 * Takes a getter, not a value, so the subtree follows a hotel switch.
 */
export function provideCurrentHotel(hotel: () => Hotel): void {
  provide(currentHotelKey, computed(hotel))
}

/** The hotel the current route is scoped to. Only valid under HotelScope. */
export function useCurrentHotel(): ComputedRef<Hotel> {
  const hotel = inject(currentHotelKey)
  if (hotel === undefined) {
    throw new Error("useCurrentHotel must be used within a HotelScope")
  }
  return hotel
}

/**
 * The hotel this browser last worked in, so "/" can reopen it. Callers
 * check it against the real hotel list, so any stored string is safe.
 */
export function readLastHotelId(): string | undefined {
  try {
    return localStorage.getItem(appConfig.storageKeys.lastHotel) ?? undefined
  } catch {
    return undefined
  }
}

export function rememberHotel(hotelId: string): void {
  try {
    localStorage.setItem(appConfig.storageKeys.lastHotel, hotelId)
  } catch {
    // Storage can be unavailable (private mode); this is only a convenience.
  }
}
