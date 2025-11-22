<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const email = ref('');
const isLoading = ref(false);
const message = ref('');
const authStore = useAuthStore();

const handleRequest = async () => {
  isLoading.value = true;
  message.value = '';
  await authStore.handleForgotPassword(email.value);
  isLoading.value = false;
  message.value = 'If an account with that email exists, a password reset link has been sent.';
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center text-gray-800">Forgot Password</h1>

      <div v-if="message" class="p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
        {{ message }}
      </div>

      <form v-else @submit.prevent="handleRequest" class="space-y-6">
        <p class="text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            <span v-if="isLoading">Sending...</span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>
      </form>
      <div class="text-sm text-center">
        <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Back to Login
        </RouterLink>
      </div>
    </div>
  </div>
</template>
