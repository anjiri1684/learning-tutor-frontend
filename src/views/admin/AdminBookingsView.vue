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

// Helper for status colors
const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'pending_payment': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Booking Management</h1>

        <div class="flex items-center bg-gray-900 p-1 rounded-lg border border-gray-700">
          <label for="status-filter" class="px-3 text-sm text-gray-400">Filter:</label>
          <select
            v-model="filterStatus"
            id="status-filter"
            class="bg-gray-800 text-white text-sm rounded-md border-0 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading bookings...</span>
         </div>
      </div>

      <div v-else class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Student</th>
                <th class="p-4 font-semibold">Teacher</th>
                <th class="p-4 font-semibold">Date</th>
                <th class="p-4 font-semibold">Price</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="booking in bookings" :key="booking.ID" class="hover:bg-white/5 transition-colors">
                <td class="p-4 font-medium text-white">{{ booking.Student?.full_name }}</td>
                <td class="p-4 text-gray-300">{{ booking.Teacher?.full_name }}</td>
                <td class="p-4 text-gray-400 text-sm">{{ formatDate(booking.CreatedAt) }}</td>
                <td class="p-4 font-medium text-white">${{ booking.Price.toFixed(2) }}</td>
                <td class="p-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium border capitalize"
                    :class="getStatusClass(booking.Status)"
                  >
                    {{ booking.Status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="p-4">
                  <button
                    v-if="booking.Status === 'confirmed' && !booking.MeetingLink"
                    @click="openLinkModal(booking)"
                    class="text-xs font-semibold text-purple-400 hover:text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    + Add Link
                  </button>
                  <a
                    v-else-if="booking.MeetingLink"
                    :href="booking.MeetingLink"
                    target="_blank"
                    class="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Join
                  </a>
                </td>
              </tr>
              <tr v-if="bookings.length === 0">
                 <td colspan="6" class="p-8 text-center text-gray-500">No bookings found matching criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-gray-800 bg-gray-900/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-gray-400">Total: <span class="text-white font-medium">{{ totalBookings }}</span> results</p>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 px-2">Page <span class="text-white">{{ currentPage }}</span> of {{ lastPage }}</span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === lastPage"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLinkModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-1">Add Meeting Link</h3>
          <p class="text-sm text-gray-400 mb-6">Paste the video conference URL for this session.</p>

          <form @submit.prevent="handleAddLink">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-300 mb-2">Google Meet / Zoom URL</label>
              <input
                type="url"
                v-model="meetingLink"
                required
                placeholder="https://meet.google.com/..."
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showLinkModal = false"
                class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
              >
                Save Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
