<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Certificate {
  ID: string;
  course_title: string;
  completion_date: string;
  certificate_url: string;
}

const certificates = ref<Certificate[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/gamification/certificates/me');
    certificates.value = response.data;
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString([], { dateStyle: 'long' });
};
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Certificates</h1>

    <div v-if="isLoading" class="text-center text-gray-500">
      Loading certificates...
    </div>

    <div v-else-if="certificates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="cert in certificates" :key="cert.ID" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold text-indigo-700">{{ cert.course_title }}</h2>
        <p class="text-sm text-gray-500 mt-2">Awarded on: {{ formatDate(cert.completion_date) }}</p>
        <a
          :href="cert.certificate_url"
          target="_blank"
          class="inline-block mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          View Certificate
        </a>
      </div>
    </div>

    <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
      <p class="text-gray-600">You haven't earned any certificates yet. Complete a course to see your achievements here!</p>
    </div>
  </div>
</template>
