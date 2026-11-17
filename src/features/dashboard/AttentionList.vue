<script setup lang="ts">
import {
  AlarmClockIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CreditCardIcon,
  ShieldQuestionIcon,
} from "@lucide/vue"
import { cva } from "class-variance-authority"
import type { Component } from "vue"
import { RouterLink } from "vue-router"

import RoomTag from "@/components/shared/RoomTag.vue"
import { Badge } from "@/components/ui/badge"
import type { AttentionItem, AttentionReason } from "@/domain/metrics"
import type { Order } from "@/domain/order"
import { minutesOverdue } from "@/domain/sla"
import { formatRelativeTime } from "@/lib/format"
import { paths } from "@/lib/paths"

/**
 * The day's most urgent orders — same triage order `computeMetrics` already
 * produced (SLA breaches, then pending approval, then failed payments).
 */
defineProps<{
  items: AttentionItem[]
  now: Date
}>()

const reasonBadgeVariants = cva("gap-1 border", {
  variants: {
    reason: {
      sla: "border-alert/30 bg-alert/8 text-alert",
      approval:
        "border-status-approval/30 bg-status-approval/8 text-status-approval",
      payment: "border-destructive/30 bg-destructive/8 text-destructive",
    } satisfies Record<AttentionReason, string>,
  },
})

const REASON_ICON: Record<AttentionReason, Component> = {
  sla: AlarmClockIcon,
  approval: ShieldQuestionIcon,
  payment: CreditCardIcon,
}

function reasonLabel(reason: AttentionReason, order: Order, now: Date): string {
  switch (reason) {
    case "sla":
      return `Overdue ${minutesOverdue(order, now)}m`
    case "approval":
      return "Approval"
    case "payment":
      return "Payment failed"
  }
}
</script>

<template>
  <section aria-labelledby="attention-heading" class="space-y-3">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 id="attention-heading" class="text-section">Needs attention</h2>
      <p class="text-sm text-muted-foreground">
        Overdue, awaiting approval, or payment issues
      </p>
    </div>
    <div
      v-if="items.length === 0"
      class="flex items-center gap-2 border-y py-4 text-sm text-muted-foreground"
    >
      <CheckCircle2Icon class="size-4 text-status-done" aria-hidden="true" />
      All clear. Nothing needs attention right now.
    </div>
    <ul v-else class="divide-y border-y">
      <li v-for="{ order, reason } in items" :key="order.id">
        <RouterLink
          :to="paths.order(order.hotelId, order.id)"
          class="flex h-12 items-center justify-between gap-3 px-2 text-sm transition-colors hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
        >
          <div class="flex min-w-0 items-center gap-3">
            <Badge variant="outline" :class="reasonBadgeVariants({ reason })">
              <component
                :is="REASON_ICON[reason]"
                class="size-3"
                aria-hidden="true"
              />
              {{ reasonLabel(reason, order, now) }}
            </Badge>
            <span class="shrink-0 font-mono">{{ order.id }}</span>
            <span class="truncate">{{ order.guestName }}</span>
            <RoomTag
              :room="order.roomNumber"
              class="hidden shrink-0 sm:inline-flex"
            />
          </div>
          <div
            class="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
          >
            {{ formatRelativeTime(order.orderTime, now) }}
            <ChevronRightIcon class="size-4" aria-hidden="true" />
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
