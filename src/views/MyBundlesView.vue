<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { RouterLink } from 'vue-router';

interface StudentBundle {
  ID: string;
  remaining_classes: number;
  bundle: {
    name: string;
    language: {
      name: string;
    }
  }
}

const authStore = useAuthStore();
const bundles = ref<StudentBundle[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/bundles/me');
    bundles.value = response.data;
  } catch (error) {
    console.error('Failed to fetch student bundles:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Bundles & Credits</h1>

    <div class="mb-8 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-700">My Credit Balance</h2>
      <p class="text-4xl font-bold text-green-600 mt-2">
        ${{ (authStore.user?.credit_balance || 0).toFixed(2) }}
      </p>
      <p class="text-sm text-gray-500 mt-1">Available credit from referrals.</p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">My Active Bundles</h2>
      <div v-if="isLoading">Loading bundles...</div>
      <div v-else-if="bundles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="sb in bundles" :key="sb.ID" class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-bold text-indigo-700">{{ sb.bundle.name }}</h3>
          <p class="text-sm text-gray-500">{{ sb.bundle.language.name }}</p>
          <div class="mt-4">
            <p class="text-gray-600">Remaining Classes:</p>
            <p class="text-3xl font-bold">{{ sb.remaining_classes }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
        <p class="text-gray-600">You have no active class bundles.</p>
        <RouterLink to="/dashboard/bundles" class="inline-block mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Purchase a Bundle
        </RouterLink>
      </div>
    </div>
  </div>
</template>
