<script setup lang="ts">
import { CircleAlertIcon, Loader2Icon } from "@lucide/vue"
import { computed, ref, watch } from "vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Order } from "@/domain/order"
import type { OrderAction } from "@/domain/order-status"
import { ApiError } from "@/lib/api-client"

/**
 * Confirmation step shared by every lifecycle action that asks first: the
 * destructive ones (Cancel, Reject), and taking on an order whose payment
 * was declined. Controlled by ConfirmActionProvider — this component only
 * asks the question and reports back what the user decided; it never
 * touches the mutation itself.
 */
const props = defineProps<{
  order: Order
  action: OrderAction
  isPending: boolean
  /** The last attempt's failure; the dialog stays open to show it. */
  error: Error | null
}>()

const emit = defineEmits<{ confirm: [reason?: string] }>()

// defineModel is a two-way prop: the parent binds it with v-model:open,
// and assigning to it here asks the parent to change it.
const open = defineModel<boolean>("open", { required: true })

const reason = ref("")
// Clear the draft reason whenever the dialog opens or closes, so each
// confirmation — possibly for a different action — starts blank. A failed
// attempt leaves the dialog open, so the reason survives a retry.
watch(open, () => {
  reason.value = ""
})

const isReject = computed(() => props.action.label === "Reject")
const isPaymentCheck = computed(
  () => props.action.confirmReason === "payment-declined"
)

const question = computed(() => {
  if (isPaymentCheck.value) {
    return "The guest's payment was declined. Collect it at delivery, or the front desk will before checkout."
  }
  return isReject.value
    ? "The request will be declined and the guest's booking stays unchanged."
    : "The guest's request will be closed and cannot be reopened."
})
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ action.label }} order
          <span class="font-mono">{{ order.id }}</span>?
        </AlertDialogTitle>
        <AlertDialogDescription>{{ question }}</AlertDialogDescription>
      </AlertDialogHeader>

      <div v-if="!isPaymentCheck" class="grid gap-1.5">
        <Label for="action-reason">Reason (optional)</Label>
        <Textarea
          id="action-reason"
          v-model="reason"
          placeholder="Add a short note for the log…"
          :disabled="isPending"
        />
      </div>

      <Alert v-if="error && !isPending" variant="destructive">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>
          Couldn't {{ action.label.toLowerCase() }} {{ order.id }}
        </AlertTitle>
        <AlertDescription>
          {{
            error instanceof ApiError
              ? error.message
              : "Check your connection and try again."
          }}
        </AlertDescription>
      </Alert>

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isPending">Go back</AlertDialogCancel>
        <!--
          A plain Button, not AlertDialogAction, which closes the dialog on
          click. This one stays open until the server answers, so the
          pending state is visible and a failure can be shown right here.
        -->
        <Button
          type="button"
          :variant="isPaymentCheck ? 'default' : 'destructive'"
          :disabled="isPending"
          @click="emit('confirm', reason.trim() || undefined)"
        >
          <Loader2Icon v-if="isPending" class="animate-spin" />
          {{ error ? "Try again" : action.label }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
