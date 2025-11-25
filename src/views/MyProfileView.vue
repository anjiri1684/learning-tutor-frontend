<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { uploadImage } from '@/services/upload';

const authStore = useAuthStore();
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });
const copyButtonText = ref('Copy Code');

const profileForm = ref({
  full_name: '',
  time_zone: '',
  learning_goals: '',
  profile_picture_url: '',
});

onMounted(() => {
  if (authStore.user) {
    profileForm.value.full_name = authStore.user.full_name;
    profileForm.value.time_zone = authStore.user.time_zone || '';
    profileForm.value.learning_goals = authStore.user.learning_goals || '';
    profileForm.value.profile_picture_url = authStore.user.profile_picture_url || '';
  }
});

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    isSubmitting.value = true;
    message.value = { type: 'info', text: 'Uploading image...' };
    try {
      const imageURL = await uploadImage(file);
      profileForm.value.profile_picture_url = imageURL;
      message.value = { type: 'success', text: 'Image uploaded! Click "Save Changes" to apply.' };
    } catch (error) {
      console.log(error);
      message.value = { type: 'error', text: 'Image upload failed. Please try again.' };
    } finally {
      isSubmitting.value = false;
    }
  }
};

const handleUpdateProfile = async () => {
  isSubmitting.value = true;
  message.value = { type: '', text: '' };

  const result = await authStore.updateProfile(profileForm.value);

  isSubmitting.value = false;
  message.value = { type: result.success ? 'success' : 'error', text: result.message };
};

const copyCode = () => {
  if (authStore.user?.referral_code) {
    navigator.clipboard.writeText(authStore.user.referral_code);
    copyButtonText.value = 'Copied!';
    setTimeout(() => {
      copyButtonText.value = 'Copy Code';
    }, 2000);
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Profile</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10 mb-8">

        <form @submit.prevent="handleUpdateProfile" class="space-y-8">

          <div v-if="message.text" :class="['p-4 text-sm rounded-xl flex items-center gap-3 border',
            message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' :
            message.type === 'error' ? 'bg-red-900/30 border-red-500/30 text-red-300' :
            'bg-blue-900/30 border-blue-500/30 text-blue-300'
          ]">
             <svg v-if="message.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
             <svg v-if="message.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {{ message.text }}
          </div>

          <div class="flex items-center gap-6 pb-6 border-b border-gray-800">
            <div class="relative group">
               <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
               <img
                  :src="profileForm.profile_picture_url || 'https://via.placeholder.com/150'"
                  class="relative w-24 h-24 rounded-full object-cover border-2 border-black bg-gray-800"
                  alt="Profile Picture"
               />
            </div>
            <div>
              <label for="profile-picture-upload" class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-purple-400 hover:border-purple-500/50 transition-all shadow-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Upload New Image
              </label>
              <input id="profile-picture-upload" type="file" @change="onFileChange" class="hidden" accept="image/png, image/jpeg" />
              <p class="text-xs text-gray-500 mt-2">JPG or PNG. Max 5MB.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                v-model="profileForm.full_name"
                id="fullName"
                type="text"
                required
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label for="timeZone" class="block text-sm font-medium text-gray-400 mb-2">Time Zone</label>
              <input
                v-model="profileForm.time_zone"
                id="timeZone"
                type="text"
                placeholder="e.g., Africa/Nairobi"
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label for="learningGoals" class="block text-sm font-medium text-gray-400 mb-2">Learning Goals</label>
              <textarea
                v-model="profileForm.learning_goals"
                id="learningGoals"
                rows="4"
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                placeholder="e.g., 'Become fluent in conversational Spanish.'"
              ></textarea>
            </div>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full sm:w-auto px-8 py-3.5 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                 <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Saving...
              </span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10 relative overflow-hidden group">
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500"></div>

        <div class="relative z-10">
           <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
              Your Referral Code
           </h2>
           <p class="text-gray-400 mt-2 text-sm">Share this code with friends. You'll get <span class="text-green-400 font-bold">$5.00 credit</span> when they make their first purchase!</p>

           <div class="mt-6 flex items-center gap-0 bg-black/40 rounded-xl border border-purple-500/30 border-dashed p-1">
             <div class="flex-grow px-4 py-2">
                <span class="text-2xl font-mono tracking-widest text-purple-400 font-bold">{{ authStore.user?.referral_code }}</span>
             </div>
             <button
                @click="copyCode"
                class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors shadow-lg"
             >
               {{ copyButtonText }}
             </button>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>
