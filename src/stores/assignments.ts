/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useAssignmentStore = defineStore('assignments', () => {
  const isLoading = ref(false)

  async function listBookingAssignments(bookingId: string) {
    isLoading.value = true
    try {
      const response = await api.get(`/bookings/${bookingId}/assignments`)
      return response.data as any[]
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createAssignment(bookingId: string, payload: { title: string; instructions: string; due_date?: string }) {
    try {
      await api.post(`/teacher/bookings/${bookingId}/assignments`, payload)
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to create assignment.' }
    }
  }

  async function submitAssignment(assignmentId: string, payload: { submission_text?: string; submission_link?: string; file?: File }) {
    try {
      if (payload.file) {
        const formData = new FormData()
        if (payload.submission_text) formData.append('submission_text', payload.submission_text)
        if (payload.submission_link) formData.append('submission_link', payload.submission_link)
        formData.append('file', payload.file)
        await api.post(`/assignments/${assignmentId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post(`/assignments/${assignmentId}/submit`, {
          submission_text: payload.submission_text || '',
          submission_link: payload.submission_link || '',
        })
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to submit assignment.' }
    }
  }

  async function gradeAssignment(assignmentId: string, grade: number, feedback: string) {
    try {
      await api.post(`/teacher/assignments/${assignmentId}/grade`, { grade, feedback })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.error || 'Failed to grade assignment.' }
    }
  }

  async function viewSubmissionFileBlobUrl(assignmentId: string): Promise<string> {
    const response = await api.get(`/assignments/${assignmentId}/submission/file`, { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  }

  return {
    isLoading,
    listBookingAssignments,
    createAssignment,
    submitAssignment,
    gradeAssignment,
    viewSubmissionFileBlobUrl,
  }
})
