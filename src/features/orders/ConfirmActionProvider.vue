<script setup lang="ts">
import { ref, shallowRef } from "vue"

import type { Order } from "@/domain/order"
import type { OrderAction } from "@/domain/order-status"

import { provideConfirmAction } from "./confirm-action"
import ConfirmActionDialog from "./ConfirmActionDialog.vue"
import { useUpdateOrderStatus } from "./mutations"

/**
 * Owns the one confirmation dialog for actions that ask first on the
 * orders page. It lives here, above the list, rather than inside each row:
 * a row can unmount at any time (a poll or a new order pushes it to page
 * 2), and a dialog inside it would vanish with a half-typed reason. The
 * dialog keeps its own copy of the order for the same reason.
 *
 * Components in the slot open it with `useConfirmAction()`.
 */
const { mutate, reset, isPending, error } = useUpdateOrderStatus()

const pending = shallowRef<{ order: Order; action: OrderAction } | null>(null)
const open = ref(false)

provideConfirmAction((order, action) => {
  reset()
  pending.value = { order, action }
  open.value = true
})

function confirm(reason?: string) {
  if (!pending.value) return
  mutate(
    { ...pending.value, reason },
    {
      onSuccess: () => {
        open.value = false
      },
    }
  )
}

function setOpen(next: boolean) {
  // While the server is deciding, the answer belongs to this dialog.
  if (!isPending.value) open.value = next
}
</script>

<template>
  <slot />
  <ConfirmActionDialog
    v-if="pending"
    :order="pending.order"
    :action="pending.action"
    :open="open"
    :is-pending="isPending"
    :error="error"
    @update:open="setOpen"
    @confirm="confirm"
  />
</template>
