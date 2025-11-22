<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Badge {
  ID: string;
  Name: string;
  Description: string;
  IconURL: string;
}

const badges = ref<Badge[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/gamification/badges/me');
    badges.value = response.data;
  } catch (error) {
    console.error('Failed to fetch badges:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Badges</h1>

    <div v-if="isLoading">Loading badges...</div>
    <div v-else-if="badges.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="badge in badges" :key="badge.ID" class="bg-white p-6 rounded-lg shadow-md text-center">
        <img :src="badge.IconURL" :alt="badge.Name" class="w-24 h-24 mx-auto" />
        <h2 class="text-lg font-bold mt-4">{{ badge.Name }}</h2>
        <p class="text-sm text-gray-500 mt-1">{{ badge.Description }}</p>
      </div>
    </div>
    <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
      <p class="text-gray-600">You haven't earned any badges yet. Keep learning to collect them all!</p>
    </div>
  </div>
</template>
