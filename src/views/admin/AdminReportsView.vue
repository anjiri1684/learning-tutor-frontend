<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

const startDate = ref(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const isDownloading = ref(false);

const handleDownload = async () => {
  isDownloading.value = true;
  try {
    const response = await api.get('/admin/reports/transactions', {
      params: {
        start_date: startDate.value,
        end_date: endDate.value,
      },
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const fileName = `transactions_${startDate.value}_to_${endDate.value}.csv`;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Failed to download report:', error);
    alert('Could not download the report.');
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Reports</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10 relative overflow-hidden group">

        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-all duration-500"></div>

        <div class="flex items-start gap-4 mb-6 relative z-10">
           <div class="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700 shadow-inner">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
           </div>
           <div>
              <h2 class="text-xl font-bold text-white">Transaction Report</h2>
              <p class="text-sm text-gray-400 mt-1 max-w-sm">Select a date range to generate and download a CSV file of all successful transactions.</p>
           </div>
        </div>

        <form @submit.prevent="handleDownload" class="space-y-6 relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="start-date" class="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                v-model="startDate"
                id="start-date"
                required
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label for="end-date" class="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                v-model="endDate"
                id="end-date"
                required
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isDownloading"
              class="w-full flex justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="isDownloading" class="flex items-center gap-2">
                 <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Generating CSV...
              </span>
              <span v-else class="flex items-center gap-2">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Download Report
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
