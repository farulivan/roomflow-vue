<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

/**
 * A room number drawn as a brass key tag: rounded fob end, punched hole,
 * stamped digits. Staff scan for rooms all shift, so rooms get one shape
 * everywhere they appear.
 */
const props = defineProps<{
  room: string
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center gap-1.5 rounded-l-full rounded-r-md border border-brass/45 bg-brass/12 py-0.5 pr-2 pl-1.5 font-mono text-xs font-semibold text-brass-ink tabular-nums',
        props.class
      )
    "
  >
    <span
      class="size-1.5 shrink-0 rounded-full bg-background ring-1 ring-brass/70"
      aria-hidden="true"
    />
    <span class="sr-only">Room </span>{{ room }}
  </span>
</template>
