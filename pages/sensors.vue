<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { SensorState, SensorType } from '~/types'
import { SENSOR_TYPE_META } from '~/types'

const devicesStore = useDevicesStore()

const searchQuery = ref('')
const selectedTab = ref('all')

interface FlatSensor {
  id: string
  nombre: string
  tipo: SensorType
  valor: number
  unidad: string
  estado: SensorState
  deviceId: number
  deviceName: string
}

const flatSensors = computed<FlatSensor[]>(() => {
  return devicesStore.devices.flatMap(device =>
    device.sensores.map(sensor => ({
      ...sensor,
      deviceId: device.id,
      deviceName: device.nombre,
    }))
  )
})

const filteredSensors = computed(() => {
  let result = flatSensors.value
  if (selectedTab.value !== 'all') {
    result = result.filter(s => s.estado === selectedTab.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.nombre.toLowerCase().includes(query) ||
      s.tipo.toLowerCase().includes(query) ||
      s.deviceName.toLowerCase().includes(query)
    )
  }
  return result
})

const tabs = computed(() => [
  { label: 'Todos', value: 'all', count: flatSensors.value.length },
  { label: 'Normal', value: 'normal', count: flatSensors.value.filter(s => s.estado === 'normal').length },
  { label: 'Warning', value: 'warning', count: flatSensors.value.filter(s => s.estado === 'warning').length },
  { label: 'Critical', value: 'critical', count: flatSensors.value.filter(s => s.estado === 'critical').length },
])

function statusVariant(estado: SensorState): 'success' | 'warning' | 'destructive' {
  const map: Record<SensorState, 'success' | 'warning' | 'destructive'> = {
    normal: 'success',
    warning: 'warning',
    critical: 'destructive',
  }
  return map[estado]
}

onMounted(() => {
  devicesStore.fetchDevices()
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

    <div v-if="devicesStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UiSkeleton v-for="i in 8" :key="i" type="card" />
    </div>

    <div v-else-if="filteredSensors.length === 0" class="py-12">
      <AppEmptyState title="Sin sensores" description="No se encontraron sensores con los filtros aplicados" icon="search" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <UiCard v-for="sensor in filteredSensors" :key="sensor.id" class="hover:shadow-md transition-shadow">
        <UiCardContent class="p-4">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ sensor.nombre }}</p>
              <p class="text-xs text-muted-foreground">{{ SENSOR_TYPE_META[sensor.tipo].label }}</p>
            </div>
            <UiBadge :variant="statusVariant(sensor.estado)">
              {{ sensor.estado }}
            </UiBadge>
          </div>

          <div class="flex items-baseline gap-1 mt-3">
            <span class="text-3xl font-bold font-mono" :style="{ color: SENSOR_TYPE_META[sensor.tipo].color }">
              {{ sensor.valor }}
            </span>
            <span class="text-muted-foreground text-sm">{{ sensor.unidad }}</span>
          </div>

          <UiSeparator class="my-3" />

          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground truncate">{{ sensor.deviceName }}</span>
            <NuxtLink :to="`/devices/${sensor.deviceId}`" class="text-xs text-primary hover:underline">
              Ver dispositivo
            </NuxtLink>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>
