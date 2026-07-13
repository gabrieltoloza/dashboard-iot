export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore()

  if (!userStore.isAuthenticated) {
    await userStore.initialize()
  }

  if (!userStore.isAuthenticated) {
    return navigateTo('/')
  }
})
