<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="
      cn(
        'border-b transition-colors hover:bg-foreground/[0.04] has-aria-expanded:bg-foreground/[0.04] data-[state=selected]:bg-foreground/[0.06]',
        props.class
      )
    "
  >
    <slot />
  </tr>
</template>
