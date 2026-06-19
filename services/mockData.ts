import type { Device, Sensor, SensorType, SensorState, DataPoint, AlarmPoint, AlarmSeverity, AlarmEstado, Zone, Group, DashboardMetrics, RecentEvent } from '~/types'
import { SENSOR_TYPE_META } from '~/types'

const sensorTypeList = (Object.keys(SENSOR_TYPE_META) as SensorType[]).filter(t => t !== 'puerta')

const modelos = [
  'Compresor Industrial Atlas',
  'Bomba Hidráulica Grundfos',
  'Inversor Schneider',
  'Generador Cummins',
  'PLC Siemens S7-1500',
  'Variador ABB ACS',
  'Compresor de Aire Ingersoll',
  'Bomba Dosificadora Milton Roy',
  'Servidor de Planta Dell',
  'Gateway IoT Advantech',
]

const nombresDispositivos = [
  'Compresor Principal',
  'Bomba Norte',
  'Panel Solar 1',
  'Subestación Este',
  'Caldera Industrial',
  'Línea de Ensamble A',
  'Línea de Ensamble B',
  'Compresor Auxiliar',
  'Bomba Sur',
  'Generador de Respaldo',
]

const zonasData: Zone[] = [
  { id: 1, nombre: 'Zona Producción', direccion: 'Av. Industrial 1234', estaciones: 8, status: 1 },
  { id: 2, nombre: 'Zona Logística', direccion: 'Calle Almacén 567', estaciones: 5, status: 1 },
  { id: 3, nombre: 'Zona Energía', direccion: 'Subestación Central', estaciones: 3, status: 1 },
  { id: 4, nombre: 'Zona Servicios', direccion: 'Cisterna y Bombeo', estaciones: 4, status: 0 },
  { id: 5, nombre: 'Zona Mantenimiento', direccion: 'Taller Principal', estaciones: 2, status: 1 },
]

const gruposData: Group[] = [
  { id: 1, nombre: 'Críticos 24/7', status: 1, estaciones: 6 },
  { id: 2, nombre: 'Producción Turno A', status: 1, estaciones: 5 },
  { id: 3, nombre: 'Producción Turno B', status: 1, estaciones: 4 },
  { id: 4, nombre: 'Respaldo', status: 0, estaciones: 3 },
]

const mensajesAlarmas = [
  'Temperatura elevada detectada',
  'Humedad fuera de rango',
  'Presión crítica en sistema',
  'Tensión inestable detectada',
  'Corriente por encima del límite',
  'Frecuencia fuera de rango nominal',
  'Puerta abierta sin autorización',
  'Conexión perdida con dispositivo',
  'Batería baja en sensor',
  'Calibración requerida',
  'Valor fuera de umbrales',
  'Falla de comunicación',
  'Sobrecorriente detectada',
  'Bajo nivel de presión',
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgo = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() - randomInt(0, daysAgo))
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59))
  return date
}

function generateSerial(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let serial = 'IOT-'
  for (let i = 0; i < 8; i++) serial += chars.charAt(Math.floor(Math.random() * chars.length))
  return serial
}

function generateSensor(deviceId: number, index: number, forceType?: SensorType): Sensor {
  const tipo = forceType || randomElement(sensorTypeList)
  const meta = SENSOR_TYPE_META[tipo]
  const estado: SensorState = Math.random() > 0.85 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'normal'
  let valor: number
  if (tipo === 'puerta') {
    valor = Math.random() > 0.5 ? 1 : 0
  } else if (estado === 'warning') {
    valor = randomFloat(meta.min, meta.min + (meta.max - meta.min) * 0.2)
  } else if (estado === 'critical') {
    valor = meta.max - 1
  } else {
    valor = randomFloat(meta.min, meta.max)
  }
  const nombre = `${meta.label} ${index + 1}`
  return {
    id: `${deviceId}-${tipo}-${index}`,
    nombre,
    tipo,
    valor,
    unidad: meta.unit,
    fechaActualizacion: randomDate(0).toISOString(),
    estado,
    min: meta.min,
    max: meta.max,
  }
}

function generateDevice(index: number): Device {
  const zona = randomElement(zonasData)
  const grupo = randomElement(gruposData)
  const tipos: SensorType[] = []
  const numSensores = randomInt(2, 5)
  const usedTypes = new Set<SensorType>()
  for (let i = 0; i < numSensores; i++) {
    let tipo: SensorType
    do {
      tipo = randomElement(sensorTypeList)
    } while (usedTypes.has(tipo))
    usedTypes.add(tipo)
    tipos.push(tipo)
  }
  const sensores = tipos.map((t, i) => generateSensor(index, i, t))
  const hasWarning = sensores.some(s => s.estado === 'warning')
  const hasCritical = sensores.some(s => s.estado === 'critical')
  const allNormal = sensores.every(s => s.estado === 'normal')
  let status: Device['status']
  if (allNormal) status = Math.random() > 0.1 ? 'online' : 'offline'
  else if (hasCritical) status = Math.random() > 0.3 ? 'warning' : 'offline'
  else if (hasWarning) status = Math.random() > 0.15 ? 'online' : 'warning'
  else status = 'online'
  return {
    id: index,
    serial: generateSerial(),
    modelo: randomElement(modelos),
    zona: zona.id,
    grupo: grupo.id,
    nombre: randomElement(nombresDispositivos),
    status,
    sensores,
  }
}

export function generateDevices(count = 5): Device[] {
  return Array.from({ length: count }, (_, i) => generateDevice(i + 1))
}

export function generateDataPoints(device: Device, hours = 24, stepMin = 5): DataPoint[] {
  const dataPoints: DataPoint[] = []
  const now = new Date()
  const steps = Math.floor((hours * 60) / stepMin)
  for (const sensor of device.sensores) {
    const meta = SENSOR_TYPE_META[sensor.tipo]
    for (let i = steps; i >= 0; i--) {
      const date = new Date(now.getTime() - i * stepMin * 60 * 1000)
      let valor: number
      if (sensor.tipo === 'puerta') {
        valor = Math.random() > 0.7 ? 1 : 0
      } else {
        const base = (meta.min + meta.max) / 2
        const variance = (meta.max - meta.min) * 0.3
        valor = randomFloat(Math.max(meta.min, base - variance), Math.min(meta.max, base + variance))
      }
      dataPoints.push({
        id: `${sensor.id}-${date.getTime()}`,
        fecha: date.toISOString(),
        dispositivo: device.nombre,
        nombre: sensor.nombre,
        sensor: sensor.tipo,
        valor,
      })
    }
  }
  return dataPoints
}

export function generateAlarms(devices: Device[], count = 30): AlarmPoint[] {
  const alarms: AlarmPoint[] = []
  for (let i = 0; i < count; i++) {
    const device = randomElement(devices)
    const sensor = randomElement(device.sensores)
    const severidad: AlarmSeverity = randomElement(['info', 'warning', 'critical'])
    const estado: AlarmEstado = randomElement(['active', 'active', 'active', 'acknowledged', 'resolved'])
    alarms.push({
      id: `ALM-${String(i + 1).padStart(5, '0')}`,
      fecha: randomDate(7).toISOString(),
      dispositivo: device.serial,
      nombre: device.nombre,
      sensor: sensor.nombre,
      alarma: randomElement(mensajesAlarmas),
      valor: `${sensor.valor} ${sensor.unidad}`,
      severidad,
      estado,
    })
  }
  return alarms.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

export function getZones(): Zone[] { return [...zonasData] }
export function getGroups(): Group[] { return [...gruposData] }

export function getDashboardMetrics(devices: Device[], alarms: AlarmPoint[]): DashboardMetrics {
  const online = devices.filter(d => d.status === 'online').length
  const offline = devices.filter(d => d.status === 'offline').length
  const warning = devices.filter(d => d.status === 'warning').length
  const activeAlarms = alarms.filter(a => a.estado === 'active').length
  const totalSensores = devices.reduce((acc, d) => acc + d.sensores.length, 0)
  return {
    totalDispositivos: devices.length,
    dispositivosOnline: online,
    dispositivosOffline: offline,
    totalZonas: zonasData.filter(z => z.status === 1).length,
    totalGrupos: gruposData.filter(g => g.status === 1).length,
    alarmasActivas: activeAlarms,
    totalSensores,
    ultimaActualizacion: new Date().toISOString(),
  }
}

export function getRecentEvents(devices: Device[], alarms: AlarmPoint[]): RecentEvent[] {
  const events: RecentEvent[] = []
  for (const alarm of alarms.slice(0, 10)) {
    events.push({
      id: `evt-alarm-${alarm.id}`,
      tipo: 'alarm' as const,
      mensaje: alarm.alarma,
      timestamp: alarm.fecha,
      dispositivo: alarm.dispositivo,
      severidad: alarm.severidad,
    })
  }
  for (const device of devices.slice(0, 5)) {
    if (device.status === 'online') {
      events.push({
        id: `evt-status-${device.id}`,
        tipo: 'status' as const,
        mensaje: `${device.nombre} está online`,
        timestamp: new Date().toISOString(),
        dispositivo: device.serial,
      })
    }
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
