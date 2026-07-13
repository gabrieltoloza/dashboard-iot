import type { Device, DataPoint, AlarmPoint, Zone, Group, DashboardMetrics, RecentEvent, DeviceFilters, AlarmFilters } from '~/types'
import { apiGet } from '~/composables/useApi'
import {
    toDevice,
    type BackendDevice,
    type BackendDeviceDetail,
    type BackendSensor,
} from './adapters/device.adapter'
import { toZone, toGroup, type BackendZone, type BackendGroup } from './adapters/zone.adapter'
import { toDataPoint } from './adapters/reading.adapter'
import { toSensor, type BackendReading, readingKey } from './adapters/sensor.adapter'
import { generateAlarms, generateDevices, getZones as mockGetZones, getGroups as mockGetGroups } from './mockData'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let alarmsCache: AlarmPoint[] | null = null

function getAlarmsData(): AlarmPoint[] {
    if (!alarmsCache) {
        const seed = generateDevices(5)
        alarmsCache = generateAlarms(seed, 30)
    }
    return alarmsCache
}

function mapDeviceFilters(filters?: DeviceFilters): Record<string, string | number> {
    if (!filters) return {}
    const out: Record<string, string | number> = {}
    if (filters.search) out.search = filters.search
    if (filters.zona && filters.zona !== 'all') out.zoneId = filters.zona
    if (filters.grupo && filters.grupo !== 'all') out.groupId = filters.grupo
    return out
}

export async function getDevices(filters?: DeviceFilters): Promise<Device[]> {
    const data = await apiGet<BackendDevice[]>('/devices', mapDeviceFilters(filters))
    if (typeof console !== 'undefined') {
        console.log('[getDevices] raw sample', Array.isArray(data) ? data.slice(0, 1) : data)
    }
    let result = data.map(toDevice)
    if (filters?.status && filters.status !== 'all') {
        result = result.filter((d) => d.status === filters.status)
    }
    if (typeof console !== 'undefined') {
        console.log('[getDevices] mapped count', result.length, 'first:', result[0])
    }
    return result
}

export async function getDevice(id: number): Promise<Device | undefined> {
    try {
        const [detail, latest] = await Promise.all([
            apiGet<BackendDeviceDetail>(`/devices/${id}`),
            apiGet<BackendReading[]>('/readings/latest'),
        ])
        const base = toDevice(detail)
        const latestByName: Record<string, BackendReading> = {}
        for (const r of latest) {
            if (r.dispositivo === detail.nombre) latestByName[r.sensor] = r
        }
        return {
            ...base,
            sensores: detail.sensores.map((s) => toSensor(s, latestByName[s.sensor_name] ?? null)),
            latestIngestedAt: detail.latest_ingested_at,
            latestReadingValue: detail.latest_reading_value,
        }
    } catch (e) {
        const err = e as Error
        if (/404|not found/i.test(err.message)) return undefined
        throw e
    }
}

export async function getAllSensors(): Promise<BackendSensor[]> {
    return apiGet<BackendSensor[]>('/sensors')
}

export async function getLatestReadings(): Promise<BackendReading[]> {
    return apiGet<BackendReading[]>('/readings/latest')
}

export async function getDeviceDataPoints(dispositivo: string, hours = 24): Promise<DataPoint[]> {
    if (!dispositivo) return []
    const now = new Date()
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000)
    const data = await apiGet<BackendReading[]>('/readings', {
        device: dispositivo,
        from: from.toISOString(),
        to: now.toISOString(),
        limit: 1000,
    })
    return data.map(toDataPoint)
}

export async function getAlarms(filters?: AlarmFilters): Promise<AlarmPoint[]> {
    await delay(300)
    let result = [...getAlarmsData()]
    if (filters?.search) {
        const search = filters.search.toLowerCase()
        result = result.filter(
            (a) =>
                a.nombre.toLowerCase().includes(search) ||
                a.alarma.toLowerCase().includes(search) ||
                a.dispositivo.toLowerCase().includes(search),
        )
    }
    if (filters?.severidad && filters.severidad !== 'all') result = result.filter((a) => a.severidad === filters.severidad)
    if (filters?.estado && filters.estado !== 'all') result = result.filter((a) => a.estado === filters.estado)
    if (filters?.dispositivo && filters.dispositivo !== 'all') result = result.filter((a) => a.dispositivo === String(filters.dispositivo))
    return result
}

export async function acknowledgeAlarm(id: string): Promise<AlarmPoint | undefined> {
    await delay(300)
    const alarm = getAlarmsData().find((a) => a.id === id)
    if (alarm) alarm.estado = 'acknowledged'
    return alarm
}

export async function getZonesData(): Promise<Zone[]> {
    const data = await apiGet<BackendZone[]>('/zones')
    return data.map(toZone)
}

export async function createZone(zone: Omit<Zone, 'id'>): Promise<Zone> {
    await delay(300)
    const zones = mockGetZones()
    return { ...zone, id: Math.max(...zones.map((z) => z.id), 0) + 1 }
}

export async function updateZone(id: number, updates: Partial<Zone>): Promise<Zone | undefined> {
    await delay(300)
    const zones = mockGetZones()
    const zone = zones.find((z) => z.id === id)
    if (zone) Object.assign(zone, updates)
    return zone
}

export async function deleteZone(_id: number): Promise<boolean> {
    await delay(300)
    return true
}

export async function getGroupsData(): Promise<Group[]> {
    const data = await apiGet<BackendGroup[]>('/groups')
    return data.map(toGroup)
}

export async function createGroup(group: Omit<Group, 'id'>): Promise<Group> {
    await delay(300)
    const groups = mockGetGroups()
    return { ...group, id: Math.max(...groups.map((g) => g.id), 0) + 1 }
}

export async function updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined> {
    await delay(300)
    const groups = mockGetGroups()
    const group = groups.find((g) => g.id === id)
    if (group) Object.assign(group, updates)
    return group
}

export async function deleteGroup(_id: number): Promise<boolean> {
    await delay(300)
    return true
}

export async function getDashboardData(): Promise<{ metrics: DashboardMetrics; recentEvents: RecentEvent[] }> {
    const results = await Promise.allSettled([
        apiGet<BackendDevice[]>('/devices'),
        apiGet<BackendSensor[]>('/sensors'),
        apiGet<BackendZone[]>('/zones'),
        apiGet<BackendGroup[]>('/groups'),
        apiGet<BackendReading[]>('/readings/latest'),
    ])

    const devices = results[0].status === 'fulfilled' ? results[0].value : []
    const sensors = results[1].status === 'fulfilled' ? results[1].value : []
    const zones = results[2].status === 'fulfilled' ? results[2].value : []
    const groups = results[3].status === 'fulfilled' ? results[3].value : []
    const latest = results[4].status === 'fulfilled' ? results[4].value : []

    if (typeof console !== 'undefined') {
        console.log('[getDashboardData]', {
            devices: devices.length,
            sensors: sensors.length,
            zones: zones.length,
            groups: groups.length,
            latest: latest.length,
        })
    }

    const mappedDevices = devices.map(toDevice)
    const online = mappedDevices.filter((d) => d.status === 'online').length
    const offline = mappedDevices.filter((d) => d.status === 'offline').length

    const metrics: DashboardMetrics = {
        totalDispositivos: mappedDevices.length,
        dispositivosOnline: online,
        dispositivosOffline: offline,
        totalZonas: zones.length,
        totalGrupos: groups.length,
        alarmasActivas: 0,
        totalSensores: sensors.length,
        ultimaActualizacion: new Date().toISOString(),
    }

    const recentEvents: RecentEvent[] = latest
        .filter((r) => r.valor_num != null)
        .slice(0, 10)
        .map((r) => {
            const device = mappedDevices.find((d) => d.nombre === r.dispositivo)
            return {
                id: `evt-${r.record_id}`,
                tipo: 'sensor' as const,
                mensaje: `${r.sensor}: ${r.valor_num}${r.valor_unit ?? ''}`,
                timestamp: r.time,
                dispositivo: r.dispositivo,
                severidad: 'info' as const,
                deviceId: device?.id,
            }
        })

    void readingKey

    return { metrics, recentEvents }
}

export async function refreshData(): Promise<void> {
    alarmsCache = null
}

export async function getActiveAlarmsCount(): Promise<number> {
    return 0
}
