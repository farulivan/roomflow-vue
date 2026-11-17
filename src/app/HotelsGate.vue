<script setup lang="ts">
import { Loader2Icon } from "@lucide/vue"

import BrandMark from "@/components/shared/BrandMark.vue"
import { Button } from "@/components/ui/button"
import { useHotels } from "@/features/hotels/queries"
import { updateDemoSettings, useDemoSettings } from "@/lib/demo-settings"

import StatusScreen from "./StatusScreen.vue"

/**
 * Waits for the hotel list every hotel-scoped route depends on, and owns
 * its loading and error screens. Its slot only renders once the list is
 * in the cache, so the routes below never see a missing list.
 */
const { isPending, isError, refetch } = useHotels()
const settings = useDemoSettings()

const retry = () => void refetch()

function turnOffSimulatedErrors() {
  updateDemoSettings({ failRequests: false })
  retry()
}
</script>

<template>
  <main
    v-if="isPending"
    class="flex min-h-svh flex-col items-center justify-center gap-4"
    aria-busy="true"
  >
    <BrandMark />
    <p class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2Icon class="size-4 animate-spin" aria-hidden="true" />
      Loading your hotels…
    </p>
  </main>

  <!--
    The demo controls live in the app shell, which can't render without
    hotels, so a stored "fail every request" setting needs a way out here.
  -->
  <StatusScreen
    v-else-if="isError"
    title="Couldn't load your hotels"
    :message="
      settings.failRequests
        ? 'Simulated API errors are switched on, so every request fails.'
        : 'Check your connection and try again.'
    "
  >
    <Button v-if="settings.failRequests" @click="turnOffSimulatedErrors">
      Turn off simulated errors
    </Button>
    <Button variant="outline" @click="retry">Retry</Button>
  </StatusScreen>

  <slot v-else />
</template>
