<script setup lang="ts">
import { CircleAlertIcon, RefreshCwIcon } from "@lucide/vue"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/** Generic data-surface error panel: what broke, and a way to try again. */
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: "Unable to load orders.",
    description: "Please try again.",
  }
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <Empty class="bg-card py-12 ring-1 ring-foreground/10">
    <EmptyHeader>
      <EmptyMedia
        variant="icon"
        class="size-10 rounded-full bg-destructive/10 text-destructive"
      >
        <CircleAlertIcon aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription>{{ description }}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button type="button" variant="outline" @click="emit('retry')">
        <RefreshCwIcon aria-hidden="true" />
        Retry
      </Button>
    </EmptyContent>
  </Empty>
</template>
