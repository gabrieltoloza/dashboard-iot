import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AlarmPoint, AlarmFilters } from '~/types'
import { getAlarms, acknowledgeAlarm as ackAlarm } from '~/services/api'

export const useAlarmsStore = defineStore('alarms', () => {
    const alarms = ref<AlarmPoint[]>([])
    const filters = ref<AlarmFilters>({
        search: '',
        severidad: 'all',
        estado: 'all',
        dispositivo: 'all',
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeAlarmsCount = computed(() =>
        alarms.value.filter(a => a.estado === 'active').length,
    )
    const criticalCount = computed(() =>
        alarms.value.filter(a => a.severidad === 'critical' && a.estado === 'active').length,
    )
    const warningCount = computed(() =>
        alarms.value.filter(a => a.severidad === 'warning' && a.estado === 'active').length,
    )
    const infoCount = computed(() =>
        alarms.value.filter(a => a.severidad === 'info' && a.estado === 'active').length,
    )

    async function fetchAlarms() {
        loading.value = true
        error.value = null
        try {
            alarms.value = await getAlarms(filters.value)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch alarms'
        } finally {
            loading.value = false
        }
    }

    async function acknowledgeAlarm(id: string) {
        try {
            const alarm = await ackAlarm(id)
            if (alarm) {
                const index = alarms.value.findIndex(a => a.id === id)
                if (index !== -1) {
                    alarms.value[index] = alarm
                }
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to acknowledge alarm'
        }
    }

    function setFilters(newFilters: Partial<AlarmFilters>) {
        filters.value = { ...filters.value, ...newFilters }
        fetchAlarms()
    }

    function clearFilters() {
        filters.value = {
            search: '',
            severidad: 'all',
            estado: 'all',
            dispositivo: 'all',
        }
        fetchAlarms()
    }

    function reset() {
        alarms.value = []
        filters.value = {
            search: '',
            severidad: 'all',
            estado: 'all',
            dispositivo: 'all',
        }
        loading.value = false
        error.value = null
    }

    return {
        alarms,
        filters,
        loading,
        error,
        activeAlarmsCount,
        criticalCount,
        warningCount,
        infoCount,
        fetchAlarms,
        acknowledgeAlarm,
        setFilters,
        clearFilters,
        reset,
    }
})
