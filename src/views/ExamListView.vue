<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/services/api';

interface MockTest {
  ID: string;
  title: string;
  description: string;
  duration_minutes: number;
}

const tests = ref<MockTest[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/exams/tests');
    tests.value = response.data;
  } catch (error) {
    console.error('Failed to fetch mock tests:', error);
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
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
           <h1 class="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Exam Portal</h1>
           <p class="text-gray-400 mt-2">Test your knowledge and earn certifications.</p>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading available tests...</span>
         </div>
      </div>

      <div v-else-if="tests.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="test in tests"
          :key="test.ID"
          class="group bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
             <div class="flex justify-between items-start mb-4">
                <h2 class="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">{{ test.title }}</h2>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-mono text-gray-300">
                   <svg class="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   {{ test.duration_minutes }} mins
                </span>
             </div>
             <p class="text-gray-400 text-sm leading-relaxed mb-8">{{ test.description }}</p>
          </div>

          <RouterLink
            :to="`/dashboard/exam/${test.ID}`"
            class="w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all group-hover:scale-[1.02]"
          >
            Start Test
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </RouterLink>
        </div>
      </div>

      <div v-else class="text-center bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center">
         <div class="h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-gray-700">
            <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-white mb-2">No Tests Available</h3>
         <p class="text-gray-400 max-w-md">There are currently no mock tests available. Please check back later for new assessments.</p>
      </div>
    </div>
  </div>
</template>
