import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useQuotasStore = defineStore('quotas', () => {
  const quotas = ref([])
  const loading = ref(false)
  const error = ref(null)

  const tierLimits = {
    free: 50,
    pro: 1000,
    premium: 3000
  }

  // Computed properties
  const totalUsers = computed(() => quotas.value.length)

  const tierCounts = computed(() => ({
    free: quotas.value.filter(q => q.tier === 'free').length,
    pro: quotas.value.filter(q => q.tier === 'pro').length,
    premium: quotas.value.filter(q => q.tier === 'premium').length
  }))

  const usersNearLimit = computed(() => {
    return quotas.value.filter(q => {
      const limit = tierLimits[q.tier] || tierLimits.free
      const used = q.calls_this_month || 0
      return (used / limit) > 0.75
    })
  })

  // Fetch quotas
  const fetchQuotas = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('user_quotas')
        .select('*')
        .order('calls_this_month', { ascending: false })

      if (err) throw err

      quotas.value = (data || []).map(q => ({
        ...q,
        limit: tierLimits[q.tier] || tierLimits.free,
        percentageUsed: Math.round(((q.calls_this_month || 0) / (tierLimits[q.tier] || tierLimits.free)) * 100)
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching quotas:', err)
    } finally {
      loading.value = false
    }
  }

  // Subscribe to real-time updates
  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('quotas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_quotas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            quotas.value.push({
              ...payload.new,
              limit: tierLimits[payload.new.tier] || tierLimits.free,
              percentageUsed: Math.round(((payload.new.calls_this_month || 0) / (tierLimits[payload.new.tier] || tierLimits.free)) * 100)
            })
          } else if (payload.eventType === 'UPDATE') {
            const index = quotas.value.findIndex(q => q.user_id === payload.new.user_id)
            if (index >= 0) {
              quotas.value[index] = {
                ...payload.new,
                limit: tierLimits[payload.new.tier] || tierLimits.free,
                percentageUsed: Math.round(((payload.new.calls_this_month || 0) / (tierLimits[payload.new.tier] || tierLimits.free)) * 100)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    quotas,
    tierLimits,
    tierCounts,
    totalUsers,
    usersNearLimit,
    loading,
    error,
    fetchQuotas,
    subscribeToUpdates
  }
})
