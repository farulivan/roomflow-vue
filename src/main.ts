import { VueQueryPlugin } from "@tanstack/vue-query"
import { createApp } from "vue"

import "./index.css"
import "vue-sonner/style.css"
import App from "./App.vue"
import BootError from "@/app/BootError.vue"
import { router } from "@/app/router"
import { createQueryClient } from "@/lib/query-client"
import { useTheme } from "@/lib/use-theme"

// Puts the stored theme on <html> before anything renders, so even the
// boot error screen comes up in the right colors.
useTheme()

/**
 * The mock backend intercepts fetch at the service-worker level, in dev and
 * in the deployed build alike. It must be running before the first query
 * fires, hence the async bootstrap.
 */
async function enableMocking() {
  const { worker } = await import("./mocks/browser")
  await worker.start({ onUnhandledFrame: "bypass", quiet: true })
}

enableMocking()
  .then(() => {
    createApp(App)
      // Plugins install app-wide services: the query cache every
      // useQuery() call shares, and the router behind <RouterView>.
      .use(VueQueryPlugin, { queryClient: createQueryClient() })
      .use(router)
      .mount("#app")
  })
  .catch((error: unknown) => {
    // Without the worker, every request would fail; say why instead of
    // showing a blank page.
    console.error("[roomflow] the demo backend failed to start", error)
    createApp(BootError).mount("#app")
  })
