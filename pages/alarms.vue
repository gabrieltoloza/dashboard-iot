<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AlarmSeverity, AlarmEstado } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const alarmsStore = useAlarmsStore()

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'alarma', label: 'Alarma', sortable: true },
  { key: 'dispositivo', label: 'Dispositivo', sortable: true },
  { key: 'sensor', label: 'Sensor' },
  { key: 'valor', label: 'Valor' },
  { key: 'severidad', label: 'Severidad', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'acciones', label: '' },
]

const tableData = computed(() => alarmsStore.alarms.map(a => ({
  id: a.id,
  alarma: a.alarma,
  dispositivo: a.dispositivo,
  sensor: a.sensor,
  valor: a.valor,
  severidad: a.severidad as AlarmSeverity,
  estado: a.estado as AlarmEstado,
  fecha: a.fecha,
})))

const hasActiveFilters = computed(() =>
  alarmsStore.filters.search ||
  alarmsStore.filters.severidad !== 'all' ||
  alarmsStore.filters.estado !== 'all'
)

const severidadOptions = [
  { label: 'Todas las severidades', value: 'all' },
  { label: 'Crítica', value: 'critical' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Informativa', value: 'info' },
]

const estadoOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activa', value: 'active' },
  { label: 'Reconocida', value: 'acknowledged' },
  { label: 'Resuelta', value: 'resolved' },
]

function getSeverityVariant(severity: AlarmSeverity): 'info' | 'warning' | 'destructive' {
  return severity === 'critical' ? 'destructive' : severity === 'warning' ? 'warning' : 'info'
}

function getEstadoVariant(estado: AlarmEstado): 'destructive' | 'warning' | 'success' {
  return estado === 'active' ? 'destructive' : estado === 'acknowledged' ? 'warning' : 'success'
}

function getEstadoLabel(estado: AlarmEstado): string {
  return { active: 'Activa', acknowledged: 'Reconocida', resolved: 'Resuelta' }[estado]
}

function formatTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

async function acknowledgeAlarm(id: string) {
  await alarmsStore.acknowledgeAlarm(id)
}

onMounted(() => {
  alarmsStore.fetchAlarms()
})
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader title="Centro de Alarmas" description="Gestión y monitoreo de alarmas del sistema">
      <template #actions>
        <UiButton variant="outline" size="sm" @click="alarmsStore.fetchAlarms()">
          <RefreshCw class="h-4 w-4" />
          Refrescar
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppMetricCard label="Total" :value="alarmsStore.alarms.length" variant="default" />
      <AppMetricCard label="Críticas" :value="alarmsStore.criticalCount" variant="error" />
      <AppMetricCard label="Advertencias" :value="alarmsStore.warningCount" variant="warning" />
      <AppMetricCard label="Informativas" :value="alarmsStore.infoCount" variant="info" />
    </div>

    <AppFiltersPanel :has-active-filters="hasActiveFilters" @clear="alarmsStore.clearFilters()">
      <AppSearchBar v-model="alarmsStore.filters.search" placeholder="Buscar alarmas..." class="w-72" />
      <UiSelect v-model="alarmsStore.filters.severidad" :options="severidadOptions" class="w-48" />
      <UiSelect v-model="alarmsStore.filters.estado" :options="estadoOptions" class="w-48" />
    </AppFiltersPanel>

    <AppDataTable :columns="columns" :data="tableData" :loading="alarmsStore.loading">
      <template #cell-severidad="{ row }">
        <AppBadge :severity="row.severidad">{{ row.severidad }}</AppBadge>
      </template>
      <template #cell-estado="{ row }">
        <UiBadge :variant="getEstadoVariant(row.estado)">
          {{ getEstadoLabel(row.estado) }}
        </UiBadge>
      </template>
      <template #cell-fecha="{ row }">
        <span class="text-sm text-muted-foreground">{{ formatTime(row.fecha) }}</span>
      </template>
      <template #cell-acciones="{ row }">
        <UiButton v-if="row.estado === 'active'" size="sm" @click="acknowledgeAlarm(row.id)">
          Reconocer
        </UiButton>
        <span v-else class="text-muted-foreground text-sm">-</span>
      </template>
    </AppDataTable>
  </div>
</template>
