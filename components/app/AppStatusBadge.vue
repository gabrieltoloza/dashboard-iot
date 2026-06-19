<script setup lang="ts">
type Status = 'online' | 'offline' | 'warning'

const props = defineProps<{
  status: Status
}>()

const config: Record<Status, { variant: 'success' | 'destructive' | 'warning'; label: string; dotClass: string }> = {
  online: { variant: 'success', label: 'Online', dotClass: 'bg-success' },
  offline: { variant: 'destructive', label: 'Offline', dotClass: 'bg-destructive' },
  warning: { variant: 'warning', label: 'Warning', dotClass: 'bg-warning' },
}
</script>

<template>
  <UiBadge :variant="config[props.status].variant" class="gap-1.5">
    <span class="w-2 h-2 rounded-full" :class="config[props.status].dotClass"></span>
    {{ config[props.status].label }}
  </UiBadge>
</template>
