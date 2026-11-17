import { fileURLToPath, URL } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { msw } from "msw/vite"
import { defineConfig } from "vitest/config"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // Serves MSW's service worker script in dev and adds it to the build,
    // so the copy in use always matches the installed MSW version and no
    // generated file has to be committed. The worker itself is started by
    // hand in src/main.ts.
    msw({ mode: "worker-only" }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
  },
})
