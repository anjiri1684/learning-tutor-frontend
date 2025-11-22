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
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Become a Teacher</h1>
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">

      <div v-if="message.text" :class="['p-3 text-sm rounded-md mb-6',
        {'bg-green-100 text-green-700': message.type === 'success'},
        {'bg-red-100 text-red-700': message.type === 'error'}
      ]">
        {{ message.text }}
      </div>

      <form v-else @submit.prevent="handleApply" class="space-y-6">
        <p class="text-gray-600">Fill out the form below to apply to become a teacher on our platform. Your application will be reviewed by an administrator.</p>
        <div>
          <label for="headline" class="block text-sm font-medium text-gray-700">Headline</label>
          <input v-model="headline" id="headline" type="text" required class="w-full mt-1 input-field" placeholder="e.g., Certified IELTS Expert with 5+ years of experience" />
        </div>
        <div>
          <label for="bio" class="block text-sm font-medium text-gray-700">About Me (Bio)</label>
          <textarea v-model="bio" id="bio" rows="6" required class="w-full mt-1 input-field" placeholder="Tell students about your teaching style, experience, and what makes your classes great."></textarea>
        </div>
        <div>
          <button type="submit" :disabled="isSubmitting" class="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit Application</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500;
}
</style>
