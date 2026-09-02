<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Enquiry {
  ID: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  team_size: number;
  message: string;
  status: string;
  created_at: string;
  language: { name: string } | null;
}

const enquiries = ref<Enquiry[]>([]);
const isLoading = ref(true);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/admin/corporate-enquiries');
    enquiries.value = res.data;
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const updateStatus = async (enquiry: Enquiry, status: string) => {
  try {
    await api.put(`/admin/corporate-enquiries/${enquiry.ID}/status`, { status });
    enquiry.status = status;
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to update status');
  }
};

const statusClass = (status: string) => {
  if (status === 'closed') return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  if (status === 'contacted') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-green-500/10 text-green-400 border-green-500/20';
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Corporate Training Enquiries</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-48 bg-gray-900/40 rounded-2xl border border-white/5">
        <svg class="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div v-else-if="enquiries.length === 0" class="bg-gray-900/40 rounded-2xl border border-white/5 p-8 text-center text-gray-400">
        No enquiries yet.
      </div>

      <div v-else class="space-y-4">
        <div v-for="e in enquiries" :key="e.ID" class="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <div class="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h2 class="text-lg font-bold text-white">{{ e.company_name }}</h2>
              <p class="text-sm text-gray-400">{{ e.contact_name }} &middot; {{ e.email }}<span v-if="e.phone"> &middot; {{ e.phone }}</span></p>
              <p class="text-sm text-gray-400 mt-1">
                Team size: <span class="text-white font-medium">{{ e.team_size }}</span>
                <span v-if="e.language"> &middot; Language: <span class="text-white font-medium">{{ e.language.name }}</span></span>
              </p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="statusClass(e.status)">
              {{ e.status }}
            </span>
          </div>

          <p v-if="e.message" class="mt-4 text-sm text-gray-300 whitespace-pre-line border-t border-white/5 pt-4">{{ e.message }}</p>

          <div class="mt-4 flex gap-2">
            <button
              v-for="s in ['new', 'contacted', 'closed']"
              :key="s"
              @click="updateStatus(e, s)"
              :disabled="e.status === s"
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
