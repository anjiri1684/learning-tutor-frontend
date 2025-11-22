<script setup lang="ts">
import { useExamStore } from '@/stores/exam';
import { RouterLink } from 'vue-router';
const examStore = useExamStore();
</script>

<template>
  <div class="container mx-auto p-8 text-center">
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-3xl font-bold">Test Completed!</h1>
      <p class="text-lg mt-4">Your Score:</p>
      <p class="text-6xl font-bold text-indigo-600 my-4">
        {{ examStore.finalResult?.score.toFixed(1) }}%
      </p>
      <div class="mt-6">
        <RouterLink to="/exams" class="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Back to Exams
        </RouterLink>
      </div>
    </div>
  </div>
</template>
