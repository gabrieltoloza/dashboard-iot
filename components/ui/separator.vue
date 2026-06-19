<script setup lang="ts">
import { Separator } from 'radix-vue'
import { cn } from '~/utils/cn'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  class?: string
}

const props = withDefaults(defineProps<Props>(), { orientation: 'horizontal' })
</script>

<template>
  <Separator
    :orientation="orientation"
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      props.class
    )"
  />
</template>
