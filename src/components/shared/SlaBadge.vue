<script setup lang="ts">
import { AlarmClockIcon } from "@lucide/vue"
import { computed } from "vue"
import type { HTMLAttributes } from "vue"

import { Badge } from "@/components/ui/badge"
import type { Order } from "@/domain/order"
import { isSlaOverdue, minutesOverdue } from "@/domain/sla"
import { cn } from "@/lib/utils"

/** Renders nothing unless the order is currently breaching its SLA. */
const props = defineProps<{
  order: Order
  now: Date
  class?: HTMLAttributes["class"]
}>()

const overdueMinutes = computed(() => minutesOverdue(props.order, props.now))
</script>

<template>
  <Badge
    v-if="isSlaOverdue(order, now)"
    variant="outline"
    :class="cn('gap-1 border-alert/30 bg-alert/8 text-alert', props.class)"
    :aria-label="`${overdueMinutes} minutes past SLA`"
  >
    <AlarmClockIcon class="size-3" aria-hidden="true" />
    <span class="font-mono tabular-nums" aria-hidden="true">
      +{{ overdueMinutes }}m
    </span>
  </Badge>
</template>
