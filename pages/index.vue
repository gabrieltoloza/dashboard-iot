<script setup lang="ts">
import { Cpu, CheckCircle2, XCircle, Bell, RefreshCw, Activity } from 'lucide-vue-next'
import { generateDataPoints } from '~/services/mockData'
import { SENSOR_TYPE_META } from '~/types'

const store = useDashboardStore()
const devicesStore = useDevicesStore()

const totalSensors = computed(() => store.metrics?.totalSensores ?? 0)

function statusVariant(status: 'online' | 'offline' | 'warning') {
  if (status === 'online') return 'success'
  if (status === 'warning') return 'warning'
  return 'destructive'
}

const deviceSparklineData = ref<Record<number, { data: number[]; color: string }>>({})

function loadSparklines() {
  for (const device of devicesStore.devices) {
    const firstSensor = device.sensores[0]
    if (!firstSensor) continue
    const points = generateDataPoints(device, 4, 30)
    const values = points.filter(p => p.sensor === firstSensor.tipo).map(p => p.valor)
    deviceSparklineData.value[device.id] = {
      data: values,
      color: SENSOR_TYPE_META[firstSensor.tipo].color,
    }
  }
}

watch(() => devicesStore.devices, () => {
  if (devicesStore.devices.length) loadSparklines()
}, { immediate: true })

const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

onMounted(() => {
  store.fetchDashboardData()
  devicesStore.fetchDevices()
  refreshInterval.value = setInterval(() => {
    store.refresh()
  }, 30000)
})

onBeforeUnmount(() => {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
})

function getZoneName(id: number): string {
  const zonesStore = useZonesStore()
  return zonesStore.zones.find(z => z.id === id)?.nombre || 'N/A'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Resumen operativo del sistema IoT</p>
      </div>
      <UiButton variant="outline" size="sm" @click="store.refresh()">
        <RefreshCw class="h-4 w-4" />
        Actualizar
      </UiButton>
    </div>

    <!-- Metric Cards Row -->
    <div v-if="store.loading && !store.metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UiSkeleton v-for="i in 4" :key="i" type="card" />
    </div>

    <div v-else-if="store.metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard>
        <UiCardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Dispositivos</p>
              <p class="metric-value mt-2">{{ store.metrics.totalDispositivos }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Cpu class="h-6 w-6 text-primary" />
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Online</p>
              <p class="metric-value mt-2 text-success">{{ store.metrics.dispositivosOnline }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 class="h-6 w-6 text-success" />
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Offline</p>
              <p class="metric-value mt-2 text-destructive">{{ store.metrics.dispositivosOffline }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle class="h-6 w-6 text-destructive" />
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Alarmas Activas</p>
              <p class="metric-value mt-2 text-warning">{{ store.metrics.alarmasActivas }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Bell class="h-6 w-6 text-warning" />
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Device Cards Grid -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Dispositivos</h2>
        <NuxtLink to="/devices" class="text-sm text-primary hover:underline">Ver todos</NuxtLink>
      </div>

      <div v-if="devicesStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiSkeleton v-for="i in 3" :key="i" type="card" />
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="device in devicesStore.devices" :key="device.id" class="hover:shadow-md transition-shadow">
          <UiCardHeader class="pb-3">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <UiCardTitle class="text-base truncate">{{ device.nombre }}</UiCardTitle>
                <UiCardDescription class="text-xs">{{ device.serial }}</UiCardDescription>
              </div>
              <UiBadge :variant="statusVariant(device.status)">
                {{ device.status }}
              </UiBadge>
            </div>
          </UiCardHeader>
          <UiCardContent class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Modelo</span>
              <span class="font-medium truncate ml-2">{{ device.modelo }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Zona</span>
              <span class="font-medium">{{ getZoneName(device.zona) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Sensores</span>
              <span class="font-mono">{{ device.sensores.length }}</span>
            </div>

            <UiSeparator v-if="deviceSparklineData[device.id]" />

            <div v-if="deviceSparklineData[device.id]" class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Última hora</span>
                <span class="font-mono" :style="{ color: deviceSparklineData[device.id].color }">
                  {{ SENSOR_TYPE_META[device.sensores[0].tipo].label }}
                </span>
              </div>
              <div class="flex items-center justify-center">
                <Sparkline
                  :data="deviceSparklineData[device.id].data"
                  :color="deviceSparklineData[device.id].color"
                  :width="260"
                  :height="40"
                />
              </div>
            </div>
          </UiCardContent>
          <UiCardFooter class="pt-2">
            <NuxtLink :to="`/devices/${device.id}`" class="text-sm text-primary hover:underline flex items-center gap-1">
              <Activity class="h-3 w-3" />
              Ver detalle
            </NuxtLink>
          </UiCardFooter>
        </UiCard>
      </div>
    </div>

    <div v-if="store.lastRefresh" class="text-center text-xs text-muted-foreground">
      Última actualización: {{ store.lastRefresh.toLocaleTimeString('es-ES') }}
    </div>
  </div>
</template>
