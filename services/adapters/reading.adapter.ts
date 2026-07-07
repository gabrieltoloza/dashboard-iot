import type { DataPoint } from '~/types'
import { guessSensorType } from './sensorType.adapter'
import type { BackendReading } from './sensor.adapter'

export function toDataPoint(b: BackendReading): DataPoint {
  const tipo = guessSensorType(null, b.sensor, b.valor_unit ?? b.unit ?? '')
  return {
    id: b.record_id,
    fecha: b.time,
    dispositivo: b.dispositivo,
    nombre: b.nombre ?? b.sensor,
    sensor: tipo,
    valor: b.valor_num ?? 0,
  }
}
