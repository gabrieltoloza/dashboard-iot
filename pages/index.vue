<script setup lang="ts">
import { Cpu, CheckCircle2, XCircle, Bell, RefreshCw, Activity, DoorOpen, DoorClosed } from 'lucide-vue-next'
import { SENSOR_TYPE_META } from '~/types'
import type { SensorType } from '~/types'
import { guessSensorType } from '~/services/adapters/sensorType.adapter'

const store = useDashboardStore()
const devicesStore = useDevicesStore()
const sensorsStore = useSensorsStore()

const totalSensors = computed(() => store.metrics?.totalSensores ?? 0)

function statusVariant(status: 'online' | 'offline' | 'warning') {
  if (status === 'online') return 'success'
  if (status === 'warning') return 'warning'
  return 'destructive'
}

interface SensorVisual {
  nombre: string
  tipo: SensorType
  values: number[]
}

const deviceSensorVisuals = ref<Record<number, SensorVisual[]>>({})

async function loadSparklines() {
  const devices = devicesStore.devices
  if (devices.length === 0) return

  await Promise.all(
    devices.map(async (device) => {
      const deviceSensors = sensorsStore.sensorsByDeviceId[device.id] ?? []
      if (deviceSensors.length === 0) return

      const points = await sensorsStore.fetchDataPoints(device.id, 4)
      const visuals: SensorVisual[] = deviceSensors.map((b) => {
        const tipo = guessSensorType(b.tipo, b.sensor_name, b.unit)
        const values = points.filter((p) => p.nombre === b.sensor_name).map((p) => p.valor)
        return { nombre: b.sensor_name, tipo, values }
      })
      deviceSensorVisuals.value[device.id] = visuals
    }),
  )
}

const metricsPolling = usePolling(() => store.fetchDashboardData(), 30000)
const sparklinesPolling = usePolling(() => loadSparklines(), 60000)

onMounted(async () => {
  store.fetchDashboardData()
  await devicesStore.fetchDevices()
  await sensorsStore.fetchAllSensors()
  await loadSparklines()
  metricsPolling.start()
  sparklinesPolling.start()
})

onBeforeUnmount(() => {
  metricsPolling.stop()
  sparklinesPolling.stop()
})

function getZoneName(device: { zonaNombre?: string | null; zona: number }): string {
  if (device.zonaNombre) return device.zonaNombre
  const zonesStore = useZonesStore()
  return zonesStore.zones.find((z) => z.id === device.zona)?.nombre || 'N/A'
}

function latestValorFor(deviceId: number, sensorNombre: string): number | undefined {
  return sensorsStore.flatSensors.find((s) => s.deviceId === deviceId && s.nombre === sensorNombre)?.valor
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
              <span class="font-medium">{{ getZoneName(device) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Sensores</span>
              <span class="font-mono">{{ sensorsStore.countByDeviceId[device.id] ?? 0 }}</span>
            </div>

            <UiSeparator v-if="deviceSensorVisuals[device.id]?.length" />

            <div v-if="deviceSensorVisuals[device.id]?.length" class="space-y-3">
              <div
                v-for="vis in deviceSensorVisuals[device.id]"
                :key="vis.nombre"
                class="flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    class="text-sm font-medium w-12 shrink-0"
                    :style="{ color: SENSOR_TYPE_META[vis.tipo].color }"
                  >{{ vis.nombre }}</span>
                  <span class="text-xs text-muted-foreground truncate">
                    {{ latestValorFor(device.id, vis.nombre) ?? '—' }} {{ SENSOR_TYPE_META[vis.tipo].unit }}
                  </span>
                </div>

                <div v-if="vis.tipo === 'puerta'" class="shrink-0">
                  <DoorClosed v-if="latestValorFor(device.id, vis.nombre) === 1" :size="24" class="text-success" />
                  <DoorOpen v-else :size="24" class="text-warning" />
                </div>
                <Sparkline
                  v-else-if="vis.values.length > 1"
                  :data="vis.values"
                  :color="SENSOR_TYPE_META[vis.tipo].color"
                  :width="120"
                  :height="28"
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
