<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Certificate {
  ID: string;
  course_title: string;
  completion_date: string;
  certificate_url: string;
}

const certificates = ref<Certificate[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/gamification/certificates/me');
    certificates.value = response.data;
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString([], { dateStyle: 'long' });
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Certificates</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading certificates...</span>
         </div>
      </div>

      <div v-else-if="certificates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="cert in certificates"
          :key="cert.ID"
          class="group bg-gray-900/60 backdrop-blur-md p-1 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 relative"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl pointer-events-none group-hover:from-purple-500/50 group-hover:to-indigo-500/50 transition-colors duration-300"></div>

          <div class="bg-gray-900 rounded-xl p-6 relative h-full flex flex-col justify-between overflow-hidden">
             <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full group-hover:bg-purple-500/20 transition-colors"></div>

             <div>
                <div class="flex items-start justify-between mb-4">
                   <div class="h-12 w-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                      <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                   </div>
                   <span class="px-2 py-1 rounded text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-500/20 uppercase tracking-wider">Verified</span>
                </div>

                <h2 class="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{{ cert.course_title }}</h2>
                <p class="text-sm text-gray-400">Awarded on: <span class="text-gray-300">{{ formatDate(cert.completion_date) }}</span></p>
             </div>

             <a
               :href="cert.certificate_url"
               target="_blank"
               class="mt-6 w-full inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
             >
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
               View Certificate
             </a>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 border-dashed text-center flex flex-col items-center justify-center">
         <div class="h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
         <p class="text-gray-400 max-w-md">You haven't earned any certificates yet. Complete a course or pass an exam to see your achievements here!</p>
      </div>
    </div>
  </div>
</template>
