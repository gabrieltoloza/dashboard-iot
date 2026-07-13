type Query = Record<string, string | number | boolean | null | undefined>

export async function apiGet<T>(path: string, query?: Query): Promise<T> {
    const config = useRuntimeConfig()
    const base = (config.public.apiBaseUrl as string) || '/api'
    const url = base.replace(/\/$/, '') + path

    try {
        const raw = await $fetch<unknown>(url, {
            method: 'GET',
            query: query as Record<string, string | number | boolean>,
            credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
        })

        if (typeof console !== 'undefined') {
            const preview = Array.isArray(raw)
                ? `Array(${raw.length})`
                : raw && typeof raw === 'object'
                    ? `Object{${Object.keys(raw).join(',')}}`
                    : typeof raw
            console.log(`[apiGet] ${url} → ${preview}`)
        }

        if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
            return (raw as { data: T }).data
        }
        return raw as T
    } catch (e: unknown) {
        const err = e as {
            data?: { error?: string; message?: string }
            message?: string
            statusMessage?: string
            statusCode?: number
        }
        const backendMsg = err?.data?.error || err?.data?.message
        const msg = backendMsg || err?.statusMessage || err?.message || `Request failed: ${path}`
        if (typeof console !== 'undefined') {
            console.error(`[apiGet] ${url} → ERROR`, { status: err?.statusCode, msg, raw: err })
        }
        throw new Error(msg)
    }
}
