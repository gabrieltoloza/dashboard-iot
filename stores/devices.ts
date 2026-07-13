import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device, DeviceFilters, ViewMode } from '~/types'
import { getDevices, getDevice } from '~/services/api'

export const useDevicesStore = defineStore('devices', () => {
    const devices = ref<Device[]>([])
    const selectedDevice = ref<Device | null>(null)
    const filters = ref<DeviceFilters>({
        search: '',
        status: 'all',
        zona: 'all',
        grupo: 'all',
    })
    const viewMode = ref<ViewMode>('table')
    const loading = ref(false)
    const error = ref<string | null>(null)

    function byId(id: number): Device | null {
        return devices.value.find(d => d.id === id) ?? null
    }

    function byNombre(nombre: string): Device | null {
        return devices.value.find(d => d.nombre === nombre) ?? null
    }

    async function fetchDevices() {
        loading.value = true
        error.value = null
        try {
            const result = await getDevices(filters.value)
            devices.value = result
            if (typeof console !== 'undefined') {
                console.log('[devicesStore] fetchDevices OK', { count: result.length, filters: filters.value })
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch devices'
            if (typeof console !== 'undefined') {
                console.error('[devicesStore] fetchDevices FAILED', e)
            }
        } finally {
            loading.value = false
        }
    }

    async function fetchDevice(id: number) {
        loading.value = true
        error.value = null
        try {
            selectedDevice.value = (await getDevice(id)) ?? null
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch device'
        } finally {
            loading.value = false
        }
    }

    function setFilters(newFilters: Partial<DeviceFilters>) {
        filters.value = { ...filters.value, ...newFilters }
        fetchDevices()
    }

    function setViewMode(mode: ViewMode) {
        viewMode.value = mode
    }

    function clearFilters() {
        filters.value = {
            search: '',
            status: 'all',
            zona: 'all',
            grupo: 'all',
        }
        fetchDevices()
    }

    function reset() {
        devices.value = []
        selectedDevice.value = null
        filters.value = {
            search: '',
            status: 'all',
            zona: 'all',
            grupo: 'all',
        }
        viewMode.value = 'table'
        loading.value = false
        error.value = null
    }

    return {
        devices,
        selectedDevice,
        filters,
        viewMode,
        loading,
        error,
        byId,
        byNombre,
        fetchDevices,
        fetchDevice,
        setFilters,
        setViewMode,
        clearFilters,
        reset,
    }
})
