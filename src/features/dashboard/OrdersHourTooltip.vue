<script setup lang="ts">
import type { HourBucket } from "@/domain/metrics"
import { formatCurrency } from "@/lib/format"

/**
 * What the chart shows for the hour under the pointer. The chart library
 * draws tooltips from an HTML string, so the chart renders this component
 * to one (see `componentToString`) and passes the hovered point as
 * `payload`.
 */
defineProps<{ payload: HourBucket & { label: string } }>()
</script>

<template>
  <div
    class="grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"
  >
    <div class="font-medium">{{ payload.label }}</div>
    <div class="flex flex-col gap-0.5">
      <span class="font-medium tabular-nums">
        {{ payload.orders }} {{ payload.orders === 1 ? "order" : "orders" }}
      </span>
      <span class="text-xs text-muted-foreground tabular-nums">
        {{ formatCurrency(payload.revenue) }}
      </span>
    </div>
  </div>
</template>
