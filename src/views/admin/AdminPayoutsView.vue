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
    await fetchRequests(); // Refresh the list
  } catch (error) {
    console.error('Failed to process payout:', error);
    alert('Failed to process payout request.');
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Pending Payout Requests</h1>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="isLoading">Loading requests...</div>
      <div v-else-if="requests.length > 0" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="p-3">Teacher</th>
              <th>Amount</th>
              <th>Date Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.ID" class="border-b hover:bg-gray-50">
              <td class="p-3 font-semibold">{{ req.Teacher.full_name }}</td>
              <td>${{ req.Amount.toFixed(2) }}</td>
              <td>{{ formatDate(req.RequestedAt) }}</td>
              <td>
                <button @click="openProcessModal(req)" class="px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">
                  Process
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500">There are no pending payout requests.</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">Process Payout for {{ selectedRequest.Teacher.full_name }}</h3>
        <p>Amount: <span class="font-bold">${{ selectedRequest.Amount.toFixed(2) }}</span></p>
        <form @submit.prevent="handleProcess" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-medium">Action</label>
            <select v-model="processForm.decision" class="w-full mt-1 border rounded p-2 bg-white">
              <option value="complete">Mark as Complete</option>
              <option value="reject">Reject Request</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Admin Notes (Optional)</label>
            <textarea v-model="processForm.admin_notes" rows="3" class="w-full mt-1 border rounded p-2" placeholder="e.g., Transaction ID, reason for rejection"></textarea>
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
