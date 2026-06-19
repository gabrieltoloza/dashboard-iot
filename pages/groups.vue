<script setup lang="ts">
import { Plus, Users, Pencil, Trash2, Cpu } from 'lucide-vue-next'
import type { Group } from '~/types'

const groupsStore = useGroupsStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingId = ref<number | null>(null)
const groupToDelete = ref<Group | null>(null)

const formData = ref({ nombre: '', estaciones: 0, status: 1 })

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.value = { nombre: '', estaciones: 0, status: 1 }
  showModal.value = true
}

function openEditModal(group: Group) {
  isEditing.value = true
  editingId.value = group.id
  formData.value = { nombre: group.nombre, estaciones: group.estaciones, status: group.status }
  showModal.value = true
}

async function saveGroup() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await groupsStore.updateGroup(editingId.value, formData.value)
    } else {
      await groupsStore.createGroup(formData.value)
    }
    showModal.value = false
  } finally {
    saving.value = false
  }
}

async function toggleGroup(id: number) {
  await groupsStore.toggleGroupStatus(id)
}

function confirmDelete(group: Group) {
  groupToDelete.value = group
  showDeleteModal.value = true
}

async function deleteGroup() {
  if (!groupToDelete.value) return
  deleting.value = true
  try {
    await groupsStore.deleteGroup(groupToDelete.value.id)
    showDeleteModal.value = false
    groupToDelete.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  groupsStore.fetchGroups()
})
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader title="Grupos" description="Gestión de grupos de trabajo">
      <template #actions>
        <UiButton @click="openCreateModal()">
          <Plus class="h-4 w-4" />
          Nuevo Grupo
        </UiButton>
      </template>
    </AppPageHeader>

    <div v-if="groupsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiSkeleton v-for="i in 3" :key="i" type="card" />
    </div>

    <div v-else-if="groupsStore.groups.length === 0" class="py-12">
      <AppEmptyState title="Sin grupos" description="Crea el primer grupo para empezar" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard v-for="group in groupsStore.groups" :key="group.id">
        <UiCardContent class="p-5">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users class="h-4 w-4" />
              </div>
              <h3 class="font-semibold truncate">{{ group.nombre }}</h3>
            </div>
            <UiBadge :variant="group.status === 1 ? 'success' : 'secondary'">
              {{ group.status === 1 ? 'Activo' : 'Inactivo' }}
            </UiBadge>
          </div>

          <div class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu class="h-4 w-4" />
            <span>{{ group.estaciones }} estaciones</span>
          </div>

          <div class="mt-4 flex gap-2">
            <UiButton variant="outline" size="sm" class="flex-1" @click="openEditModal(group)">
              <Pencil class="h-3 w-3" />
              Editar
            </UiButton>
            <UiButton variant="outline" size="sm" @click="toggleGroup(group.id)">
              {{ group.status === 1 ? 'Desactivar' : 'Activar' }}
            </UiButton>
            <UiButton variant="outline" size="icon" @click="confirmDelete(group)">
              <Trash2 class="h-3 w-3 text-destructive" />
            </UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <AppModal v-model:open="showModal" :title="isEditing ? 'Editar Grupo' : 'Nuevo Grupo'" size="md">
      <form @submit.prevent="saveGroup()" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Nombre</label>
          <UiInput v-model="formData.nombre" required />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Estaciones</label>
          <UiInput v-model.number="formData.estaciones" type="number" min="0" required />
        </div>
      </form>
      <template #footer>
        <UiButton variant="ghost" @click="showModal = false">Cancelar</UiButton>
        <UiButton @click="saveGroup()" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </UiButton>
      </template>
    </AppModal>

    <AppModal v-model:open="showDeleteModal" title="Confirmar Eliminación" size="sm">
      <p>¿Está seguro de que desea eliminar el grupo <strong>{{ groupToDelete?.nombre }}</strong>?</p>
      <template #footer>
        <UiButton variant="ghost" @click="showDeleteModal = false">Cancelar</UiButton>
        <UiButton variant="destructive" @click="deleteGroup()" :disabled="deleting">
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </UiButton>
      </template>
    </AppModal>
  </div>
</template>
