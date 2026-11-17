import type { Component, Ref } from "vue"
import { createContext } from "reka-ui"

export { default as ChartContainer } from "./ChartContainer.vue"
export { componentToString } from "./utils"

// Format: { THEME_NAME: CSS_SELECTOR }
export const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: string | Component
    icon?: string | Component
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

interface ChartContextProps {
  id: string
  config: Ref<ChartConfig>
}

export const [useChart, provideChartContext] =
  createContext<ChartContextProps>("Chart")

// Imported from their own paths, not the package root, so the bundle
// takes these two components and not the whole chart library.
export { default as ChartCrosshair } from "@unovis/vue/components/crosshair"
export { default as ChartTooltip } from "@unovis/vue/components/tooltip"
