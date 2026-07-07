import type { Device } from '~/types'
import { mapStatus } from './status.adapter'
import { toSensor } from './sensor.adapter'

export interface BackendDevice {
  device_id: number
  serial: string
  modelo: string | null
  nombre: string
  status: string | null
  group_id: number | null
  group_nombre: string | null
  zone_id: number | null
  zone_nombre: string | null
  updated_at: string
}

export interface BackendSensor {
  sensor_id: number
  device_id: number
  sensor_name: string
  display_name: string | null
  tipo: string | null
  unit: string
}

export interface BackendDeviceDetail extends BackendDevice {
  latest_ingested_at: string | null
  latest_reading_value: number | null
  sensores: BackendSensor[]
}

export function toDevice(b: BackendDevice): Device {
  return {
    id: b.device_id,
    serial: b.serial,
    modelo: b.modelo ?? 'N/D',
    zona: b.zone_id ?? 0,
    grupo: b.group_id ?? 0,
    nombre: b.nombre,
    status: mapStatus(b.status),
    sensores: [],
    zonaNombre: b.zone_nombre,
    grupoNombre: b.group_nombre,
  }
}

export function toDeviceDetail(b: BackendDeviceDetail): Device {
  return {
    ...toDevice(b),
    sensores: b.sensores.map((s) => toSensor(s)),
    latestIngestedAt: b.latest_ingested_at,
    latestReadingValue: b.latest_reading_value,
  }
}
