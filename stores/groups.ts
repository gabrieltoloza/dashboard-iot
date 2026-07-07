import { defineStore } from 'pinia'
import type { Group } from '~/types'
import { getGroupsData, createGroup as create, updateGroup as update, deleteGroup as remove } from '~/services/api'

interface GroupsState {
    groups: Group[]
    loading: boolean
    error: string | null
}

export const useGroupsStore = defineStore('groups', {
    state: (): GroupsState => ({
        groups: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchGroups() {
            this.loading = true
            this.error = null
            try {
                this.groups = await getGroupsData()
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to fetch groups'
            } finally {
                this.loading = false
            }
        },

        async createGroup(group: Omit<Group, 'id'>) {
            try {
                const newGroup = await create(group)
                this.groups.push(newGroup)
                return newGroup
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to create group'
                throw e
            }
        },

        async updateGroup(id: number, updates: Partial<Group>) {
            try {
                const updated = await update(id, updates)
                if (updated) {
                    const index = this.groups.findIndex(g => g.id === id)
                    if (index !== -1) {
                        this.groups[index] = updated
                    }
                }
                return updated
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to update group'
                throw e
            }
        },

        async toggleGroupStatus(id: number) {
            const group = this.groups.find(g => g.id === id)
            if (group) {
                await this.updateGroup(id, { status: group.status === 1 ? 0 : 1 })
            }
        },

        async deleteGroup(id: number) {
            try {
                await remove(id)
                this.groups = this.groups.filter(g => g.id !== id)
            } catch (e) {
                this.error = e instanceof Error ? e.message : 'Failed to delete group'
                throw e
            }
        }
    }
})
