import type { Device, DataPoint, AlarmPoint, Zone, Group, DashboardMetrics, RecentEvent, DeviceFilters, AlarmFilters } from '~/types'
import { generateDevices, generateDataPoints, generateAlarms, getZones, getGroups, getDashboardMetrics, getRecentEvents } from './mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let devicesCache: Device[] | null = null
let alarmsCache: AlarmPoint[] | null = null

function getDevicesData(): { devices: Device[], alarms: AlarmPoint[] } {
  if (!devicesCache) devicesCache = generateDevices(5)
  if (!alarmsCache) alarmsCache = generateAlarms(devicesCache, 30)
  return { devices: devicesCache, alarms: alarmsCache }
}

export function getDevices(filters?: DeviceFilters): Promise<Device[]> {
  return delay(300).then(() => {
    const { devices } = getDevicesData()
    let result = [...devices]
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(d =>
        d.nombre.toLowerCase().includes(search) ||
        d.serial.toLowerCase().includes(search) ||
        d.modelo.toLowerCase().includes(search)
      )
    }
    if (filters?.status && filters.status !== 'all') result = result.filter(d => d.status === filters.status)
    if (filters?.zona && filters.zona !== 'all') result = result.filter(d => d.zona === filters.zona)
    if (filters?.grupo && filters.grupo !== 'all') result = result.filter(d => d.grupo === filters.grupo)
    return result
  })
}

export function getDevice(id: number): Promise<Device | undefined> {
  return delay(300).then(() => {
    const { devices } = getDevicesData()
    return devices.find(d => d.id === id)
  })
}

export function getDeviceDataPoints(deviceId: number, hours = 24): Promise<DataPoint[]> {
  return delay(300).then(() => {
    const { devices } = getDevicesData()
    const device = devices.find(d => d.id === deviceId)
    if (!device) return []
    return generateDataPoints(device, hours)
  })
}

export function getAlarms(filters?: AlarmFilters): Promise<AlarmPoint[]> {
  return delay(300).then(() => {
    const { alarms } = getDevicesData()
    let result = [...alarms]
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(a =>
        a.nombre.toLowerCase().includes(search) ||
        a.alarma.toLowerCase().includes(search) ||
        a.dispositivo.toLowerCase().includes(search)
      )
    }
    if (filters?.severidad && filters.severidad !== 'all') result = result.filter(a => a.severidad === filters.severidad)
    if (filters?.estado && filters.estado !== 'all') result = result.filter(a => a.estado === filters.estado)
    if (filters?.dispositivo && filters.dispositivo !== 'all') result = result.filter(a => a.dispositivo === String(filters.dispositivo))
    return result
  })
}

export function acknowledgeAlarm(id: string): Promise<AlarmPoint | undefined> {
  return delay(300).then(() => {
    const { alarms } = getDevicesData()
    const alarm = alarms.find(a => a.id === id)
    if (alarm) alarm.estado = 'acknowledged'
    return alarm
  })
}

export function getZonesData(): Promise<Zone[]> { return delay(300).then(() => getZones()) }

export function createZone(zone: Omit<Zone, 'id'>): Promise<Zone> {
  return delay(300).then(() => {
    const zones = getZones()
    return { ...zone, id: Math.max(...zones.map(z => z.id)) + 1 }
  })
}

export function updateZone(id: number, updates: Partial<Zone>): Promise<Zone | undefined> {
  return delay(300).then(() => {
    const zones = getZones()
    const zone = zones.find(z => z.id === id)
    if (zone) Object.assign(zone, updates)
    return zone
  })
}

export function deleteZone(_id: number): Promise<boolean> {
  return delay(300).then(() => true)
}

export function getGroupsData(): Promise<Group[]> { return delay(300).then(() => getGroups()) }

export function createGroup(group: Omit<Group, 'id'>): Promise<Group> {
  return delay(300).then(() => {
    const groups = getGroups()
    return { ...group, id: Math.max(...groups.map(g => g.id)) + 1 }
  })
}

export function updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined> {
  return delay(300).then(() => {
    const groups = getGroups()
    const group = groups.find(g => g.id === id)
    if (group) Object.assign(group, updates)
    return group
  })
}

export function deleteGroup(_id: number): Promise<boolean> {
  return delay(300).then(() => true)
}

export function getDashboardData(): Promise<{ metrics: DashboardMetrics, recentEvents: RecentEvent[] }> {
  return delay(300).then(() => {
    const { devices, alarms } = getDevicesData()
    return { metrics: getDashboardMetrics(devices, alarms), recentEvents: getRecentEvents(devices, alarms) }
  })
}

export function refreshData(): Promise<void> {
  return delay(300).then(() => {
    devicesCache = null
    alarmsCache = null
  })
}

export function getActiveAlarmsCount(): Promise<number> {
  return delay(300).then(() => {
    const { alarms } = getDevicesData()
    return alarms.filter(a => a.estado === 'active').length
  })
}
