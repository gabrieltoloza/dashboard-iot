import type { Zone, Group } from '~/types'

export interface BackendZone {
  zone_id: number
  nombre: string
  direccion: string | null
  status: number
  updated_at: string
}

export interface BackendGroup {
  group_id: number
  nombre: string
  status: number
  updated_at: string
}

export function toZone(b: BackendZone): Zone {
  return {
    id: b.zone_id,
    nombre: b.nombre,
    direccion: b.direccion ?? '',
    estaciones: 0,
    status: b.status,
  }
}

export function toGroup(b: BackendGroup): Group {
  return {
    id: b.group_id,
    nombre: b.nombre,
    status: b.status,
    estaciones: 0,
  }
}
