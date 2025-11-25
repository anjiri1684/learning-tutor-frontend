<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const dashboardData = ref<any>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/admin/dashboard-analytics');
    dashboardData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

// UI Helper for status badges
const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'pending_payment': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'completed': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="p-6 max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Admin Dashboard</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading dashboard data...</span>
         </div>
      </div>

      <div v-else-if="dashboardData" class="space-y-8">

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div class="relative group bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg class="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 7.875c0-.202.064-.373.19-.508.13-.14.332-.23.601-.267V5.533a1.942 1.942 0 011.028.216c.365.202.61.533.684.945h1.27c-.075-.82-.47-1.464-1.125-1.854a2.534 2.534 0 01-.659-.253V2.413a.627.627 0 00-.31-.567.63.63 0 00-.638.035c-.172.108-.363.2-.567.272v-1.7a2.296 2.296 0 01.567.268c.362.242.433.468.433.707 0 .202-.064.373-.19.508-.13.14-.332.23-.601.267V3.97a1.943 1.943 0 01-1.028-.216c-.365-.202-.61-.533-.684-.945h-1.27c.075.82.47 1.464 1.125 1.854.26.155.482.24.659.253v2.244a.627.627 0 00.31.567.63.63 0 00.638-.035zM5 11h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6a1 1 0 011-1z"/></svg>
            </div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Total Revenue</h3>
            <p class="mt-2 text-3xl font-bold text-white group-hover:text-green-400 transition-colors">${{ dashboardData.total_revenue.toFixed(2) }}</p>
          </div>

          <div class="relative group bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg class="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
            </div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Total Students</h3>
            <p class="mt-2 text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">{{ dashboardData.total_students }}</p>
          </div>

          <div class="relative group bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300">
             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
             </div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Active Teachers</h3>
            <p class="mt-2 text-3xl font-bold text-white group-hover:text-teal-400 transition-colors">{{ dashboardData.total_active_teachers }}</p>
          </div>

          <div class="relative group bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300">
             <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg class="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>
             </div>
            <h3 class="font-medium text-gray-400 text-sm uppercase tracking-wide">Bookings (30 Days)</h3>
            <p class="mt-2 text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">{{ dashboardData.bookings_last_30_days }}</p>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          <div class="p-6 border-b border-gray-800">
            <h2 class="text-xl font-semibold text-white">Recent Bookings</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left whitespace-nowrap">
              <thead>
                <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider">
                  <th class="p-4 font-semibold">Student</th>
                  <th class="p-4 font-semibold">Teacher</th>
                  <th class="p-4 font-semibold">Date</th>
                  <th class="p-4 font-semibold">Price</th>
                  <th class="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr v-for="booking in dashboardData.recent_bookings" :key="booking.ID" class="hover:bg-white/5 transition-colors">
                  <td class="p-4 text-white font-medium">{{ booking.Student.full_name }}</td>
                  <td class="p-4 text-gray-300">{{ booking.Teacher.full_name }}</td>
                  <td class="p-4 text-gray-400 text-sm">{{ formatDate(booking.CreatedAt) }}</td>
                  <td class="p-4 font-medium text-white">${{ booking.Price.toFixed(2) }}</td>
                  <td class="p-4">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-medium border capitalize"
                      :class="getStatusClass(booking.Status)"
                    >
                      {{ booking.Status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!dashboardData.recent_bookings || dashboardData.recent_bookings.length === 0">
                  <td colspan="5" class="p-6 text-center text-gray-500">No recent bookings found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
