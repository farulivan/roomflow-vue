<script setup lang="ts">
import { MenuIcon } from "@lucide/vue"
import { ref, watch } from "vue"
import { RouterView, useRoute } from "vue-router"

import BrandMark from "@/components/shared/BrandMark.vue"
import HouseClock from "@/components/shared/HouseClock.vue"
import ThemeToggle from "@/components/shared/ThemeToggle.vue"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import { useOrderSimulator } from "@/features/simulator/use-order-simulator"
import { track } from "@/lib/analytics"

import AppSidebar from "./AppSidebar.vue"
import UserMenu from "./UserMenu.vue"

/**
 * Application frame: fixed sidebar on desktop, sheet navigation on mobile,
 * and a utility header shared by every page. Mounted for as long as a
 * hotel is open, so this is also where the background order simulator
 * runs — it needs to keep ticking regardless of which page is showing.
 *
 * The `header-extras` slot puts controls in the header, before the theme
 * toggle.
 */
const mobileNavOpen = ref(false)
const route = useRoute()
const hotel = useCurrentHotel()
useOrderSimulator(() => hotel.value.id)

watch(
  () => route.path,
  (path) => track("page_view", { path }),
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-svh">
    <a
      href="#main"
      class="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      Skip to content
    </a>

    <aside
      class="sticky top-0 hidden h-svh w-60 flex-col border-r bg-sidebar lg:flex"
    >
      <AppSidebar />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-3 md:px-6"
      >
        <!-- v-model:open keeps the ref and the sheet's open state in step. -->
        <Sheet v-model:open="mobileNavOpen">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="lg:hidden"
              aria-label="Open navigation"
            >
              <MenuIcon class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-72 gap-0 bg-sidebar p-0">
            <SheetHeader class="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebar @navigate="mobileNavOpen = false" />
          </SheetContent>
        </Sheet>

        <div class="flex min-w-0 items-center gap-2 lg:hidden">
          <BrandMark />
          <span class="hidden truncate text-sm text-muted-foreground sm:inline">
            ・ {{ hotel.name }}
          </span>
        </div>

        <div class="ml-auto flex items-center gap-1">
          <HouseClock />
          <slot name="header-extras" />
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main id="main" class="flex-1 px-4 pt-4 pb-10 md:px-8 md:pt-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
