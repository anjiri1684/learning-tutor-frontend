<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const logs = ref<any[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);

const fetchLogs = async (page: number = 1) => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/audit-logs', { params: { page, limit: 20 } });
    logs.value = response.data.data;
    currentPage.value = response.data.meta.page;
    lastPage.value = response.data.meta.last_page;
    total.value = response.data.meta.total;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchLogs(1));

const changePage = (page: number) => {
  if (page >= 1 && page <= lastPage.value) fetchLogs(page);
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

const actionLabel = (action: string) => action.replace(/[._]/g, ' ');
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Audit Log</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
        <span class="text-gray-400">Loading...</span>
      </div>

      <div v-else class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Date</th>
                <th class="p-4 font-semibold">Admin</th>
                <th class="p-4 font-semibold">Action</th>
                <th class="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-white/5 transition-colors">
                <td class="p-4 text-gray-400 text-sm font-mono">{{ formatDate(log.created_at) }}</td>
                <td class="p-4 text-white font-medium">{{ log.actor?.full_name || 'Unknown' }}</td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                    {{ actionLabel(log.action) }}
                  </span>
                </td>
                <td class="p-4 text-gray-300 text-sm max-w-md truncate" :title="log.details">{{ log.details }}</td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="4" class="p-8 text-center text-gray-500">No audit log entries yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-gray-800 bg-gray-900/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-gray-400">Total: <span class="text-white font-medium">{{ total }}</span> entries</p>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 px-2">Page <span class="text-white">{{ currentPage }}</span> of {{ lastPage }}</span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === lastPage"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
