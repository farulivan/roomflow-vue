<script setup lang="ts">
import { CheckIcon, ChevronsUpDownIcon } from "@lucide/vue"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { track } from "@/lib/analytics"
import { paths } from "@/lib/paths"

import { useCurrentHotel } from "./current-hotel"
import { useHotels } from "./queries"

/**
 * Switches the whole console to another hotel. The section you're in
 * (dashboard or orders) carries over; filters and any open order don't,
 * since they belonged to the hotel you just left.
 */
const emit = defineEmits<{ switch: [] }>()

const current = useCurrentHotel()
const { data: hotels } = useHotels()
const route = useRoute()
const router = useRouter()

// `matched` lists every route record on the way to the current page, so
// this is also true while an order is open under /orders.
const onOrders = computed(() =>
  route.matched.some((record) => record.name === "orders")
)

function switchTo(hotelId: string) {
  if (hotelId === current.value.id) return
  track("hotel_switched", { from: current.value.id, to: hotelId })
  void router.push(
    onOrders.value ? paths.orders(hotelId) : paths.dashboard(hotelId)
  )
  emit("switch")
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        class="h-auto w-full justify-start gap-2.5 rounded-lg px-2 py-1.5 text-left"
        :aria-label="`Hotel: ${current.name}. Switch hotel`"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-md bg-card font-mono text-xs font-medium ring-1 ring-foreground/10"
          aria-hidden="true"
        >
          {{ current.code }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium">
            {{ current.name }}
          </span>
          <span
            class="block truncate text-xs font-normal text-muted-foreground"
          >
            {{ current.city }}
          </span>
        </span>
        <ChevronsUpDownIcon
          class="size-4 shrink-0 opacity-60"
          aria-hidden="true"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      class="w-(--reka-dropdown-menu-trigger-width) min-w-56"
    >
      <DropdownMenuLabel class="text-xs font-normal text-muted-foreground">
        Hotels
      </DropdownMenuLabel>
      <DropdownMenuItem
        v-for="hotel in hotels"
        :key="hotel.id"
        class="gap-2.5"
        @select="switchTo(hotel.id)"
      >
        <span class="w-6 font-mono text-xs text-muted-foreground">
          {{ hotel.code }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate">{{ hotel.name }}</span>
          <span class="block truncate text-xs text-muted-foreground">
            {{ hotel.city }}
          </span>
        </span>
        <CheckIcon
          v-if="hotel.id === current.id"
          class="size-4"
          aria-label="Current hotel"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
