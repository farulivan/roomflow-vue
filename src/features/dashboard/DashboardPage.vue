<script setup lang="ts">
import ErrorState from "@/components/shared/ErrorState.vue"
import PageHeader from "@/components/shared/PageHeader.vue"
import StaleDataNotice from "@/components/shared/StaleDataNotice.vue"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import { formatLongDate } from "@/lib/format"
import { useNow } from "@/lib/use-now"

import AttentionList from "./AttentionList.vue"
import DashboardSkeleton from "./DashboardSkeleton.vue"
import OrdersTodayCard from "./OrdersTodayCard.vue"
import { useMetrics } from "./queries"
import TodayCard from "./TodayCard.vue"
import TopServices from "./TopServices.vue"

/**
 * A single `useMetrics()` call drives the whole page: the day's figures,
 * the chart, the attention queue and the top services all read from the
 * same snapshot, so nothing on screen can disagree with anything else on
 * screen.
 */
const hotel = useCurrentHotel()
const now = useNow()
const {
  data: metrics,
  isPending,
  isError,
  isFetching,
  dataUpdatedAt,
  refetch,
} = useMetrics(() => hotel.value.id)

const retry = () => void refetch()
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8">
    <PageHeader
      title="Dashboard"
      :description="`${hotel.name} ・ ${formatLongDate(now)}`"
    />

    <DashboardSkeleton v-if="isPending" />
    <ErrorState
      v-else-if="!metrics"
      title="Unable to load dashboard data."
      @retry="retry"
    />
    <div v-else class="space-y-10">
      <StaleDataNotice
        v-if="isError"
        :updated-at="dataUpdatedAt"
        :is-retrying="isFetching"
        @retry="retry"
      />

      <div class="grid gap-4 lg:grid-cols-5">
        <OrdersTodayCard
          :orders-by-hour="metrics.ordersByHour"
          :revenue-today="metrics.revenueToday"
          :avg-order-value="metrics.avgOrderValue"
          class="lg:col-span-3"
        />
        <TodayCard
          :metrics="metrics"
          :hotel-id="hotel.id"
          class="lg:col-span-2"
        />
      </div>

      <AttentionList :items="metrics.attention" :now="now" />
      <TopServices :data="metrics.topServices" />
    </div>
  </div>
</template>
