import { defineStore } from 'pinia'
import type { AlarmPoint, AlarmFilters } from '~/types'
import { getAlarms, acknowledgeAlarm as ackAlarm } from '~/services/api'

interface AlarmsState {
    alarms: AlarmPoint[]
    filters: AlarmFilters
    loading: boolean
    error: string | null
}

export const useAlarmsStore = defineStore('alarms', {
    state: (): AlarmsState => ({
        alarms: [],
        filters: {
            search: '',
            severidad: 'all',
            estado: 'all',
            dispositivo: 'all'
        },
        loading: false,
        error: null
    }),

    getters: {
        activeAlarmsCount: (state) => state.alarms.filter(a => a.estado === 'active').length,
        criticalCount: (state) => state.alarms.filter(a => a.severidad === 'critical' && a.estado === 'active').length,
        warningCount: (state) => state.alarms.filter(a => a.severidad === 'warning' && a.estado === 'active').length,
        infoCount: (state) => state.alarms.filter(a => a.severidad === 'info' && a.estado === 'active').length
    },

    actions: {
        async fetchAlarms() {
            this.loading = true
            this.error = null
            try {
                this.alarms = await getAlarms(this.filters)
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch alarms'
            } finally {
                this.loading = false
            }
        },

        async acknowledgeAlarm(id: string) {
            try {
                const alarm = await ackAlarm(id)
                if (alarm) {
                    const index = this.alarms.findIndex(a => a.id === id)
                    if (index !== -1) {
                        this.alarms[index] = alarm
                    }
                }
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to acknowledge alarm'
            }
        },

        setFilters(filters: Partial<AlarmFilters>) {
            this.filters = { ...this.filters, ...filters }
            this.fetchAlarms()
        },

        clearFilters() {
            this.filters = {
                search: '',
                severidad: 'all',
                estado: 'all',
                dispositivo: 'all'
            }
            this.fetchAlarms()
        }
    }
})
