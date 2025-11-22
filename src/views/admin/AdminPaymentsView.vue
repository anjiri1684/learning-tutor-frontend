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
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Payment History</h1>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex space-x-4 mb-4">
        <select v-model="filters.status" class="p-2 border rounded-md"><option value="">All Statuses</option><option value="succeeded">Succeeded</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <select v-model="filters.provider" class="p-2 border rounded-md"><option value="">All Providers</option><option value="mpesa">M-Pesa</option><option value="paypal">PayPal</option><option value="credit">Credit</option></select>
      </div>
      <table class="w-full text-left">
        <thead><tr class="bg-gray-50"><th>Date</th><th>Student</th><th>Amount</th><th>Provider</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="p in payments" :key="p.ID" class="border-b">
            <td class="py-3">{{ formatDate(p.CreatedAt) }}</td>
            <td>{{ getStudentName(p) }}</td>
            <td>${{ p.Amount.toFixed(2) }}</td>
            <td class="capitalize">{{ p.Provider }}</td>
            <td class="capitalize font-semibold">{{ p.Status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
