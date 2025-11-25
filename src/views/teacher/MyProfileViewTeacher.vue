<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const profileForm = ref({
  headline: '',
  bio: '',
});
const isLoading = ref(true);
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });

onMounted(async () => {

  try {
    const response = await api.get('/teacher/profile/me');
    profileForm.value.headline = response.data.headline || '';
    profileForm.value.bio = response.data.bio || '';
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleUpdateProfile = async () => {
  isSubmitting.value = true;
  message.value = { type: '', text: '' };
  try {
    await api.put('/teacher/profile/me', profileForm.value);
    message.value = { type: 'success', text: 'Profile updated successfully!' };
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'Failed to update profile.' };
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
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Edit Public Profile</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10 relative overflow-hidden">

        <div v-if="isLoading" class="flex justify-center items-center h-64">
           <div class="flex flex-col items-center gap-3">
              <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-400">Loading profile data...</span>
           </div>
        </div>

        <form v-else @submit.prevent="handleUpdateProfile" class="space-y-8">

          <div v-if="message.text" :class="['p-4 rounded-xl flex items-start gap-3 border text-sm',
            message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'
          ]">
             <svg v-if="message.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
             <svg v-else class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <span class="leading-relaxed">{{ message.text }}</span>
          </div>

          <div>
            <label for="headline" class="block text-sm font-medium text-gray-300 mb-2">Headline</label>
            <div class="relative">
               <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
               </div>
               <input
                 v-model="profileForm.headline"
                 id="headline"
                 type="text"
                 required
                 class="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                 placeholder="e.g., Certified IELTS Expert with 5+ years of experience"
               />
            </div>
          </div>

          <div>
            <label for="bio" class="block text-sm font-medium text-gray-300 mb-2">About Me (Bio)</label>
            <div class="relative">
               <textarea
                 v-model="profileForm.bio"
                 id="bio"
                 rows="8"
                 required
                 class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600 custom-scrollbar"
                 placeholder="Tell students about your teaching style, experience, and what makes your classes unique..."
               ></textarea>
            </div>
            <p class="text-xs text-gray-500 mt-2 text-right">Markdown formatting supported.</p>
          </div>

          <div class="pt-4 border-t border-white/5">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full sm:w-auto px-8 py-3.5 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                 <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Saving...
              </span>
              <span v-else class="flex items-center gap-2">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                 Save Changes
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
