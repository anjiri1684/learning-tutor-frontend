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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

    <div class="bg-white p-6 rounded-lg shadow-md max-w-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Transaction Report</h2>
      <p class="text-sm text-gray-600 mb-4">Select a date range to download a CSV file of all successful transactions.</p>

      <form @submit.prevent="handleDownload" class="space-y-4">
        <div class="flex items-center space-x-4">
          <div>
            <label for="start-date" class="block text-sm font-medium">Start Date</label>
            <input type="date" v-model="startDate" id="start-date" required class="w-full mt-1 p-2 border rounded-md" />
          </div>
          <div>
            <label for="end-date" class="block text-sm font-medium">End Date</label>
            <input type="date" v-model="endDate" id="end-date" required class="w-full mt-1 p-2 border rounded-md" />
          </div>
        </div>
        <button type="submit" :disabled="isDownloading" class="w-full px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 disabled:bg-gray-400">
          <span v-if="isDownloading">Generating...</span>
          <span v-else>Download Report</span>
        </button>
      </form>
    </div>
  </div>
</template>
