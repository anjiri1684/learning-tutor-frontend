<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import api from '@/services/api';

// Paystack redirects here after hosted checkout with ?reference=...&trxref=...
const route = useRoute();
const state = ref<'verifying' | 'success' | 'error'>('verifying');
const errorText = ref('');
const purchaseType = ref<'booking' | 'bundle'>('booking');

const reference = computed(() => {
  const ref = route.query.reference || route.query.trxref;
  return typeof ref === 'string' ? ref : '';
});

const nextLink = computed(() =>
  purchaseType.value === 'bundle'
    ? { to: '/dashboard/my-bundles', label: 'Go to My Bundles' }
    : { to: '/dashboard/my-classes', label: 'Go to My Classes' },
);

const verify = async () => {
  if (!reference.value) {
    state.value = 'error';
    errorText.value = 'No payment reference was returned by Paystack.';
    return;
  }
  state.value = 'verifying';
  try {
    const res = await api.post('/payments/paystack/verify', { reference: reference.value });
    purchaseType.value = res.data.type === 'bundle' ? 'bundle' : 'booking';
    state.value = 'success';
  } catch (error: any) {
    state.value = 'error';
    errorText.value = error.response?.data?.error || 'We could not verify your payment.';
  }
};

onMounted(verify);
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] px-4 py-12">
    <div class="w-full max-w-md p-8 text-center bg-gray-900/50 border border-white/10 rounded-2xl">
      <template v-if="state === 'verifying'">
        <div class="w-12 h-12 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <h1 class="mt-6 text-2xl font-bold text-white">Confirming your payment…</h1>
        <p class="mt-2 text-gray-400">Please don't close this page.</p>
      </template>

      <template v-else-if="state === 'success'">
        <svg class="w-14 h-14 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 class="mt-4 text-2xl font-bold text-white">Payment successful</h1>
        <p class="mt-2 text-gray-400">
          {{ purchaseType === 'bundle' ? 'Your package is now active.' : 'Your class is confirmed.' }}
        </p>
        <RouterLink
          :to="nextLink.to"
          class="inline-block mt-6 px-6 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-all"
        >
          {{ nextLink.label }}
        </RouterLink>
      </template>

      <template v-else>
        <svg class="w-14 h-14 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 class="mt-4 text-2xl font-bold text-white">Payment not confirmed</h1>
        <p class="mt-2 text-red-300">{{ errorText }}</p>
        <p v-if="reference" class="mt-3 text-xs text-gray-500 font-mono break-all">Reference: {{ reference }}</p>
        <div class="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-center">
          <button
            v-if="reference"
            @click="verify"
            class="px-6 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-all"
          >
            Try again
          </button>
          <RouterLink
            to="/dashboard"
            class="px-6 py-3 font-bold text-gray-300 border border-white/10 rounded-lg hover:bg-gray-800 transition-all"
          >
            Back to dashboard
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>
