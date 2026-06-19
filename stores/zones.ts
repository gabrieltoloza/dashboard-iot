import { defineStore } from 'pinia'
import type { Zone } from '~/types'
import { getZonesData, createZone as create, updateZone as update, deleteZone as remove } from '~/services/api'

interface ZonesState {
  zones: Zone[]
  loading: boolean
  error: string | null
}

export const useZonesStore = defineStore('zones', {
  state: (): ZonesState => ({
    zones: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchZones() {
      this.loading = true
      this.error = null
      try {
        this.zones = await getZonesData()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to fetch zones'
      } finally {
        this.loading = false
      }
    },

    async createZone(zone: Omit<Zone, 'id'>) {
      try {
        const newZone = await create(zone)
        this.zones.push(newZone)
        return newZone
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to create zone'
        throw e
      }
    },

    async updateZone(id: number, updates: Partial<Zone>) {
      try {
        const updated = await update(id, updates)
        if (updated) {
          const index = this.zones.findIndex(z => z.id === id)
          if (index !== -1) {
            this.zones[index] = updated
          }
        }
        return updated
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to update zone'
        throw e
      }
    },

    async toggleZoneStatus(id: number) {
      const zone = this.zones.find(z => z.id === id)
      if (zone) {
        await this.updateZone(id, { status: zone.status === 1 ? 0 : 1 })
      }
    },

    async deleteZone(id: number) {
      try {
        await remove(id)
        this.zones = this.zones.filter(z => z.id !== id)
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to delete zone'
        throw e
      }
    }
  }
})
