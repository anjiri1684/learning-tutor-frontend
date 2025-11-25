<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface RescheduleRequest {
  ID: string;
  proposed_start_time: string;
  proposed_end_time: string;
  student: {
    full_name: string;
  };
  availability_slot: {
    start_time: string;
    language: {
      name: string;
    }
  };
}

const requests = ref<RescheduleRequest[]>([]);
const isLoading = ref(true);

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/teacher/reschedule-requests');
    requests.value = response.data;
  } catch (error) {
    console.error('Failed to fetch reschedule requests:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRequests);

const handleDecision = async (bookingId: string, decision: 'approve' | 'reject') => {
  try {
    await api.post(`/teacher/reschedule-requests/${bookingId}/process`, { decision });
    await fetchRequests();
  } catch (error) {
    console.error(`Failed to ${decision} request:`, error);
    alert(`Could not process the request. Please try again.`);
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Reschedule Requests</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading requests...</span>
         </div>
      </div>

      <div v-else-if="requests.length > 0" class="space-y-6">
        <div
          v-for="req in requests"
          :key="req.ID"
          class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300 group"
        >
          <div class="flex flex-col lg:flex-row lg:justify-between gap-6">

            <div class="flex items-start gap-4">
               <div class="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-white border border-gray-700">
                  {{ req.student.full_name.charAt(0).toUpperCase() }}
               </div>
               <div>
                  <p class="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{{ req.student.full_name }}</p>
                  <p class="text-sm text-gray-400">Wants to reschedule their <strong class="text-white">{{ req.availability_slot.language.name }}</strong> class.</p>
               </div>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
               <div class="text-center sm:text-right">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Original Time</p>
                  <p class="font-mono text-red-400 line-through decoration-red-500/50 text-sm">{{ formatDate(req.availability_slot.start_time) }}</p>
               </div>

               <div class="hidden sm:block text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
               </div>
               <div class="sm:hidden text-gray-600 rotate-90 transform self-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
               </div>

               <div>
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Proposed Time</p>
                  <p class="font-mono text-green-400 font-bold text-sm">{{ formatDate(req.proposed_start_time) }}</p>
               </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-800 flex justify-end gap-3">
            <button
              @click="handleDecision(req.ID, 'reject')"
              class="px-5 py-2 text-sm font-semibold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 hover:text-red-300 transition-all"
            >
              Reject
            </button>
            <button
              @click="handleDecision(req.ID, 'approve')"
              class="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg shadow-lg shadow-green-500/20 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all"
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 border-dashed text-center flex flex-col items-center justify-center">
         <div class="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
         </div>
         <p class="text-gray-400 text-lg">You have no pending reschedule requests.</p>
         <p class="text-gray-600 text-sm mt-1">Check back later when students propose new times.</p>
      </div>
    </div>
  </div>
</template>
