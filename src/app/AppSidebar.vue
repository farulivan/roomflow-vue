<script setup lang="ts">
import { ClipboardListIcon, LayoutDashboardIcon } from "@lucide/vue"
import { RouterLink } from "vue-router"

import AppCredit from "@/components/shared/AppCredit.vue"
import BrandMark from "@/components/shared/BrandMark.vue"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import HotelSwitcher from "@/features/hotels/HotelSwitcher.vue"
import { paths } from "@/lib/paths"
import { cn } from "@/lib/utils"

/**
 * Brand, hotel switcher and navigation: the desktop sidebar and the mobile
 * sheet share it. `navigate` fires when a link or a hotel is chosen, which
 * is the sheet's cue to close.
 */
const emit = defineEmits<{ navigate: [] }>()

const hotel = useCurrentHotel()

// `exact` keeps Dashboard from staying lit on the pages beneath it, since
// every hotel page's URL starts with the dashboard's.
const NAV_ITEMS = [
  {
    to: paths.dashboard,
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { to: paths.orders, label: "Orders", icon: ClipboardListIcon, exact: false },
] as const
</script>

<template>
  <div class="space-y-4 px-3 pt-5 pb-4">
    <BrandMark class="px-2" />
    <HotelSwitcher @switch="emit('navigate')" />
  </div>

  <nav aria-label="Main" class="grid gap-0.5 px-3">
    <!--
      `custom` hands the link's state to the slot instead of rendering an
      <a> itself, so the classes can depend on whether it is active.
    -->
    <RouterLink
      v-for="item in NAV_ITEMS"
      :key="item.label"
      v-slot="{ href, navigate, isActive, isExactActive }"
      :to="item.to(hotel.id)"
      custom
    >
      <a
        :href="href"
        :aria-current="
          (item.exact ? isExactActive : isActive) ? 'page' : undefined
        "
        :class="
          cn(
            'flex h-8 items-center gap-2.5 rounded-lg px-2 text-body transition-colors',
            (item.exact ? isExactActive : isActive)
              ? 'bg-sidebar-accent text-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
          )
        "
        @click="
          (event) => {
            navigate(event)
            emit('navigate')
          }
        "
      >
        <component :is="item.icon" class="size-4" aria-hidden="true" />
        {{ item.label }}
      </a>
    </RouterLink>
  </nav>

  <div class="mt-auto space-y-1 border-t px-5 py-4">
    <p class="text-xs text-muted-foreground">Demo data ・ resets on reload</p>
    <AppCredit />
  </div>
</template>
