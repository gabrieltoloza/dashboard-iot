export const useLogin = () => {
  const userStore = useUserStore()

  async function login(username: string, password: string) {
    await userStore.login(username, password)
    await userStore.initialize()
  }

  return { login }
}
