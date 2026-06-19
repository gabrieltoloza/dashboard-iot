<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'text' | 'title' | 'avatar' | 'card' | 'custom'
  width?: 'full' | '3/4' | '1/2' | '1/3'
  class?: string
}>(), { type: 'text' })

const widthClass = computed(() => {
  const widths: Record<string, string> = {
    full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3'
  }
  return widths[props.width || 'full']
})
</script>

<template>
  <div class="animate-pulse">
    <div v-if="type === 'card'" class="space-y-3 rounded-lg border bg-card p-5">
      <div class="h-4 bg-muted rounded w-3/4"></div>
      <div class="h-4 bg-muted rounded w-1/2"></div>
    </div>
    <div v-else :class="['h-4 bg-muted rounded', widthClass]" />
  </div>
</template>
