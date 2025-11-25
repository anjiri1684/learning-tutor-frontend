<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

const payments = ref<any[]>([]);
const isLoading = ref(true);
const filters = ref({ status: '', provider: '' });
const pagination = ref({ page: 1, total: 0 });

const fetchPayments = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      status: filters.value.status,
      provider: filters.value.provider,
    });
    const response = await api.get(`/admin/payments?${params.toString()}`);
    payments.value = response.data.data;
    pagination.value.total = response.data.meta.total;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPayments);
watch(filters, fetchPayments, { deep: true });

const getStudentName = (payment: any) => {
  if (payment.Booking && payment.Booking.Student) return payment.Booking.Student.full_name;
  if (payment.StudentBundle && payment.StudentBundle.Student) return payment.StudentBundle.Student.full_name;
  return 'N/A';
};
const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

// UI Helper for status styling
const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'succeeded': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'refunded': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
};

// UI Helper for provider icons/colors
const getProviderIcon = (provider: string) => {
  switch (provider?.toLowerCase()) {
    case 'mpesa': return 'text-green-500';
    case 'paypal': return 'text-blue-500';
    case 'credit': return 'text-purple-500';
    default: return 'text-gray-400';
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Payment History</h1>

        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div class="relative">
            <select
              v-model="filters.status"
              class="appearance-none w-full sm:w-40 bg-gray-900 border border-gray-700 text-white py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div class="relative">
            <select
              v-model="filters.provider"
              class="appearance-none w-full sm:w-40 bg-gray-900 border border-gray-700 text-white py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer"
            >
              <option value="">All Providers</option>
              <option value="mpesa">M-Pesa</option>
              <option value="paypal">PayPal</option>
              <option value="credit">Credit Card</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Date</th>
                <th class="p-4 font-semibold">Student</th>
                <th class="p-4 font-semibold">Amount</th>
                <th class="p-4 font-semibold">Provider</th>
                <th class="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">

              <tr v-if="isLoading">
                 <td colspan="5" class="p-8 text-center">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <svg class="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-sm text-gray-400">Loading payment history...</span>
                    </div>
                 </td>
              </tr>

              <tr v-else v-for="p in payments" :key="p.ID" class="hover:bg-white/5 transition-colors group">
                <td class="p-4 text-gray-400 text-sm font-mono">{{ formatDate(p.CreatedAt) }}</td>
                <td class="p-4 font-medium text-white">{{ getStudentName(p) }}</td>
                <td class="p-4 font-bold text-white tracking-wide">${{ p.Amount.toFixed(2) }}</td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span :class="getProviderIcon(p.Provider)">
                      <svg v-if="p.Provider === 'credit'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </span>
                    <span class="capitalize text-gray-300">{{ p.Provider }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize"
                    :class="getStatusStyles(p.Status)"
                  >
                    {{ p.Status }}
                  </span>
                </td>
              </tr>

              <tr v-if="!isLoading && payments.length === 0">
                 <td colspan="5" class="p-12 text-center text-gray-500">
                    No payment records found matching your filters.
                 </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-6 py-4 border-t border-gray-800 bg-gray-900/40 text-right">
           <span class="text-sm text-gray-500">Total Records: <span class="text-white font-medium">{{ pagination.total }}</span></span>
        </div>
      </div>
    </div>
  </div>
</template>
