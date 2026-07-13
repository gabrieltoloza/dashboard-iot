<script setup lang="ts">
import { ArrowLeft, RefreshCw, Settings, Download, Bell, DoorOpen, DoorClosed } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { SENSOR_TYPE_META } from '~/types'
import type { SensorState } from '~/types'
import { getDeviceDataPoints } from '~/services/api'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const devicesStore = useDevicesStore()
const zonesStore = useZonesStore()
const groupsStore = useGroupsStore()
const alarmsStore = useAlarmsStore()

const deviceId = computed(() => Number(route.params.id))
const device = computed(() => devicesStore.selectedDevice)

const deviceAlarms = computed(() =>
    alarmsStore.alarms
        .filter(a => a.dispositivo === device.value?.serial)
        .slice(0, 5)
)

const sensorSparklines = ref<Record<string, number[]>>({})

async function loadSensorSparklines() {
  if (!device.value) return
  const points = await getDeviceDataPoints(device.value.nombre, 4)
  const next: Record<string, number[]> = {}
  for (const s of device.value.sensores) {
    next[s.nombre] = points.filter(p => p.nombre === s.nombre).map(p => p.valor)
  }
  sensorSparklines.value = next
}

function getZoneName(id: number): string {
    return zonesStore.zones.find(z => z.id === id)?.nombre || 'N/A'
}
function getGroupName(id: number): string {
    return groupsStore.groups.find(g => g.id === id)?.nombre || 'N/A'
}

function statusVariant(estado: SensorState): 'success' | 'warning' | 'destructive' {
    return estado === 'normal' ? 'success' : estado === 'warning' ? 'warning' : 'destructive'
}

function formatTime(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

const detailPolling = usePolling(() => devicesStore.fetchDevice(deviceId.value), 10000)
const sparklinesPolling = usePolling(() => loadSensorSparklines(), 60000)

onMounted(async () => {
  zonesStore.fetchZones()
  groupsStore.fetchGroups()
  alarmsStore.fetchAlarms()
  await devicesStore.fetchDevice(deviceId.value)
  await loadSensorSparklines()
  detailPolling.start()
  sparklinesPolling.start()
})

onBeforeUnmount(() => {
  detailPolling.stop()
  sparklinesPolling.stop()
})

watch(deviceId, async (id) => {
  if (!id) return
  sensorSparklines.value = {}
  await devicesStore.fetchDevice(id)
  await loadSensorSparklines()
})
</script>

<template>
    <div class="space-y-6">
        <div>
            <UiButton variant="ghost" size="sm" as-child>
                <NuxtLink to="/devices">
                    <ArrowLeft class="h-4 w-4" />
                    Volver a dispositivos
                </NuxtLink>
            </UiButton>
        </div>

        <div v-if="devicesStore.loading" class="space-y-4">
            <UiSkeleton type="card" />
            <UiSkeleton type="card" />
        </div>

        <template v-else-if="device">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <UiCard class="lg:col-span-2">
                    <UiCardContent class="p-5">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h2 class="text-xl font-bold">{{ device.nombre }}</h2>
                                <p class="text-muted-foreground text-sm">{{ device.serial }}</p>
                            </div>
                            <AppStatusBadge :status="device.status" />
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div class="p-3 rounded-lg bg-muted">
                                <p class="text-xs text-muted-foreground">Modelo</p>
                                <p class="font-medium text-sm mt-1 truncate">{{ device.modelo }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-muted">
                                <p class="text-xs text-muted-foreground">Zona</p>
                                <p class="font-medium text-sm mt-1">{{ getZoneName(device.zona) }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-muted">
                                <p class="text-xs text-muted-foreground">Grupo</p>
                                <p class="font-medium text-sm mt-1">{{ getGroupName(device.grupo) }}</p>
                            </div>
                            <div class="p-3 rounded-lg bg-muted">
                                <p class="text-xs text-muted-foreground">Sensores</p>
                                <p class="font-medium text-sm mt-1 font-mono">{{ device.sensores.length }}</p>
                            </div>
                        </div>
                    </UiCardContent>
                </UiCard>

                <UiCard>
                    <UiCardContent class="p-5">
                        <h3 class="font-semibold mb-4">Acciones Rápidas</h3>
                        <div class="space-y-2">
                            <UiButton variant="outline" size="sm" class="w-full justify-start">
                                <RefreshCw class="h-4 w-4" />
                                Reiniciar
                            </UiButton>
                            <UiButton variant="outline" size="sm" class="w-full justify-start">
                                <Settings class="h-4 w-4" />
                                Configurar
                            </UiButton>
                            <UiButton variant="outline" size="sm" class="w-full justify-start">
                                <Download class="h-4 w-4" />
                                Descargar datos
                            </UiButton>
                        </div>
                    </UiCardContent>
                </UiCard>
            </div>

            <UiCard>
                <UiCardHeader>
                    <UiCardTitle class="text-base">Sensores</UiCardTitle>
                </UiCardHeader>
                <UiCardContent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div
                            v-for="sensor in device.sensores"
                            :key="sensor.id"
                            :class="sensor.tipo === 'puerta'
                                ? 'p-4 rounded-lg border hover:border-primary transition-colors'
                                : 'p-4 rounded-lg border hover:border-primary transition-colors min-h-[320px] flex flex-col'"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium">{{ SENSOR_TYPE_META[sensor.tipo].label }}</span>
                                <UiBadge :variant="statusVariant(sensor.estado)">{{ sensor.estado }}</UiBadge>
                            </div>

                            <template v-if="sensor.tipo === 'puerta'">
                                <div class="flex items-center justify-between gap-2">
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-2xl font-bold font-mono" :style="{ color: SENSOR_TYPE_META[sensor.tipo].color }">
                                            {{ sensor.valor }}
                                        </span>
                                        <span class="text-muted-foreground text-sm">{{ sensor.unidad }}</span>
                                    </div>
                                    <DoorClosed v-if="sensor.valor === 1" :size="36" class="text-success shrink-0" />
                                    <DoorOpen v-else :size="36" class="text-warning shrink-0" />
                                </div>
                                <p class="text-xs text-muted-foreground mt-2">
                                    Actualizado: {{ formatTime(sensor.fechaActualizacion) }}
                                </p>
                            </template>

                            <template v-else>
                                <div class="flex-1 min-h-0">
                                    <SensorLineChart
                                        v-if="sensorSparklines[sensor.nombre]?.length"
                                        :data="sensorSparklines[sensor.nombre]"
                                        :color="SENSOR_TYPE_META[sensor.tipo].color"
                                        :label="`${SENSOR_TYPE_META[sensor.tipo].label} (${sensor.unidad})`"
                                        :unit="sensor.unidad"
                                    />
                                </div>
                                <div class="mt-2 flex items-center justify-between text-xs">
                                    <span class="font-mono font-bold" :style="{ color: SENSOR_TYPE_META[sensor.tipo].color }">
                                        {{ sensor.valor }} {{ sensor.unidad }}
                                    </span>
                                    <span class="text-muted-foreground">
                                        Actualizado: {{ formatTime(sensor.fechaActualizacion) }}
                                    </span>
                                </div>
                            </template>
                        </div>
                    </div>
                </UiCardContent>
            </UiCard>

            <UiCard>
                <UiCardHeader>
                    <UiCardTitle class="text-base flex items-center gap-2">
                        <Bell class="h-4 w-4" />
                        Alarmas Recientes
                    </UiCardTitle>
                </UiCardHeader>
                <UiCardContent>
                    <div v-if="deviceAlarms.length === 0" class="text-center py-8 text-muted-foreground">
                        No hay alarmas para este dispositivo
                    </div>
                    <div v-else class="space-y-2">
                        <div v-for="alarm in deviceAlarms" :key="alarm.id"
                            class="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <AppBadge :severity="alarm.severidad">{{ alarm.severidad }}</AppBadge>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">{{ alarm.alarma }}</p>
                                <p class="text-xs text-muted-foreground">{{ alarm.sensor }} - {{ alarm.valor }}</p>
                            </div>
                            <span class="text-xs text-muted-foreground whitespace-nowrap">{{ formatTime(alarm.fecha)
                                }}</span>
                        </div>
                    </div>
                </UiCardContent>
            </UiCard>
        </template>

        <div v-else class="py-12">
            <AppEmptyState title="Dispositivo no encontrado" description="Verifica que el ID sea correcto"
                icon="error" />
        </div>
    </div>
</template>
