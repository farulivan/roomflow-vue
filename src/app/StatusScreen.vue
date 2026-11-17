<script setup lang="ts">
import BrandMark from "@/components/shared/BrandMark.vue"

/**
 * Full-page message for states where the app shell can't render: route
 * errors, not-found pages, and the hotel list failing to load. Buttons
 * and links go in the default slot.
 */
defineProps<{
  title: string
  message: string
}>()
</script>

<template>
  <main
    class="flex min-h-svh flex-col items-center justify-center gap-5 p-6 text-center"
  >
    <BrandMark />
    <div class="space-y-1">
      <h1 class="text-section font-normal">{{ title }}</h1>
      <p class="max-w-sm text-sm text-muted-foreground">{{ message }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </main>
</template>
