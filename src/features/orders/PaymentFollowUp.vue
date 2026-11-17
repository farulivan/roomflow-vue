<script setup lang="ts">
import { Loader2Icon, TriangleAlertIcon } from "@lucide/vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { Order } from "@/domain/order"

import { useCollectPayment, useIsOrderUpdating } from "./mutations"

/**
 * A declined payment that still has to be collected, and the button the
 * front desk uses once it has been. Collecting it also takes the order off
 * the dashboard's "Needs attention" list.
 */
const props = defineProps<{ order: Order }>()

const { mutate: collectPayment } = useCollectPayment()
// Shared with the row menu and the footer actions, so a change started
// anywhere disables this button too.
const isPending = useIsOrderUpdating(() => props.order.id)
</script>

<template>
  <Alert variant="destructive" class="mb-3 border-destructive/30">
    <TriangleAlertIcon />
    <AlertTitle>Payment failed</AlertTitle>
    <AlertDescription>
      <p>
        {{
          order.status === "Completed"
            ? "Delivered, but the payment still needs collecting."
            : "The card was declined. Collect it at delivery, or the front desk will before checkout."
        }}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        class="mt-2"
        :disabled="isPending"
        @click="collectPayment({ order })"
      >
        <Loader2Icon v-if="isPending" class="animate-spin" />
        Mark payment collected
      </Button>
    </AlertDescription>
  </Alert>
</template>
