import type { Component } from "vue"
import { h, render } from "vue"

/**
 * Unovis draws its tooltip from an HTML string, not from a component.
 * This returns a template function for it that renders `component` to a
 * string for the hovered data point, passed in as the `payload` prop.
 * Each point's markup is rendered once and reused.
 */
export function componentToString<Datum extends object>(
  component: Component,
  props?: Record<string, unknown>
) {
  const cache = new Map<string, string>()

  return (datum: Datum): string => {
    const key = JSON.stringify(datum)
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const container = document.createElement("div")
    render(h(component, { ...props, payload: datum }), container)
    const html = container.innerHTML
    // Unmount again: only the markup is kept.
    render(null, container)

    cache.set(key, html)
    return html
  }
}
