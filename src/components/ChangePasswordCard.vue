<script setup lang="ts">
import { ref } from 'vue';
import api from '@/services/api';

const form = ref({ current_password: '', new_password: '', confirm_password: '' });
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });

const handleChangePassword = async () => {
  message.value = { type: '', text: '' };

  if (form.value.new_password !== form.value.confirm_password) {
    message.value = { type: 'error', text: 'New passwords do not match.' };
    return;
  }

  isSubmitting.value = true;
  try {
    await api.put('/profile/me/password', {
      current_password: form.value.current_password,
      new_password: form.value.new_password,
    });
    message.value = { type: 'success', text: 'Password changed successfully.' };
    form.value = { current_password: '', new_password: '', confirm_password: '' };
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'Failed to change password.' };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10">
    <h2 class="text-xl font-bold text-white mb-6">Change Password</h2>

    <form @submit.prevent="handleChangePassword" class="space-y-6">
      <div v-if="message.text" :class="['p-4 text-sm rounded-xl flex items-center gap-3 border',
        message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'
      ]">
        {{ message.text }}
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
        <input v-model="form.current_password" type="password" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">New Password</label>
        <input v-model="form.new_password" type="password" required minlength="6" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
        <input v-model="form.confirm_password" type="password" required minlength="6" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-8 py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 transition-all disabled:opacity-50"
      >
        {{ isSubmitting ? 'Saving...' : 'Change Password' }}
      </button>
    </form>
  </div>
</template>
