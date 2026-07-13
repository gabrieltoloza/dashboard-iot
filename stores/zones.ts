import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Zone } from '~/types'
import { getZonesData, createZone as create, updateZone as update, deleteZone as remove } from '~/services/api'

export const useZonesStore = defineStore('zones', () => {
    const zones = ref<Zone[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchZones() {
        loading.value = true
        error.value = null
        try {
            zones.value = await getZonesData()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch zones'
        } finally {
            loading.value = false
        }
    }

    async function createZone(zone: Omit<Zone, 'id'>) {
        try {
            const newZone = await create(zone)
            zones.value.push(newZone)
            return newZone
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create zone'
            throw e
        }
    }

    async function updateZone(id: number, updates: Partial<Zone>) {
        try {
            const updated = await update(id, updates)
            if (updated) {
                const index = zones.value.findIndex(z => z.id === id)
                if (index !== -1) {
                    zones.value[index] = updated
                }
            }
            return updated
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update zone'
            throw e
        }
    }

    async function toggleZoneStatus(id: number) {
        const zone = zones.value.find(z => z.id === id)
        if (zone) {
            await updateZone(id, { status: zone.status === 1 ? 0 : 1 })
        }
    }

    async function deleteZone(id: number) {
        try {
            await remove(id)
            zones.value = zones.value.filter(z => z.id !== id)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to delete zone'
            throw e
        }
    }

    function reset() {
        zones.value = []
        loading.value = false
        error.value = null
    }

    return {

        // Getters
        zones,
        loading,
        error,

        // Actions
        fetchZones,
        createZone,
        updateZone,
        toggleZoneStatus,
        deleteZone,
        reset,
    }
})
