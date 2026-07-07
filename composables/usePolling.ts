import { useIntervalFn, useDocumentVisibility } from '@vueuse/core'

export function usePolling(cb: () => void | Promise<void>, interval: number) {
  const visibility = useDocumentVisibility()

  const intervalFn = useIntervalFn(cb, interval, {
    immediate: false,
    immediateCallback: false,
  })

  watch(visibility, (v) => {
    if (v === 'hidden') intervalFn.pause()
    else intervalFn.resume()
  }, { immediate: true })

  return {
    start: () => intervalFn.resume(),
    stop: () => intervalFn.pause(),
  }
}
