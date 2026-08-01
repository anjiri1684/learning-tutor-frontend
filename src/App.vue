<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCurrencyStore } from './stores/currency';

const authStore = useAuthStore();
const currencyStore = useCurrencyStore(); 

onMounted(() => {
  currencyStore.fetchRate();
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<template>
  <div
    v-if="authStore.isImpersonating"
    class="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-black text-sm font-semibold py-2 px-4 flex items-center justify-center gap-3 shadow-lg"
  >
    <span>You're viewing as {{ authStore.user?.full_name }} ({{ authStore.user?.role }})</span>
    <button
      @click="authStore.stopImpersonation"
      class="px-3 py-1 bg-black text-yellow-400 rounded-lg font-bold hover:bg-gray-900 transition-colors"
    >
      Return to Admin
    </button>
  </div>
  <div :class="authStore.isImpersonating ? 'pt-9' : ''">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
