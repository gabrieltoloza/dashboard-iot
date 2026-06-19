<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  text?: string
}>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="flex flex-col items-center gap-4 bg-card p-8 rounded-lg shadow-lg">
        <Loader2 class="h-8 w-8 text-primary animate-spin" />
        <p v-if="text" class="text-muted-foreground text-sm">{{ text }}</p>
      </div>
    </div>
  </Teleport>
</template>
