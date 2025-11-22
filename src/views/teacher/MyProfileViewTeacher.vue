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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Edit My Public Profile</h1>
    <div v-if="isLoading">Loading profile...</div>
    <div v-else class="max-w-2xl bg-white p-8 rounded-lg shadow-md">
      <form @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div v-if="message.text" :class="['p-3 text-sm rounded-md', message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
          {{ message.text }}
        </div>
        <div>
          <label for="headline" class="block text-sm font-medium text-gray-700">Headline</label>
          <input v-model="profileForm.headline" id="headline" type="text" required class="w-full mt-1 p-2 border rounded-md" placeholder="e.g., Certified IELTS Expert" />
        </div>
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700">About Me (Bio)</label>
          <textarea v-model="profileForm.bio" id="bio" rows="8" required class="w-full mt-1 p-2 border rounded-md" placeholder="Tell students about your teaching style..."></textarea>
        </div>
        <div>
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400">
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
