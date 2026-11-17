<script setup lang="ts">
import {
  BedDoubleIcon,
  ConciergeBellIcon,
  Flower2Icon,
  ShirtIcon,
  SparklesIcon,
} from "@lucide/vue"
import type { Component } from "vue"

import MoneyAmount from "@/components/shared/MoneyAmount.vue"
import { Card } from "@/components/ui/card"
import type { ServiceStat } from "@/domain/metrics"
import type { ServiceType } from "@/domain/order"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Today's services ranked by order count, with the revenue each brought in. */
defineProps<{ data: ServiceStat[] }>()

const SERVICE_ICON: Record<ServiceType, Component> = {
  "Room Service": ConciergeBellIcon,
  Housekeeping: SparklesIcon,
  Laundry: ShirtIcon,
  "Extra Bed": BedDoubleIcon,
  "Spa & Massage": Flower2Icon,
}
</script>

<template>
  <section aria-labelledby="top-services-heading" class="space-y-3">
    <h2 id="top-services-heading" class="text-section">Top services today</h2>
    <Card class="py-1">
      <p
        v-if="data.length === 0"
        class="py-8 text-center text-sm text-muted-foreground"
      >
        No orders yet today.
      </p>
      <ol v-else class="divide-y">
        <li
          v-for="{ service, count, revenue } in data"
          :key="service"
          class="flex items-center gap-3 px-4 py-3"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            aria-hidden="true"
          >
            <component :is="SERVICE_ICON[service]" class="size-4" />
          </span>
          <span class="min-w-0 flex-1 truncate text-body">{{ service }}</span>
          <span class="text-sm text-muted-foreground tabular-nums">
            {{ count }} {{ count === 1 ? "order" : "orders" }}
          </span>
          <MoneyAmount
            :value="formatCurrency(revenue)"
            :class="
              cn(
                'w-24 text-right text-body',
                revenue === 0 && 'text-muted-foreground'
              )
            "
          />
        </li>
      </ol>
    </Card>
  </section>
</template>
