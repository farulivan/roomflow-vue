<script setup lang="ts">
import { SearchIcon, XIcon } from "@lucide/vue"
import { useDebounceFn } from "@vueuse/core"
import { computed, ref, watch } from "vue"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ORDER_STATUSES, PAYMENT_STATUSES, SERVICES } from "@/domain/order"
import {
  ORDER_SORTS,
  type OrderQueryParams,
  type OrderSort,
} from "@/domain/order-query"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

import FilterSelect from "./FilterSelect.vue"

const props = defineProps<{
  params: OrderQueryParams
  activeFilterCount: number
}>()

const emit = defineEmits<{
  paramsChange: [patch: Partial<OrderQueryParams>]
  clearFilters: []
}>()

const SEARCH_DEBOUNCE_MS = 300

const SORT_LABELS: Record<OrderSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "amount-high": "Amount: high to low",
  "amount-low": "Amount: low to high",
}

const searchDraft = ref(props.params.search ?? "")

// Adopt a search that changed from outside: back/forward navigation or
// Clear filters. The URL holds the trimmed search, so the draft's own echo
// coming back ("John " → "John") must not overwrite what the user is
// still typing.
watch(
  () => props.params.search,
  (search) => {
    if ((search ?? "") !== searchDraft.value.trim()) {
      searchDraft.value = search ?? ""
    }
  }
)

const commitSearch = useDebounceFn((value: string) => {
  emit("paramsChange", { search: value || undefined })
  if (value) track("orders_searched", { query: value })
}, SEARCH_DEBOUNCE_MS)

function handleSearchChange(value: string) {
  searchDraft.value = value
  void commitSearch(value)
}

function applyFilter(patch: Partial<OrderQueryParams>) {
  emit("paramsChange", patch)
  track("orders_filtered", patch)
}

function applySort(sort: OrderSort) {
  emit("paramsChange", { sort })
  track("orders_sorted", { sort })
}

const slaActive = computed(() => props.params.sla === "overdue")
const failedActive = computed(() => props.params.payment === "Failed")
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative w-full sm:w-64">
      <SearchIcon
        class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        :model-value="searchDraft"
        placeholder="Search guest, order ID, or room…"
        aria-label="Search guest, order ID, or room"
        class="pr-6 pl-8"
        @update:model-value="(value) => handleSearchChange(String(value))"
      />
      <Button
        v-if="searchDraft"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="absolute top-1/2 right-1 -translate-y-1/2"
        aria-label="Clear search"
        @click="handleSearchChange('')"
      >
        <XIcon class="size-3.5" />
      </Button>
    </div>

    <FilterSelect
      label="Filter by status"
      all-label="All statuses"
      :value="params.status"
      :options="ORDER_STATUSES"
      @change="(status) => applyFilter({ status })"
    />
    <FilterSelect
      label="Filter by service"
      all-label="All services"
      :value="params.service"
      :options="SERVICES"
      @change="(service) => applyFilter({ service })"
    />
    <FilterSelect
      label="Filter by payment status"
      all-label="All payments"
      :value="params.payment"
      :options="PAYMENT_STATUSES"
      @change="(payment) => applyFilter({ payment })"
    />

    <Select
      :model-value="params.sort ?? 'newest'"
      @update:model-value="(value) => applySort(value as OrderSort)"
    >
      <SelectTrigger aria-label="Sort orders" class="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="sort in ORDER_SORTS" :key="sort" :value="sort">
          {{ SORT_LABELS[sort] }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button
      type="button"
      variant="outline"
      size="sm"
      :aria-pressed="slaActive"
      :class="
        cn(
          slaActive &&
            'border-alert/50 bg-alert/10 text-alert hover:bg-alert/15 hover:text-alert'
        )
      "
      @click="applyFilter({ sla: slaActive ? undefined : 'overdue' })"
    >
      Overdue SLA
    </Button>

    <Button
      type="button"
      variant="outline"
      size="sm"
      :aria-pressed="failedActive"
      :class="
        cn(
          failedActive &&
            'border-destructive/40 bg-destructive/8 text-destructive hover:bg-destructive/12 hover:text-destructive'
        )
      "
      @click="applyFilter({ payment: failedActive ? undefined : 'Failed' })"
    >
      Failed payments
    </Button>

    <Button
      v-if="activeFilterCount > 0"
      type="button"
      variant="ghost"
      size="sm"
      class="ml-auto"
      @click="emit('clearFilters')"
    >
      Clear filters ({{ activeFilterCount }})
    </Button>
  </div>
</template>
