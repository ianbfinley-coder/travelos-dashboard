<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm font-medium text-gray-600">ALERTS</p>
      <div class="flex gap-2 text-xs">
        <span class="px-2 py-1 bg-red-50 text-red-700 rounded">{{ alertStore.criticalCount }} Critical</span>
        <span class="px-2 py-1 bg-orange-50 text-orange-700 rounded">{{ alertStore.warningCount }} Warnings</span>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="flex gap-2 mb-4">
      <button
        @click="alertStore.setFilter('all')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded transition-colors',
          alertStore.filter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        All
      </button>
      <button
        @click="alertStore.setFilter('critical')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded transition-colors',
          alertStore.filter === 'critical'
            ? 'bg-red-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Critical
      </button>
      <button
        @click="alertStore.setFilter('warning')"
        :class="[
          'px-3 py-1 text-xs font-medium rounded transition-colors',
          alertStore.filter === 'warning'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        Warning
      </button>
    </div>

    <!-- Alerts List -->
    <div class="flex-1 overflow-y-auto space-y-2">
      <div v-if="alertStore.filteredAlerts.length === 0" class="text-center text-gray-500 py-8">
        <p class="text-sm">No alerts</p>
      </div>

      <div
        v-for="alert in alertStore.filteredAlerts"
        :key="alert.id"
        :class="[
          'p-3 rounded-lg border-l-4 transition-colors hover:shadow-md cursor-pointer',
          alert.severity === 'CRITICAL'
            ? 'bg-red-50 border-l-red-600'
            : alert.severity === 'WARNING'
            ? 'bg-orange-50 border-l-orange-600'
            : 'bg-blue-50 border-l-blue-600'
        ]"
        @click="selectedAlert = selectedAlert?.id === alert.id ? null : alert"
      >
        <div class="flex items-start justify-between mb-1">
          <p :class="[
            'text-xs font-bold uppercase tracking-wide',
            alert.severity === 'CRITICAL' ? 'text-red-700' : 'text-orange-700'
          ]">
            {{ alert.severity }}
          </p>
          <span v-if="!alert.sent" class="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
            Open
          </span>
        </div>
        <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ alert.type }}</p>
        <p class="text-xs text-gray-600 mt-1">{{ formatRelativeTime(alert.created_at) }}</p>

        <!-- Expanded view -->
        <div v-if="selectedAlert?.id === alert.id" class="mt-3 pt-3 border-t border-gray-300 text-xs">
          <p class="text-gray-700 mb-1">{{ alert.message }}</p>
          <p class="text-gray-500">{{ new Date(alert.created_at).toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAlertStore } from '../stores/alerts'
import { formatRelativeTime } from '../lib/supabase'

const alertStore = useAlertStore()
const selectedAlert = ref(null)
</script>
