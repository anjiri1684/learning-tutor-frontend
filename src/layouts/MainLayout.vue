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

// Helper to get initials
const getUserInitials = () => {
  const name = authStore.user?.full_name || 'User';
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<template>
  <div class="flex h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white overflow-hidden">

    <aside class="hidden md:flex w-72 bg-gray-900 border-r border-white/10 flex-col z-20 relative shadow-2xl shadow-black">
      <div class="p-6 border-b border-white/5 flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30 text-xs">
          PYH
        </div>
        <h1 class="text-xl font-bold tracking-tight text-white">LanguageTutor</h1>
      </div>

      <div class="p-6 border-b border-white/5 bg-white/[0.02]">
         <div class="flex flex-col items-center gap-3">
            <div class="relative group">
               <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
               <img
                  v-if="authStore.user?.profile_picture_url"
                  :src="authStore.user.profile_picture_url"
                  class="relative w-16 h-16 rounded-full object-cover border-2 border-gray-900"
                  alt="Profile"
               />
               <div
                  v-else
                  class="relative w-16 h-16 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-xl font-bold text-white"
               >
                  {{ getUserInitials() }}
               </div>
            </div>
            <div class="text-center">
               <p class="font-semibold text-white">{{ authStore.user?.full_name }}</p>
               <p class="text-xs text-purple-400 font-medium capitalize tracking-wide">{{ authStore.user?.role }}</p>
            </div>
         </div>
      </div>

      <nav class="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
          active-class="bg-purple-900/20 text-purple-300 shadow-[inset_3px_0_0_0_#a855f7] pl-5"
          :class="$route.path !== link.path ? 'text-gray-400 hover:text-white hover:bg-white/5' : ''"
        >
          {{ link.name }}
          <span v-if="$route.path === link.path" class="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/10 bg-gray-900 space-y-2">
        <RouterLink
          to="/apply-to-teach"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-green-400 border border-green-500/10 hover:bg-green-950/30 hover:border-green-500/30 transition-all duration-300"
        >
           Become a Teacher
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-500/10 hover:bg-red-950/30 hover:border-red-500/30 transition-all duration-300"
        >
          Log Out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden bg-black relative">
      <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
         <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <header class="md:hidden bg-gray-900/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center z-30">
        <div class="flex items-center gap-2">
           <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">PYH</div>
           <h1 class="text-lg font-bold text-white">LanguageTutor</h1>
        </div>
        <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/5">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 relative z-10 scroll-smooth custom-scrollbar">
        <router-view />
      </main>
    </div>

    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" @click="isMobileMenuOpen = false"></div>

    <div :class="['fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col', isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <h1 class="text-xl font-bold text-white">Menu</h1>
        <button @click="isMobileMenuOpen = false" class="text-gray-400 hover:text-white">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-6 border-b border-white/5 bg-white/[0.02]">
         <div class="flex items-center gap-3">
            <img
               v-if="authStore.user?.profile_picture_url"
               :src="authStore.user.profile_picture_url"
               class="w-12 h-12 rounded-full border border-gray-700"
               alt="Profile"
            />
            <div
               v-else
               class="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-white"
            >
               {{ getUserInitials() }}
            </div>
            <div>
               <p class="font-semibold text-white text-sm">{{ authStore.user?.full_name }}</p>
               <p class="text-xs text-purple-400 capitalize">{{ authStore.user?.role }}</p>
            </div>
         </div>
      </div>

      <nav class="flex-grow p-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          @click="isMobileMenuOpen = false"
          class="flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all"
          active-class="bg-purple-900/20 text-purple-300 border-l-2 border-purple-500"
          :class="$route.path !== link.path ? 'text-gray-400 hover:text-white hover:bg-white/5' : ''"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/10 space-y-2">
        <RouterLink
          to="/apply-to-teach"
          @click="isMobileMenuOpen = false"
          class="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-green-400 border border-green-500/10 hover:bg-green-950/30"
        >
          Become a Teacher
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-red-400 border border-red-500/10 hover:bg-red-950/30"
        >
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
