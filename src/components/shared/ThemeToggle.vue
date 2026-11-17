<script setup lang="ts">
import { MoonIcon, SunIcon } from "@lucide/vue"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { track } from "@/lib/analytics"
import { useTheme } from "@/lib/use-theme"
import type { ThemePreference } from "@/lib/use-theme"

const { preference } = useTheme()

const THEMES: readonly ThemePreference[] = ["light", "dark", "auto"]

// The menu reports the picked item's value as a loose type; narrow it
// back to one of ours before storing it.
function choose(value: unknown) {
  const theme = THEMES.find((candidate) => candidate === value)
  if (!theme) return
  preference.value = theme
  track("theme_changed", { theme })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Change theme"
        class="text-muted-foreground"
      >
        <SunIcon class="size-4 dark:hidden" />
        <MoonIcon class="hidden size-4 dark:block" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup
        :model-value="preference"
        @update:model-value="choose"
      >
        <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto">System</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
