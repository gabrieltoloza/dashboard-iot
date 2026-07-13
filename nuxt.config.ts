export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    ssr: false,

    modules: [
        '@pinia/nuxt',
        '@vueuse/nuxt',
    ],

    css: [
        '~/assets/css/main.css',
    ],

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },

    app: {
        baseURL: '/dashboard-iot/',
        buildAssetsDir: '_nuxt/',
        head: {
            title: 'IoT Dashboard',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Plataforma de monitoreo y gestion de dispositivos IoT' },
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
            ],
        },
    },

    nitro: {
        preset: 'static',
        prerender: {
            crawlLinks: false,
            routes: ['/'],
        },
    },

    runtimeConfig: {
        public: {
            apiBaseUrl: import.meta.env.NUXT_PUBLIC_API_BASE_URL || '/api',
            apiProxyTarget: import.meta.env.NUXT_PUBLIC_API_PROXY_TARGET || 'http://127.0.0.1:3003',
            pollingInterval: 30000,
        },
    },

    vite: {
        server: {
            proxy: {
                '/dashboard-iot/api': {
                    target: import.meta.env.NUXT_PUBLIC_API_PROXY_TARGET || 'http://127.0.0.1:3003',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/dashboard-iot/, ''),
                },
            },
        },
    },

    typescript: {
        strict: true,
    },
})