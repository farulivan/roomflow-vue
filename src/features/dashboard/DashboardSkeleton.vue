<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder in the dashboard's final layout. Kept in its own file so
 * the router can show it while the (lazy-loaded) dashboard chunk arrives.
 */
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-10">
    <div class="grid gap-4 lg:grid-cols-5">
      <Skeleton class="h-80 rounded-xl lg:col-span-3" />
      <Skeleton class="h-80 rounded-xl lg:col-span-2" />
    </div>
    <div class="space-y-3">
      <Skeleton class="h-7 w-48" />
      <Skeleton class="h-48 rounded-xl" />
    </div>
    <div class="space-y-3">
      <Skeleton class="h-7 w-48" />
      <Skeleton class="h-64 rounded-xl" />
    </div>
  </div>
</template>
