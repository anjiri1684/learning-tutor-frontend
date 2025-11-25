<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, RouterLink } from 'vue-router';

const fullName = ref('');
const email = ref('');
const password = ref('');
const referredByCode = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  const payload: any = {
    full_name: fullName.value,
    email: email.value,
    password: password.value,
  };

  if (referredByCode.value) {
    payload.referred_by_code = referredByCode.value;
  }

  const result = await authStore.register(payload);

  isLoading.value = false;

  if (result.success) {
    router.push('/');
  } else {
    errorMessage.value = result.message;
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-black relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
    </div>

    <div class="w-full max-w-md p-8 space-y-6 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/20">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-white">Create Account</h1>
        <p class="mt-2 text-sm text-gray-400">Join the community and start learning today</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">

        <div v-if="errorMessage" class="p-3 text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-lg flex items-center gap-2">
           <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {{ errorMessage }}
        </div>

        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            v-model="fullName"
            id="fullName"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-950/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
          <input
            v-model="email"
            id="email"
            type="email"
            required
            class="w-full px-4 py-3 bg-gray-950/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            class="w-full px-4 py-3 bg-gray-950/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label for="referralCode" class="block text-sm font-medium text-gray-300 mb-2">
            Referral Code <span class="text-gray-500 text-xs ml-1">(Optional)</span>
          </label>
          <input
            v-model="referredByCode"
            id="referralCode"
            type="text"
            class="w-full px-4 py-3 bg-gray-950/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
            placeholder="CODE123"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center px-4 py-3.5 text-sm font-bold text-white bg-purple-600 rounded-full shadow-lg shadow-purple-500/40 hover:bg-purple-500 hover:shadow-purple-500/60 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Creating Account...
            </span>
            <span v-else>Register</span>
          </button>
        </div>

        <div class="text-sm text-center pt-2">
          <RouterLink to="/login" class="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Already have an account? <span class="underline underline-offset-4">Log in</span>
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
