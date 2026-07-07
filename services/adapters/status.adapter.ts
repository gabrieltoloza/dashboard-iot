export function mapStatus(backend: string | null | undefined): 'online' | 'offline' | 'warning' {
  if (!backend) return 'online'
  const s = backend.toLowerCase().trim()
  if (s.includes('offline') || s.includes('desconectad') || s.includes('fuera de línea')) return 'offline'
  if (s.includes('línea') || s.includes('linea') || s.includes('online') || s.includes('conectad')) return 'online'
  if (s.includes('warning') || s.includes('alerta') || s.includes('advertencia')) return 'warning'
  if (s.includes('error') || s.includes('critical') || s.includes('crític') || s.includes('falla')) return 'warning'
  return 'online'
}
