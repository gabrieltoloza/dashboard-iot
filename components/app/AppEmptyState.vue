<script setup lang="ts">
import { FileText, AlertCircle, Search } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  icon?: 'empty' | 'error' | 'search'
}>(), { icon: 'empty' })

const iconConfig = {
  empty: { bg: 'bg-muted text-muted-foreground', icon: FileText },
  error: { bg: 'bg-destructive/10 text-destructive', icon: AlertCircle },
  search: { bg: 'bg-primary/10 text-primary', icon: Search },
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div :class="['w-16 h-16 rounded-full flex items-center justify-center mb-4', iconConfig[props.icon].bg]">
      <component :is="iconConfig[props.icon].icon" class="w-8 h-8" />
    </div>
    <h3 class="text-lg font-semibold mb-1">{{ title }}</h3>
    <p v-if="description" class="text-muted-foreground text-sm max-w-sm mb-4">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
