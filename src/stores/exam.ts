/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useExamStore = defineStore('exam', () => {
  const currentAttemptId = ref<string | null>(null)
  const questions = ref<any[]>([])
  const testDetails = ref<{ title: string; duration: number } | null>(null)
  const userAnswers = ref<Record<string, string>>({})
  const finalResult = ref<any>(null)

  async function startTest(testId: string) {
    try {
      const response = await api.post(`/exams/tests/${testId}/start`)
      currentAttemptId.value = response.data.attempt_id
      questions.value = response.data.questions
      testDetails.value = {
        title: response.data.test_title,
        duration: response.data.duration_minutes,
      }
      userAnswers.value = {}
      finalResult.value = null
      return { success: true }
    } catch (error) {
      console.error('Failed to start test:', error)
      return { success: false }
    }
  }

  async function submitTest() {
    if (!currentAttemptId.value) return { success: false, message: 'No active test attempt.' }

    const answersPayload = Object.entries(userAnswers.value).map(
      ([question_id, selected_answer]) => ({
        question_id,
        selected_answer,
      }),
    )

    try {
      const response = await api.post(`/exams/tests/submit/${currentAttemptId.value}`, {
        answers: answersPayload,
      })
      finalResult.value = response.data
      currentAttemptId.value = null
      questions.value = []
      return { success: true, result: response.data }
    } catch (error: any) {
      console.error('Failed to submit test:', error)
      return { success: false, message: error.response?.data?.error || 'Submission failed.' }
    }
  }

  return {
    currentAttemptId,
    questions,
    testDetails,
    userAnswers,
    finalResult,
    startTest,
    submitTest,
  }
})
