import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useCostStore = defineStore('cost', () => {
  const logs = ref([])
  const dailyTotal = ref(0)
  const monthlyTotal = ref(0)
  const serviceBreakdown = ref({})
  const trend = ref([])
  const budgetLimit = 500
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const budgetPercentage = computed(() => {
    return Math.round((monthlyTotal.value / budgetLimit) * 100)
  })

  const budgetColor = computed(() => {
    const pct = budgetPercentage.value
    if (pct < 50) return 'bg-green-500'
    if (pct < 75) return 'bg-yellow-400'
    if (pct < 90) return 'bg-orange-500'
    return 'bg-red-600'
  })

  const spendingRate = computed(() => {
    if (logs.value.length === 0) return 0
    const today = new Date().toISOString().split('T')[0]
    const todayLogs = logs.value.filter(log => log.created_at.startsWith(today))
    return todayLogs.reduce((sum, log) => sum + (log.cost || 0), 0)
  })

  // Fetch today's logs
  const fetchTodayLogs = async () => {
    try {
      loading.value = true
      error.value = null

      const today = new Date().toISOString().split('T')[0]
      const { data, error: err } = await supabase
        .from('api_logs')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })

      if (err) throw err

      logs.value = data || []
      calculateDailyTotal()
      calculateServiceBreakdown()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching today logs:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch monthly logs
  const fetchMonthlyLogs = async () => {
    try {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data, error: err } = await supabase
        .from('api_logs')
        .select('cost')
        .gte('created_at', firstDay)
        .lte('created_at', now.toISOString())

      if (err) throw err

      monthlyTotal.value = (data || []).reduce((sum, log) => sum + (log.cost || 0), 0)
    } catch (err) {
      console.error('Error fetching monthly logs:', err)
    }
  }

  // Fetch trend data (last 7 days)
  const fetchTrend = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error: err } = await supabase
        .from('api_logs')
        .select('created_at, cost')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (err) throw err

      // Group by date
      const grouped = {}
      ;(data || []).forEach(log => {
        const date = log.created_at.split('T')[0]
        grouped[date] = (grouped[date] || 0) + (log.cost || 0)
      })

      trend.value = Object.entries(grouped).map(([date, cost]) => ({
        date,
        cost: Math.round(cost * 100) / 100
      }))
    } catch (err) {
      console.error('Error fetching trend:', err)
    }
  }

  // Calculate daily total
  const calculateDailyTotal = () => {
    dailyTotal.value = logs.value.reduce((sum, log) => sum + (log.cost || 0), 0)
    dailyTotal.value = Math.round(dailyTotal.value * 100) / 100
  }

  // Calculate service breakdown
  const calculateServiceBreakdown = () => {
    const breakdown = {}
    logs.value.forEach(log => {
      const service = log.service || 'Unknown'
      breakdown[service] = (breakdown[service] || 0) + (log.cost || 0)
    })

    Object.keys(breakdown).forEach(service => {
      breakdown[service] = Math.round(breakdown[service] * 100) / 100
    })

    serviceBreakdown.value = breakdown
  }

  // Add new log (real-time update)
  const addLog = (log) => {
    logs.value.unshift(log)
    calculateDailyTotal()
    calculateServiceBreakdown()
  }

  // Subscribe to real-time updates
  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('api-logs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'api_logs' },
        (payload) => {
          addLog(payload.new)
          fetchMonthlyLogs()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    logs,
    dailyTotal,
    monthlyTotal,
    budgetLimit,
    budgetPercentage,
    budgetColor,
    serviceBreakdown,
    trend,
    spendingRate,
    loading,
    error,
    fetchTodayLogs,
    fetchMonthlyLogs,
    fetchTrend,
    subscribeToUpdates,
    addLog
  }
})
