<script setup lang="ts">
import { computed } from "vue"
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

/**
 * A money figure with its cents set smaller and raised, so the whole units
 * carry the number. It formats nothing itself: anything without cents
 * ("$642", "Included") renders exactly as given.
 */
const props = defineProps<{
  /** Already formatted by src/lib/format, e.g. "$1,284.50" or "Included". */
  value: string
  class?: HTMLAttributes["class"]
}>()

const TRAILING_CENTS = /^(.*)(\.\d{2})$/

const parts = computed(() => {
  const match = TRAILING_CENTS.exec(props.value)
  return match ? { whole: match[1], cents: match[2] } : null
})
</script>

<template>
  <span :class="cn('tabular-nums', props.class)">
    <template v-if="parts">
      {{ parts.whole
      }}<span class="align-[0.45em] text-[0.6em]">{{ parts.cents }}</span>
    </template>
    <template v-else>{{ value }}</template>
  </span>
</template>
