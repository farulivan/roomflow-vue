import { createGlobalState, useColorMode, useEventListener } from "@vueuse/core"

import { appConfig } from "./config"

/** What the person picked. "auto" follows the operating system. */
export type ThemePreference = "light" | "dark" | "auto"

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable='true']") !==
        null)
  )
}

/**
 * The app's color theme. VueUse's `useColorMode` does the work: it stores
 * the preference, follows the system setting while that is "auto", puts
 * `light` or `dark` on <html> (the `dark:` classes key off it), and
 * switches without animating every color on the page.
 *
 * `createGlobalState` runs this once and hands the same refs to every
 * caller: the toggle, the toaster, and main.ts, which calls it before the
 * app mounts so the first paint already has the right theme.
 */
export const useTheme = createGlobalState(() => {
  const { store: preference, state: resolved } = useColorMode({
    storageKey: appConfig.storageKeys.theme,
  })

  // Pressing "d" anywhere outside a text field flips light and dark.
  useEventListener(window, "keydown", (event) => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
    if (isEditableTarget(event.target)) return
    if (event.key.toLowerCase() !== "d") return
    preference.value = resolved.value === "dark" ? "light" : "dark"
  })

  return { preference, resolved }
})
