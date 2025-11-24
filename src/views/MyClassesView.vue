<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

interface Booking {
  ID: string;
  status: string;
  meeting_link?: string;
  teacher: { user: { full_name: string; } };
  availability_slot: { start_time: string; end_time: string; language: { name: string; } };
}
interface Resource {
  id: string;
  file_name: string;
  file_url: string;
}

const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const actionMessage = ref({ type: '', text: '' });

const showReviewModal = ref(false);
const showRefundModal = ref(false);
const showRescheduleModal = ref(false);
const showResourcesModal = ref(false);
const isLoadingResources = ref(false);
const selectedBooking = ref<Booking | null>(null);
const selectedBookingResources = ref<Resource[]>([]);

const reviewData = ref({ rating: 5, comment: '' });
const refundReason = ref('');
const rescheduleData = ref({ new_start_time: '', new_end_time: '' });

onMounted(async () => { await fetchBookings(); });

const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/bookings/me');
    bookings.value = response.data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  } finally {
    isLoading.value = false;
  }
};

const toDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const upcomingClasses = computed(() =>
  bookings.value.filter(b => b.availability_slot && new Date(b.availability_slot.start_time) >= new Date() && (b.status === 'confirmed' || b.status === 'reschedule_requested'))
);
const pastClasses = computed(() =>
  bookings.value.filter(b => b.availability_slot && (new Date(b.availability_slot.start_time) < new Date() || ['completed', 'cancelled', 'unattended'].includes(b.status)))
);

const openReviewModal = (booking: Booking) => {
  selectedBooking.value = booking;
  reviewData.value = { rating: 5, comment: '' };
  showReviewModal.value = true;
};

const openRefundModal = (booking: Booking) => {
  selectedBooking.value = booking;
  refundReason.value = '';
  showRefundModal.value = true;
};

const openResourcesModal = async (booking: Booking) => {
  selectedBooking.value = booking;
  showResourcesModal.value = true;
  isLoadingResources.value = true;
  try {
    const response = await api.get(`/bookings/${booking.ID}/resources`);
    selectedBookingResources.value = response.data;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    selectedBookingResources.value = [];
  } finally {
    isLoadingResources.value = false;
  }
};

const submitReview = async () => {
  if (!selectedBooking.value) return;
  await api.post(`/bookings/${selectedBooking.value.ID}/review`, reviewData.value);
  showReviewModal.value = false;
  actionMessage.value = { type: 'success', text: 'Thank you for your review!' };
  setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
  await fetchBookings();
};

const submitRefundRequest = async () => {
  if (!selectedBooking.value) return;
  await api.post(`/bookings/${selectedBooking.value.ID}/request-refund`, { reason: refundReason.value });
  showRefundModal.value = false;
  actionMessage.value = { type: 'success', text: 'Your refund request has been submitted.' };
  setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
  await fetchBookings();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
};

const openRescheduleModal = (booking: Booking) => {
  if (!booking.availability_slot) return;
  selectedBooking.value = booking;
  const originalDate = new Date(booking.availability_slot.start_time);
  originalDate.setDate(originalDate.getDate() + 1);
  rescheduleData.value.new_start_time = toDateTimeLocal(originalDate.toISOString());
  rescheduleData.value.new_end_time = toDateTimeLocal(new Date(originalDate.getTime() + 60 * 60 * 1000).toISOString());
  showRescheduleModal.value = true;
};

const submitRescheduleRequest = async () => {
  if (!selectedBooking.value) return;

  const startTime = new Date(rescheduleData.value.new_start_time).toISOString();
  const endTime = new Date(rescheduleData.value.new_end_time).toISOString();

  await api.post(`/bookings/${selectedBooking.value.ID}/request-reschedule`, {
    new_start_time: startTime,
    new_end_time: endTime,
  });

  showRescheduleModal.value = false;
  actionMessage.value = { type: 'success', text: 'Your reschedule request has been sent to the teacher.' };
  setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
  await fetchBookings();
};
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Classes</h1>

    <div v-if="actionMessage.text" :class="['mb-4 p-3 text-sm rounded-md', actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
      {{ actionMessage.text }}
    </div>

    <div v-if="isLoading">Loading classes...</div>
    <div v-else>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Upcoming</h2>
      <div v-if="upcomingClasses.length > 0" class="space-y-4">
        <div v-for="booking in upcomingClasses" :key="booking.ID" class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p class="font-bold text-lg">{{ booking.availability_slot?.language.name }}</p>
              <p class="text-gray-600">with {{ booking.teacher.user.full_name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ booking.availability_slot?.start_time ? formatDate(booking.availability_slot.start_time) : 'N/A' }}</p>
            </div>
            <div class="flex items-center space-x-2 mt-4 sm:mt-0 flex-wrap gap-2">
              <button @click="openResourcesModal(booking)" class="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Resources</button>
              <a v-if="booking.meeting_link" :href="booking.meeting_link" target="_blank" class="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">Join Class</a>
              <span v-else class="px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-md">Link Pending</span>
              <button @click="openRescheduleModal(booking)" class="px-3 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600">Reschedule</button>
              <button @click="openRefundModal(booking)" class="px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600">Refund</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 mb-8">You have no upcoming classes.</p>

      <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Past</h2>
      <div v-if="pastClasses.length > 0" class="space-y-4">
        <div v-for="booking in pastClasses" :key="booking.ID" class="bg-white p-4 rounded-lg shadow-md opacity-80">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p class="font-bold">{{ booking.availability_slot?.language.name }}</p>
              <p class="text-gray-600">with {{ booking.teacher.user.full_name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ booking.availability_slot?.start_time ? formatDate(booking.availability_slot.start_time) : 'N/A' }} - <span class="font-semibold capitalize">{{ booking.status }}</span></p>
            </div>
            <div class="flex items-center space-x-2 mt-4 sm:mt-0">
              <button @click="openResourcesModal(booking)" class="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Resources</button>
              <button v-if="booking.status === 'completed'" @click="openReviewModal(booking)" class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">Leave a Review</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">You have no past classes.</p>
    </div>

    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold">Leave a Review</h3>
        <div class="mt-4"><label class="block text-sm font-medium">Rating (1-5)</label><input type="number" min="1" max="5" v-model="reviewData.rating" class="w-full mt-1 border rounded p-2" /></div>
        <div class="mt-4"><label class="block text-sm font-medium">Comment</label><textarea v-model="reviewData.comment" rows="4" class="w-full mt-1 border rounded p-2"></textarea></div>
        <div class="mt-6 flex justify-end space-x-4"><button @click="showReviewModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button><button @click="submitReview" class="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button></div>
      </div>
    </div>
    <div v-if="showRefundModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold">Request a Refund</h3>
        <div class="mt-4"><label class="block text-sm font-medium">Reason for Refund Request</label><textarea v-model="refundReason" rows="4" class="w-full mt-1 border rounded p-2"></textarea></div>
        <div class="mt-6 flex justify-end space-x-4"><button @click="showRefundModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button><button @click="submitRefundRequest" class="px-4 py-2 bg-red-600 text-white rounded">Submit Request</button></div>
      </div>
    </div>
    <div v-if="showRescheduleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold">Request to Reschedule</h3>
        <p class="text-sm text-gray-600 mt-2">Propose a new time for your class. This will be sent to the teacher for approval.</p>
        <div class="mt-4">
          <label class="block text-sm font-medium">New Start Time</label>
          <input type="datetime-local" v-model="rescheduleData.new_start_time" class="w-full mt-1 border rounded p-2" />
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium">New End Time</label>
          <input type="datetime-local" v-model="rescheduleData.new_end_time" class="w-full mt-1 border rounded p-2" />
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button @click="showRescheduleModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button @click="submitRescheduleRequest" class="px-4 py-2 bg-indigo-600 text-white rounded">Send Request</button>
        </div>
      </div>
    </div>
    <div v-if="showResourcesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold">Class Resources</h3>
        <div v-if="isLoadingResources" class="mt-4 text-center">Loading...</div>
        <div v-else-if="selectedBookingResources.length > 0" class="mt-4 space-y-2">
          <a v-for="resource in selectedBookingResources" :key="resource.id" :href="resource.file_url" target="_blank" download class="block p-3 bg-gray-100 rounded-md hover:bg-gray-200 text-blue-600 font-semibold">{{ resource.file_name }}</a>
        </div>
        <div v-else class="mt-4 text-gray-500">No resources have been uploaded for this class.</div>
        <div class="mt-6 text-right"><button @click="showResourcesModal = false" class="px-4 py-2 bg-gray-200 rounded">Close</button></div>
      </div>
    </div>
  </div>
</template>
