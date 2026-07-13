import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardMetrics, RecentEvent } from '~/types'
import { getDashboardData, refreshData } from '~/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
    
    const metrics = ref<DashboardMetrics | null>(null)
    const recentEvents = ref<RecentEvent[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const lastRefresh = ref<Date | null>(null)

    async function fetchDashboardData() {
        loading.value = true
        error.value = null
        try {
            const data = await getDashboardData()
            metrics.value = data.metrics
            recentEvents.value = data.recentEvents
            lastRefresh.value = new Date()
            if (typeof console !== 'undefined') {
                console.log('[dashboardStore] fetchDashboardData OK', {
                    totalDispositivos: data.metrics.totalDispositivos,
                    totalSensores: data.metrics.totalSensores,
                })
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch dashboard data'
            if (typeof console !== 'undefined') {
                console.error('[dashboardStore] fetchDashboardData FAILED', e)
            }
        } finally {
            loading.value = false
        }
    }

    async function refresh() {
        await refreshData()
        await fetchDashboardData()
    }

    function reset() {
        metrics.value = null
        recentEvents.value = []
        loading.value = false
        error.value = null
        lastRefresh.value = null
    }

    return {

        // Getters
        metrics,
        recentEvents,
        loading,
        error,
        lastRefresh,

        // Setters
        fetchDashboardData,
        refresh,
        reset,
    }
})
