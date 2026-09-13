<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">TravelOS Dashboard</h1>
            <p class="text-sm text-gray-600 mt-1">Real-time monitoring & analytics</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Last updated: {{ lastUpdated }}</p>
            <button
              @click="refreshData"
              :disabled="isRefreshing"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
            >
              {{ isRefreshing ? 'Refreshing...' : 'Refresh Now' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cost Dashboard (spans 2 rows on desktop) -->
        <div class="lg:col-span-2 lg:row-span-2 space-y-6">
          <CostDashboard />
        </div>

        <!-- Alert Feed (right column, top) -->
        <div class="lg:col-span-1">
          <AlertFeed />
        </div>

        <!-- Performance Metrics (bottom left) -->
        <div class="lg:col-span-2">
          <PerformanceMetrics />
        </div>
      </div>

      <!-- User Quotas (full width at bottom) -->
      <div class="mt-6">
        <UserQuotas />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCostStore } from './stores/cost'
import { useAlertStore } from './stores/alerts'
import { useMetricsStore } from './stores/metrics'
import { useQuotasStore } from './stores/quotas'
import CostDashboard from './components/CostDashboard.vue'
import AlertFeed from './components/AlertFeed.vue'
import PerformanceMetrics from './components/PerformanceMetrics.vue'
import UserQuotas from './components/UserQuotas.vue'

const costStore = useCostStore()
const alertStore = useAlertStore()
const metricsStore = useMetricsStore()
const quotasStore = useQuotasStore()

const lastUpdated = ref('')
const isRefreshing = ref(false)
let unsubscribers = []
let refreshInterval = null

// Format time
const formatLastUpdated = () => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Load initial data
const loadData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      costStore.fetchTodayLogs(),
      costStore.fetchMonthlyLogs(),
      costStore.fetchTrend(),
      alertStore.fetchAlerts(),
      metricsStore.fetchMetrics(),
      quotasStore.fetchQuotas()
    ])
  } finally {
    isRefreshing.value = false
  }
  lastUpdated.value = formatLastUpdated()
}

// Refresh data
const refreshData = async () => {
  await loadData()
}

onMounted(async () => {
  // Load initial data
  await loadData()

  // Subscribe to real-time updates
  unsubscribers.push(costStore.subscribeToUpdates())
  unsubscribers.push(alertStore.subscribeToUpdates())
  unsubscribers.push(metricsStore.subscribeToUpdates())
  unsubscribers.push(quotasStore.subscribeToUpdates())

  // Refresh every 30 seconds
  refreshInterval = setInterval(() => {
    lastUpdated.value = formatLastUpdated()
  }, 1000)
})

onUnmounted(() => {
  // Cleanup subscriptions
  unsubscribers.forEach(unsub => unsub?.())
  clearInterval(refreshInterval)
})
</script>
