<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

const headline = ref('');
const bio = ref('');
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });

const handleApply = async () => {
  isSubmitting.value = true;
  message.value = { type: '', text: '' };

  try {
    await api.post('/teacher/apply', {
      headline: headline.value,
      bio: bio.value,
    });
    message.value = { type: 'success', text: 'Your application has been submitted! Our team will review it shortly.' };
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'Failed to submit application.' };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Become a Teacher</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10 relative overflow-hidden">

        <div v-if="message.text" :class="['p-4 mb-8 text-sm rounded-xl flex items-start gap-3 border',
          message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'
        ]">
           <svg v-if="message.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <span class="leading-relaxed">{{ message.text }}</span>
        </div>

        <form v-else @submit.prevent="handleApply" class="space-y-8">
          <div class="flex items-start gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
             <div class="bg-purple-900/30 p-2 rounded-lg">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
             </div>
             <p class="text-gray-400 text-sm leading-relaxed">
                Fill out the form below to apply to become a teacher on our platform. Tell us about your expertise and why students should choose you.
             </p>
          </div>

          <div>
            <label for="headline" class="block text-sm font-medium text-gray-300 mb-2">Headline</label>
            <input
              v-model="headline"
              id="headline"
              type="text"
              required
              class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              placeholder="e.g., Certified IELTS Expert with 5+ years of experience"
            />
          </div>

          <div>
            <label for="bio" class="block text-sm font-medium text-gray-300 mb-2">About Me (Bio)</label>
            <textarea
              v-model="bio"
              id="bio"
              rows="6"
              required
              class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              placeholder="Tell students about your teaching style, experience, and what makes your classes great."
            ></textarea>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full px-8 py-4 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                 <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Submitting Application...
              </span>
              <span v-else class="flex items-center gap-2">
                 Submit Application
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
