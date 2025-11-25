<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const reviews = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/teacher/reviews/me');
    reviews.value = response.data;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

// UI Helper for avatar initials
const getInitials = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Reviews</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading reviews...</span>
         </div>
      </div>

      <div v-else-if="reviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="review in reviews"
          :key="review.ID"
          class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
               <div class="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {{ getInitials(review.Student.full_name) }}
               </div>
               <div>
                  <p class="font-bold text-white text-sm">{{ review.Student.full_name }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.CreatedAt) }}</p>
               </div>
            </div>

            <div class="flex gap-0.5">
               <svg v-for="n in 5" :key="n" :class="n <= review.Rating ? 'text-yellow-400' : 'text-gray-700'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
               </svg>
            </div>
          </div>

          <div class="relative flex-grow">
             <div v-if="review.Comment" class="bg-black/30 p-4 rounded-xl border border-white/5 relative mt-2">
                <svg class="absolute top-3 left-3 w-4 h-4 text-purple-500/30 transform -translate-x-1 -translate-y-1" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.3738 14.5029 16.9602 14.3496C17.2001 14.3262 17.3828 14.1256 17.3828 13.8863V12.1934C17.3828 12.0169 17.2657 11.8617 17.0934 11.8211C15.3533 11.4116 14.4393 9.68943 14.4393 7.82812V6C14.4393 4.89543 15.3348 4 16.4393 4H19.4393C20.5439 4 21.4393 4.89543 21.4393 6V11C21.4393 15.655 17.8681 21 14.017 21ZM5 21L5 18C5 16.0547 6.35683 14.5029 7.94317 14.3496C8.1831 14.3262 8.36579 14.1256 8.36579 13.8863V12.1934C8.36579 12.0169 8.24867 11.8617 8.07636 11.8211C6.33629 11.4116 5.42229 9.68943 5.42229 7.82812V6C5.42229 4.89543 6.31772 4 7.42229 4H10.4223C11.5269 4 12.4223 4.89543 12.4223 6V11C12.4223 15.655 8.85107 21 5 21Z"/></svg>
                <p class="text-gray-300 text-sm italic pl-5 leading-relaxed">"{{ review.Comment }}"</p>
             </div>
             <div v-else class="mt-4 text-gray-600 text-sm italic">No written comment provided.</div>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 border-dashed text-center flex flex-col items-center justify-center">
         <div class="h-16 w-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-white">No Reviews Yet</h3>
         <p class="text-gray-400 mt-2 max-w-md">You haven't received any reviews yet. Deliver great classes and ask your students for feedback!</p>
      </div>
    </div>
  </div>
</template>
