<script setup lang="ts">
/** One "label: value" line in the order drawer. The value goes in the slot. */
defineProps<{ label: string }>()
</script>

<template>
  <div class="grid grid-cols-[7.5rem_1fr] items-baseline gap-x-3 py-2 text-sm">
    <dt class="text-muted-foreground">{{ label }}</dt>
    <dd><slot /></dd>
  </div>
</template>
