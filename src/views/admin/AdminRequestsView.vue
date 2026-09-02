<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

interface ContactRequest {
  ID: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
}

const requests = ref<ContactRequest[]>([]);
const newCount = ref(0);
const isLoading = ref(true);
const statusFilter = ref('');

const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = statusFilter.value ? `?status=${statusFilter.value}` : '';
    const res = await api.get(`/admin/contact-requests${params}`);
    requests.value = res.data.data || [];
    newCount.value = res.data.new_count || 0;
  } catch (error) {
    console.error('Failed to fetch requests:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const setStatus = async (r: ContactRequest, status: string) => {
  try {
    await api.put(`/admin/contact-requests/${r.ID}/status`, { status });
    r.status = status;
    const res = await api.get('/admin/contact-requests');
    newCount.value = res.data.new_count || 0;
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to update request');
  }
};

const typeLabel = (t: string) =>
  t === 'teacher_application' ? 'Teacher application' : t === 'other' ? 'Other' : 'General';

const statusClass = (s: string) => {
  if (s === 'resolved') return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  if (s === 'read') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-green-500/10 text-green-400 border-green-500/20';
};

const formatDate = (d: string) => new Date(d).toLocaleString();

const filtered = computed(() => requests.value);
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          Requests
          <span v-if="newCount > 0" class="ml-2 align-middle text-sm font-semibold px-2.5 py-1 rounded-full bg-purple-600 text-white">{{ newCount }} new</span>
        </h1>
        <select v-model="statusFilter" @change="fetchData" class="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-48 bg-gray-900/40 rounded-2xl border border-white/5">
        <svg class="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div v-else-if="filtered.length === 0" class="bg-gray-900/40 rounded-2xl border border-white/5 p-8 text-center text-gray-400">
        No requests.
      </div>

      <div v-else class="space-y-4">
        <div v-for="r in filtered" :key="r.ID" class="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6" :class="{ 'ring-1 ring-purple-500/30': r.status === 'new' }">
          <div class="flex flex-wrap justify-between items-start gap-3">
            <div>
              <h2 class="text-lg font-bold text-white">{{ r.subject || '(no subject)' }}</h2>
              <p class="text-sm text-gray-400">
                {{ r.name }} &middot;
                <a :href="`mailto:${r.email}`" class="text-purple-400 hover:text-purple-300">{{ r.email }}</a>
                &middot; {{ formatDate(r.created_at) }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-700/40 text-gray-300 border-gray-600/40">{{ typeLabel(r.type) }}</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="statusClass(r.status)">{{ r.status }}</span>
            </div>
          </div>

          <p class="mt-4 text-sm text-gray-200 whitespace-pre-line border-t border-white/5 pt-4">{{ r.message }}</p>

          <div class="mt-4 flex gap-2">
            <button
              v-for="s in ['new', 'read', 'resolved']"
              :key="s"
              @click="setStatus(r, s)"
              :disabled="r.status === s"
              class="text-xs font-medium px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Mark {{ s }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
