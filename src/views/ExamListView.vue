<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/services/api';

interface MockTest {
  ID: string;
  title: string;
  description: string;
  duration_minutes: number;
}

const tests = ref<MockTest[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/exams/tests');
    tests.value = response.data;
  } catch (error) {
    console.error('Failed to fetch mock tests:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Exam Portal</h1>

    <div v-if="isLoading" class="text-center text-gray-500">
      Loading available tests...
    </div>

    <div v-else-if="tests.length > 0" class="space-y-4">
      <div v-for="test in tests" :key="test.ID" class="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-indigo-700">{{ test.title }}</h2>
          <p class="text-sm text-gray-600 mt-1">{{ test.description }}</p>
          <p class="text-sm text-gray-500 mt-2">Duration: {{ test.duration_minutes }} minutes</p>
        </div>
        <RouterLink :to="`/dashboard/exam/${test.ID}`" class="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Start Test
        </RouterLink>
      </div>
    </div>

    <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
      <p class="text-gray-600">There are currently no mock tests available. Please check back later.</p>
    </div>
  </div>
</template>
