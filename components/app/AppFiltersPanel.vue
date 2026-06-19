<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  hasActiveFilters: boolean
}>()

defineEmits<{
  clear: []
}>()
</script>

<template>
  <UiCard class="mb-6">
    <UiCardContent class="p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-sm">Filtros</h3>
        <button v-if="hasActiveFilters" @click="$emit('clear')" class="inline-flex items-center gap-1 text-sm text-destructive hover:underline">
          <X class="h-3 w-3" />
          Limpiar filtros
        </button>
      </div>
      <div class="flex flex-wrap gap-3">
        <slot />
      </div>
    </UiCardContent>
  </UiCard>
</template>
