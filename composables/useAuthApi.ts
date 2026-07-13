type AuthMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface AuthFetchOptions {
  method?: AuthMethod
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean>
}

export async function authFetch<T>(path: string, options: AuthFetchOptions = {}): Promise<T> {
  const config = useRuntimeConfig()
  const base = (config.public.apiBaseUrl as string) || '/api'
  const url = base.replace(/\/$/, '') + path

  try {
    const res = await $fetch<T>(url, {
      method: options.method ?? 'GET',
      body: options.body,
      query: options.query,
      credentials: 'include',
    })
    return res
  } catch (e: unknown) {
    const err = e as { data?: { error?: string; message?: string }; message?: string; statusMessage?: string }
    const msg = err?.data?.message || err?.data?.error || err?.statusMessage || err?.message || `Request failed: ${path}`
    throw new Error(msg)
  }
}
