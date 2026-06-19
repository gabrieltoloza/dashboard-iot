<script setup lang="ts">
import { CheckCircle2, AlertTriangle, XCircle, Info, Activity } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  suffix?: string
  trend?: number
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}>(), { variant: 'default' })

const variantBg: Record<string, string> = {
  default: 'bg-muted text-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

const variantIcon: Record<string, typeof Activity> = {
  default: Activity,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}
</script>

<template>
  <UiCard>
    <UiCardContent class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold tracking-tight font-mono">{{ value }}</span>
            <span v-if="suffix" class="text-lg text-muted-foreground">{{ suffix }}</span>
          </div>
          <div v-if="trend" class="flex items-center gap-1 mt-2">
            <span
              class="text-sm font-medium"
              :class="trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'"
            >
              {{ trend > 0 ? '+' : '' }}{{ trend }}%
            </span>
          </div>
        </div>
        <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', variantBg[variant]]">
          <component :is="variantIcon[variant]" class="h-6 w-6" />
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
