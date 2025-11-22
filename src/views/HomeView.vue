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
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Hello, {{ authStore.user?.full_name }}!</h1>
      <p class="text-gray-500 mt-1">Welcome back, let's continue your learning journey.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div class="bg-indigo-100 p-3 rounded-full">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-500 text-sm">XP Earned</h3>
          <p class="text-2xl font-bold text-gray-800">{{ dashboardStore.stats.xp }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div class="bg-green-100 p-3 rounded-full">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.373 2.986M23 12l-5.373 2.986"></path></svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-500 text-sm">Classes Completed</h3>
          <p class="text-2xl font-bold text-gray-800">{{ dashboardStore.stats.completedClasses }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div class="bg-blue-100 p-3 rounded-full">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-500 text-sm">Bundle Credits</h3>
          <p class="text-2xl font-bold text-gray-800">{{ dashboardStore.stats.remainingBundleClasses }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Your Next Class</h2>
        <div v-if="dashboardStore.nextClass" class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p class="font-bold text-lg text-indigo-700">{{ dashboardStore.nextClass.availability_slot.language.name }}</p>
            <p class="text-gray-600">with {{ dashboardStore.nextClass.teacher.user.full_name }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(dashboardStore.nextClass.availability_slot.start_time) }}</p>
          </div>
          <div class="mt-4 sm:mt-0">
            <a v-if="dashboardStore.nextClass.meeting_link" :href="dashboardStore.nextClass.meeting_link" target="_blank" class="px-6 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">
              Join Class
            </a>
            <span v-else class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-200 rounded-md">Link Pending</span>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500">You have no upcoming classes.</p>
          <RouterLink to="/dashboard/find-teachers" class="inline-block mt-4 px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Book a Class
          </RouterLink>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div class="space-y-3">
          <RouterLink to="/dashboard/my-classes" class="block w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 font-medium text-gray-700">View All My Classes</RouterLink>
          <RouterLink to="/dashboard/my-bundles" class="block w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 font-medium text-gray-700">Check My Bundles</RouterLink>
          <RouterLink to="/dashboard/profile" class="block w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 font-medium text-gray-700">Update My Profile</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
