<script setup lang="ts">
import {
  FlaskConicalIcon,
  Loader2Icon,
  RotateCcwIcon,
  ZapIcon,
} from "@lucide/vue"
import { toast } from "vue-sonner"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import { updateDemoSettings, useDemoSettings } from "@/lib/demo-settings"

import DemoSwitchRow from "./DemoSwitchRow.vue"
import { useCreateIncomingOrder, useResetDemoData } from "./mutations"

/**
 * Header popover exposing every demo lever: automatic incoming orders,
 * simulated slow network, simulated API failures, plus one-off triggers.
 * Reads the settings live and writes them through updateDemoSettings, the
 * same store the mock API's handlers read.
 */
const hotel = useCurrentHotel()
const settings = useDemoSettings()
const { mutate: createIncomingOrder, isPending: isSendingOrder } =
  useCreateIncomingOrder()
const { mutate: resetDemoData, isPending: isResetting } = useResetDemoData()

function sendOrderNow() {
  createIncomingOrder(hotel.value.id, {
    onError: () =>
      toast.error("Couldn't send a demo order", {
        description: settings.value.failRequests
          ? "Simulated API errors are on, so every request fails."
          : "Check your connection and try again.",
      }),
  })
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        aria-label="Demo controls"
        class="text-muted-foreground"
      >
        <FlaskConicalIcon />
        <span class="hidden sm:inline">Demo</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end">
      <div class="space-y-0.5">
        <p class="text-sm font-semibold">Demo controls</p>
        <p class="text-xs text-muted-foreground">
          Simulate real-world conditions.
        </p>
      </div>

      <div class="space-y-3">
        <DemoSwitchRow
          label="New orders"
          description="A new request arrives automatically"
          :checked="settings.autoOrders"
          @update:checked="
            (checked) => updateDemoSettings({ autoOrders: checked })
          "
        />
        <DemoSwitchRow
          label="Slow network"
          description="Add multi-second latency"
          :checked="settings.network === 'slow'"
          @update:checked="
            (checked) =>
              updateDemoSettings({ network: checked ? 'slow' : 'normal' })
          "
        />
        <DemoSwitchRow
          label="API errors"
          description="Fail every request"
          :checked="settings.failRequests"
          switch-class="data-checked:bg-destructive"
          @update:checked="
            (checked) => updateDemoSettings({ failRequests: checked })
          "
        />
      </div>

      <Separator />

      <div class="space-y-1.5">
        <Button
          type="button"
          variant="outline"
          class="w-full justify-start"
          :disabled="isSendingOrder"
          @click="sendOrderNow"
        >
          <Loader2Icon v-if="isSendingOrder" class="animate-spin" />
          <ZapIcon v-else />
          Send order now
        </Button>
        <Button
          type="button"
          variant="outline"
          class="w-full justify-start"
          :disabled="isResetting"
          @click="resetDemoData()"
        >
          <Loader2Icon v-if="isResetting" class="animate-spin" />
          <RotateCcwIcon v-else />
          Reset demo data
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
