<script setup lang="ts">
import { RouterLink } from "vue-router"

import { Button } from "@/components/ui/button"
import { paths } from "@/lib/paths"

import StatusScreen from "./StatusScreen.vue"
</script>

<template>
  <StatusScreen
    title="Page not found"
    message="This page does not exist. It may have been moved, or the link is wrong."
  >
    <!-- as-child: the Button lends its look to the link instead of wrapping it. -->
    <Button as-child>
      <RouterLink :to="paths.home">Go to dashboard</RouterLink>
    </Button>
  </StatusScreen>
</template>
