<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { computed } from "vue"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  errors?: Array<string | { message: string | undefined } | undefined>
}>()

// The messages to show, without blanks or repeats. A form library hands
// over `undefined` for a field that has no error.
const messages = computed(() => [
  ...new Set(
    (props.errors ?? [])
      .map((error) => (typeof error === "string" ? error : error?.message))
      .filter((message): message is string => !!message)
  ),
])
</script>

<template>
  <div
    v-if="$slots.default || messages.length > 0"
    role="alert"
    data-slot="field-error"
    :class="cn('text-sm font-normal text-destructive', props.class)"
  >
    <slot v-if="$slots.default" />

    <template v-else-if="messages.length === 1">
      {{ messages[0] }}
    </template>

    <ul v-else class="ml-4 flex list-disc flex-col gap-1">
      <li v-for="message in messages" :key="message">
        {{ message }}
      </li>
    </ul>
  </div>
</template>
