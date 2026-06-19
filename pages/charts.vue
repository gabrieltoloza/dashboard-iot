<script setup lang="ts">
import { Line, Bar, Doughnut, Radar } from 'vue-chartjs'
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
import { SENSOR_TYPE_META } from '~/types'

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

const textColor = computed(() => isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
const gridColor = computed(() => isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
const tooltipBg = computed(() => isDark.value ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)')

function makeBaseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor.value, font: { size: 11 } } },
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
      x: { ticks: { color: textColor.value, font: { size: 10 } }, grid: { color: gridColor.value } },
      y: { ticks: { color: textColor.value, font: { size: 10 } }, grid: { color: gridColor.value } },
    },
  }
}

function generate24hData(base: number, variance: number) {
  const labels: string[] = []
  const data: number[] = []
  const now = new Date()
  for (let i = 24; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(`${date.getHours()}:00`)
    data.push(parseFloat((base + (Math.random() - 0.5) * variance * 2).toFixed(2)))
  }
  return { labels, data }
}

const temp = generate24hData(28, 5)
const hum = generate24hData(60, 10)
const volt = generate24hData(220, 8)
const freq = generate24hData(50, 0.8)

const lineChartData = computed(() => ({
  labels: temp.labels,
  datasets: [{
    label: 'Temperatura (°C)',
    data: temp.data,
    borderColor: SENSOR_TYPE_META.temperatura.color,
    backgroundColor: SENSOR_TYPE_META.temperatura.color + '20',
    tension: 0.4,
    pointRadius: 0,
    borderWidth: 2,
  }],
}))
const lineOptions = computed(() => makeBaseOptions())

const areaChartData = computed(() => ({
  labels: hum.labels,
  datasets: [{
    label: 'Humedad (%)',
    data: hum.data,
    borderColor: SENSOR_TYPE_META.humedad.color,
    backgroundColor: (ctx: any) => {
      const chart = ctx.chart
      const { ctx: c, chartArea } = chart
      if (!chartArea) return null
      const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      gradient.addColorStop(0, SENSOR_TYPE_META.humedad.color + '00')
      gradient.addColorStop(1, SENSOR_TYPE_META.humedad.color + '60')
      return gradient
    },
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    borderWidth: 2,
  }],
}))
const areaOptions = computed(() => makeBaseOptions())

const multiLineData = computed(() => ({
  labels: volt.labels,
  datasets: [
    { label: 'Tensión (V)', data: volt.data, borderColor: SENSOR_TYPE_META.tension.color, backgroundColor: 'transparent', tension: 0.3, pointRadius: 0, borderWidth: 2 },
    { label: 'Frecuencia (Hz)', data: freq.data.map(v => v * 4), borderColor: SENSOR_TYPE_META.frecuencia.color, backgroundColor: 'transparent', tension: 0.3, pointRadius: 0, borderWidth: 2, borderDash: [4, 4] },
  ],
}))
const multiLineOptions = computed(() => makeBaseOptions())

// Discrete
const barData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [{
    label: 'Alarmas',
    data: [12, 19, 8, 15, 22, 6, 3],
    backgroundColor: SENSOR_TYPE_META.temperatura.color,
    borderRadius: 4,
  }],
}))
const barOptions = computed(() => makeBaseOptions())

// Summary
const donutData = computed(() => ({
  labels: ['Online', 'Warning', 'Offline'],
  datasets: [{
    data: [3, 1, 1],
    backgroundColor: [
      SENSOR_TYPE_META.potencia.color,
      SENSOR_TYPE_META.tension.color,
      'hsl(var(--destructive))',
    ],
    borderColor: 'transparent',
    borderWidth: 0,
  }],
}))
const donutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: textColor.value, font: { size: 11 }, padding: 12 } },
    tooltip: { backgroundColor: tooltipBg.value, titleColor: isDark.value ? '#fff' : '#000', bodyColor: isDark.value ? '#fff' : '#000' },
  },
}))

// Comparison - Horizontal Bar
const hbarData = computed(() => ({
  labels: ['Compresor Principal', 'Bomba Norte', 'Panel Solar 1', 'Caldera Industrial', 'Generador'],
  datasets: [{
    label: 'Horas activas',
    data: [142, 98, 87, 76, 64],
    backgroundColor: SENSOR_TYPE_META.corriente.color,
    borderRadius: 4,
  }],
}))
const hbarOptions = computed(() => ({
  ...makeBaseOptions(),
  indexAxis: 'y' as const,
  plugins: { legend: { display: false }, tooltip: makeBaseOptions().plugins.tooltip },
}))

// Radar
const radarData = computed(() => ({
  labels: ['Temp', 'Hum', 'Volt', 'Corr', 'Pot', 'Pres', 'Freq'],
  datasets: [
    {
      label: 'Compresor A',
      data: [85, 70, 90, 60, 80, 75, 95],
      borderColor: SENSOR_TYPE_META.temperatura.color,
      backgroundColor: SENSOR_TYPE_META.temperatura.color + '40',
      borderWidth: 2,
      pointRadius: 3,
    },
    {
      label: 'Bomba B',
      data: [60, 80, 70, 85, 65, 90, 70],
      borderColor: SENSOR_TYPE_META.presion.color,
      backgroundColor: SENSOR_TYPE_META.presion.color + '40',
      borderWidth: 2,
      pointRadius: 3,
    },
  ],
}))
const radarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor.value, font: { size: 11 } } },
    tooltip: { backgroundColor: tooltipBg.value, titleColor: isDark.value ? '#fff' : '#000', bodyColor: isDark.value ? '#fff' : '#000' },
  },
  scales: {
    r: {
      ticks: { color: textColor.value, backdropColor: 'transparent' },
      grid: { color: gridColor.value },
      pointLabels: { color: textColor.value, font: { size: 11 } },
    },
  },
}))

const sparklineTemp = ref<number[]>([])
const sparklineHum = ref<number[]>([])
const sparklineVolt = ref<number[]>([])
onMounted(() => {
  sparklineTemp.value = temp.data.slice(-20)
  sparklineHum.value = hum.data.slice(-20)
  sparklineVolt.value = volt.data.slice(-20)
})

const categorias = [
  { to: '/charts/time-series', label: 'Time-Series', desc: 'Tendencias en el tiempo', count: 3, color: SENSOR_TYPE_META.temperatura.color },
  { to: '/charts/discrete', label: 'Discrete/Status', desc: 'Eventos y estados discretos', count: 3, color: SENSOR_TYPE_META.corriente.color },
  { to: '/charts/summary', label: 'Summary', desc: 'Resúmenes y distribuciones', count: 2, color: SENSOR_TYPE_META.potencia.color },
  { to: '/charts/comparison', label: 'Comparison', desc: 'Comparaciones y rankings', count: 2, color: SENSOR_TYPE_META.frecuencia.color },
]
</script>

<template>
  <div class="space-y-6">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Catálogo de Gráficos</UiCardTitle>
        <UiCardDescription>Evaluación de 10 visualizaciones para el dashboard IoT</UiCardDescription>
      </UiCardHeader>
    </UiCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink v-for="cat in categorias" :key="cat.to" :to="cat.to">
        <UiCard class="hover:shadow-md transition-shadow cursor-pointer h-full">
          <UiCardContent class="p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: cat.color + '20' }">
                <BarChart3 class="w-5 h-5" :style="{ color: cat.color }" />
              </div>
              <UiBadge variant="secondary">{{ cat.count }} ejemplos</UiBadge>
            </div>
            <h3 class="font-semibold text-base">{{ cat.label }}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{ cat.desc }}</p>
          </UiCardContent>
        </UiCard>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Line Chart Clásico</UiCardTitle>
          <UiCardDescription>Tendencias generales 24h</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Line :data="lineChartData" :options="lineOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: series temporales de un sensor</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Area Chart</UiCardTitle>
          <UiCardDescription>Volumen con gradiente</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Line :data="areaChartData" :options="areaOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: énfasis en magnitud acumulada</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Multi-Line Chart</UiCardTitle>
          <UiCardDescription>Comparar sensores</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Line :data="multiLineData" :options="multiLineOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: correlación entre variables</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Bar Chart Vertical</UiCardTitle>
          <UiCardDescription>Frecuencia de eventos</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: conteo por categoría</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Sparkline Línea</UiCardTitle>
          <UiCardDescription>Vista compacta</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-3 py-2">
            <div v-for="(item, i) in [
              { label: 'Compresor A', data: sparklineTemp, color: SENSOR_TYPE_META.temperatura.color },
              { label: 'Bomba B', data: sparklineHum, color: SENSOR_TYPE_META.humedad.color },
              { label: 'Inversor C', data: sparklineVolt, color: SENSOR_TYPE_META.tension.color },
            ]" :key="i" class="flex items-center justify-between">
              <span class="text-sm">{{ item.label }}</span>
              <Sparkline :data="item.data" :color="item.color" :width="100" :height="24" />
            </div>
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: tablas y listas con espacio limitado</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Sparkline Bar</UiCardTitle>
          <UiCardDescription>Estados discretos</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-3 py-2">
            <div v-for="(item, i) in [
              { label: 'Estados ON', data: [3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10], color: SENSOR_TYPE_META.potencia.color },
              { label: 'Alarmas/h', data: [1, 0, 2, 1, 3, 0, 1, 2, 1, 0, 1, 2], color: 'hsl(var(--destructive))' },
            ]" :key="i" class="flex items-center justify-between">
              <span class="text-sm">{{ item.label }}</span>
              <Sparkline :data="item.data" :color="item.color" :width="100" :height="24" type="bar" />
            </div>
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: comparar contadores discretos</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Donut Chart</UiCardTitle>
          <UiCardDescription>Distribución de partes</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Doughnut :data="donutData" :options="donutOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: composición porcentual</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Progress Bar</UiCardTitle>
          <UiCardDescription>Metas y niveles</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-4 py-2">
            <div v-for="(item, i) in [
              { label: 'Capacidad Compresor', value: 78, color: SENSOR_TYPE_META.temperatura.color },
              { label: 'Producción Diaria', value: 92, color: SENSOR_TYPE_META.potencia.color },
              { label: 'Uso Bomba', value: 45, color: SENSOR_TYPE_META.presion.color },
            ]" :key="i">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ item.label }}</span>
                <span class="font-mono">{{ item.value }}%</span>
              </div>
              <div class="h-2 bg-muted rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="{ width: item.value + '%', backgroundColor: item.color }" />
              </div>
            </div>
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: progreso contra meta</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Horizontal Bar</UiCardTitle>
          <UiCardDescription>Rankings top N</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Bar :data="hbarData" :options="hbarOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: ranking con etiquetas largas</p>
        </UiCardFooter>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Radar Chart</UiCardTitle>
          <UiCardDescription>Perfil multi-axis</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="h-48">
            <Radar :data="radarData" :options="radarOptions" />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <p class="text-xs text-muted-foreground">Mejor para: comparación multidimensional</p>
        </UiCardFooter>
      </UiCard>
    </div>
  </div>
</template>
