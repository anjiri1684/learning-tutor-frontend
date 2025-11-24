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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reschedule Requests</h1>

    <div v-if="isLoading">Loading requests...</div>
    <div v-else-if="requests.length > 0" class="space-y-4">
      <div v-for="req in requests" :key="req.ID" class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <p class="font-semibold text-lg">{{ req.student.full_name }}</p>
            <p class="text-gray-600">Wants to reschedule their {{ req.availability_slot.language.name }} class.</p>
          </div>
          <div class="mt-4 sm:mt-0 sm:text-right">
            <p class="text-sm text-gray-500">Original Time:</p>
            <p class="font-semibold text-red-600 line-through">{{ formatDate(req.availability_slot.start_time) }}</p>
          </div>
          <div class="mt-4 sm:mt-0 sm:text-right">
            <p class="text-sm text-gray-500">Proposed New Time:</p>
            <p class="font-semibold text-green-600">{{ formatDate(req.proposed_start_time) }}</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t flex justify-end space-x-3">
          <button @click="handleDecision(req.ID, 'reject')" class="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600">
            Reject
          </button>
          <button @click="handleDecision(req.ID, 'approve')" class="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">
            Approve
          </button>
        </div>
      </div>
    </div>
    <div v-else class="bg-white p-8 rounded-lg shadow-md text-center">
      <p class="text-gray-500">You have no pending reschedule requests.</p>
    </div>
  </div>
</template>
