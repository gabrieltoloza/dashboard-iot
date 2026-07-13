export const useLogout = async () => {
  const userStore = useUserStore()

  await userStore.logout()
  userStore.resetUser()

  useDashboardStore().reset()
  useDevicesStore().reset()
  useSensorsStore().reset()
  useAlarmsStore().reset()
  useZonesStore().reset()
  useGroupsStore().reset()

  await navigateTo('/')
}
