<script setup lang="ts">
import { Activity } from 'lucide-vue-next'

definePageMeta({
  layout: 'blank',
  middleware: ['redirect-authenticated'],
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center gap-3 mb-6">
        <div class="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <Activity class="w-7 h-7 text-primary-foreground" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight">IoT Dashboard</h1>
          <p class="text-sm text-muted-foreground">Iniciar sesion para continuar</p>
        </div>
      </div>

      <UiCard>
        <UiCardContent class="p-6">
          <LoginForm />
        </UiCardContent>
      </UiCard>

      <p class="text-center text-xs text-muted-foreground mt-4">
        Monitoreo y gestion de dispositivos IoT
      </p>
    </div>
  </div>
</template>
