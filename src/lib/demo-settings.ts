import { createGlobalState, useStorage } from "@vueuse/core"
import type { Ref } from "vue"
import { z } from "zod"

import { appConfig } from "./config"

/**
 * Runtime demo controls. The mock API reads these to simulate network
 * conditions; the header popover writes them. Persisted in localStorage so
 * a chosen scenario survives navigation.
 */
export interface DemoSettings {
  /** "slow" adds multi-second latency to every request. */
  network: "normal" | "slow"
  /** When on, every API request fails with HTTP 500. */
  failRequests: boolean
  /** When on, a new order arrives automatically at a fixed cadence. */
  autoOrders: boolean
}

const defaultDemoSettings: DemoSettings = {
  network: "normal",
  failRequests: false,
  autoOrders: true,
}

// Each field falls back to its default on its own, so one bad or missing
// value in storage doesn't throw away the others.
const storedSettingsSchema = z.object({
  network: z.enum(["normal", "slow"]).catch(defaultDemoSettings.network),
  failRequests: z.boolean().catch(defaultDemoSettings.failRequests),
  autoOrders: z.boolean().catch(defaultDemoSettings.autoOrders),
})

function parseSettings(raw: string): DemoSettings {
  try {
    const parsed = storedSettingsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : defaultDemoSettings
  } catch {
    return defaultDemoSettings
  }
}

/**
 * The settings as one ref shared by the whole app. `useStorage` keeps it
 * in step with localStorage (other tabs included), and `createGlobalState`
 * makes every caller get that same ref instead of a copy of its own.
 */
export const useDemoSettings: () => Ref<DemoSettings> = createGlobalState(() =>
  // No storage argument: VueUse then looks up localStorage itself and
  // falls back to the defaults when the browser blocks it.
  useStorage(
    appConfig.storageKeys.demoSettings,
    defaultDemoSettings,
    undefined,
    {
      serializer: { read: parseSettings, write: JSON.stringify },
      writeDefaults: false,
    }
  )
)

/** The current settings, for code that runs outside a component. */
export function getDemoSettings(): DemoSettings {
  return useDemoSettings().value
}

export function updateDemoSettings(patch: Partial<DemoSettings>): void {
  const settings = useDemoSettings()
  settings.value = { ...settings.value, ...patch }
}
