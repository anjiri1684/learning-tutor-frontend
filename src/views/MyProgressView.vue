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
        backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple background
        borderColor: '#a855f7', // Neon Purple line
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#a855f7',
        data: history.map(t => t.score),
        tension: 0.3, // Smoother curves
        fill: true,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)', // Light grid lines for dark mode
      },
      ticks: {
        color: '#9ca3af', // gray-400 text
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#9ca3af',
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: '#ffffff' // White legend text
      }
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Progress</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading your progress...</span>
         </div>
      </div>

      <div v-else-if="progressData">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-teal-500/30 hover:shadow-teal-500/10 transition-all duration-300 flex items-center justify-between group">
            <div>
               <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Total Completed Classes</h3>
               <p class="text-4xl font-bold text-white mt-2 group-hover:text-teal-400 transition-colors">{{ progressData.total_classes_completed }}</p>
            </div>
            <div class="bg-teal-900/20 p-4 rounded-xl border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
               <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>

          <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:shadow-purple-500/10 transition-all duration-300 flex items-center justify-between group">
            <div>
               <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Total Hours Learned</h3>
               <p class="text-4xl font-bold text-white mt-2 group-hover:text-purple-400 transition-colors">{{ progressData.total_hours_learned.toFixed(1) }}</p>
            </div>
            <div class="bg-purple-900/20 p-4 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
               <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl shadow-purple-900/10">
          <div class="flex items-center justify-between mb-6">
             <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                Mock Test Performance
             </h2>
          </div>

          <div v-if="progressData.test_history.length > 1" class="h-80 w-full">
            <Line :data="chartData" :options="chartOptions" />
          </div>

          <div v-else class="flex flex-col items-center justify-center h-64 text-center bg-black/20 rounded-xl border border-white/5 border-dashed">
             <svg class="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             <p class="text-gray-400">Not enough data yet.</p>
             <p class="text-sm text-gray-500 mt-1">Complete at least two mock tests to see your progress over time.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
