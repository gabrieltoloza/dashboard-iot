<script setup lang="ts">
interface Props {
  data: number[]
  color?: string
  width?: number
  height?: number
  type?: 'line' | 'bar'
  fill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'hsl(var(--primary))',
  width: 120,
  height: 32,
  type: 'line',
  fill: true,
})

const min = computed(() => Math.min(...props.data))
const max = computed(() => Math.max(...props.data))
const range = computed(() => max.value - min.value || 1)

const points = computed(() => {
  if (props.data.length < 2) return ''
  const stepX = props.width / (props.data.length - 1)
  return props.data
    .map((v, i) => {
      const x = i * stepX
      const y = props.height - ((v - min.value) / range.value) * (props.height - 2) - 1
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
})

const fillPath = computed(() => {
  if (props.data.length < 2) return ''
  const stepX = props.width / (props.data.length - 1)
  const linePoints = props.data
    .map((v, i) => {
      const x = i * stepX
      const y = props.height - ((v - min.value) / range.value) * (props.height - 2) - 1
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
  return `${linePoints} L ${props.width} ${props.height} L 0 ${props.height} Z`
})

const bars = computed(() => {
  if (props.data.length < 1) return []
  const barW = props.width / props.data.length - 1
  return props.data.map((v, i) => {
    const h = ((v - min.value) / range.value) * (props.height - 2)
    return {
      x: i * (barW + 1),
      y: props.height - h,
      w: barW,
      h,
    }
  })
})

const id = computed(() => `spark-${Math.random().toString(36).slice(2, 9)}`)
</script>

<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="overflow-visible">
    <defs v-if="type === 'line' && fill">
      <linearGradient :id="id" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <template v-if="type === 'line'">
      <path v-if="fill" :d="fillPath" :fill="`url(#${id})`" />
      <path :d="points" :stroke="color" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else>
      <rect
        v-for="(bar, i) in bars"
        :key="i"
        :x="bar.x"
        :y="bar.y"
        :width="bar.w"
        :height="bar.h"
        :fill="color"
        rx="1"
      />
    </template>
  </svg>
</template>
