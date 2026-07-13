import type { Zone, Group } from '~/types'

export interface BackendZone {
  zone_id: number
  nombre: string
  direccion: string | null
  status: string | null
  updated_at: string
}

export interface BackendGroup {
  group_id: number
  nombre: string
  status: string | null
  updated_at: string
}

function statusToNumber(s: string | null | undefined): number {
  if (s == null) return 0
  const lowered = s.toLowerCase()
  if (lowered === 'active' || lowered === 'enabled' || lowered === '1' || lowered === 'true') return 1
  if (lowered === 'inactive' || lowered === 'disabled' || lowered === '0' || lowered === 'false') return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export function toZone(b: BackendZone): Zone {
  return {
    id: b.zone_id,
    nombre: b.nombre,
    direccion: b.direccion ?? '',
    estaciones: 0,
    status: statusToNumber(b.status),
  }
}

export function toGroup(b: BackendGroup): Group {
  return {
    id: b.group_id,
    nombre: b.nombre,
    status: statusToNumber(b.status),
    estaciones: 0,
  }
}
