import { defineStore } from 'pinia'
import type { DashboardMetrics, RecentEvent } from '~/types'
import { getDashboardData, refreshData } from '~/services/api'

interface DashboardState {
  metrics: DashboardMetrics | null
  recentEvents: RecentEvent[]
  loading: boolean
  error: string | null
  lastRefresh: Date | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    metrics: null,
    recentEvents: [],
    loading: false,
    error: null,
    lastRefresh: null
  }),

  actions: {
    async fetchDashboardData() {
      this.loading = true
      this.error = null
      try {
        const data = await getDashboardData()
        this.metrics = data.metrics
        this.recentEvents = data.recentEvents
        this.lastRefresh = new Date()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to fetch dashboard data'
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      await refreshData()
      await this.fetchDashboardData()
    }
  }
})
