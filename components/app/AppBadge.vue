<script setup lang="ts">
type Severity = 'info' | 'warning' | 'critical' | 'success'

const props = defineProps<{
  severity: Severity
}>()

const variantMap: Record<Severity, 'info' | 'warning' | 'destructive' | 'success'> = {
  info: 'info',
  warning: 'warning',
  critical: 'destructive',
  success: 'success',
}
</script>

<template>
  <UiBadge :variant="variantMap[props.severity]">
    <slot />
  </UiBadge>
</template>
