<script setup lang="ts">
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

const props = defineProps<{
  columns: Column[]
  data: Record<string, any>[]
  loading?: boolean
  pageSize?: number
}>()

const pageSize = props.pageSize || 10
const currentPage = ref(1)
const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() => Math.ceil(props.data.length / pageSize))
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedData.value.slice(start, start + pageSize)
})

function toggleSort(key: string) {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortOrder.value = 'asc' }
}
</script>

<template>
  <UiCard>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th
              v-for="column in columns"
              :key="column.key"
              @click="column.sortable ? toggleSort(column.key) : undefined"
              :class="['h-12 px-4 text-left align-middle font-medium text-muted-foreground', column.sortable ? 'cursor-pointer hover:text-foreground' : '']"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <ChevronUp v-if="column.sortable && sortKey === column.key && sortOrder === 'asc'" class="h-3 w-3" />
                <ChevronDown v-else-if="column.sortable && sortKey === column.key && sortOrder === 'desc'" class="h-3 w-3" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in 5" :key="i" class="border-b">
              <td v-for="column in columns" :key="column.key" class="p-4">
                <UiSkeleton class="h-4 w-24" />
              </td>
            </tr>
          </template>
          <template v-else-if="data.length === 0">
            <tr>
              <td :colspan="columns.length" class="text-center py-12">
                <AppEmptyState title="No hay datos" description="No se encontraron registros" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="(row, index) in paginatedData" :key="index" class="border-b hover:bg-muted/30 transition-colors">
              <td v-for="column in columns" :key="column.key" class="p-4 align-middle">
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && data.length > 0" class="flex items-center justify-between px-4 py-3 border-t">
      <p class="text-sm text-muted-foreground">
        Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, data.length) }} de {{ data.length }}
      </p>
      <div class="flex items-center gap-1">
        <UiButton variant="outline" size="icon" :disabled="currentPage === 1" @click="currentPage--">
          <ChevronLeft class="h-4 w-4" />
        </UiButton>
        <UiButton
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          size="sm"
          @click="currentPage = page"
        >
          {{ page }}
        </UiButton>
        <UiButton variant="outline" size="icon" :disabled="currentPage === totalPages" @click="currentPage++">
          <ChevronRight class="h-4 w-4" />
        </UiButton>
      </div>
    </div>
  </UiCard>
</template>
