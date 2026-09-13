<template>
  <div class="space-y-6">
    <!-- Daily Total Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p class="text-sm font-medium text-gray-600 mb-2">TODAY'S COST</p>
      <div class="flex items-end justify-between">
        <div>
          <p class="text-4xl font-bold text-gray-900">{{ formatCurrency(costStore.dailyTotal) }}</p>
          <p class="text-sm text-gray-500 mt-2">{{ costStore.logs.length }} API calls</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">Spending rate</p>
          <p class="text-lg font-semibold text-blue-600">{{ formatCurrency(costStore.spendingRate) }}/day</p>
        </div>
      </div>
    </div>

    <!-- Budget Progress Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium text-gray-600">MONTHLY BUDGET</p>
        <p class="text-sm font-semibold">{{ costStore.budgetPercentage }}% of ${{ costStore.budgetLimit }}</p>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            :class="costStore.budgetColor"
            :style="{ width: Math.min(100, costStore.budgetPercentage) + '%' }"
            class="h-full transition-all duration-300"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-600">
          <span>{{ formatCurrency(costStore.monthlyTotal) }} used</span>
          <span>{{ formatCurrency(costStore.budgetLimit - costStore.monthlyTotal) }} remaining</span>
        </div>
      </div>
    </div>

    <!-- Service Breakdown Chart -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p class="text-sm font-medium text-gray-600 mb-4">COST BY SERVICE</p>
      <div class="space-y-3">
        <div v-if="Object.keys(costStore.serviceBreakdown).length === 0" class="text-center text-gray-500">
          <p class="text-sm">No data yet</p>
        </div>
        <div
          v-for="(cost, service) in sortedServices"
          :key="service"
          class="flex items-center justify-between"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-700 mb-1">{{ service }}</p>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                :style="{ width: (cost / maxServiceCost * 100) + '%' }"
                class="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              ></div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-900 ml-4 whitespace-nowrap">{{ formatCurrency(cost) }}</p>
        </div>
      </div>
    </div>

    <!-- Trend Chart -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p class="text-sm font-medium text-gray-600 mb-4">7-DAY TREND</p>
      <div v-if="costStore.trend.length > 0" class="space-y-2">
        <div
          v-for="day in costStore.trend"
          :key="day.date"
          class="flex items-center justify-between"
        >
          <p class="text-xs text-gray-600 w-20">{{ formatDate(day.date) }}</p>
          <div class="flex-1 h-6 bg-gray-100 rounded mx-3 overflow-hidden">
            <div
              :style="{ width: (day.cost / maxTrendCost * 100) + '%' }"
              class="h-full bg-gradient-to-r from-green-400 to-green-600"
            ></div>
          </div>
          <p class="text-xs font-semibold text-gray-900 w-16 text-right">{{ formatCurrency(day.cost) }}</p>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-4">
        <p class="text-sm">No trend data yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCostStore } from '../stores/cost'
import { formatCurrency } from '../lib/supabase'

const costStore = useCostStore()

const sortedServices = computed(() => {
  const entries = Object.entries(costStore.serviceBreakdown)
  return Object.fromEntries(entries.sort((a, b) => b[1] - a[1]))
})

const maxServiceCost = computed(() => {
  const costs = Object.values(costStore.serviceBreakdown)
  return costs.length > 0 ? Math.max(...costs) : 1
})

const maxTrendCost = computed(() => {
  const costs = costStore.trend.map(t => t.cost)
  return costs.length > 0 ? Math.max(...costs) : 1
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
