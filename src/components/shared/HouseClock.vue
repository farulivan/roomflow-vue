<script setup lang="ts">
import { useNow } from "@vueuse/core"

import { formatClockTime } from "@/lib/format"

/**
 * The house clock. A hotel runs on minutes — SLA countdowns, delivery
 * promises — so the current time is always one glance away. Hidden from
 * screen readers: the OS already announces time on demand.
 */
// Ticks every second, unlike the shared 30-second clock in lib/use-now
// that drives the SLA badges.
const now = useNow({ interval: 1000 })

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" })
</script>

<template>
  <div
    aria-hidden="true"
    class="mr-3 hidden items-baseline gap-1.5 text-base tabular-nums sm:flex"
  >
    <span class="text-muted-foreground">{{ weekday.format(now) }}</span>
    <span class="font-medium">{{ formatClockTime(now) }}</span>
  </div>
</template>
