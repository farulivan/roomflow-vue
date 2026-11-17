<script setup lang="ts">
import { cva } from "class-variance-authority"
import type { HTMLAttributes } from "vue"

import { Badge } from "@/components/ui/badge"
import type { PaymentStatus } from "@/domain/order"
import { cn } from "@/lib/utils"

const props = defineProps<{
  status: PaymentStatus
  class?: HTMLAttributes["class"]
}>()

const paymentBadgeVariants = cva("gap-1.5 border", {
  variants: {
    status: {
      Paid: "border-status-done/30 bg-status-done/8 text-status-done",
      Pending: "border-brass/40 bg-brass/10 text-brass-ink",
      // Solid, not subtle: a failed payment is a problem to act on, not
      // just informational.
      Failed:
        "border-transparent bg-destructive text-white dark:text-background",
    } satisfies Record<PaymentStatus, string>,
  },
})
</script>

<template>
  <Badge
    variant="outline"
    :class="cn(paymentBadgeVariants({ status }), props.class)"
  >
    <span
      class="size-1.5 shrink-0 rounded-full bg-current"
      aria-hidden="true"
    />
    {{ status }}
  </Badge>
</template>
