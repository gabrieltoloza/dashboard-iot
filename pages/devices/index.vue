<script setup lang="ts">
import { Download, List, LayoutGrid } from 'lucide-vue-next'

const devicesStore = useDevicesStore()
const zonesStore = useZonesStore()
const groupsStore = useGroupsStore()

const columns = [
  { key: 'serial', label: 'Serial', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'status', label: 'Estado', sortable: true },
  { key: 'zona', label: 'Zona', sortable: true },
  { key: 'grupo', label: 'Grupo', sortable: true },
  { key: 'sensores', label: 'Sensores' },
  { key: 'acciones', label: '' },
]

const tableData = computed(() =>
  devicesStore.devices.map(d => ({
    id: d.id,
    serial: d.serial,
    nombre: d.nombre,
    modelo: d.modelo,
    status: d.status,
    zona: d.zona,
    grupo: d.grupo,
    sensores: d.sensores,
  }))
)

const zones = computed(() => zonesStore.zones)
const groups = computed(() => groupsStore.groups)

const statusOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Warning', value: 'warning' },
]

const zoneOptions = computed(() => [
  { label: 'Todas las zonas', value: 'all' },
  ...zones.value.map(z => ({ label: z.nombre, value: z.id })),
])

const groupOptions = computed(() => [
  { label: 'Todos los grupos', value: 'all' },
  ...groups.value.map(g => ({ label: g.nombre, value: g.id })),
])

function getZoneName(id: number): string {
  return zones.value.find(z => z.id === id)?.nombre || 'N/A'
}

function getGroupName(id: number): string {
  return groups.value.find(g => g.id === id)?.nombre || 'N/A'
}

onMounted(() => {
  devicesStore.fetchDevices()
  zonesStore.fetchZones()
  groupsStore.fetchGroups()
})
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader title="Estaciones" description="Gestión de estaciones IoT">
      <template #actions>
        <UiButton variant="outline" size="sm">
          <Download class="h-4 w-4" />
          Exportar
        </UiButton>
      </template>
    </AppPageHeader>

    <div class="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
      <div class="flex flex-wrap gap-3 flex-1">
        <AppSearchBar v-model="devicesStore.filters.search" placeholder="Buscar por nombre, serial o modelo..." class="w-72" />
        <UiSelect v-model="devicesStore.filters.status" :options="statusOptions" class="w-44" />
        <UiSelect v-model="devicesStore.filters.zona" :options="zoneOptions" class="w-44" />
        <UiSelect v-model="devicesStore.filters.grupo" :options="groupOptions" class="w-44" />
      </div>

      <div class="flex items-center border border-input rounded-md p-1 bg-background">
        <UiButton
          :variant="devicesStore.viewMode === 'table' ? 'secondary' : 'ghost'"
          size="icon"
          @click="devicesStore.setViewMode('table')"
        >
          <List class="h-4 w-4" />
        </UiButton>
        <UiButton
          :variant="devicesStore.viewMode === 'grid' ? 'secondary' : 'ghost'"
          size="icon"
          @click="devicesStore.setViewMode('grid')"
        >
          <LayoutGrid class="h-4 w-4" />
        </UiButton>
      </div>
    </div>

    <div v-if="devicesStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiSkeleton v-for="i in 6" :key="i" type="card" />
    </div>

    <template v-else-if="devicesStore.viewMode === 'table'">
      <AppDataTable :columns="columns" :data="tableData" :loading="devicesStore.loading">
        <template #cell-status="{ row }">
          <AppStatusBadge :status="row.status" />
        </template>
        <template #cell-zona="{ row }">
          {{ getZoneName(row.zona) }}
        </template>
        <template #cell-grupo="{ row }">
          {{ getGroupName(row.grupo) }}
        </template>
        <template #cell-sensores="{ row }">
          <UiBadge variant="secondary">{{ row.sensores.length }}</UiBadge>
        </template>
        <template #cell-acciones="{ row }">
          <UiButton variant="ghost" size="sm" as-child>
            <NuxtLink :to="`/devices/${row.id}`">Ver detalle</NuxtLink>
          </UiButton>
        </template>
      </AppDataTable>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="device in devicesStore.devices" :key="device.id" class="hover:shadow-md transition-shadow">
          <UiCardContent class="p-5">
            <div class="flex items-start justify-between">
              <div class="min-w-0">
                <h3 class="font-semibold truncate">{{ device.nombre }}</h3>
                <p class="text-sm text-muted-foreground">{{ device.serial }}</p>
              </div>
              <AppStatusBadge :status="device.status" />
            </div>

            <UiSeparator class="my-4" />

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Modelo</span>
                <span class="font-medium truncate ml-2">{{ device.modelo }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Zona</span>
                <span class="font-medium">{{ getZoneName(device.zona) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sensores</span>
                <UiBadge variant="secondary">{{ device.sensores.length }}</UiBadge>
              </div>
            </div>

            <UiButton class="mt-4 w-full" size="sm" as-child>
              <NuxtLink :to="`/devices/${device.id}`">Ver detalle</NuxtLink>
            </UiButton>
          </UiCardContent>
        </UiCard>
      </div>
    </template>
  </div>
</template>
