<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const analyticsData = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/teacher/analytics');
    analyticsData.value = response.data;
  } finally {
    isLoading.value = false;
  }
});

const chartData = computed(() => {
  if (!analyticsData.value || !analyticsData.value.monthly_earnings_data) {
    return { labels: [], datasets: [] };
  }
  const data = analyticsData.value.monthly_earnings_data;
  return {
    labels: data.map((d: any) => new Date(d.month).toLocaleString('default', { month: 'long', year: 'numeric' })),
    datasets: [{
      label: 'Monthly Earnings ($)',
      backgroundColor: '#14b8a6',
      data: data.map((d: any) => d.earnings),
    }],
  };
});

const chartOptions = { responsive: true, maintainAspectRatio: false };
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Performance</h1>
    <div v-if="isLoading">Loading analytics...</div>
    <div v-else-if="analyticsData">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-semibold text-gray-500">Total Earnings</h3><p class="text-3xl font-bold text-green-600">${{ analyticsData.total_earnings.toFixed(2) }}</p></div>
        <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-semibold text-gray-500">Average Rating</h3><p class="text-3xl font-bold text-yellow-500">{{ analyticsData.average_rating.toFixed(1) }} ★</p></div>
        <div class="bg-white p-6 rounded-lg shadow-md"><h3 class="font-semibold text-gray-500">Classes Taught</h3><p class="text-3xl font-bold text-teal-600">{{ analyticsData.total_classes_taught }}</p></div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Monthly Earnings</h2>
        <div class="h-80"><Bar :data="chartData" :options="chartOptions" /></div>
      </div>
    </div>
  </div>
</template>
