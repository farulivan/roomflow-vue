<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { Switch } from "@/components/ui/switch"

/** One labelled on/off setting in the demo controls. */
defineProps<{
  label: string
  description: string
  switchClass?: HTMLAttributes["class"]
}>()

// Bound by the parent with v-model:checked.
const checked = defineModel<boolean>("checked", { required: true })
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <div class="space-y-0.5">
      <p class="text-sm font-medium">{{ label }}</p>
      <p class="text-xs text-muted-foreground">{{ description }}</p>
    </div>
    <Switch v-model="checked" :aria-label="label" :class="switchClass" />
  </div>
</template>
