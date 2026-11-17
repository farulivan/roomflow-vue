<script setup lang="ts">
import { InboxIcon } from "@lucide/vue"
import type { Component } from "vue"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * Generic "nothing here" surface for any data list. Copy and the optional
 * action always come from the caller, so the same component reads right
 * for "no orders exist yet" and "nothing matches your filters" alike.
 *
 * The `action` slot typically holds a "Clear filters" or similar recovery
 * button.
 */
withDefaults(
  defineProps<{
    icon?: Component
    title: string
    description?: string
  }>(),
  { icon: () => InboxIcon }
)
</script>

<template>
  <Empty class="bg-card py-12 ring-1 ring-foreground/10">
    <EmptyHeader>
      <EmptyMedia variant="icon" class="size-10 rounded-full">
        <component :is="icon" aria-hidden="true" />
      </EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription v-if="description">{{ description }}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent v-if="$slots.action">
      <slot name="action" />
    </EmptyContent>
  </Empty>
</template>
