<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'
</script>

<template>
  <div class="relative w-full overflow-auto">
    <table :class="cn('w-full caption-bottom text-sm', ($attrs.class as HTMLAttributes['class']))">
      <slot />
    </table>
  </div>
</template>
