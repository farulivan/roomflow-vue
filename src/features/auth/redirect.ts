import type { LocationQuery } from "vue-router"

import { paths } from "@/lib/paths"

/**
 * Where to go after signing in: the page the visitor was sent away from,
 * if the link names one inside this app. Anything else ("https://…",
 * "//host") is ignored, so a crafted link can't bounce a visitor to
 * another site.
 */
export function redirectTarget(query: LocationQuery): string {
  const { redirect } = query
  return typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//")
    ? redirect
    : paths.home
}
