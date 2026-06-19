<script setup lang="ts">
import { Plus, MapPin, Pencil, Trash2, Cpu } from 'lucide-vue-next'
import type { Zone } from '~/types'

const zonesStore = useZonesStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingId = ref<number | null>(null)
const zoneToDelete = ref<Zone | null>(null)

const formData = ref({ nombre: '', direccion: '', estaciones: 0, status: 1 })

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = { nombre: '', direccion: '', estaciones: 0, status: 1 }
  showModal.value = true
}

function openEditModal(zone: Zone) {
  isEditing.value = true
  editingId.value = zone.id
  formData.value = { nombre: zone.nombre, direccion: zone.direccion, estaciones: zone.estaciones, status: zone.status }
  showModal.value = true
}

async function saveZone() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await zonesStore.updateZone(editingId.value, formData.value)
    } else {
      await zonesStore.createZone(formData.value)
    }
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function toggleZone(id: number) {
  await zonesStore.toggleZoneStatus(id)
}

function confirmDelete(zone: Zone) {
  zoneToDelete.value = zone
  showDeleteModal.value = true
}

async function deleteZone() {
  if (!zoneToDelete.value) return
  deleting.value = true
  try {
    await zonesStore.deleteZone(zoneToDelete.value.id)
    showDeleteModal.value = false
    zoneToDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  zonesStore.fetchZones()
})
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader title="Zonas" description="Gestión de zonas del sistema">
      <template #actions>
        <UiButton @click="openCreateModal()">
          <Plus class="h-4 w-4" />
          Nueva Zona
        </UiButton>
      </template>
    </AppPageHeader>

    <div v-if="zonesStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiSkeleton v-for="i in 3" :key="i" type="card" />
    </div>

    <div v-else-if="zonesStore.zones.length === 0" class="py-12">
      <AppEmptyState title="Sin zonas" description="Crea la primera zona para empezar" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiCard v-for="zone in zonesStore.zones" :key="zone.id">
        <UiCardContent class="p-5">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-lg">{{ zone.nombre }}</h3>
              <p class="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin class="h-3 w-3" />
                {{ zone.direccion }}
              </p>
            </div>
            <UiBadge :variant="zone.status === 1 ? 'success' : 'secondary'">
              {{ zone.status === 1 ? 'Activa' : 'Inactiva' }}
            </UiBadge>
          </div>

          <UiSeparator class="my-4" />

          <div class="flex items-center gap-2 text-sm">
            <Cpu class="h-4 w-4 text-muted-foreground" />
            <span>{{ zone.estaciones }} estaciones</span>
          </div>

          <div class="mt-4 flex gap-2">
            <UiButton variant="outline" size="sm" class="flex-1" @click="openEditModal(zone)">
              <Pencil class="h-3 w-3" />
              Editar
            </UiButton>
            <UiButton variant="outline" size="sm" @click="toggleZone(zone.id)">
              {{ zone.status === 1 ? 'Desactivar' : 'Activar' }}
            </UiButton>
            <UiButton variant="outline" size="icon" @click="confirmDelete(zone)">
              <Trash2 class="h-3 w-3 text-destructive" />
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <AppModal v-model:open="showModal" :title="isEditing ? 'Editar Zona' : 'Nueva Zona'" size="md">
      <form @submit.prevent="saveZone()" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Nombre</label>
          <UiInput v-model="formData.nombre" required />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Dirección</label>
          <UiInput v-model="formData.direccion" required />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Estaciones</label>
          <UiInput v-model.number="formData.estaciones" type="number" min="0" required />
        </div>
      </form>
      <template #footer>
        <UiButton variant="ghost" @click="showModal = false">Cancelar</UiButton>
        <UiButton @click="saveZone()" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </UiButton>
      </template>
    </AppModal>

    <AppModal v-model:open="showDeleteModal" title="Confirmar Eliminación" size="sm">
      <p>¿Está seguro de que desea eliminar la zona <strong>{{ zoneToDelete?.nombre }}</strong>?</p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Cancelar</UiButton>
        <UiButton variant="destructive" @click="deleteZone()" :disabled="deleting">
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>
