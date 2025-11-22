<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const reviews = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/teacher/reviews/me');
    reviews.value = response.data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Reviews</h1>
    <div v-if="isLoading">Loading reviews...</div>
    <div v-else-if="reviews.length > 0" class="space-y-4">
      <div v-for="review in reviews" :key="review.ID" class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center">
          <p class="font-semibold">{{ review.Student.full_name }}</p>
          <p class="text-sm text-gray-500">{{ formatDate(review.CreatedAt) }}</p>
        </div>
        <div class="flex items-center mt-2">
          <span v-for="n in 5" :key="n" class="text-2xl" :class="n <= review.Rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
        </div>
        <p v-if="review.Comment" class="text-gray-700 mt-3 italic">"{{ review.Comment }}"</p>
      </div>
    </div>
    <div v-else class="bg-white p-8 rounded-lg shadow-md text-center">
      <p class="text-gray-500">You have not received any reviews yet.</p>
    </div>
  </div>
</template>
