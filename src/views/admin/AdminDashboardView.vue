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
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

    <div v-if="isLoading">Loading dashboard data...</div>
    <div v-else-if="dashboardData">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Total Revenue</h3>
          <p class="text-3xl font-bold text-green-600">${{ dashboardData.total_revenue.toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Total Students</h3>
          <p class="text-3xl font-bold text-blue-600">{{ dashboardData.total_students }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Active Teachers</h3>
          <p class="text-3xl font-bold text-teal-600">{{ dashboardData.total_active_teachers }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="font-semibold text-gray-500">Bookings (Last 30 Days)</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ dashboardData.bookings_last_30_days }}</p>
        </div>
      </div>

      <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Recent Bookings</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50">
                <th class="p-3">Student</th>
                <th>Teacher</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in dashboardData.recent_bookings" :key="booking.ID" class="border-b">
                <td class="p-3">{{ booking.Student.full_name }}</td>
                <td>{{ booking.Teacher.full_name }}</td>
                <td>{{ formatDate(booking.CreatedAt) }}</td>
                <td>${{ booking.Price.toFixed(2) }}</td>
                <td class="capitalize">{{ booking.Status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
