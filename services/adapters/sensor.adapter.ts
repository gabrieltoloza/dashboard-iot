import type { Sensor, SensorState } from '~/types'
import { SENSOR_TYPE_META } from '~/types'
import { guessSensorType } from './sensorType.adapter'
import type { BackendSensor } from './device.adapter'

export interface BackendReading {
  record_id: string
  time: string
  dispositivo: string
  sensor: string
  nombre: string | null
  valor_num: number | null
  valor_unit: string | null
  valor_raw: string
  ingested_at?: string
  display_name?: string | null
  unit?: string | null
}

export function toSensor(b: BackendSensor, latest?: BackendReading | null): Sensor {
  const tipo = guessSensorType(b.tipo, b.sensor_name, b.unit)
  const meta = SENSOR_TYPE_META[tipo]
  const unidad = latest?.valor_unit ?? latest?.unit ?? b.unit
  const valor = latest?.valor_num ?? 0
  const fechaActualizacion = latest?.time ?? new Date().toISOString()
  const estado = computeEstado(tipo, valor, meta.min, meta.max, latest)
  const nombre = b.display_name || b.sensor_name
  return {
    id: String(b.sensor_id),
    nombre,
    tipo,
    valor,
    unidad: unidad || meta.unit,
    fechaActualizacion,
    estado,
    min: meta.min,
    max: meta.max,
  }
}

function computeEstado(tipo: string, valor: number, min: number, max: number, latest?: BackendReading | null): SensorState {
  if (!latest) return 'normal'

  if (tipo === 'puerta') {
    return valor === 1 ? 'normal' : 'warning'
  }

  const range = max - min
  if (range <= 0) return 'normal'
  const margin = range * 0.1
  if (valor >= min - margin && valor <= max + margin) {
    if (valor < min + margin || valor > max - margin) return 'warning'
    return 'normal'
  }
  return 'warning'
}

export function readingKey(dispositivo: string, sensor: string): string {
  return `${dispositivo}|${sensor}`
}
