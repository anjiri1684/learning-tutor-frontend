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
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Earnings</h1>

    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="font-semibold text-gray-500">Available for Payout</h2>
      <p class="text-4xl font-bold text-green-600 mt-2">${{ balance.toFixed(2) }}</p>
      <button @click="showModal = true" class="mt-4 px-6 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700">
        Request Payout
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Payout History</h2>
      <div v-if="isLoading">Loading history...</div>
      <table v-else-if="requests.length > 0" class="w-full text-left">
        <thead>
          <tr class="border-b">
            <th class="py-2">Date Requested</th>
            <th class="py-2">Amount</th>
            <th class="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in requests" :key="req.ID" class="border-b">
            <td class="py-3">{{ formatDate(req.RequestedAt) }}</td>
            <td class="py-3">${{ req.Amount.toFixed(2) }}</td>
            <td class="py-3"><span class="font-semibold capitalize">{{ req.Status }}</span></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-gray-500">You have no payout history.</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Request a Payout</h3>
        <form @submit.prevent="handleRequestPayout">
          <label class="block text-sm font-medium">Amount</label>
          <input type="number" v-model="payoutAmount" :max="balance" step="0.01" required class="w-full mt-1 border rounded p-2" />
          <p class="text-xs text-gray-500 mt-1">Available: ${{ balance.toFixed(2) }}</p>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-teal-600 text-white rounded">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
