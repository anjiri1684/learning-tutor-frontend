<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const newPassword = ref('');
const isLoading = ref(false);
const message = ref('');
const isSuccess = ref(false);
const token = ref('');

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  token.value = route.query.token as string;
  if (!token.value) {
    message.value = 'Invalid or missing reset token.';
  }
});

const handleReset = async () => {
  isLoading.value = true;
  message.value = '';
  const result = await authStore.handleResetPassword({
    token: token.value,
    new_password: newPassword.value,
  });

  isLoading.value = false;
  message.value = result.message;
  isSuccess.value = result.success;

  if (result.success) {
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center text-gray-800">Reset Your Password</h1>

      <div v-if="message" :class="['p-3 text-sm rounded-md', isSuccess ? 'text-green-700 bg-green-100 border-green-400' : 'text-red-700 bg-red-100 border-red-400']">
        {{ message }}
        <p v-if="isSuccess" class="mt-2">Redirecting to login...</p>
      </div>

      <form v-else @submit.prevent="handleReset" class="space-y-6">
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
          <input
            v-model="newPassword"
            id="newPassword"
            type="password"
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
            <span v-if="isLoading">Resetting...</span>
            <span v-else>Reset Password</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
