<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/vue"
import { computed } from "vue"

import { Button } from "@/components/ui/button"

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{ pageChange: [page: number] }>()

const start = computed(() => (props.page - 1) * props.pageSize + 1)
const end = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-wrap items-center justify-between gap-3 text-sm"
  >
    <p class="text-muted-foreground">
      Showing <span class="text-foreground tabular-nums">{{ start }}</span> to
      <span class="text-foreground tabular-nums">{{ end }}</span> of
      <span class="text-foreground tabular-nums">{{ total }}</span> orders
    </p>
    <div class="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Previous page"
        :disabled="page <= 1"
        @click="emit('pageChange', page - 1)"
      >
        <ChevronLeftIcon />
      </Button>
      <span class="text-muted-foreground">
        Page {{ page }} of {{ totalPages }}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Next page"
        :disabled="page >= totalPages"
        @click="emit('pageChange', page + 1)"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  </div>
</template>
