<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  modelValue?: string | number
  disabled?: boolean
  class?: HTMLAttributes['class']
  options: { label: string; value: string | number }[]
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => String(props.modelValue ?? ''),
  set: (v) => emit('update:modelValue', v),
})
</script>

<template>
  <select
    v-model="value"
    :disabled="disabled"
    :class="cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
