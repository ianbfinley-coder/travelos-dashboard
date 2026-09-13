import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, calculatePercentile } from '../lib/supabase'

export const useMetricsStore = defineStore('metrics', () => {
  const logs = ref([])
  const p50 = ref(0)
  const p95 = ref(0)
  const p99 = ref(0)
  const successRate = ref(100)
  const failedCount = ref(0)
  const cacheHitRatio = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const successColor = computed(() => {
    if (successRate.value > 99) return 'text-green-600'
    if (successRate.value > 95) return 'text-yellow-500'
    return 'text-red-600'
  })

  // Fetch metrics from last 24 hours
  const fetchMetrics = async () => {
    try {
      loading.value = true
      error.value = null

      const today = new Date().toISOString().split('T')[0]
      const { data, error: err } = await supabase
        .from('api_logs')
        .select('response_time_ms, status_code, cached')
        .gte('created_at', `${today}T00:00:00`)

      if (err) throw err

      logs.value = data || []
      calculateMetrics()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching metrics:', err)
    } finally {
      loading.value = false
    }
  }

  // Calculate all metrics
  const calculateMetrics = () => {
    if (logs.value.length === 0) {
      p50.value = 0
      p95.value = 0
      p99.value = 0
      successRate.value = 100
      failedCount.value = 0
      cacheHitRatio.value = 0
      return
    }

    const responseTimes = logs.value
      .filter(log => log.response_time_ms)
      .map(log => log.response_time_ms)

    if (responseTimes.length > 0) {
      p50.value = Math.round(calculatePercentile(responseTimes, 50))
      p95.value = Math.round(calculatePercentile(responseTimes, 95))
      p99.value = Math.round(calculatePercentile(responseTimes, 99))
    }

    const successful = logs.value.filter(log => log.status_code < 400).length
    successRate.value = Math.round((successful / logs.value.length) * 100 * 10) / 10
    failedCount.value = logs.value.length - successful

    const cached = logs.value.filter(log => log.cached).length
    cacheHitRatio.value = Math.round((cached / logs.value.length) * 100)
  }

  // Add new log (real-time update)
  const addLog = (log) => {
    logs.value.unshift(log)
    calculateMetrics()
  }

  // Subscribe to real-time updates
  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('metrics-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'api_logs' },
        (payload) => {
          addLog(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    logs,
    p50,
    p95,
    p99,
    successRate,
    successColor,
    failedCount,
    cacheHitRatio,
    loading,
    error,
    fetchMetrics,
    subscribeToUpdates,
    addLog
  }
})
