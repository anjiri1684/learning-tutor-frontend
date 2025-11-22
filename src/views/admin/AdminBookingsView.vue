<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

const bookings = ref<any[]>([]);
const isLoading = ref(true);
const filterStatus = ref('');
const showLinkModal = ref(false);
const selectedBooking = ref<any>(null);
const meetingLink = ref('');
const currentPage = ref(1);
const lastPage = ref(1);
const totalBookings = ref(0);

const fetchBookings = async (page: number = 1) => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (filterStatus.value) {
      params.append('status', filterStatus.value);
    }
    params.append('page', page.toString());
    const response = await api.get(`/admin/bookings?${params.toString()}`);
    bookings.value = response.data.data;
    currentPage.value = response.data.meta.page;
    lastPage.value = response.data.meta.last_page;
    totalBookings.value = response.data.meta.total;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchBookings(currentPage.value));
watch(filterStatus, () => fetchBookings(1));

const openLinkModal = (booking: any) => {
  selectedBooking.value = booking;
  meetingLink.value = '';
  showLinkModal.value = true;
};

const handleAddLink = async () => {
  if (!selectedBooking.value || !meetingLink.value) return;
  try {
    await api.post(`/admin/bookings/${selectedBooking.value.ID}/add-link`, {
      meeting_link: meetingLink.value,
    });
    showLinkModal.value = false;
    await fetchBookings(currentPage.value);
  } catch (error) {
    console.error('Failed to add link:', error);
    alert('Failed to add link.');
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

const changePage = (page: number) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchBookings(page);
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Booking Management</h1>

    <div class="mb-4">
      <label for="status-filter" class="mr-2">Filter by status:</label>
      <select v-model="filterStatus" id="status-filter" class="p-2 border rounded-md">
        <option value="">All</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending_payment">Pending Payment</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div v-if="isLoading" class="text-gray-600">Loading bookings...</div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-50">
            <th class="p-3">Student</th>
            <th>Teacher</th>
            <th>Date</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.ID" class="border-b">
            <td class="p-3">{{ booking.Student?.full_name }}</td>
            <td>{{ booking.Teacher?.full_name }}</td>
            <td>{{ formatDate(booking.CreatedAt) }}</td>
            <td>${{ booking.Price.toFixed(2) }}</td>
            <td class="capitalize">{{ booking.Status }}</td>
            <td>
              <button
                v-if="booking.Status === 'confirmed' && !booking.MeetingLink"
                @click="openLinkModal(booking)"
                class="text-indigo-600 hover:underline"
              >
                Add Link
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="mt-4 flex justify-between items-center">
        <p class="text-gray-600">Total Bookings: {{ totalBookings }}</p>
        <div class="flex space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-4 py-2">Page {{ currentPage }} of {{ lastPage }}</span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === lastPage"
            class="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <div v-if="showLinkModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Add Meeting Link</h3>
        <form @submit.prevent="handleAddLink">
          <label>Google Meet URL</label>
          <input type="url" v-model="meetingLink" required class="w-full mt-1 border rounded p-2" />
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showLinkModal = false" class="px-4 py-2 bg-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md">Save Link</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
