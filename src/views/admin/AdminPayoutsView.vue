<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const requests = ref<any[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const selectedRequest = ref<any>(null);
const processForm = ref({
  decision: 'complete',
  admin_notes: '',
});

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/payout-requests');
    requests.value = response.data;
  } catch (error) {
    console.error('Failed to fetch payout requests:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRequests);

const openProcessModal = (request: any) => {
  selectedRequest.value = request;
  processForm.value = { decision: 'complete', admin_notes: '' };
  showModal.value = true;
};

const handleProcess = async () => {
  if (!selectedRequest.value) return;
  try {
    await api.post(`/admin/payout-requests/${selectedRequest.value.ID}/process`, processForm.value);
    showModal.value = false;
    await fetchRequests();
  } catch (error) {
    console.error('Failed to process payout:', error);
    alert('Failed to process payout request.');
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Pending Payout Requests</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">

        <div v-if="isLoading" class="flex justify-center items-center h-64">
           <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-400">Loading requests...</span>
           </div>
        </div>

        <div v-else-if="requests.length > 0" class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Teacher</th>
                <th class="p-4 font-semibold">Amount</th>
                <th class="p-4 font-semibold">Date Requested</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="req in requests" :key="req.ID" class="hover:bg-white/5 transition-colors group">
                <td class="p-4">
                   <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700">
                         {{ req.Teacher.full_name.charAt(0).toUpperCase() }}
                      </div>
                      <span class="font-medium text-white">{{ req.Teacher.full_name }}</span>
                   </div>
                </td>
                <td class="p-4 font-bold text-green-400">${{ req.Amount.toFixed(2) }}</td>
                <td class="p-4 text-gray-400 text-sm font-mono">{{ formatDate(req.RequestedAt) }}</td>
                <td class="p-4 text-right">
                  <button
                    @click="openProcessModal(req)"
                    class="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/20 hover:bg-purple-500 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Process
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
           <svg class="w-12 h-12 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
           <p>There are no pending payout requests.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden transform transition-all scale-100">
          <div class="p-8">
            <h3 class="text-xl font-bold text-white mb-2">Process Payout</h3>
            <p class="text-gray-400 text-sm mb-6">
               Processing request for <span class="text-white font-semibold">{{ selectedRequest.Teacher.full_name }}</span>
            </p>

            <div class="bg-black/30 p-4 rounded-xl border border-white/5 mb-6 flex justify-between items-center">
               <span class="text-gray-400 text-sm">Requested Amount</span>
               <span class="text-2xl font-bold text-green-400">${{ selectedRequest.Amount.toFixed(2) }}</span>
            </div>

            <form @submit.prevent="handleProcess" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Decision</label>
                <select
                  v-model="processForm.decision"
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="complete">Mark as Complete</option>
                  <option value="reject">Reject Request</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Admin Notes <span class="text-gray-500 text-xs ml-1">(Optional)</span></label>
                <textarea
                  v-model="processForm.admin_notes"
                  rows="3"
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                  placeholder="e.g., Transaction ID, reason for rejection..."
                ></textarea>
              </div>

              <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  @click="showModal = false"
                  class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
