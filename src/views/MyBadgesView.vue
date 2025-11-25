<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Badge {
  ID: string;
  Name: string;
  Description: string;
  IconURL: string;
}

const badges = ref<Badge[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/gamification/badges/me');
    badges.value = response.data;
  } catch (error) {
    console.error('Failed to fetch badges:', error);
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

    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Badges</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading badges...</span>
         </div>
      </div>

      <div v-else-if="badges.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="badge in badges"
          :key="badge.ID"
          class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/20 hover:-translate-y-2 transition-all duration-300 text-center group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          <div class="relative z-10">
             <img
               :src="badge.IconURL"
               :alt="badge.Name"
               class="w-24 h-24 mx-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-300"
             />
             <h2 class="text-lg font-bold mt-6 text-white group-hover:text-purple-300 transition-colors">{{ badge.Name }}</h2>
             <p class="text-sm text-gray-400 mt-2 leading-relaxed">{{ badge.Description }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 border-dashed text-center flex flex-col items-center justify-center">
         <div class="h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-white mb-2">No Badges Yet</h3>
         <p class="text-gray-400 max-w-md">You haven't earned any badges yet. Complete lessons and hit milestones to start your collection!</p>
      </div>
    </div>
  </div>
</template>
