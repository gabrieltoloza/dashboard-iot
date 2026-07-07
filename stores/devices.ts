import { defineStore } from 'pinia'
import type { Device, DeviceFilters, ViewMode } from '~/types'
import { getDevices, getDevice } from '~/services/api'

interface DevicesState {
    devices: Device[]
    selectedDevice: Device | null
    filters: DeviceFilters
    viewMode: ViewMode
    loading: boolean
    error: string | null
}

export const useDevicesStore = defineStore('devices', {
    state: (): DevicesState => ({
        devices: [],
        selectedDevice: null,
        filters: {
            search: '',
            status: 'all',
            zona: 'all',
            grupo: 'all'
        },
        viewMode: 'table',
        loading: false,
        error: null
    }),

    getters: {
        byId: (state) => (id: number) => state.devices.find((d) => d.id === id) ?? null,
        byNombre: (state) => (nombre: string) => state.devices.find((d) => d.nombre === nombre) ?? null,
    },

    actions: {
        async fetchDevices() {
            this.loading = true
            this.error = null
            try {
                this.devices = await getDevices(this.filters)
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch devices'
            } finally {
                this.loading = false
            }
        },

        async fetchDevice(id: number) {
            this.loading = true
            this.error = null
            try {
                this.selectedDevice = (await getDevice(id)) ?? null
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch device'
            } finally {
                this.loading = false
            }
        },

        setFilters(filters: Partial<DeviceFilters>) {
            this.filters = { ...this.filters, ...filters }
            this.fetchDevices()
        },

        setViewMode(mode: ViewMode) {
            this.viewMode = mode
        },

        clearFilters() {
            this.filters = {
                search: '',
                status: 'all',
                zona: 'all',
                grupo: 'all'
            }
            this.fetchDevices()
        }
    }
})
