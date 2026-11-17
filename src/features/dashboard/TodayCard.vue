<script setup lang="ts">
import { ChevronRightIcon } from "@lucide/vue"
import { computed } from "vue"
import type { HTMLAttributes } from "vue"
import { RouterLink } from "vue-router"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Metrics } from "@/domain/metrics"
import { paths } from "@/lib/paths"
import { cn } from "@/lib/utils"

/** Today's counts as one short list, with a way into the orders behind them. */
const props = defineProps<{
  metrics: Metrics
  hotelId: string
  class?: HTMLAttributes["class"]
}>()

interface SummaryRow {
  label: string
  value: number
  /** Flags a count that needs attention (SLA breaches > 0). */
  warning?: boolean
  /** When set, the row links to a pre-filtered view. */
  to?: string
}

const rows = computed<SummaryRow[]>(() => [
  { label: "Open orders", value: props.metrics.openOrders },
  {
    label: "SLA breaches",
    value: props.metrics.slaBreaches,
    warning: props.metrics.slaBreaches > 0,
    to: paths.orders(props.hotelId, "?sla=overdue"),
  },
  { label: "Active guests", value: props.metrics.activeGuests },
  { label: "Completed", value: props.metrics.completedToday },
])

const rowClass = "-mx-2 flex h-10 items-center gap-2 rounded-lg px-2"
</script>

<template>
  <Card :class="props.class">
    <CardHeader>
      <CardTitle>Today</CardTitle>
    </CardHeader>
    <CardContent class="flex-1">
      <ul class="text-body">
        <li v-for="row in rows" :key="row.label">
          <!-- A row with a destination is a link; the others are plain. -->
          <component
            :is="row.to ? RouterLink : 'div'"
            :to="row.to"
            :class="
              cn(
                rowClass,
                row.to &&
                  'transition-colors hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
              )
            "
          >
            <span class="text-muted-foreground">{{ row.label }}</span>
            <span
              :class="cn('ml-auto tabular-nums', row.warning && 'text-alert')"
            >
              {{ row.value }}
            </span>
            <!-- Every row keeps the chevron's slot, so the values line up. -->
            <span class="size-4 shrink-0">
              <ChevronRightIcon
                v-if="row.to"
                class="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
          </component>
        </li>
      </ul>
    </CardContent>
    <CardFooter class="bg-transparent py-3">
      <RouterLink
        :to="paths.orders(hotelId)"
        class="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        View all orders
        <ChevronRightIcon class="size-4" aria-hidden="true" />
      </RouterLink>
    </CardFooter>
  </Card>
</template>
