<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router"
import type { RouteLocationRaw } from "vue-router"

import PaymentBadge from "@/components/shared/PaymentBadge.vue"
import RoomTag from "@/components/shared/RoomTag.vue"
import SlaBadge from "@/components/shared/SlaBadge.vue"
import StatusBadge from "@/components/shared/StatusBadge.vue"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order } from "@/domain/order"
import { isSlaOverdue } from "@/domain/sla"
import { formatDateTime, formatRelativeTime } from "@/lib/format"
import { paths } from "@/lib/paths"
import { cn } from "@/lib/utils"

import OrderActions from "./OrderActions.vue"
import OrderAmount from "./OrderAmount.vue"

defineProps<{
  orders: Order[]
  now: Date
}>()

const route = useRoute()
const router = useRouter()

/** Row background/rail treatment shared by the default and overdue states. */
const rowTreatment = cn(
  "cursor-pointer border-l-2 border-l-transparent transition-colors hover:bg-muted/50",
  "data-[overdue=true]:border-l-alert data-[overdue=true]:bg-alert/[0.04] data-[overdue=true]:hover:bg-alert/[0.07]"
)

/** The order's drawer, with the list's current filters kept in the URL. */
function detailsLocation(order: Order): RouteLocationRaw {
  return { path: paths.order(order.hotelId, order.id), query: route.query }
}

function openDetails(event: MouseEvent, order: Order) {
  // The ID link and the actions button handle their own clicks.
  if ((event.target as HTMLElement).closest("a,button")) return
  void router.push(detailsLocation(order))
}
</script>

<template>
  <Table class="min-w-[760px]">
    <TableCaption class="sr-only">Guest service orders</TableCaption>
    <TableHeader class="sticky top-0 z-10 bg-background">
      <TableRow>
        <TableHead>Order</TableHead>
        <TableHead>Guest</TableHead>
        <TableHead>Room</TableHead>
        <TableHead>Service</TableHead>
        <TableHead>Placed</TableHead>
        <TableHead class="text-right">Amount</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Payment</TableHead>
        <TableHead class="w-10 px-2">
          <span class="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <!--
        The order open in the details drawer is highlighted so it's easy
        to find again. `route.params` includes the params of nested routes,
        so the drawer's :orderId is readable from here.
      -->
      <TableRow
        v-for="order in orders"
        :key="order.id"
        :data-overdue="isSlaOverdue(order, now)"
        :data-state="order.id === route.params.orderId ? 'selected' : undefined"
        :class="rowTreatment"
        @click="openDetails($event, order)"
      >
        <TableCell class="font-mono">
          <RouterLink
            :to="detailsLocation(order)"
            :data-order-link="order.id"
            class="font-medium text-primary underline-offset-4 hover:underline"
          >
            {{ order.id }}
          </RouterLink>
        </TableCell>
        <TableCell>
          <span class="block max-w-[8rem] truncate" :title="order.guestName">
            {{ order.guestName }}
          </span>
        </TableCell>
        <TableCell>
          <RoomTag :room="order.roomNumber" />
        </TableCell>
        <TableCell>
          <span
            class="block max-w-[7rem] truncate"
            :title="
              order.quantity > 1
                ? `${order.service} × ${order.quantity}`
                : order.service
            "
          >
            {{ order.service }}
            <span v-if="order.quantity > 1" class="text-muted-foreground">
              × {{ order.quantity }}
            </span>
          </span>
        </TableCell>
        <TableCell :title="formatDateTime(order.orderTime)">
          {{ formatRelativeTime(order.orderTime, now) }}
        </TableCell>
        <TableCell class="text-right">
          <OrderAmount :order="order" />
        </TableCell>
        <TableCell>
          <div class="flex items-center gap-1.5">
            <StatusBadge :status="order.status" />
            <SlaBadge :order="order" :now="now" />
          </div>
        </TableCell>
        <TableCell>
          <PaymentBadge :status="order.paymentStatus" />
        </TableCell>
        <TableCell class="px-2">
          <OrderActions :order="order" variant="row" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
