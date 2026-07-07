import type { SensorType } from '~/types'
import { SENSOR_TYPE_META } from '~/types'

const KNOWN_TYPES = new Set<string>(Object.keys(SENSOR_TYPE_META))

export function guessSensorType(
  tipo: string | null | undefined,
  sensorName: string,
  unit: string,
): SensorType {
  if (tipo && KNOWN_TYPES.has(tipo)) return tipo as SensorType

  const u = (unit || '').toLowerCase()
  const n = (sensorName || '').toLowerCase()
  const t = (tipo || '').toLowerCase()

  if (u === '°c' || u === 'c' || n.startsWith('temp') || t.includes('temp')) return 'temperatura'
  if (u === 'e' || t === 'entrada' || t === 'puerta' || n.startsWith('p') && n.length <= 3) return 'puerta'
  if (u === '%' || t.includes('hum')) return 'humedad'
  if (u === 'v' || t.includes('tens') || t.includes('volt')) return 'tension'
  if (u === 'a' || t.includes('corr')) return 'corriente'
  if (u === 'w' || t.includes('pot')) return 'potencia'
  if (u === 'bar' || t.includes('pres')) return 'presion'
  if (u === 'hz' || t.includes('frec')) return 'frecuencia'

  return 'temperatura'
}

export function sensorTypeFromMeta(tipo: SensorType): { min: number; max: number; color: string; unit: string; label: string } {
  return SENSOR_TYPE_META[tipo]
}
