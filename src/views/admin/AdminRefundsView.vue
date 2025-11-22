<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const requests = ref<any[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const selectedRequest = ref<any>(null);
const processForm = ref({
  decision: 'approve',
});

const fetchRequests = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/refund-requests');
    requests.value = response.data;
  } catch (error) {
    console.error('Failed to fetch refund requests:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRequests);

const openProcessModal = (request: any) => {
  selectedRequest.value = request;
  processForm.value.decision = 'approve';
  showModal.value = true;
};

const handleProcess = async () => {
  if (!selectedRequest.value) return;
  try {
    await api.post(`/admin/refund-requests/${selectedRequest.value.ID}/process`, processForm.value);
    showModal.value = false;
    await fetchRequests(); // Refresh the list
  } catch (error) {
    console.error('Failed to process refund:', error);
    alert('Failed to process refund request.');
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Pending Refund Requests</h1>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="isLoading">Loading requests...</div>
      <div v-else-if="requests.length > 0" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="p-3">Student</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.ID" class="border-b hover:bg-gray-50">
              <td class="p-3 font-semibold">{{ req.Booking.Student.full_name }}</td>
              <td>${{ req.Amount.toFixed(2) }}</td>
              <td class="text-sm text-gray-600">{{ req.RefundReason }}</td>
              <td>{{ formatDate(req.CreatedAt) }}</td>
              <td>
                <button @click="openProcessModal(req)" class="px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">
                  Process
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500">There are no pending refund requests.</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">Process Refund for {{ selectedRequest.Booking.Student.full_name }}</h3>
        <p>Amount: <span class="font-bold">${{ selectedRequest.Amount.toFixed(2) }}</span></p>
        <p class="mt-2">Reason: <span class="italic text-gray-700">"{{ selectedRequest.RefundReason }}"</span></p>
        <form @submit.prevent="handleProcess" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-medium">Action</label>
            <select v-model="processForm.decision" class="w-full mt-1 border rounded p-2 bg-white">
              <option value="approve">Approve (Mark as Refunded)</option>
              <option value="reject">Reject Request</option>
            </select>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-gray-800 text-white rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
