/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const nextClass = ref<any>(null)
  const stats = ref({
    completedClasses: 0,
    xp: 0,
    remainingBundleClasses: 0,
  })

  async function fetchDashboardData() {
    try {
      const bookingsRes = await api.get('/bookings/me')
      const bundlesRes = await api.get('/bundles/me')

      const upcoming = bookingsRes.data
        .filter(
          (b: any) =>
            new Date(b.availability_slot.start_time) > new Date() && b.status === 'confirmed',
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.availability_slot.start_time).getTime() -
            new Date(b.availability_slot.start_time).getTime(),
        )

      if (upcoming.length > 0) {
        nextClass.value = upcoming[0]
      }

      stats.value.completedClasses = bookingsRes.data.filter(
        (b: any) => b.status === 'completed',
      ).length
      stats.value.remainingBundleClasses = bundlesRes.data.reduce(
        (total: number, bundle: any) => total + bundle.remaining_classes,
        0,
      )
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  return { nextClass, stats, fetchDashboardData }
})
