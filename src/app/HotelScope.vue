<script setup lang="ts">
import { computed, watchEffect } from "vue"
import { useRoute } from "vue-router"

import { rememberHotel } from "@/features/hotels/current-hotel"
import CurrentHotelProvider from "@/features/hotels/CurrentHotelProvider.vue"
import { useHotels } from "@/features/hotels/queries"
import DemoControls from "@/features/simulator/DemoControls.vue"

import AppShell from "./AppShell.vue"
import HotelsGate from "./HotelsGate.vue"
import NotFoundPage from "./NotFoundPage.vue"

/**
 * Scopes everything under /hotels/:hotelId to that hotel: an unknown ID is
 * a not-found page, a known one is provided to the tree via
 * useCurrentHotel() and remembered as the hotel to reopen next time.
 */
const route = useRoute()
// The same cached list HotelsGate waits for; asking again costs nothing.
const { data: hotels } = useHotels()

const hotel = computed(() =>
  hotels.value?.find((candidate) => candidate.id === route.params.hotelId)
)

watchEffect(() => {
  if (hotel.value) rememberHotel(hotel.value.id)
})
</script>

<template>
  <HotelsGate>
    <CurrentHotelProvider v-if="hotel" :hotel="hotel">
      <AppShell>
        <template #header-extras>
          <DemoControls />
        </template>
      </AppShell>
    </CurrentHotelProvider>
    <NotFoundPage v-else />
  </HotelsGate>
</template>
