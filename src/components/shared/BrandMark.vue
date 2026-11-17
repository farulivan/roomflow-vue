<script setup lang="ts">
import type { HTMLAttributes } from "vue"

import { cn } from "@/lib/utils"

/** Logo mark + wordmark, shared by the app shell, login and status pages. */
const props = defineProps<{ class?: HTMLAttributes["class"] }>()
</script>

<template>
  <div :class="cn('flex items-center gap-2.5', props.class)">
    <!--
      The Roomflow mark: a room key tag with a brass ring, and two brass
      lines for the requests flowing through it. Same drawing as
      public/favicon.svg.
    -->
    <svg
      viewBox="0 0 32 32"
      class="size-8 shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 2.5 26.5 9.5v17a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3v-17Z"
        class="fill-primary"
      />
      <circle
        cx="16"
        cy="10.5"
        r="3.4"
        fill="none"
        stroke-width="1.6"
        class="stroke-brass"
      />
      <circle cx="16" cy="10.5" r="1.6" class="fill-background" />
      <path
        d="M10.5 18.5h11M10.5 23.5h7"
        stroke-width="2.2"
        stroke-linecap="round"
        class="stroke-brass"
      />
    </svg>
    <span class="text-lg font-semibold tracking-tight">Roomflow</span>
  </div>
</template>
