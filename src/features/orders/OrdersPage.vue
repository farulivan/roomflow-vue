<script setup lang="ts">
import { RouterView } from "vue-router"

import EmptyState from "@/components/shared/EmptyState.vue"
import ErrorState from "@/components/shared/ErrorState.vue"
import PageHeader from "@/components/shared/PageHeader.vue"
import StaleDataNotice from "@/components/shared/StaleDataNotice.vue"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentHotel } from "@/features/hotels/current-hotel"
import { useNow } from "@/lib/use-now"
import { cn } from "@/lib/utils"

import ConfirmActionProvider from "./ConfirmActionProvider.vue"
import OrderCardList from "./OrderCardList.vue"
import OrdersPagination from "./OrdersPagination.vue"
import OrdersTable from "./OrdersTable.vue"
import OrdersToolbar from "./OrdersToolbar.vue"
import { useOrders } from "./queries"
import { useOrdersSearchParams } from "./use-orders-search-params"

const hotel = useCurrentHotel()
const { params, setParams, clearFilters, activeFilterCount } =
  useOrdersSearchParams()
const now = useNow()
const {
  data: page,
  isPending,
  isError,
  isFetching,
  dataUpdatedAt,
  refetch,
} = useOrders(() => hotel.value.id, params)

const retry = () => void refetch()
</script>

<template>
  <ConfirmActionProvider>
    <div class="space-y-4">
      <PageHeader
        title="Orders"
        :description="`Guest service requests at ${hotel.name}`"
      >
        <span v-if="page" class="text-sm text-muted-foreground tabular-nums">
          {{ page.total }} total
        </span>
      </PageHeader>

      <!--
        The toolbar stays mounted in every state: a search that matches
        nothing still has to be editable, and a filter change is the
        natural way to recover from a failed load.
      -->
      <OrdersToolbar
        :params="params"
        :active-filter-count="activeFilterCount"
        @params-change="setParams"
        @clear-filters="clearFilters"
      />

      <div v-if="isPending" class="space-y-2">
        <Skeleton v-for="row in 8" :key="row" class="h-12 rounded-lg" />
      </div>
      <ErrorState v-else-if="!page" @retry="retry" />
      <div
        v-else
        :class="
          cn(
            'space-y-4 transition-opacity',
            isFetching && !isError && 'opacity-60'
          )
        "
      >
        <StaleDataNotice
          v-if="isError"
          :updated-at="dataUpdatedAt"
          :is-retrying="isFetching"
          @retry="retry"
        />

        <EmptyState
          v-if="page.total === 0"
          :title="
            activeFilterCount > 0
              ? 'No orders match your filters'
              : 'No orders yet'
          "
          :description="
            activeFilterCount > 0
              ? undefined
              : 'New guest requests will appear here.'
          "
        >
          <template v-if="activeFilterCount > 0" #action>
            <Button type="button" variant="outline" @click="clearFilters">
              Clear filters
            </Button>
          </template>
        </EmptyState>
        <template v-else>
          <div class="hidden md:block">
            <OrdersTable :orders="page.items" :now="now" />
          </div>
          <div class="md:hidden">
            <OrderCardList :orders="page.items" :now="now" />
          </div>
          <OrdersPagination
            :page="page.page"
            :total-pages="page.totalPages"
            :total="page.total"
            :page-size="page.pageSize"
            @page-change="(next) => setParams({ page: next })"
          />
        </template>
      </div>

      <!-- The order drawer, when the URL names an order. -->
      <RouterView />
    </div>
  </ConfirmActionProvider>
</template>
