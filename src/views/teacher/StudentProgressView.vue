<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const progressData = ref<any>(null);
const isLoading = ref(true);
const route = useRoute();

onMounted(async () => {
  const studentId = route.params.studentId as string;
  try {
    const response = await api.get(`/teacher/student-progress/${studentId}`);
    progressData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
</script>

<template>
  <div>
    <div v-if="isLoading">Loading student progress...</div>
    <div v-else-if="progressData">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Student Progress: {{ progressData.student_name }}</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Total Completed Classes</h3>
          <p class="text-3xl font-bold text-teal-600">{{ progressData.total_classes }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Average Rating Given</h3>
          <p class="text-3xl font-bold text-yellow-500">
            {{ progressData.average_rating.toFixed(1) }} ★
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Class History</h2>
      <div v-if="progressData.bookings.length > 0" class="space-y-4">
        <div v-for="booking in progressData.bookings" :key="booking.ID" class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-lg">{{ booking.availability_slot.language.name }} Class</p>
              <p class="text-sm text-gray-500">{{ formatDate(booking.availability_slot.start_time) }}</p>
            </div>
            <span class="px-3 py-1 text-sm font-semibold rounded-full capitalize"
              :class="{
                'bg-green-100 text-green-800': booking.status === 'completed',
                'bg-red-100 text-red-800': booking.status === 'cancelled',
                'bg-gray-100 text-gray-800': booking.status !== 'completed' && booking.status !== 'cancelled',
              }"
            >{{ booking.status }}</span>
          </div>
          <div v-if="booking.teacher_feedback" class="mt-4 pt-4 border-t border-gray-200">
            <p class="font-semibold text-sm text-gray-600">Your Feedback:</p>
            <p class="text-gray-700 italic mt-1">"{{ booking.teacher_feedback }}"</p>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">No class history found for this student.</p>
    </div>
  </div>
</template>
