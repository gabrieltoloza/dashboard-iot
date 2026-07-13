<script setup lang="ts">
const userStore = useUserStore()

useHead({
    htmlAttrs: {
        class: 'dark',
    },
})

onMounted(() => {
    userStore.initialize()
})
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
