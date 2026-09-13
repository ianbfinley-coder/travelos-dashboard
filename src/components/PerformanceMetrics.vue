<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <p class="text-sm font-medium text-gray-600 mb-6">API PERFORMANCE (24H)</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Latency Stats -->
      <div class="space-y-4">
        <div>
          <p class="text-xs text-gray-600 mb-1">P50 Latency</p>
          <p class="text-2xl font-bold text-gray-900">{{ metricsStore.p50 }}ms</p>
        </div>
        <div>
          <p class="text-xs text-gray-600 mb-1">P95 Latency</p>
          <p class="text-2xl font-bold text-gray-900">{{ metricsStore.p95 }}ms</p>
        </div>
        <div>
          <p class="text-xs text-gray-600 mb-1">P99 Latency</p>
          <p class="text-2xl font-bold text-gray-900">{{ metricsStore.p99 }}ms</p>
        </div>
      </div>

      <!-- Success Rate -->
      <div class="flex flex-col items-center justify-center py-4">
        <p class="text-xs text-gray-600 mb-3">SUCCESS RATE</p>
        <div class="relative w-24 h-24">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"></circle>
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              :stroke="metricsStore.successRate > 99 ? '#15803d' : metricsStore.successRate > 95 ? '#eab308' : '#dc2626'"
              stroke-width="8"
              stroke-dasharray="282.6"
              :stroke-dashoffset="282.6 * (1 - metricsStore.successRate / 100)"
              stroke-linecap="round"
              class="transition-all duration-500"
            ></circle>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span :class="['text-xl font-bold', metricsStore.successColor]">
              {{ metricsStore.successRate }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Failed Requests -->
      <div class="flex flex-col items-center justify-center py-4">
        <p class="text-xs text-gray-600 mb-3">FAILED REQUESTS</p>
        <p class="text-4xl font-bold text-red-600">{{ metricsStore.failedCount }}</p>
        <p class="text-xs text-gray-500 mt-2">in last 24h</p>
      </div>

      <!-- Cache Hit Ratio -->
      <div class="flex flex-col items-center justify-center py-4">
        <p class="text-xs text-gray-600 mb-3">CACHE HIT RATIO</p>
        <p class="text-4xl font-bold text-green-600">{{ metricsStore.cacheHitRatio }}%</p>
        <p class="text-xs text-gray-500 mt-2">of requests cached</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMetricsStore } from '../stores/metrics'

const metricsStore = useMetricsStore()
</script>
