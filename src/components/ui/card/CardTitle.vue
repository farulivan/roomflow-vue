<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card-title"
    :class="
      cn(
        'font-heading text-body font-normal group-data-[size=sm]/card:text-sm',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
