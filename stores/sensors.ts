import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DataPoint, Sensor } from '~/types'
import { getDeviceDataPoints, getAllSensors, getLatestReadings } from '~/services/api'
import { toSensor, readingKey, type BackendReading } from '~/services/adapters/sensor.adapter'
import type { BackendSensor } from '~/services/adapters/device.adapter'

export interface FlatSensor extends Sensor {
    deviceId: number
    deviceName: string
}

export const useSensorsStore = defineStore('sensors', () => {
    const dataPoints = ref<Record<string, DataPoint[]>>({})
    const timeRange = ref(24)
    const catalog = ref<BackendSensor[]>([])
    const latest = ref<Record<string, BackendReading>>({})
    const loading = ref(false)
    const error = ref<string | null>(null)

    function latestByKey(dispositivo: string, sensor: string): BackendReading | undefined {
        return latest.value[readingKey(dispositivo, sensor)]
    }

    const sensorsByDeviceId = computed<Record<number, BackendSensor[]>>(() => {
        const out: Record<number, BackendSensor[]> = {}
        for (const s of catalog.value) {
            if (!out[s.device_id]) out[s.device_id] = []
            out[s.device_id].push(s)
        }
        return out
    })

    const countByDeviceId = computed<Record<number, number>>(() => {
        const out: Record<number, number> = {}
        const map = sensorsByDeviceId.value
        for (const idStr in map) {
            out[Number(idStr)] = map[Number(idStr)].length
        }
        return out
    })

    const flatSensors = computed<FlatSensor[]>(() => {
        const devicesStore = useDevicesStore()
        const out: FlatSensor[] = []
        for (const bSensor of catalog.value) {
            const device = devicesStore.devices.find(d => d.id === bSensor.device_id)
            if (!device) continue
            const latestReading = latest.value[readingKey(device.nombre, bSensor.sensor_name)]
            const mapped = toSensor(bSensor, latestReading ?? null)
            out.push({ ...mapped, deviceId: device.id, deviceName: device.nombre })
        }
        return out
    })

    async function fetchDataPoints(deviceId: number, hours?: number): Promise<DataPoint[]> {
        const devicesStore = useDevicesStore()
        const device = devicesStore.byId(deviceId) ?? devicesStore.devices.find(d => d.id === deviceId)
        if (!device) {
            dataPoints.value[deviceId] = []
            return []
        }
        loading.value = true
        error.value = null
        try {
            const range = hours ?? timeRange.value
            const data = await getDeviceDataPoints(device.nombre, range)
            dataPoints.value[deviceId] = data
            return data
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch sensor data'
            dataPoints.value[deviceId] = []
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchAllSensors() {
        try {
            catalog.value = await getAllSensors()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch sensors'
        }
    }

    async function fetchLatest() {
        try {
            const data = await getLatestReadings()
            const next: Record<string, BackendReading> = {}
            for (const r of data) next[readingKey(r.dispositivo, r.sensor)] = r
            latest.value = next
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch latest readings'
        }
    }

    function setTimeRange(hours: number) {
        timeRange.value = hours
    }

    function reset() {
        dataPoints.value = {}
        timeRange.value = 24
        catalog.value = []
        latest.value = {}
        loading.value = false
        error.value = null
    }

    return {
        dataPoints,
        timeRange,
        catalog,
        latest,
        loading,
        error,
        latestByKey,
        sensorsByDeviceId,
        countByDeviceId,
        flatSensors,
        fetchDataPoints,
        fetchAllSensors,
        fetchLatest,
        setTimeRange,
        reset,
    }
})
