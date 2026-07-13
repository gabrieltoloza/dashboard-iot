<script setup lang="ts">
import { Search, DoorOpen, DoorClosed } from 'lucide-vue-next'
import type { SensorState } from '~/types'
import { SENSOR_TYPE_META } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const devicesStore = useDevicesStore()
const sensorsStore = useSensorsStore()

const searchQuery = ref('')
const selectedTab = ref('all')

const flatSensors = computed(() => sensorsStore.flatSensors)

const sensorSparklines = ref<Record<string, number[]>>({})

async function loadSensorSparklines() {
  const devices = devicesStore.devices
  if (devices.length === 0) return

  const next: Record<string, number[]> = {}
  await Promise.all(
    devices.map(async (device) => {
      const points = await sensorsStore.fetchDataPoints(device.id, 4)
      const deviceSensors = sensorsStore.sensorsByDeviceId[device.id] ?? []
      for (const b of deviceSensors) {
        const flat = sensorsStore.flatSensors.find(
          (s) => s.deviceId === device.id && s.nombre === b.sensor_name,
        )
        if (flat) {
          next[flat.id] = points.filter((p) => p.nombre === b.sensor_name).map((p) => p.valor)
        }
      }
    }),
  )
  sensorSparklines.value = next
}

const filteredSensors = computed(() => {
  let result = flatSensors.value
  if (selectedTab.value !== 'all') {
    result = result.filter((s) => s.estado === selectedTab.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.nombre.toLowerCase().includes(query) ||
        s.tipo.toLowerCase().includes(query) ||
        s.deviceName.toLowerCase().includes(query),
    )
  }
  return result
})

const tabs = computed(() => [
  { label: 'Todos', value: 'all', count: flatSensors.value.length },
  { label: 'Normal', value: 'normal', count: flatSensors.value.filter((s) => s.estado === 'normal').length },
  { label: 'Warning', value: 'warning', count: flatSensors.value.filter((s) => s.estado === 'warning').length },
  { label: 'Critical', value: 'critical', count: flatSensors.value.filter((s) => s.estado === 'critical').length },
])

function statusVariant(estado: SensorState): 'success' | 'warning' | 'destructive' {
  const map: Record<SensorState, 'success' | 'warning' | 'destructive'> = {
    normal: 'success',
    warning: 'warning',
    critical: 'destructive',
  }
  return map[estado]
}

const latestPolling = usePolling(() => sensorsStore.fetchLatest(), 10000)
const sparklinesPolling = usePolling(() => loadSensorSparklines(), 60000)

onMounted(async () => {
  await devicesStore.fetchDevices()
  await sensorsStore.fetchAllSensors()
  await sensorsStore.fetchLatest()
  await loadSensorSparklines()
  latestPolling.start()
  sparklinesPolling.start()
})

onBeforeUnmount(() => {
  latestPolling.stop()
  sparklinesPolling.stop()
})
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader title="Sensores" description="Monitoreo de todos los sensores" />

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <UiInput v-model="searchQuery" placeholder="Buscar sensores..." class="pl-9" />
      </div>
      <AppTabs :tabs="tabs" v-model="selectedTab" />
    </div>

    <div v-if="devicesStore.loading || sensorsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UiSkeleton v-for="i in 8" :key="i" type="card" />
    </div>

    <div v-else-if="filteredSensors.length === 0" class="py-12">
      <AppEmptyState title="Sin sensores" description="No se encontraron sensores con los filtros aplicados" icon="search" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UiCard
        v-for="sensor in filteredSensors"
        :key="sensor.id"
        class="hover:shadow-md transition-shadow"
        :class="sensor.tipo === 'puerta' ? '' : 'min-h-[320px]'"
      >
        <UiCardContent
          :class="sensor.tipo === 'puerta' ? 'p-4' : 'p-4 flex flex-col h-full'"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ sensor.nombre }}</p>
              <p class="text-xs text-muted-foreground">{{ SENSOR_TYPE_META[sensor.tipo].label }}</p>
            </div>
            <UiBadge :variant="statusVariant(sensor.estado)">
              {{ sensor.estado }}
            </UiBadge>
          </div>

          <template v-if="sensor.tipo === 'puerta'">
            <div class="flex items-center justify-between mt-3 gap-2">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-bold font-mono" :style="{ color: SENSOR_TYPE_META[sensor.tipo].color }">
                  {{ sensor.valor }}
                </span>
                <span class="text-muted-foreground text-sm">{{ sensor.unidad }}</span>
              </div>
              <DoorClosed v-if="sensor.valor === 1" :size="36" class="text-success shrink-0" />
              <DoorOpen v-else :size="36" class="text-warning shrink-0" />
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-muted-foreground truncate">{{ sensor.deviceName }}</span>
              <NuxtLink :to="`/devices/${sensor.deviceId}`" class="text-xs text-primary hover:underline">
                Ver dispositivo
              </NuxtLink>
            </div>
          </template>

          <template v-else>
            <div class="flex-1 min-h-0">
              <SensorLineChart
                v-if="sensorSparklines[sensor.id]?.length"
                :data="sensorSparklines[sensor.id]"
                :color="SENSOR_TYPE_META[sensor.tipo].color"
                :label="`${SENSOR_TYPE_META[sensor.tipo].label} (${sensor.unidad})`"
                :unit="sensor.unidad"
              />
            </div>
            <div class="mt-2 flex items-center justify-between text-xs">
              <span class="font-mono font-bold" :style="{ color: SENSOR_TYPE_META[sensor.tipo].color }">
                {{ sensor.valor }} {{ sensor.unidad }}
              </span>
              <span class="text-muted-foreground">{{ sensor.deviceName }}</span>
            </div>
          </template>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>
