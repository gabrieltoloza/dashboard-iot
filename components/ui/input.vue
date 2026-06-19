<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  min?: number | string
  max?: number | string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => String(props.modelValue ?? ''),
  set: (v) => emit('update:modelValue', v),
})
</script>

<template>
  <input
    v-model="inputValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
</template>
