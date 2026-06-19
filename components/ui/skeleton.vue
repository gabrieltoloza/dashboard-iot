<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  type?: 'card' | 'text' | 'circle'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), { type: 'text' })

const typeClass = computed(() => {
  switch (props.type) {
    case 'card': return 'h-32 w-full rounded-lg'
    case 'circle': return 'h-12 w-12 rounded-full'
    default: return 'h-4 w-full rounded'
  }
})
</script>

<template>
  <div :class="cn('skeleton-shimmer', typeClass, props.class)" />
</template>
