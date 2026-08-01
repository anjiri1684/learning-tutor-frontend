/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useLibraryStore = defineStore('library', () => {
  const myResources = ref<any[]>([])
  const accessibleResources = ref<any[]>([])
  const isLoading = ref(false)

  async function fetchMyResources() {
    isLoading.value = true
    try {
      const response = await api.get('/library/mine')
      myResources.value = response.data
    } catch (error) {
      console.error('Failed to fetch library resources:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAccessibleResources() {
    isLoading.value = true
    try {
      const response = await api.get('/library/me')
      accessibleResources.value = response.data
    } catch (error) {
      console.error('Failed to fetch accessible resources:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function uploadResource(payload: { title: string; description: string; file: File }) {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('description', payload.description)
    formData.append('file', payload.file)

    try {
      await api.post('/library', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Upload failed.' }
    }
  }

  async function grantAccess(resourceId: string, emails: string[]) {
    try {
      const response = await api.post(`/library/${resourceId}/access`, { emails })
      const granted = response.data.granted || []
      const skipped = response.data.skipped || []
      return { success: true, granted, skipped }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to grant access.', granted: [], skipped: [] }
    }
  }

  async function revokeAccess(resourceId: string, email: string) {
    try {
      await api.delete(`/library/${resourceId}/access/${encodeURIComponent(email)}`)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to revoke access.' }
    }
  }

  async function viewResourceBlobUrl(resourceId: string): Promise<string> {
    const response = await api.get(`/library/${resourceId}/view`, { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  }

  async function getResourceNote(resourceId: string): Promise<string> {
    try {
      const response = await api.get(`/library/${resourceId}/note`)
      return response.data.note || ''
    } catch (error) {
      console.error('Failed to fetch resource note:', error)
      return ''
    }
  }

  async function saveResourceNote(resourceId: string, note: string) {
    try {
      await api.put(`/library/${resourceId}/note`, { note })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to save note.' }
    }
  }

  async function deleteResource(resourceId: string) {
    try {
      await api.delete(`/library/${resourceId}`)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to delete resource.' }
    }
  }

  return {
    myResources,
    accessibleResources,
    isLoading,
    fetchMyResources,
    fetchAccessibleResources,
    uploadResource,
    grantAccess,
    revokeAccess,
    viewResourceBlobUrl,
    deleteResource,
    getResourceNote,
    saveResourceNote,
  }
})
