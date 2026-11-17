<script setup lang="ts">
import { LogOutIcon } from "@lucide/vue"
import { computed } from "vue"
import { useRouter } from "vue-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/session"
import { paths } from "@/lib/paths"

const { session, logout } = useAuth()
const router = useRouter()

/** The signed-in person's initial, shown in the brand color. */
const initial = computed(() => session.value?.email.charAt(0).toUpperCase())

function signOut() {
  logout()
  void router.push(paths.login)
}
</script>

<template>
  <!--
    The shell only renders behind the router's session check, so there is
    always a session here, except for the moment between logout() clearing
    it and the navigation to /login finishing.
  -->
  <DropdownMenu v-if="session">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Account menu"
        class="ml-1 transition-shadow hover:ring-4 hover:ring-foreground/[0.06] aria-expanded:ring-4 aria-expanded:ring-foreground/[0.06]"
      >
        <Avatar>
          <AvatarFallback
            class="bg-primary/10 text-xs font-medium text-primary"
          >
            {{ initial }}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-60">
      <DropdownMenuLabel class="flex items-center gap-2.5 py-2 font-normal">
        <Avatar>
          <AvatarFallback
            class="bg-primary/10 text-xs font-medium text-primary"
          >
            {{ initial }}
          </AvatarFallback>
        </Avatar>
        <span class="min-w-0 truncate text-sm text-foreground">
          {{ session.email }}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="signOut">
        <LogOutIcon />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
