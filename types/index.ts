export interface Device {
  id: number
  serial: string
  modelo: string
  zona: number
  grupo: number
  nombre: string
  status: 'online' | 'offline' | 'warning'
  sensores: Sensor[]
}

export interface Sensor {
  id: string
  nombre: string
  tipo: SensorType
  valor: number
  unidad: string
  fechaActualizacion: string
  estado: SensorState
  min?: number
  max?: number
}

export type SensorType =
  | 'temperatura'
  | 'humedad'
  | 'tension'
  | 'corriente'
  | 'potencia'
  | 'presion'
  | 'frecuencia'
  | 'puerta'

export type SensorState = 'normal' | 'warning' | 'critical'

export interface DataPoint {
  id: string
  fecha: string
  dispositivo: string
  nombre: string
  sensor: SensorType
  valor: number
}

export interface AlarmPoint {
  id: string
  fecha: string
  dispositivo: string
  nombre: string
  sensor: string
  alarma: string
  valor: string
  severidad: AlarmSeverity
  estado: AlarmEstado
}

export type AlarmSeverity = 'info' | 'warning' | 'critical'
export type AlarmEstado = 'active' | 'acknowledged' | 'resolved'

export interface Zone {
  id: number
  nombre: string
  direccion: string
  estaciones: number
  status: number
}

export interface Group {
  id: number
  nombre: string
  status: number
  estaciones: number
}

export interface DashboardMetrics {
  totalDispositivos: number
  dispositivosOnline: number
  dispositivosOffline: number
  totalZonas: number
  totalGrupos: number
  alarmasActivas: number
  totalSensores: number
  ultimaActualizacion: string
}

export interface RecentEvent {
  id: string
  tipo: 'alarm' | 'status' | 'sensor'
  mensaje: string
  timestamp: string
  dispositivo?: string
  severidad?: AlarmSeverity
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DeviceFilters {
  search?: string
  status?: Device['status'] | 'all'
  zona?: number | 'all'
  grupo?: number | 'all'
}

export interface AlarmFilters {
  search?: string
  severidad?: AlarmSeverity | 'all'
  estado?: AlarmEstado | 'all'
  dispositivo?: number | 'all'
}

export type ViewMode = 'table' | 'grid'

export const SENSOR_TYPE_META: Record<SensorType, { label: string; color: string; unit: string; min: number; max: number }> = {
  temperatura: { label: 'Temperatura', color: '#ef4444', unit: '°C', min: 15, max: 45 },
  humedad: { label: 'Humedad', color: '#3b82f6', unit: '%', min: 30, max: 90 },
  tension: { label: 'Tensión', color: '#f59e0b', unit: 'V', min: 210, max: 240 },
  corriente: { label: 'Corriente', color: '#8b5cf6', unit: 'A', min: 0.5, max: 15 },
  potencia: { label: 'Potencia', color: '#10b981', unit: 'W', min: 0, max: 5000 },
  presion: { label: 'Presión', color: '#06b6d4', unit: 'bar', min: 2, max: 8 },
  frecuencia: { label: 'Frecuencia', color: '#ec4899', unit: 'Hz', min: 49, max: 51 },
  puerta: { label: 'Puerta', color: '#6b7280', unit: '', min: 0, max: 1 },
}
