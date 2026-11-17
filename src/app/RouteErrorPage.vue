<script setup lang="ts">
import { RouterLink } from "vue-router"

import { Button } from "@/components/ui/button"
import { paths } from "@/lib/paths"

import StatusScreen from "./StatusScreen.vue"

/** What App.vue shows in place of a page that threw. */
const reload = () => window.location.reload()
</script>

<template>
  <StatusScreen
    title="Something went wrong"
    message="The page hit an unexpected error. Reload to continue where you left off."
  >
    <Button @click="reload">Reload</Button>
    <Button as-child variant="outline">
      <RouterLink :to="paths.home">Go to dashboard</RouterLink>
    </Button>
  </StatusScreen>
</template>
