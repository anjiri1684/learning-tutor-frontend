<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface Application {
  user_id: string;
  headline: string;
  bio: string;
  status: string;
  user: User;
}

const applications = ref<Application[]>([]);
const isLoading = ref(true);

const fetchApplications = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/applications/pending');
    applications.value = response.data;
  } catch (error) {
    console.error('Failed to fetch applications:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplications);

const handleDecision = async (teacherId: string, decision: 'active' | 'rejected') => {
  try {
    await api.put(`/admin/applications/${teacherId}`, { status: decision });
    await fetchApplications();
  } catch (error) {
    console.error(`Failed to ${decision} application:`, error);
    alert('Failed to process application.');
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString();
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      Pending Teacher Applications
    </h1>

    <div v-if="isLoading">Loading applications...</div>

    <div v-else-if="applications.length > 0" class="space-y-6">
      <div
        v-for="app in applications"
        :key="app.user_id"
        class="bg-white p-6 rounded-lg shadow-md"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-bold">{{ app.user.full_name }}</h2>
            <p class="text-sm text-gray-500">{{ app.user.email }}</p>
          </div>
          <p class="text-sm text-gray-500">
            Applied on: {{ formatDate(app.user.created_at) }}
          </p>
        </div>

        <div class="mt-4 pt-4 border-t">
          <p class="font-semibold">Headline:</p>
          <p class="text-gray-700">{{ app.headline }}</p>

          <p class="font-semibold mt-3">Bio:</p>
          <p class="text-gray-700 whitespace-pre-wrap">{{ app.bio }}</p>
        </div>

        <div class="mt-6 pt-4 border-t flex justify-end gap-3">
          <button
            @click="handleDecision(app.user_id, 'rejected')"
            class="px-5 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition"
          >
            Reject
          </button>
          <button
            @click="handleDecision(app.user_id, 'active')"
            class="px-5 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition"
          >
            Approve
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white p-12 rounded-lg shadow-md text-center">
      <p class="text-gray-500 text-lg">
        There are no pending teacher applications.
      </p>
    </div>
  </div>
</template>
