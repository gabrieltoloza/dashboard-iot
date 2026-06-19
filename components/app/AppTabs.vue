<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger } from 'radix-vue'

interface Tab {
  label: string
  value: string
  count?: number
}

defineProps<{
  tabs: Tab[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
    class="w-full"
  >
    <TabsList class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          class="ml-2 rounded-full bg-muted-foreground/20 px-2 text-xs"
        >
          {{ tab.count }}
        </span>
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>
