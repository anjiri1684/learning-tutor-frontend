<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.fetchDashboardData();
  if (authStore.user) {
    dashboardStore.stats.xp = authStore.user.xp || 0;
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="mb-10">
        <h1 class="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
           Hello, <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{{ authStore.user?.full_name?.split(' ')[0] || 'Learner' }}</span>!
        </h1>
        <p class="text-gray-400 mt-2 text-lg">Welcome back, let's continue your learning journey.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <div class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300 flex items-center space-x-5 group">
          <div class="bg-purple-900/30 p-4 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
            <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">XP Earned</h3>
            <p class="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{{ dashboardStore.stats.xp }}</p>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-green-500/30 transition-all duration-300 flex items-center space-x-5 group">
          <div class="bg-green-900/30 p-4 rounded-xl border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Classes Completed</h3>
            <p class="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">{{ dashboardStore.stats.completedClasses }}</p>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-blue-500/30 transition-all duration-300 flex items-center space-x-5 group">
          <div class="bg-blue-900/30 p-4 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Bundle Credits</h3>
            <p class="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">{{ dashboardStore.stats.remainingBundleClasses }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl shadow-purple-900/10">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             Your Next Class
          </h2>

          <div v-if="dashboardStore.nextClass" class="bg-black/40 rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div class="flex items-start gap-4">
               <div class="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-700">
                  {{ dashboardStore.nextClass.availability_slot.language.name.substring(0,2).toUpperCase() }}
               </div>
               <div>
                  <p class="font-bold text-xl text-white">{{ dashboardStore.nextClass.availability_slot.language.name }}</p>
                  <p class="text-gray-400">with <span class="text-purple-400">{{ dashboardStore.nextClass.teacher.user.full_name }}</span></p>
                  <p class="text-sm text-gray-500 mt-2 flex items-center gap-1">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     {{ formatDate(dashboardStore.nextClass.availability_slot.start_time) }}
                  </p>
               </div>
            </div>

            <div>
              <a
                v-if="dashboardStore.nextClass.meeting_link"
                :href="dashboardStore.nextClass.meeting_link"
                target="_blank"
                class="inline-flex items-center justify-center px-6 py-3 font-bold text-white bg-green-600 rounded-lg shadow-lg shadow-green-500/20 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Join Class
              </a>
              <span
                v-else
                class="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-400 bg-gray-800 rounded-lg border border-gray-700 w-full sm:w-auto cursor-not-allowed"
              >
                Link Pending
              </span>
            </div>
          </div>

          <div v-else class="text-center py-10 bg-black/20 rounded-xl border border-white/5 border-dashed">
             <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             </div>
            <p class="text-gray-400 text-lg">You have no upcoming classes.</p>
            <p class="text-gray-500 text-sm mb-6">Ready to learn something new?</p>
            <RouterLink
              to="/dashboard/find-teachers"
              class="inline-flex items-center gap-2 px-8 py-3 font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
            >
              Book a Class
            </RouterLink>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl shadow-purple-900/10">
          <h2 class="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div class="space-y-3">
            <RouterLink
              to="/dashboard/my-classes"
              class="flex items-center justify-between w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-purple-500/50 group transition-all"
            >
               <span class="font-medium text-gray-300 group-hover:text-white">View All My Classes</span>
               <svg class="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </RouterLink>

            <RouterLink
              to="/dashboard/my-bundles"
              class="flex items-center justify-between w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-purple-500/50 group transition-all"
            >
               <span class="font-medium text-gray-300 group-hover:text-white">Check My Bundles</span>
               <svg class="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </RouterLink>

            <RouterLink
              to="/dashboard/profile"
              class="flex items-center justify-between w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-purple-500/50 group transition-all"
            >
               <span class="font-medium text-gray-300 group-hover:text-white">Update My Profile</span>
               <svg class="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
