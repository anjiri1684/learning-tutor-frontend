<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const reviews = ref<any[]>([]);
const isLoading = ref(true);

const fetchReviews = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/reviews');
    reviews.value = response.data;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchReviews);

const handleDelete = async (reviewId: string) => {
  if (confirm('Are you sure you want to delete this review permanently?')) {
    await api.delete(`/admin/reviews/${reviewId}`);
    await fetchReviews();
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Review Management</h1>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="isLoading">Loading reviews...</div>
      <div v-else-if="reviews.length > 0" class="space-y-4">
        <div v-for="review in reviews" :key="review.ID" class="p-4 border rounded-md">
          <div class="flex justify-between items-start">
            <div>
              <p><strong>Student:</strong> {{ review.Student.full_name }}</p>
              <p><strong>Teacher:</strong> {{ review.Teacher.User.full_name }}</p>
              <div class="flex items-center mt-1">
                <span v-for="n in 5" :key="n" :class="n <= review.Rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
              </div>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500 mb-2">{{ formatDate(review.CreatedAt) }}</p>
                <button @click="handleDelete(review.ID)" class="text-sm text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
          <p v-if="review.Comment" class="text-gray-700 mt-2 italic">"{{ review.Comment }}"</p>
        </div>
      </div>
      <p v-else>No reviews found.</p>
    </div>
  </div>
</template>
