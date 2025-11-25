<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const progressData = ref<any>(null);
const isLoading = ref(true);
const route = useRoute();

onMounted(async () => {
  const studentId = route.params.studentId as string;
  try {
    const response = await api.get(`/teacher/student-progress/${studentId}`);
    progressData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch student progress:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });

// Helper for status styling
const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-700/30 text-gray-400 border-gray-600/30';
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading student progress...</span>
         </div>
      </div>

      <div v-else-if="progressData">
        <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                 Student Progress
              </h1>
              <p class="text-lg text-purple-400 mt-1 font-medium">{{ progressData.student_name }}</p>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div class="group bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-teal-500/30 hover:shadow-teal-500/10 transition-all duration-300 flex items-center justify-between">
            <div>
               <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Total Completed Classes</h3>
               <p class="text-4xl font-bold text-white mt-2 group-hover:text-teal-400 transition-colors">{{ progressData.total_classes }}</p>
            </div>
            <div class="bg-teal-900/20 p-4 rounded-xl border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
               <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
          </div>

          <div class="group bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-yellow-500/30 hover:shadow-yellow-500/10 transition-all duration-300 flex items-center justify-between">
            <div>
               <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Average Rating Given</h3>
               <div class="flex items-center gap-2 mt-2">
                  <p class="text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors">{{ progressData.average_rating.toFixed(1) }}</p>
                  <svg class="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
               </div>
            </div>
            <div class="bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
               <svg class="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div class="p-6 border-b border-gray-800 flex items-center gap-2">
             <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <h2 class="text-xl font-bold text-white">Class History</h2>
          </div>

          <div v-if="progressData.bookings.length > 0" class="divide-y divide-gray-800">
            <div v-for="booking in progressData.bookings" :key="booking.ID" class="p-6 hover:bg-white/5 transition-colors">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div class="flex items-start gap-4">
                   <div class="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 font-bold border border-gray-700">
                      {{ booking.availability_slot.language.name.substring(0,2).toUpperCase() }}
                   </div>
                   <div>
                      <p class="font-bold text-lg text-white">{{ booking.availability_slot.language.name }} Class</p>
                      <p class="text-sm text-gray-400 font-mono mt-1 flex items-center gap-2">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                         {{ formatDate(booking.availability_slot.start_time) }}
                      </p>
                   </div>
                </div>
                <span
                  class="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border"
                  :class="getStatusClass(booking.status)"
                >
                  {{ booking.status }}
                </span>
              </div>

              <div v-if="booking.teacher_feedback" class="mt-4 bg-black/30 p-4 rounded-xl border border-white/5 ml-0 sm:ml-14">
                <p class="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Your Feedback</p>
                <p class="text-gray-300 italic text-sm leading-relaxed">"{{ booking.teacher_feedback }}"</p>
              </div>
            </div>
          </div>

          <div v-else class="p-12 text-center">
             <p class="text-gray-500">No class history found for this student.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
