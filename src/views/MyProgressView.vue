<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const progressData = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/profile/me/progress');
    progressData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch progress data:', error);
  } finally {
    isLoading.value = false;
  }
});

const chartData = computed(() => {
  if (!progressData.value || !progressData.value.test_history) {
    return { labels: [], datasets: [] };
  }
  const history = [...progressData.value.test_history].reverse();

  return {
    labels: history.map(t => new Date(t.start_time).toLocaleDateString()),
    datasets: [
      {
        label: 'Mock Test Score (%)',
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        data: history.map(t => t.score),
        tension: 0.1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Progress</h1>

    <div v-if="isLoading">Loading your progress...</div>
    <div v-else-if="progressData">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Total Completed Classes</h3>
          <p class="text-3xl font-bold text-teal-600">{{ progressData.total_classes_completed }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Total Hours Learned</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ progressData.total_hours_learned.toFixed(1) }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Mock Test Performance</h2>
        <div v-if="progressData.test_history.length > 1" class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <p v-else class="text-gray-500">Complete at least two mock tests to see your progress over time.</p>
      </div>
    </div>
  </div>
</template>
