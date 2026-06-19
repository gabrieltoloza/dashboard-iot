<script setup lang="ts">
import { AvatarRoot, AvatarImage, AvatarFallback } from 'radix-vue'
import { cn } from '~/utils/cn'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {})
</script>

<template>
  <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)">
    <AvatarImage v-if="src" :src="src" :alt="alt" class="aspect-square h-full w-full" />
    <AvatarFallback class="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium">
      {{ fallback || '?' }}
    </AvatarFallback>
  </AvatarRoot>
</template>
