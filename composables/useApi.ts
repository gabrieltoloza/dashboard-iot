type Query = Record<string, string | number | boolean | null | undefined>

export async function apiGet<T>(path: string, query?: Query): Promise<T> {
    const config = useRuntimeConfig()
    const base = (config.public.apiBaseUrl as string) || '/api'
    const url = base.replace(/\/$/, '') + path

    try {
        const res = await $fetch<{ data: T }>(url, {
            method: 'GET',
            query: query as Record<string, string | number>,
        })
        return res.data
    } catch (e: unknown) {
        const err = e as { data?: { error?: string }; message?: string; statusMessage?: string }
        const msg = err?.data?.error || err?.statusMessage || err?.message || `Request failed: ${path}`
        throw new Error(msg)
    }
}