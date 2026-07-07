import { defineStore } from 'pinia'
import type { DataPoint, Sensor } from '~/types'
import { getDeviceDataPoints, getAllSensors, getLatestReadings } from '~/services/api'
import { toSensor, readingKey, type BackendReading } from '~/services/adapters/sensor.adapter'
import type { BackendSensor } from '~/services/adapters/device.adapter'

export interface FlatSensor extends Sensor {
    deviceId: number
    deviceName: string
}

interface SensorsState {
    dataPoints: Record<string, DataPoint[]>
    timeRange: number
    catalog: BackendSensor[]
    latest: Record<string, BackendReading>
    loading: boolean
    error: string | null
}

export const useSensorsStore = defineStore('sensors', {
    state: (): SensorsState => ({
        dataPoints: {},
        timeRange: 24,
        catalog: [],
        latest: {},
        loading: false,
        error: null
    }),

    getters: {
        latestByKey: (state) => (dispositivo: string, sensor: string): BackendReading | undefined =>
            state.latest[readingKey(dispositivo, sensor)],

        sensorsByDeviceId(state): Record<number, BackendSensor[]> {
            const out: Record<number, BackendSensor[]> = {}
            for (const s of state.catalog) {
                if (!out[s.device_id]) out[s.device_id] = []
                out[s.device_id].push(s)
            }
            return out
        },

        countByDeviceId(): Record<number, number> {
            const out: Record<number, number> = {}
            for (const idStr in this.sensorsByDeviceId) {
                out[Number(idStr)] = this.sensorsByDeviceId[Number(idStr)].length
            }
            return out
        },

        flatSensors(): FlatSensor[] {
            const devicesStore = useDevicesStore()
            const out: FlatSensor[] = []
            for (const bSensor of this.catalog) {
                const device = devicesStore.devices.find((d) => d.id === bSensor.device_id)
                if (!device) continue
                const latest = this.latest[readingKey(device.nombre, bSensor.sensor_name)]
                const mapped = toSensor(bSensor, latest ?? null)
                out.push({ ...mapped, deviceId: device.id, deviceName: device.nombre })
            }
            return out
        }
    },

    actions: {
        async fetchDataPoints(deviceId: number, hours?: number): Promise<DataPoint[]> {
            const devicesStore = useDevicesStore()
            const device = devicesStore.byId(deviceId) ?? devicesStore.devices.find((d) => d.id === deviceId)
            if (!device) {
                this.dataPoints[deviceId] = []
                return []
            }
            this.loading = true
            this.error = null
            try {
                const range = hours ?? this.timeRange
                const data = await getDeviceDataPoints(device.nombre, range)
                this.dataPoints[deviceId] = data
                return data
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch sensor data'
                this.dataPoints[deviceId] = []
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchAllSensors() {
            try {
                this.catalog = await getAllSensors()
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch sensors'
            }
        },

        async fetchLatest() {
            try {
                const data = await getLatestReadings()
                const next: Record<string, BackendReading> = {}
                for (const r of data) next[readingKey(r.dispositivo, r.sensor)] = r
                this.latest = next
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch latest readings'
            }
        },

        setTimeRange(hours: number) {
            this.timeRange = hours
        }
    }
})
