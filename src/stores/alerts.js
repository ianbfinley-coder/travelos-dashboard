import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAlertStore = defineStore('alerts', () => {
  const alerts = ref([])
  const filter = ref('all') // 'all', 'critical', 'warning'
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const filteredAlerts = computed(() => {
    if (filter.value === 'critical') {
      return alerts.value.filter(a => a.severity === 'CRITICAL')
    }
    if (filter.value === 'warning') {
      return alerts.value.filter(a => a.severity === 'WARNING')
    }
    return alerts.value
  })

  const criticalCount = computed(() => {
    return alerts.value.filter(a => a.severity === 'CRITICAL').length
  })

  const warningCount = computed(() => {
    return alerts.value.filter(a => a.severity === 'WARNING').length
  })

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (err) throw err

      alerts.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching alerts:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new alert (real-time update)
  const addAlert = (alert) => {
    alerts.value.unshift(alert)
    if (alerts.value.length > 50) {
      alerts.value.pop()
    }
  }

  // Subscribe to real-time updates
  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          addAlert(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Set filter
  const setFilter = (newFilter) => {
    filter.value = newFilter
  }

  return {
    alerts,
    filteredAlerts,
    filter,
    criticalCount,
    warningCount,
    loading,
    error,
    fetchAlerts,
    subscribeToUpdates,
    addAlert,
    setFilter
  }
})
