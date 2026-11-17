<script setup lang="ts">
import { cva } from "class-variance-authority"
import type { HTMLAttributes } from "vue"

import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/domain/order"
import { cn } from "@/lib/utils"

/** Color-coded order status chip; color always pairs with the status text. */
const props = defineProps<{
  status: OrderStatus
  class?: HTMLAttributes["class"]
}>()

const statusBadgeVariants = cva("border", {
  variants: {
    status: {
      // The only solid status: New is the queue staff work from.
      New: "border-transparent bg-primary text-primary-foreground",
      Acknowledged:
        "border-status-acknowledged/30 bg-status-acknowledged/8 text-status-acknowledged",
      "In Progress":
        "border-status-progress/30 bg-status-progress/8 text-status-progress",
      "Pending Approval":
        "border-status-approval/30 bg-status-approval/8 text-status-approval",
      Completed: "border-status-done/30 bg-status-done/8 text-status-done",
      Cancelled: "border-input bg-transparent text-muted-foreground",
    } satisfies Record<OrderStatus, string>,
  },
})
</script>

<template>
  <Badge
    variant="outline"
    :class="cn(statusBadgeVariants({ status }), props.class)"
  >
    {{ status }}
  </Badge>
</template>
