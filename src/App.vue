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
  <RouterView />
</template>

<style scoped>
</style>
