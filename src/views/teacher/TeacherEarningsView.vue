<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const balance = ref(0);
const requests = ref<any[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const payoutAmount = ref(0);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [balanceRes, requestsRes] = await Promise.all([
      api.get('/teacher/earnings'),
      api.get('/teacher/payouts/requests'),
    ]);
    balance.value = balanceRes.data.current_balance;
    requests.value = requestsRes.data;
  } catch (error) {
    console.error('Failed to fetch earnings data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const handleRequestPayout = async () => {
  if (payoutAmount.value <= 0 || payoutAmount.value > balance.value) {
    alert('Invalid amount. Must be greater than 0 and not more than your balance.');
    return;
  }
  try {
    await api.post('/teacher/payouts/request', { amount: payoutAmount.value });
    showModal.value = false;
    payoutAmount.value = 0;
    await fetchData();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to submit request.');
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-green-400 bg-green-900/20 border-green-500/20';
    case 'pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20';
    case 'rejected': return 'text-red-400 bg-red-900/20 border-red-500/20';
    default: return 'text-gray-400 bg-gray-800 border-gray-700';
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Earnings</h1>

      <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl mb-8 relative overflow-hidden group">
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-green-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/20 transition-all duration-500"></div>

        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
             <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Available for Payout</h2>
             <div class="flex items-baseline gap-1">
                <span class="text-5xl font-bold text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">${{ balance.toFixed(2) }}</span>
                <span class="text-gray-500 font-medium">USD</span>
             </div>
          </div>

          <button
            @click="showModal = true"
            class="px-8 py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Request Payout
          </button>
        </div>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div class="p-6 border-b border-gray-800">
           <h2 class="text-xl font-bold text-white">Payout History</h2>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center h-48">
           <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-400">Loading history...</span>
           </div>
        </div>

        <div v-else-if="requests.length > 0" class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Date Requested</th>
                <th class="p-4 font-semibold">Amount</th>
                <th class="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="req in requests" :key="req.ID" class="hover:bg-white/5 transition-colors group">
                <td class="p-4 text-gray-300 font-mono">{{ formatDate(req.RequestedAt) }}</td>
                <td class="p-4 text-white font-bold">${{ req.Amount.toFixed(2) }}</td>
                <td class="p-4">
                   <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize"
                      :class="getStatusStyles(req.Status)"
                   >
                      {{ req.Status }}
                   </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-12 text-center">
           <p class="text-gray-500">You have no payout history yet.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
          <div class="p-8">
            <h3 class="text-xl font-bold text-white mb-6">Request a Payout</h3>

            <form @submit.prevent="handleRequestPayout" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Amount to Withdraw</label>
                <div class="relative">
                   <span class="absolute left-4 top-3.5 text-gray-500">$</span>
                   <input
                     type="number"
                     v-model="payoutAmount"
                     :max="balance"
                     step="0.01"
                     required
                     class="w-full pl-8 pr-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                   />
                </div>
                <p class="text-xs text-gray-500 mt-2 text-right">
                   Available Balance: <span class="text-green-400 font-bold">${{ balance.toFixed(2) }}</span>
                </p>
              </div>

              <div class="flex justify-end gap-4 pt-4 border-t border-gray-800">
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
