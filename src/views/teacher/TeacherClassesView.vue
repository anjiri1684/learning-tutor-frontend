<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import api from '@/services/api';

// --- Interfaces ---
interface Booking {
  ID: string;
  status: string;
  meeting_link?: string;
  student: {
    id: string; // Ensure student ID is available for the link
    full_name: string;
  };
  availability_slot: {
    start_time: string;
    end_time: string;
    language: {
      name: string;
    }
  };
}

// --- Component State ---
const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const actionMessage = ref({ type: '', text: '' });
const selectedBooking = ref<Booking | null>(null);
const router = useRouter();

// Modal and Form State
const showFeedbackModal = ref(false);
const feedbackText = ref('');
const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);

// --- Data Fetching ---
const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/teacher/bookings');
    bookings.value = response.data;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchBookings);

// --- Computed Properties ---
const upcomingClasses = computed(() => {
  if (!Array.isArray(bookings.value)) return [];
  return bookings.value.filter(b => new Date(b.availability_slot.start_time) >= new Date() && b.status === 'confirmed');
});
const pastClasses = computed(() => {
  if (!Array.isArray(bookings.value)) return [];
  return bookings.value.filter(b => new Date(b.availability_slot.start_time) < new Date() || b.status !== 'confirmed');
});

// --- Action Methods ---
const handleMarkAsComplete = async (bookingId: string) => {
  if (confirm('Are you sure you want to mark this class as complete? This will credit your earnings.')) {
    try {
      await api.post(`/teacher/bookings/${bookingId}/complete`);
      actionMessage.value = { type: 'success', text: 'Class marked as complete!' };
      await fetchBookings();
    } catch (error) {
      console.error('Failed to mark class as complete:', error);
      actionMessage.value = { type: 'error', text: 'Failed to mark class as complete.' };
    } finally {
      setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
    }
  }
};

const openFeedbackModal = (booking: Booking) => {
  selectedBooking.value = booking;
  feedbackText.value = '';
  showFeedbackModal.value = true;
};
const handleSubmitFeedback = async () => {
  if (!selectedBooking.value || !feedbackText.value) return;
  isSubmitting.value = true;
  try {
    await api.post(`/teacher/bookings/${selectedBooking.value.ID}/feedback`, { feedback: feedbackText.value });
    showFeedbackModal.value = false;
    actionMessage.value = { type: 'success', text: 'Feedback submitted successfully.' };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    actionMessage.value = { type: 'error', text: 'Failed to submit feedback.' };
  } finally {
    isSubmitting.value = false;
    setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
  }
};

const openUploadModal = (booking: Booking) => {
  selectedBooking.value = booking;
  selectedFile.value = null;
  showUploadModal.value = true;
};
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files && target.files[0] ? target.files[0] : null;
};
const handleUploadResource = async () => {
  if (!selectedFile.value || !selectedBooking.value) return;
  isSubmitting.value = true;
  const formData = new FormData();
  formData.append('resource', selectedFile.value);
  try {
    await api.post(`/teacher/bookings/${selectedBooking.value.ID}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    showUploadModal.value = false;
    actionMessage.value = { type: 'success', text: 'Resource uploaded successfully!' };
  } catch (error) {
    console.error('Failed to upload resource:', error);
    actionMessage.value = { type: 'error', text: 'Upload failed. Please try again.' };
  } finally {
    isSubmitting.value = false;
    setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
  }
};

const handleStartConversationWithStudent = async (studentId: string) => {
  try {
    await api.post('/conversations', { recipient_id: studentId });
    router.push('/teacher/messages');
  } catch (error) {
    console.error("Failed to start conversation:", error);
    alert("Could not start a conversation with this student.");
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' });
</script>

<template>
  <div>
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
              <p class="font-bold text-lg">{{ booking.availability_slot.language.name }}</p>
              <div class="flex items-center space-x-2">
                <RouterLink :to="`/teacher/student-progress/${booking.student.id}`" class="text-gray-600 hover:text-teal-600 hover:underline">
                  with {{ booking.student.full_name }}
                </RouterLink>
                <button @click="handleStartConversationWithStudent(booking.student.id)" class="text-indigo-500 hover:text-indigo-700" title="Message Student">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(booking.availability_slot.start_time) }}</p>
            </div>
            <div class="flex items-center space-x-2 mt-4 sm:mt-0">
              <button @click="openUploadModal(booking)" class="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Upload Resources</button>
              <a v-if="booking.meeting_link" :href="booking.meeting_link" target="_blank" class="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">Join Class</a>
              <span v-else class="px-4 py-2 text-sm text-gray-500 bg-gray-200 rounded-md">Link Pending</span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">You have no upcoming classes.</p>

      <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Past</h2>
      <div v-if="pastClasses.length > 0" class="space-y-4">
        <div v-for="booking in pastClasses" :key="booking.ID" class="bg-white p-4 rounded-lg shadow-md opacity-80">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p class="font-bold">{{ booking.availability_slot.language.name }}</p>
              <div class="flex items-center space-x-2">
                <RouterLink :to="`/teacher/student-progress/${booking.student.id}`" class="text-gray-600 hover:text-teal-600 hover:underline">
                  with {{ booking.student.full_name }}
                </RouterLink>
                 <button @click="handleStartConversationWithStudent(booking.student.id)" class="text-indigo-500 hover:text-indigo-700" title="Message Student">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(booking.availability_slot.start_time) }} - <span class="font-semibold capitalize">{{ booking.status }}</span></p>
            </div>
            <div class="flex items-center space-x-2 mt-4 sm:mt-0">
              <button @click="openUploadModal(booking)" class="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Upload Resources</button>
              <button v-if="booking.status === 'confirmed' && new Date(booking.availability_slot.start_time) < new Date()" @click="handleMarkAsComplete(booking.ID)" class="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">Mark as Complete</button>
              <button v-if="booking.status === 'completed'" @click="openFeedbackModal(booking)" class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600">Submit Feedback</button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500">You have no past classes.</p>
    </div>

    <div v-if="showFeedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">Submit Feedback for {{ selectedBooking!.student.full_name }}</h3>
        <form @submit.prevent="handleSubmitFeedback">
          <textarea v-model="feedbackText" rows="5" required class="w-full mt-1 border rounded p-2" placeholder="Enter feedback on the student's progress..."></textarea>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showFeedbackModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-teal-600 text-white rounded disabled:bg-teal-400">
              <span v-if="isSubmitting">Submitting...</span><span v-else>Submit Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">Upload Resources for class with {{ selectedBooking!.student.full_name }}</h3>
        <form @submit.prevent="handleUploadResource">
          <div>
            <label class="block text-sm font-medium text-gray-700">Select File</label>
            <input type="file" @change="handleFileSelect" required class="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showUploadModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-teal-600 text-white rounded disabled:bg-teal-400">
              <span v-if="isSubmitting">Uploading...</span><span v-else>Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
