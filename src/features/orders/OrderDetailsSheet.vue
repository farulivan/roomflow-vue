<script setup lang="ts">
import { AlarmClockIcon, SearchXIcon } from "@lucide/vue"
import { computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import ErrorState from "@/components/shared/ErrorState.vue"
import PaymentBadge from "@/components/shared/PaymentBadge.vue"
import RoomTag from "@/components/shared/RoomTag.vue"
import SlaBadge from "@/components/shared/SlaBadge.vue"
import StatusBadge from "@/components/shared/StatusBadge.vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { needsPaymentFollowUp } from "@/domain/payment"
import {
  isSlaOverdue,
  minutesOverdue,
  minutesSinceOrdered,
  slaTargetMinutes,
} from "@/domain/sla"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import { track } from "@/lib/analytics"
import { ApiError } from "@/lib/api-client"
import { formatDateTime, formatRelativeTime } from "@/lib/format"
import { paths } from "@/lib/paths"
import { useNow } from "@/lib/use-now"

import OrderActions from "./OrderActions.vue"
import OrderAmount from "./OrderAmount.vue"
import OrderDetailRow from "./OrderDetailRow.vue"
import PaymentFollowUp from "./PaymentFollowUp.vue"
import { useOrder } from "./queries"

/**
 * Full order detail with lifecycle actions, routed at
 * /hotels/:hotelId/orders/:orderId.
 * Mounting this component IS the open signal — the router only renders it
 * when the path matches — so closing means navigating back to the list
 * rather than flipping local state. A successful action updates the cache
 * in place, so the sheet stays open and staff can chain actions
 * (Acknowledge then Start) without reopening it.
 *
 * The router passes `orderId` in as a prop (`props: true` on the route).
 * Unlike a value read from the current route, it still names this order
 * while the sheet closes, when the URL has already moved on.
 */
const props = defineProps<{ orderId: string }>()

const hotel = useCurrentHotel()
const route = useRoute()
const router = useRouter()
const now = useNow()

const {
  data: order,
  isPending,
  isError,
  error,
  refetch,
} = useOrder(
  () => hotel.value.id,
  () => props.orderId
)

const isNotFound = computed(
  () => error.value instanceof ApiError && error.value.status === 404
)

// Watches the id, not the order object, so this fires once per order
// opened rather than on every poll or optimistic status update (both
// replace the object and keep the id).
watch(
  () => order.value?.id,
  (id) => {
    if (id && order.value) {
      track("order_opened", { orderId: id, status: order.value.status })
    }
  },
  { immediate: true }
)

function close() {
  void router.push({ path: paths.orders(hotel.value.id), query: route.query })
}

// The sheet is opened by a route, not by a trigger button, so it has
// nothing to hand focus back to and would drop it on <body>. Return it to
// this order's link in the list (the visible one: the table and the mobile
// cards are both rendered), when it's on the page.
function returnFocusToList(event: Event) {
  const link = [
    ...document.querySelectorAll<HTMLElement>(
      `[data-order-link="${CSS.escape(props.orderId)}"]`
    ),
  ].find((element) => element.offsetParent !== null)
  if (!link) return
  event.preventDefault()
  link.focus()
}
</script>

<template>
  <Sheet :open="true" @update:open="(open) => !open && close()">
    <!-- The width classes are prefixed like the primitive's own side classes, so these win. -->
    <SheetContent
      class="data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      @close-auto-focus="returnFocusToList"
    >
      <SheetHeader>
        <SheetTitle class="font-mono">{{ orderId }}</SheetTitle>
        <SheetDescription>Order details</SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <div v-if="isPending" class="space-y-3">
          <Skeleton v-for="row in 6" :key="row" class="h-5 w-full" />
        </div>

        <div
          v-if="isNotFound"
          class="flex flex-col items-center gap-2 py-10 text-center"
        >
          <SearchXIcon
            class="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p class="font-medium">
            Order {{ orderId }} isn't in {{ hotel.name }}
          </p>
          <p class="text-sm text-muted-foreground">
            It may belong to another hotel, or the link is wrong.
          </p>
        </div>

        <ErrorState
          v-if="isError && !isNotFound"
          title="Unable to load this order."
          @retry="() => void refetch()"
        />

        <template v-if="order">
          <div class="space-y-2 pb-4">
            <p class="text-figure">
              <OrderAmount :order="order" />
            </p>
            <div class="flex flex-wrap items-center gap-1.5">
              <StatusBadge :status="order.status" />
              <SlaBadge :order="order" :now="now" />
              <PaymentBadge :status="order.paymentStatus" />
            </div>
          </div>

          <Alert
            v-if="isSlaOverdue(order, now)"
            class="mb-3 border-alert/40 bg-alert/[0.06]"
          >
            <AlarmClockIcon class="text-alert" />
            <AlertTitle>Past SLA</AlertTitle>
            <AlertDescription>
              Waiting {{ minutesSinceOrdered(order, now) }}m,
              {{ minutesOverdue(order, now) }}m over the
              {{ slaTargetMinutes(order) }}-minute
              {{ order.service.toLowerCase() }} target.
            </AlertDescription>
          </Alert>

          <PaymentFollowUp v-if="needsPaymentFollowUp(order)" :order="order" />

          <dl class="divide-y border-t">
            <OrderDetailRow label="Guest">{{ order.guestName }}</OrderDetailRow>
            <OrderDetailRow label="Room">
              <RoomTag :room="order.roomNumber" />
            </OrderDetailRow>
            <OrderDetailRow label="Service">
              {{ order.service
              }}<template v-if="order.quantity > 1">
                × {{ order.quantity }}</template
              >
            </OrderDetailRow>
            <OrderDetailRow label="Special request">
              <template v-if="order.specialRequest">
                {{ order.specialRequest }}
              </template>
              <em v-else class="text-muted-foreground">None</em>
            </OrderDetailRow>
            <OrderDetailRow label="Placed">
              {{ formatDateTime(order.orderTime) }}
              <span class="text-muted-foreground">
                ({{ formatRelativeTime(order.orderTime, now) }})
              </span>
            </OrderDetailRow>
          </dl>
        </template>
      </div>

      <SheetFooter v-if="order" class="border-t">
        <OrderActions :order="order" variant="detail" />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
