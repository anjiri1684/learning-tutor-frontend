<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { RouterLink, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Find a Teacher', path: '/dashboard/find-teachers' },
  { name: 'My Classes', path: '/dashboard/my-classes' },
  { name: 'Purchase a Bundle', path: '/dashboard/bundles' },
  { name: 'My Bundles', path: '/dashboard/my-bundles' },
  { name: 'My Badges', path: '/dashboard/my-badges' },
  { name: 'My Progress', path: '/dashboard/my-progress' },
  // { name: 'My Messages', path: '/dashboard/my-messages' },
  { name: 'Exams', path: '/dashboard/exams' },
  { name: 'My Certificates', path: '/dashboard/my-certificates' },
  { name: 'My Profile', path: '/dashboard/profile' },
];
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="hidden md:flex w-64 bg-white shadow-md flex-col">
      <div class="p-6 border-b">
        <h1 class="text-2xl font-bold text-indigo-600">LanguageTutor</h1>
      </div>
      <div class="p-4 border-b">
        <img :src="authStore.user?.profile_picture_url || 'https://via.placeholder.com/150'" class="w-16 h-16 rounded-full mx-auto" alt="Profile Picture" />
        <p class="text-center font-semibold mt-2">{{ authStore.user?.full_name }}</p>
        <p class="text-center text-sm text-gray-500 capitalize">{{ authStore.user?.role }}</p>
      </div>
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          class="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-100 hover:text-indigo-700"
          active-class="bg-indigo-100 text-indigo-700 font-bold"
        >
          {{ link.name }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t">
        <RouterLink to="/apply-to-teach" class="w-full flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-green-100 hover:text-green-700 font-semibold">
          Become a Teacher
        </RouterLink>
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 mt-2 text-gray-700 rounded-md hover:bg-red-100 hover:text-red-700">
          Log Out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-indigo-600">LanguageTutor</h1>
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-700 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-8">
        <router-view />
      </main>
    </div>

    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" @click="isMobileMenuOpen = false"></div>
    <div :class="['fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300 ease-in-out md:hidden', isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-6 border-b">
        <h1 class="text-2xl font-bold text-indigo-600">LanguageTutor</h1>
      </div>
      <div class="p-4 border-b">
        <img :src="authStore.user?.profile_picture_url || 'https://via.placeholder.com/150'" class="w-16 h-16 rounded-full mx-auto" alt="Profile Picture" />
        <p class="text-center font-semibold mt-2">{{ authStore.user?.full_name }}</p>
        <p class="text-center text-sm text-gray-500 capitalize">{{ authStore.user?.role }}</p>
      </div>
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-indigo-100 hover:text-indigo-700"
          active-class="bg-indigo-100 text-indigo-700 font-bold"
        >
          {{ link.name }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t">
        <RouterLink to="/apply-to-teach" @click="isMobileMenuOpen = false" class="w-full flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-green-100 hover:text-green-700 font-semibold">
          Become a Teacher
        </RouterLink>
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 mt-2 text-gray-700 rounded-md hover:bg-red-100 hover:text-red-700">
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>
