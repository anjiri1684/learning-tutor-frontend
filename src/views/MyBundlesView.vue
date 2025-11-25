<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { RouterLink } from 'vue-router';

interface StudentBundle {
  ID: string;
  remaining_classes: number;
  bundle: {
    name: string;
    language: {
      name: string;
    }
  }
}

const authStore = useAuthStore();
const bundles = ref<StudentBundle[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/bundles/me');
    bundles.value = response.data;
  } catch (error) {
    console.error('Failed to fetch student bundles:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Bundles & Credits</h1>

      <div class="mb-10 bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-green-500/20 shadow-lg relative overflow-hidden group">
        <div class="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-green-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/20 transition-all duration-500"></div>

        <div class="flex items-center justify-between relative z-10">
          <div>
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Available Credit Balance</h2>
            <div class="flex items-baseline mt-2 gap-1">
               <span class="text-5xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">${{ (authStore.user?.credit_balance || 0).toFixed(2) }}</span>
               <span class="text-gray-500 font-medium">USD</span>
            </div>
            <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               Earned from referrals
            </p>
          </div>
          <div class="hidden sm:flex h-16 w-16 rounded-full bg-green-900/20 border border-green-500/30 items-center justify-center">
             <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
           My Active Bundles
        </h2>

        <div v-if="isLoading" class="flex justify-center items-center h-48 bg-gray-900/40 rounded-2xl border border-white/5">
           <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-400">Loading bundles...</span>
           </div>
        </div>

        <div v-else-if="bundles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="sb in bundles"
            :key="sb.ID"
            class="group bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex justify-between items-start mb-4">
               <div>
                  <h3 class="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{{ sb.bundle.name }}</h3>
                  <span class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded border border-gray-700 text-gray-400 bg-gray-800 uppercase tracking-wide">
                     {{ sb.bundle.language.name }}
                  </span>
               </div>
               <div class="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-purple-900/20 group-hover:text-purple-400 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
               </div>
            </div>

            <div class="mt-6 pt-4 border-t border-white/5">
              <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Remaining Classes</p>
              <div class="flex items-center gap-2">
                 <span class="text-3xl font-bold text-white">{{ sb.remaining_classes }}</span>
                 <span class="text-sm text-gray-500 mt-2">credits left</span>
              </div>
              <div class="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                 <div class="h-full bg-purple-600 rounded-full" style="width: 60%"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center bg-gray-900/40 backdrop-blur-sm p-10 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center">
           <div class="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
           </div>
          <p class="text-gray-400 text-lg mb-6">You have no active class bundles.</p>
          <RouterLink
            to="/dashboard/bundles"
            class="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all"
          >
            Purchase a Bundle
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
