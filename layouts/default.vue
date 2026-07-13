<script setup lang="ts">
import { useAlarmsStore } from '~/stores/alarms'
import { TooltipProvider } from 'radix-vue'
import {
	Activity,
	Cpu,
	Bell,
	Map,
	Users,
	BarChart3,
	Sun,
	Moon,
	Menu,
	LogOut,
	ChevronDown,
} from 'lucide-vue-next'

const route = useRoute()
const alarmsStore = useAlarmsStore()
const userStore = useUserStore()

const isDark = ref(true)
const sidebarOpen = ref(false)
const now = ref(new Date())

const navItems = [
	{ to: '/dashboard', label: 'Dashboard', icon: Activity, match: (p: string) => p === '/dashboard' || p === '/' },
	{ to: '/devices', label: 'Dispositivos', icon: Cpu, match: (p: string) => p.startsWith('/devices') },
	{ to: '/sensors', label: 'Sensores', icon: BarChart3, match: (p: string) => p === '/sensors' },
	{ to: '/alarms', label: 'Alarmas', icon: Bell, match: (p: string) => p === '/alarms' },
	{ to: '/zones', label: 'Zonas', icon: Map, match: (p: string) => p === '/zones' },
	{ to: '/groups', label: 'Grupos', icon: Users, match: (p: string) => p === '/groups' },
	{ to: '/charts', label: 'Catálogo de Gráficos', icon: BarChart3, match: (p: string) => p.startsWith('/charts') },
]

const pageTitles: Record<string, string> = {
	'/': 'Dashboard',
	'/dashboard': 'Dashboard',
	'/devices': 'Dispositivos',
	'/sensors': 'Sensores',
	'/alarms': 'Alarmas',
	'/zones': 'Zonas',
	'/groups': 'Grupos',
	'/charts': 'Catálogo de Gráficos',
}

const pageTitle = computed(() => {
	const path = route.path
	if (path.startsWith('/devices/')) return 'Detalle de Dispositivo'
	if (path.startsWith('/charts/')) return 'Gráficos'
	return pageTitles[path] || 'Dashboard'
})

const activeAlarmsCount = computed(() => alarmsStore.activeAlarmsCount)
const currentTime = computed(() => {
	return now.value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const userInitials = computed(() => {
	const name = userStore.user.username || userStore.user.email || '?'
	return name.slice(0, 2).toUpperCase()
})

const userDisplay = computed(() => userStore.user.username || 'Usuario')
const userEmail = computed(() => userStore.user.email || '')

function toggleTheme() {
	isDark.value = !isDark.value
	document.documentElement.classList.toggle('dark', isDark.value)
}

async function handleLogout() {
	await useLogout()
}

let clockInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
	alarmsStore.fetchAlarms()
	clockInterval = setInterval(() => { now.value = new Date() }, 1000)
})

onBeforeUnmount(() => {
	if (clockInterval) clearInterval(clockInterval)
})
</script>

<template>
	<TooltipProvider :delay-duration="200">
		<div class="flex h-screen bg-background">
			<!-- Desktop Sidebar -->
			<aside class="hidden md:flex w-64 bg-card border-r border-border flex-col">
				<div class="p-4 border-b border-border">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
							<Activity class="w-5 h-5 text-primary-foreground" />
						</div>
						<div>
							<h1 class="font-bold text-base">IoT Dashboard</h1>
							<p class="text-xs text-muted-foreground">Monitoring Platform</p>
						</div>
					</div>
				</div>

				<nav class="flex-1 p-3 space-y-1">
					<NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						:class="{ 'bg-primary/10 text-primary hover:bg-primary/15': item.match(route.path) }">
						<component :is="item.icon" class="w-4 h-4" />
						<span class="flex-1">{{ item.label }}</span>
						<span v-if="item.to === '/alarms' && activeAlarmsCount > 0"
							class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
							{{ activeAlarmsCount }}
						</span>
					</NuxtLink>
				</nav>

				<div class="p-4 border-t border-border">
					<UiDropdownMenu>
						<template #trigger>
							<button class="w-full flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-accent">
								<UiAvatar :fallback="userInitials" class="h-9 w-9" />
								<div class="flex-1 min-w-0 text-left">
									<p class="font-medium text-sm truncate">{{ userDisplay }}</p>
									<p class="text-xs text-muted-foreground truncate">{{ userEmail }}</p>
								</div>
								<ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
							</button>
						</template>
						<button
							class="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
							@click="handleLogout"
						>
							<LogOut class="h-4 w-4" />
							<span>Cerrar sesion</span>
						</button>
					</UiDropdownMenu>
				</div>
			</aside>

			<!-- Mobile Sheet -->
			<UiSheet v-model:open="sidebarOpen" side="left">
				<template #trigger>
					<button
						class="md:hidden fixed top-3 left-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground">
						<Menu class="h-4 w-4" />
					</button>
				</template>
				<div class="flex flex-col h-full">
					<div class="p-4 border-b border-border">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
								<Activity class="w-5 h-5 text-primary-foreground" />
							</div>
							<div>
								<h1 class="font-bold text-base">IoT Dashboard</h1>
								<p class="text-xs text-muted-foreground">Monitoring Platform</p>
							</div>
						</div>
					</div>
					<nav class="flex-1 p-3 space-y-1">
						<NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="sidebarOpen = false"
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
							:class="{ 'bg-primary/10 text-primary hover:bg-primary/15': item.match(route.path) }">
							<component :is="item.icon" class="w-4 h-4" />
							<span class="flex-1">{{ item.label }}</span>
							<span v-if="item.to === '/alarms' && activeAlarmsCount > 0"
								class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
								{{ activeAlarmsCount }}
							</span>
						</NuxtLink>
					</nav>
					<div class="p-4 border-t border-border space-y-3">
						<div class="flex items-center gap-3">
							<UiAvatar :fallback="userInitials" class="h-9 w-9" />
							<div class="flex-1 min-w-0">
								<p class="font-medium text-sm truncate">{{ userDisplay }}</p>
								<p class="text-xs text-muted-foreground truncate">{{ userEmail }}</p>
							</div>
						</div>
						<UiButton variant="outline" class="w-full" @click="handleLogout">
							<LogOut class="h-4 w-4" />
							Cerrar sesion
						</UiButton>
					</div>
				</div>
			</UiSheet>

			<div class="flex-1 flex flex-col overflow-hidden w-full">
				<header
					class="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
					<div class="flex items-center gap-3 md:pl-0 pl-12">
						<h2 class="text-lg md:text-xl font-semibold">{{ pageTitle }}</h2>
					</div>
					<div class="flex items-center gap-3 md:gap-4">
						<span class="hidden sm:inline-flex text-sm text-muted-foreground font-mono">{{ currentTime
							}}</span>
						<UiTooltip :content="isDark ? 'Modo claro' : 'Modo oscuro'">
							<UiButton variant="ghost" size="icon" @click="toggleTheme">
								<Sun v-if="isDark" class="h-4 w-4" />
								<Moon v-else class="h-4 w-4" />
							</UiButton>
						</UiTooltip>
					</div>
				</header>

				<main class="flex-1 overflow-auto p-4 md:p-6 bg-background">
					<slot />
				</main>
			</div>
		</div>
	</TooltipProvider>
</template>
