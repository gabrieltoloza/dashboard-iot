import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User, LoginResponse, ProfileResponse } from '~/types/auth'
import { authFetch } from '~/composables/useAuthApi'

const initialValue = (): User => ({
    id: 0,
    username: '',
    email: '',
    role: [],
    bearer_token: null,
    auth: false,
})

export const useUserStore = defineStore('user', () => {
    const user = ref<User>(initialValue())

    const getUser = computed(() => user.value)
    const isAuthenticated = computed(() => user.value.auth)
    const hasRole = (role: string) => user.value.role.includes(role)
    const isAdmin = computed(() => user.value.role.includes('admin'))

    function setUser(data: User) {
        user.value = { ...data, auth: true }
    }

    function resetUser() {
        user.value = initialValue()
    }

    async function initialize() {
        try {
            const res = await authFetch<ProfileResponse>('/sessions/profile')
            if (res?.user) {
                setUser(res.user)
            } else {
                resetUser()
            }
        } catch {
            resetUser()
        }
    }

    async function login(username: string, password: string): Promise<LoginResponse> {
        const res = await authFetch<LoginResponse>('/sessions/login', {
            method: 'POST',
            body: { username, password },
        })
        if (!res?.status) {
            throw new Error(res?.message || 'Login fallido')
        }
        return res
    }

    async function logout(): Promise<void> {
        try {
            await authFetch('/sessions/logout')
        } catch {
        }
    }

    return {
        user,
        getUser,
        isAuthenticated,
        isAdmin,
        hasRole,
        setUser,
        resetUser,
        initialize,
        login,
        logout,
    }
})
