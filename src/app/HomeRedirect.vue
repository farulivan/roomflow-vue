<script setup lang="ts">
import { watchEffect } from "vue"
import { useRouter } from "vue-router"

import { readLastHotelId } from "@/features/hotels/current-hotel"
import { useHotels } from "@/features/hotels/queries"
import { paths } from "@/lib/paths"

import HotelsGate from "./HotelsGate.vue"
import StatusScreen from "./StatusScreen.vue"

/** "/" has no hotel of its own: reopen the last one used, else the first. */
const { data: hotels } = useHotels()
const router = useRouter()

watchEffect(() => {
  if (!hotels.value) return

  const lastId = readLastHotelId()
  const target =
    hotels.value.find((hotel) => hotel.id === lastId) ?? hotels.value[0]
  if (target) void router.replace(paths.dashboard(target.id))
})
</script>

<template>
  <HotelsGate>
    <!-- Only an account with no hotels stays on this page. -->
    <StatusScreen
      v-if="hotels?.length === 0"
      title="No hotels yet"
      message="This account doesn't have access to any hotel."
    />
  </HotelsGate>
</template>
