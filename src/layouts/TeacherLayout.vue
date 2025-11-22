<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const handleLogout = () => {
  authStore.logout();
};

const navLinks = [
  { name: 'My Classes', path: '/teacher/classes' },
  { name: 'My Availability', path: '/teacher/availability' },
  { name: 'Reschedule Requests', path: '/teacher/reschedules' },
  { name: 'My Earnings', path: '/teacher/earnings' },
  { name: 'My Analytics', path: '/teacher/analytics' },
  { name: 'My Reviews', path: '/teacher/reviews' },
  // { name: 'My Messages', path: '/teacher/messages' },
  { name: 'My Profile', path: '/teacher/profile' },
];
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="hidden md:flex w-64 bg-white shadow-md flex-col">
      <div class="p-6 border-b">
        <h1 class="text-2xl font-bold text-teal-600">Teacher Portal</h1>
      </div>
      <div class="p-4 border-b">
        <p class="text-center font-semibold mt-2">{{ authStore.user?.full_name }}</p>
        <p class="text-center text-sm text-gray-500 capitalize">{{ authStore.user?.role }}</p>
      </div>
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <RouterLink v-for="link in navLinks" :key="link.name" :to="link.path"
          class="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-teal-100 hover:text-teal-700"
          active-class="bg-teal-100 text-teal-700 font-bold">
          {{ link.name }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t">
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-red-100 hover:text-red-700">
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
