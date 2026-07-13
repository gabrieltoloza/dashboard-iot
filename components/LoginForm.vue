<script setup lang="ts">
import { ref } from 'vue'
import { LogIn, AlertCircle } from 'lucide-vue-next'

const { login } = useLogin()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function onSubmit() {
  if (loading.value) return
  errorMessage.value = null
  loading.value = true
  try {
    await login(username.value.trim(), password.value)
    await navigateTo('/dashboard')
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Error al iniciar sesion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div v-if="errorMessage" class="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />
      <span class="leading-tight">{{ errorMessage }}</span>
    </div>

    <div class="space-y-2">
      <UiLabel for="login-username">Usuario</UiLabel>
      <UiInput
        id="login-username"
        v-model="username"
        type="text"
        placeholder="Ingrese su usuario"
        autocomplete="username"
        required
        :disabled="loading"
      />
    </div>

    <div class="space-y-2">
      <UiLabel for="login-password">Contrasena</UiLabel>
      <UiInput
        id="login-password"
        v-model="password"
        type="password"
        placeholder="Ingrese su contrasena"
        autocomplete="current-password"
        required
        :disabled="loading"
      />
    </div>

    <UiButton type="submit" class="w-full" :disabled="loading">
      <LogIn v-if="!loading" class="h-4 w-4" />
      <span>{{ loading ? 'Ingresando...' : 'Iniciar sesion' }}</span>
    </UiButton>
  </form>
</template>
