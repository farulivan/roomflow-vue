<script setup lang="ts">
import { CloudOffIcon, RefreshCwIcon } from "@lucide/vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatClockTime } from "@/lib/format"

/**
 * Shown above data that is still on screen after a background refresh
 * failed. Staff keep working with what they have and see how old it is,
 * instead of losing the whole view to an error panel.
 */
defineProps<{
  /** `dataUpdatedAt` of the query whose background refresh failed. */
  updatedAt: number
  isRetrying: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <Alert class="flex items-center gap-3 border-alert/40 bg-alert/[0.06]">
    <CloudOffIcon class="size-4 shrink-0 text-alert" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <AlertTitle>Couldn't refresh</AlertTitle>
      <AlertDescription>
        Showing data from {{ formatClockTime(new Date(updatedAt)) }}.
      </AlertDescription>
    </div>
    <Button
      type="button"
      size="sm"
      variant="outline"
      :disabled="isRetrying"
      @click="emit('retry')"
    >
      <RefreshCwIcon
        :class="isRetrying ? 'animate-spin' : ''"
        aria-hidden="true"
      />
      Retry
    </Button>
  </Alert>
</template>
