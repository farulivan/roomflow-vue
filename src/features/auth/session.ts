import { useQueryClient } from "@tanstack/vue-query"
import { createGlobalState, useStorage } from "@vueuse/core"
import { ref } from "vue"
import type { Ref } from "vue"
import { z } from "zod"

import { track } from "@/lib/analytics"
import { appConfig } from "@/lib/config"

import type { LoginFormValues } from "./schema"

/** A signed-in visitor. Mock session — no token, nothing server-verified. */
const sessionSchema = z.object({ email: z.email() })

export type Session = z.infer<typeof sessionSchema>

/** Simulated request latency so the sign-in button has something to show. */
const LOGIN_DELAY_MS = 600

/** The stored session, or null if it's not one we wrote. */
function parseSession(raw: string): Session | null {
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * The session as one ref shared by the whole app, mirrored to
 * localStorage. It is read from storage when first used, so the router
 * guard already knows about a stored session on the very first
 * navigation, and there's no flash of the sign-in page on reload.
 */
export const useSession: () => Ref<Session | null> = createGlobalState(() =>
  useStorage<Session | null>(appConfig.storageKeys.session, null, undefined, {
    serializer: { read: parseSession, write: JSON.stringify },
  })
)

/** The session plus the two ways to change it. Call from a component. */
export function useAuth() {
  const session = useSession()
  const queryClient = useQueryClient()
  const isLoading = ref(false)

  async function login(values: LoginFormValues): Promise<void> {
    isLoading.value = true
    try {
      // Mock only: the schema already guarantees a well-formed email and a
      // 6+ character password, and that's all this "backend" requires — it
      // always succeeds. Swapping in a real authentication request is the
      // obvious next step for a production deployment.
      await new Promise((resolve) => setTimeout(resolve, LOGIN_DELAY_MS))
      session.value = { email: values.email }
      track("login", {})
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    session.value = null
    // The next person to sign in on this browser starts from the server,
    // not from what the last one had loaded.
    queryClient.clear()
    track("logout", {})
  }

  return { session, login, logout, isLoading }
}
