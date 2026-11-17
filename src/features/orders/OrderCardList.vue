<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"

import PaymentBadge from "@/components/shared/PaymentBadge.vue"
import RoomTag from "@/components/shared/RoomTag.vue"
import SlaBadge from "@/components/shared/SlaBadge.vue"
import StatusBadge from "@/components/shared/StatusBadge.vue"
import type { Order } from "@/domain/order"
import { isSlaOverdue } from "@/domain/sla"
import { formatRelativeTime } from "@/lib/format"
import { paths } from "@/lib/paths"
import { cn } from "@/lib/utils"

import OrderActions from "./OrderActions.vue"
import OrderAmount from "./OrderAmount.vue"

/**
 * Mobile counterpart to OrdersTable: same data, one card per order. The
 * whole card is clickable through a stretched link (the order ID's ::after
 * covers the card), which keeps the actions menu a sibling of the link
 * rather than an interactive element nested inside it.
 */
defineProps<{
  orders: Order[]
  now: Date
}>()

const route = useRoute()

const cardTreatment = cn(
  "relative rounded-xl border border-l-2 border-l-transparent bg-card p-3 transition-colors",
  "hover:bg-foreground/[0.03] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
  "data-[overdue=true]:border-l-alert data-[overdue=true]:bg-alert/[0.04]"
)
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li
      v-for="order in orders"
      :key="order.id"
      :data-overdue="isSlaOverdue(order, now)"
      :class="cardTreatment"
    >
      <div class="flex items-center justify-between gap-2">
        <!-- Carrying the query along keeps the list's filters behind the drawer. -->
        <RouterLink
          :to="{
            path: paths.order(order.hotelId, order.id),
            query: route.query,
          }"
          :data-order-link="order.id"
          class="font-mono text-sm font-medium text-primary after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
        >
          {{ order.id }}
        </RouterLink>
        <div class="flex items-center gap-1.5">
          <StatusBadge :status="order.status" />
          <SlaBadge :order="order" :now="now" />
          <div class="relative z-10">
            <OrderActions :order="order" variant="row" />
          </div>
        </div>
      </div>
      <div class="mt-1.5 flex items-center justify-between gap-2">
        <span class="font-medium">{{ order.guestName }}</span>
        <RoomTag :room="order.roomNumber" />
      </div>
      <div
        class="mt-1 flex items-baseline justify-between gap-2 text-sm text-muted-foreground"
      >
        <span>
          {{ order.service
          }}<template v-if="order.quantity > 1">
            × {{ order.quantity }}</template
          >
        </span>
        <OrderAmount :order="order" />
      </div>
      <div class="mt-2 flex items-center justify-between gap-2">
        <span class="text-xs text-muted-foreground">
          {{ formatRelativeTime(order.orderTime, now) }}
        </span>
        <PaymentBadge :status="order.paymentStatus" />
      </div>
    </li>
  </ul>
</template>
