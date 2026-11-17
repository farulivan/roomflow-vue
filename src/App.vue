<script setup lang="ts">
import { onErrorCaptured, ref } from "vue"
import { RouterView, useRouter } from "vue-router"

import RouteErrorPage from "@/app/RouteErrorPage.vue"
import { Toaster } from "@/components/ui/sonner"
import { useTheme } from "@/lib/use-theme"

const { resolved: theme } = useTheme()

// The app's error boundary: an error thrown while a page renders or
// handles an event lands here, not on a blank screen. Returning false
// stops it there.
const failed = ref(false)
onErrorCaptured((error) => {
  console.error("[roomflow] a page failed to render", error)
  failed.value = true
  return false
})

// Leaving the broken page is a fresh start.
useRouter().afterEach(() => {
  failed.value = false
})
</script>

<template>
  <RouteErrorPage v-if="failed" />
  <!-- RouterView renders whichever page the current URL maps to. -->
  <RouterView v-else />
  <Toaster position="top-right" close-button rich-colors :theme="theme" />
</template>
