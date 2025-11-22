<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const handleLogout = () => {
  authStore.logout();
};

const navLinks = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'User Management', path: '/admin/users' },
  { name: 'Teacher Applications', path: '/admin/teacher-applications' },
  { name: 'Booking Management', path: '/admin/bookings' },
  { name: 'Language Management', path: '/admin/languages' },
  { name: 'Class Bundles', path: '/admin/bundles' },
  { name: 'Exam Management', path: '/admin/exams' },
  { name: 'Payout Requests', path: '/admin/payouts' },
  { name: 'Refund Requests', path: '/admin/refunds' },
  { name: 'Payment History', path: '/admin/payments' },
  { name: 'Review Management', path: '/admin/reviews' },
  { name: 'Reports', path: '/admin/reports' },
];
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="hidden md:flex w-64 bg-gray-800 text-gray-200 flex-col">
      <div class="p-6 border-b border-gray-700">
        <h1 class="text-2xl font-bold text-white">Admin Portal</h1>
      </div>
      <div class="p-4 border-b border-gray-700">
        <p class="text-center font-semibold mt-2">{{ authStore.user?.full_name }}</p>
        <p class="text-center text-sm text-gray-400 capitalize">{{ authStore.user?.role }}</p>
      </div>
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <RouterLink v-for="link in navLinks" :key="link.name" :to="link.path"
          class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700"
          active-class="bg-gray-900 text-white font-bold">
          {{ link.name }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 rounded-md hover:bg-red-900 hover:text-white">
          Log Out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-8">
            <router-view />
        </main>
    </div>
  </div>
</template>
