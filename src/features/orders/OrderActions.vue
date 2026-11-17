<script setup lang="ts">
import { Loader2Icon, MoreHorizontalIcon } from "@lucide/vue"
import { computed } from "vue"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Order } from "@/domain/order"
import { actionsForOrder, type OrderAction } from "@/domain/order-status"
import { needsPaymentFollowUp } from "@/domain/payment"

import { useConfirmAction } from "./confirm-action"
import {
  useCollectPayment,
  useIsOrderUpdating,
  useUpdateOrderStatus,
} from "./mutations"

/**
 * Renders exactly the actions `actionsForOrder` allows for this order, with
 * no per-status branching here, so this component and the mock API can
 * never disagree about what's legal. Actions that need a confirmation hand
 * off to the page's shared confirm dialog.
 *
 * The row menu also carries the payment track: an order whose payment is
 * still owed offers "Mark payment collected", even once it's completed,
 * since a delivered-but-unpaid order is exactly when that's needed.
 */
const props = defineProps<{
  order: Order
  /** "detail": buttons in the sheet footer. "row": a dropdown menu. */
  variant: "detail" | "row"
}>()

const { mutate: updateStatus } = useUpdateOrderStatus()
const { mutate: collectPayment } = useCollectPayment()
const requestConfirmation = useConfirmAction()
const isPending = useIsOrderUpdating(() => props.order.id)

const actions = computed(() => actionsForOrder(props.order))
const paymentOwed = computed(() => needsPaymentFollowUp(props.order))

/** Extra styling layered on top of the base button variant, by intent. */
const INTENT_BUTTON_CLASSES: Record<OrderAction["intent"], string> = {
  default: "",
  success: "bg-success text-success-foreground hover:bg-success/90",
  destructive: "border-destructive/40 text-destructive hover:bg-destructive/10",
}

function runAction(action: OrderAction) {
  if (action.confirm) {
    requestConfirmation(props.order, action)
    return
  }
  updateStatus({ order: props.order, action })
}
</script>

<template>
  <template v-if="variant === 'row'">
    <DropdownMenu v-if="actions.length > 0 || paymentOwed">
      <DropdownMenuTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          :aria-label="`Actions for ${order.id}`"
          :disabled="isPending"
        >
          <Loader2Icon v-if="isPending" class="animate-spin" />
          <MoreHorizontalIcon v-else />
        </Button>
      </DropdownMenuTrigger>
      <!-- Wide enough for "Mark payment collected" on one line. -->
      <DropdownMenuContent align="end" class="min-w-48">
        <DropdownMenuItem
          v-for="action in actions"
          :key="action.to"
          :variant="action.intent === 'destructive' ? 'destructive' : 'default'"
          :disabled="isPending"
          @select="runAction(action)"
        >
          {{ action.label }}
        </DropdownMenuItem>
        <template v-if="paymentOwed">
          <DropdownMenuSeparator v-if="actions.length > 0" />
          <DropdownMenuLabel class="text-xs font-normal text-muted-foreground">
            Payment
          </DropdownMenuLabel>
          <DropdownMenuItem
            :disabled="isPending"
            @select="collectPayment({ order })"
          >
            Mark payment collected
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </template>

  <p v-else-if="actions.length === 0" class="text-sm text-muted-foreground">
    No further actions. This order is {{ order.status }}.
  </p>

  <div v-else class="flex justify-end gap-2">
    <Button
      v-for="action in actions"
      :key="action.to"
      type="button"
      :variant="action.intent === 'destructive' ? 'outline' : 'default'"
      :disabled="isPending"
      :class="INTENT_BUTTON_CLASSES[action.intent]"
      @click="runAction(action)"
    >
      <Loader2Icon v-if="isPending" class="animate-spin" />
      {{ action.label }}
    </Button>
  </div>
</template>
