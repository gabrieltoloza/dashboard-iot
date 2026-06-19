import { defineStore } from 'pinia'
import type { DataPoint } from '~/types'
import { getDeviceDataPoints } from '~/services/api'

interface SensorsState {
  dataPoints: Record<string, DataPoint[]>
  timeRange: number
  loading: boolean
  error: string | null
}

export const useSensorsStore = defineStore('sensors', {
  state: (): SensorsState => ({
    dataPoints: {},
    timeRange: 24,
    loading: false,
    error: null
  }),

  actions: {
    async fetchDataPoints(deviceId: number, hours?: number) {
      this.loading = true
      this.error = null
      try {
        const range = hours ?? this.timeRange
        const data = await getDeviceDataPoints(deviceId, range)
        this.dataPoints[deviceId] = data
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to fetch sensor data'
      } finally {
        this.loading = false
      }
    },

    setTimeRange(hours: number) {
      this.timeRange = hours
    }
  }
})
