<script setup lang="ts">
import type { Hotel } from "@/domain/hotel"

import { provideCurrentHotel } from "./current-hotel"

/**
 * Scopes everything in its slot to one hotel; components inside read it
 * with `useCurrentHotel()`. The prop is required, so a component in the
 * slot can never run without a hotel.
 */
const props = defineProps<{ hotel: Hotel }>()

provideCurrentHotel(() => props.hotel)
</script>

<template>
  <slot />
</template>
