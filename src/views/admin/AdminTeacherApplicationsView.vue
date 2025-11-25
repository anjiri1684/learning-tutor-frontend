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
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <!-- Ambient Background Glow -->
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">
        Pending Teacher Applications
      </h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading applications...</span>
         </div>
      </div>

      <!-- Applications List -->
      <div v-else-if="applications.length > 0" class="space-y-6">
        <div
          v-for="app in applications"
          :key="app.user_id"
          class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
        >
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div class="flex items-center gap-4">
               <!-- Avatar Placeholder -->
               <div class="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                  {{ app.user.full_name.charAt(0).toUpperCase() }}
               </div>
               <div>
                  <h2 class="text-xl font-bold text-white">{{ app.user.full_name }}</h2>
                  <p class="text-sm text-purple-300">{{ app.user.email }}</p>
               </div>
            </div>
            <div class="text-sm text-gray-500 bg-black/20 px-3 py-1 rounded-full border border-white/5">
              Applied: {{ formatDate(app.user.created_at) }}
            </div>
          </div>

          <!-- Content Section -->
          <div class="mt-6 pt-6 border-t border-gray-700/50 space-y-4">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Headline</p>
              <p class="text-gray-200 font-medium">{{ app.headline }}</p>
            </div>

            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Biography</p>
              <div class="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                 {{ app.bio }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 pt-6 border-t border-gray-700/50 flex flex-col sm:flex-row justify-end gap-3">
            <button
              @click="handleDecision(app.user_id, 'rejected')"
              class="px-6 py-2.5 text-sm font-semibold text-red-300 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 hover:border-red-500/40 hover:text-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Reject Application
            </button>
            <button
              @click="handleDecision(app.user_id, 'active')"
              class="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-lg shadow-green-500/20 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Approve Teacher
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center gap-4">
        <div class="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center">
           <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-gray-400 text-lg">
          No pending teacher applications at the moment.
        </p>
      </div>
    </div>
  </div>
</template>
