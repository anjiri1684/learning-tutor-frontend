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

// Helper to get initials
const getUserInitials = () => {
  const name = authStore.user?.full_name || 'Admin User';
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<template>
  <div class="flex h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white overflow-hidden">

    <aside class="hidden md:flex w-72 bg-gray-900 border-r border-white/10 flex-col z-20 relative shadow-2xl shadow-black">

      <div class="p-6 border-b border-white/5 flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30 text-xs">
          PHY
        </div>
        <h1 class="text-xl font-bold tracking-tight text-white">Admin Portal</h1>
      </div>

      <div class="p-6 border-b border-white/5 bg-white/[0.02]">
        <div class="flex items-center gap-4">
           <div class="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-[2px] shadow-md shadow-purple-500/20">
              <div class="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                 {{ getUserInitials() }}
              </div>
           </div>
           <div class="overflow-hidden">
              <p class="font-semibold text-sm truncate text-white">{{ authStore.user?.full_name }}</p>
              <p class="text-xs text-purple-400 font-medium capitalize tracking-wide">{{ authStore.user?.role }}</p>
           </div>
        </div>
      </div>

      <nav class="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <RouterLink v-for="link in navLinks" :key="link.name" :to="link.path"
          class="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group"
          active-class="bg-purple-900/20 text-purple-300 shadow-[inset_3px_0_0_0_#a855f7] pl-5"
          :class="$route.path !== link.path ? 'text-gray-400 hover:text-white hover:bg-white/5' : ''"
        >
          {{ link.name }}
          <span v-if="$route.path === link.path" class="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/10 bg-gray-900">
        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-500/10 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-300 transition-all duration-300 group">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Log Out
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col relative overflow-hidden bg-black">

        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
           <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 relative z-10 scroll-smooth">
            <router-view />
        </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for the dark theme */
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
