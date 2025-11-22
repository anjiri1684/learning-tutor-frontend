/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

interface TeacherInfo {
  user_id: string
  user: {
    full_name: string
  }
}
interface SlotInfo {
  id: string
  start_time: string
  end_time: string
  language_id: string
}
interface Language {
  ID: string
  Name: string
  PricePerSession: number
}

export const useBookingStore = defineStore('booking', () => {
  const selectedTeacher = ref<TeacherInfo | null>(null)
  const selectedSlot = ref<SlotInfo | null>(null)
  const languages = ref<Language[]>([])

  async function fetchLanguages() {
    try {
      const response = await api.get('/languages')
      languages.value = response.data
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    }
  }

  function setBookingContext(teacher: TeacherInfo, slot: SlotInfo) {
    selectedTeacher.value = teacher
    selectedSlot.value = slot
    if (languages.value.length === 0) {
      fetchLanguages()
    }
  }

  async function createBooking(payload: { payment_provider: string; mpesa_phone_number?: string }) {
    if (!selectedSlot.value) {
      return { success: false, message: 'No slot selected.' }
    }

    try {
      const response = await api.post('/bookings', {
        availability_slot_id: selectedSlot.value.id,
        ...payload,
      })

      if (payload.payment_provider === 'mpesa') {
        selectedTeacher.value = null
        selectedSlot.value = null
      }
      return { success: true, data: response.data }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Booking failed.' }
    }
  }

  return { selectedTeacher, selectedSlot, languages, setBookingContext, createBooking }
})
