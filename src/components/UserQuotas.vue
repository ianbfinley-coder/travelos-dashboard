<template>
  <div class="space-y-6">
    <!-- Tier Distribution -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-sm text-gray-600 mb-2">FREE TIER</p>
        <p class="text-3xl font-bold text-gray-900">{{ quotasStore.tierCounts.free }}</p>
        <p class="text-xs text-gray-500 mt-2">50 calls/month each</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-sm text-gray-600 mb-2">PRO TIER</p>
        <p class="text-3xl font-bold text-gray-900">{{ quotasStore.tierCounts.pro }}</p>
        <p class="text-xs text-gray-500 mt-2">1,000 calls/month each</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p class="text-sm text-gray-600 mb-2">PREMIUM TIER</p>
        <p class="text-3xl font-bold text-gray-900">{{ quotasStore.tierCounts.premium }}</p>
        <p class="text-xs text-gray-500 mt-2">3,000 calls/month each</p>
      </div>
    </div>

    <!-- Quotas Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <p class="text-sm font-medium text-gray-600">USER QUOTA USAGE</p>
      </div>

      <div v-if="quotasStore.quotas.length === 0" class="px-6 py-8 text-center text-gray-500">
        <p class="text-sm">No users yet</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">User ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Tier</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Usage</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">Progress</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wide">% Used</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="quota in quotasStore.quotas"
              :key="quota.user_id"
              :class="[
                'hover:bg-gray-50 transition-colors',
                quota.percentageUsed > 75 ? 'bg-yellow-50' : ''
              ]"
            >
              <td class="px-6 py-4 text-sm text-gray-900 font-mono">{{ quota.user_id.slice(0, 8) }}...</td>
              <td class="px-6 py-4 text-sm">
                <span :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  quota.tier === 'free' ? 'bg-gray-100 text-gray-800' :
                  quota.tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                ]">
                  {{ quota.tier }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ quota.calls_this_month }} / {{ quota.limit }}</td>
              <td class="px-6 py-4 text-sm">
                <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :style="{ width: Math.min(100, quota.percentageUsed) + '%' }"
                    :class="[
                      'h-full transition-all duration-300',
                      quota.percentageUsed > 90 ? 'bg-red-500' :
                      quota.percentageUsed > 75 ? 'bg-orange-500' :
                      quota.percentageUsed > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    ]"
                  ></div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right text-gray-900">{{ quota.percentageUsed }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Users Near Limit Alert -->
    <div v-if="quotasStore.usersNearLimit.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 text-yellow-600 text-xl">⚠️</div>
        <div>
          <h3 class="font-medium text-yellow-900 mb-1">Users Approaching Quota Limits</h3>
          <p class="text-sm text-yellow-800 mb-3">
            {{ quotasStore.usersNearLimit.length }} user{{ quotasStore.usersNearLimit.length > 1 ? 's' : '' }}
            {{ quotasStore.usersNearLimit.length > 1 ? 'are' : 'is' }} at 75%+ of their monthly quota.
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="user in quotasStore.usersNearLimit.slice(0, 5)"
              :key="user.user_id"
              class="px-3 py-1 bg-yellow-100 text-yellow-900 text-xs rounded-full font-mono"
            >
              {{ user.user_id.slice(0, 8) }}... ({{ user.percentageUsed }}%)
            </span>
            <span v-if="quotasStore.usersNearLimit.length > 5" class="px-3 py-1 text-xs text-yellow-700">
              +{{ quotasStore.usersNearLimit.length - 5 }} more
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuotasStore } from '../stores/quotas'

const quotasStore = useQuotasStore()
</script>
