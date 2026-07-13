import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Group } from '~/types'
import { getGroupsData, createGroup as create, updateGroup as update, deleteGroup as remove } from '~/services/api'

export const useGroupsStore = defineStore('groups', () => {
    const groups = ref<Group[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchGroups() {
        loading.value = true
        error.value = null
        try {
            groups.value = await getGroupsData()
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch groups'
        } finally {
            loading.value = false
        }
    }

    async function createGroup(group: Omit<Group, 'id'>) {
        try {
            const newGroup = await create(group)
            groups.value.push(newGroup)
            return newGroup
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to create group'
            throw e
        }
    }

    async function updateGroup(id: number, updates: Partial<Group>) {
        try {
            const updated = await update(id, updates)
            if (updated) {
                const index = groups.value.findIndex(g => g.id === id)
                if (index !== -1) {
                    groups.value[index] = updated
                }
            }
            return updated
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to update group'
            throw e
        }
    }

    async function toggleGroupStatus(id: number) {
        const group = groups.value.find(g => g.id === id)
        if (group) {
            await updateGroup(id, { status: group.status === 1 ? 0 : 1 })
        }
    }

    async function deleteGroup(id: number) {
        try {
            await remove(id)
            groups.value = groups.value.filter(g => g.id !== id)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to delete group'
            throw e
        }
    }

    function reset() {
        groups.value = []
        loading.value = false
        error.value = null
    }

    return {
        groups,
        loading,
        error,
        fetchGroups,
        createGroup,
        updateGroup,
        toggleGroupStatus,
        deleteGroup,
        reset,
    }
})
