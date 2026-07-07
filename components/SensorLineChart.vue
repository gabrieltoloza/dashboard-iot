<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface Props {
  data: number[]
  color?: string
  label?: string
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'hsl(var(--primary))',
  label: '',
  unit: '',
})

const isDark = ref(true)
function syncTheme() {
  isDark.value = document.documentElement.classList.contains('dark')
}
onMounted(() => {
  syncTheme()
  const observer = new MutationObserver(syncTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onBeforeUnmount(() => observer.disconnect())
})

const textColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'))
const gridColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'))
const tooltipBg = computed(() => (isDark.value ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)'))

const chartData = computed(() => ({
  labels: props.data.map((_, i) => i),
  datasets: [
    {
      label: props.label,
      data: props.data,
      borderColor: props.color,
      backgroundColor: props.color + '20',
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tooltipBg.value,
      titleColor: isDark.value ? '#fff' : '#000',
      bodyColor: isDark.value ? '#fff' : '#000',
      borderColor: gridColor.value,
      borderWidth: 1,
      padding: 8,
      cornerRadius: 6,
    },
  },
  scales: {
    x: { display: false },
    y: { ticks: { color: textColor.value, font: { size: 10 } }, grid: { color: gridColor.value } },
  },
}))
</script>

<template>
  <div class="w-full h-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
