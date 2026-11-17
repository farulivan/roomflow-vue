<script setup lang="ts">
import { computed } from "vue"
import type { HTMLAttributes } from "vue"

import MoneyAmount from "@/components/shared/MoneyAmount.vue"
import type { Order } from "@/domain/order"
import { formatOrderAmount } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * An order's price as the list, cards and drawer show it: muted when
 * nothing is charged, and struck through when a priced order was cancelled.
 */
const props = defineProps<{
  order: Pick<Order, "amount" | "status">
  class?: HTMLAttributes["class"]
}>()

const cancelled = computed(() => props.order.status === "Cancelled")
</script>

<template>
  <MoneyAmount
    :value="formatOrderAmount(order.amount)"
    :class="
      cn(
        order.amount === 0 || cancelled
          ? 'text-muted-foreground'
          : 'text-foreground',
        cancelled && order.amount > 0 && 'line-through',
        props.class
      )
    "
  />
</template>
