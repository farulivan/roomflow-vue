<script setup lang="ts">
import { defineAsyncComponent } from "vue"

import DashboardSkeleton from "@/features/dashboard/DashboardSkeleton.vue"

// The dashboard is the only page that draws charts, so it and the charting
// library load on first visit instead of in the main bundle. The skeleton
// shows while that chunk downloads.
const DashboardPage = defineAsyncComponent({
  loader: () => import("@/features/dashboard/DashboardPage.vue"),
  loadingComponent: DashboardSkeleton,
  delay: 0,
})
</script>

<template>
  <DashboardPage />
</template>
