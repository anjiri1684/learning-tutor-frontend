import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCurrencyStore = defineStore('currency', () => {
  const usdToKesRate = ref<number | null>(null)

  async function fetchRate() {
    try {
      const response = await api.get('/currency/rate')
      usdToKesRate.value = response.data.usd_to_kes
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
      usdToKesRate.value = 130.0
    }
  }

  return { usdToKesRate, fetchRate }
})
