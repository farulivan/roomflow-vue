<script setup lang="ts" generic="T extends string">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * One "All …" dropdown over a fixed list of values. `generic` on the
 * script tag makes the component generic over the option type, so a
 * status filter emits an OrderStatus and a service filter a ServiceType.
 */
defineProps<{
  label: string
  allLabel: string
  value: T | undefined
  options: readonly T[]
}>()

const emit = defineEmits<{ change: [value: T | undefined] }>()

/** The select needs a non-empty value for every item, so "All" gets a sentinel. */
const ALL_VALUE = "all"
</script>

<template>
  <Select
    :model-value="value ?? ALL_VALUE"
    @update:model-value="
      (next) => emit('change', next === ALL_VALUE ? undefined : (next as T))
    "
  >
    <SelectTrigger :aria-label="label" class="w-36">
      <SelectValue :placeholder="allLabel" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem :value="ALL_VALUE">{{ allLabel }}</SelectItem>
      <SelectItem v-for="option in options" :key="option" :value="option">
        {{ option }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
