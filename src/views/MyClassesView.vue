<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useAssignmentStore } from '@/stores/assignments';
import { formatInUserTimeZone, currentTimeZone } from '@/utils/datetime';

const authStore = useAuthStore();
const assignmentStore = useAssignmentStore();

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

interface WaitlistEntry {
  id: string;
  availability_slot: {
    id: string;
    start_time: string;
    end_time: string;
    teacher: { full_name: string };
    language: { name: string };
  };
}

const bookings = ref<Booking[]>([]);
const waitlistEntries = ref<WaitlistEntry[]>([]);
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

const showAssignmentsModal = ref(false);
const assignments = ref<any[]>([]);
const isLoadingAssignments = ref(false);
const submittingAssignmentId = ref<string | null>(null);
const submissionForm = ref({ submission_text: '', submission_link: '' });
const submissionFile = ref<File | null>(null);
const isSubmittingAssignment = ref(false);
const submissionViewerUrl = ref<string | null>(null);

onMounted(async () => {
  await fetchBookings();
  await fetchWaitlist();
});

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

const fetchWaitlist = async () => {
  try {
    const response = await api.get('/waitlist/me');
    waitlistEntries.value = response.data;
  } catch (error) {
    console.error('Failed to fetch waitlist:', error);
  }
};

const handleLeaveWaitlist = async (entry: WaitlistEntry) => {
  try {
    await api.delete(`/availability/${entry.availability_slot.id}/waitlist`);
    waitlistEntries.value = waitlistEntries.value.filter((e) => e.id !== entry.id);
  } catch (error) {
    console.error('Failed to leave waitlist:', error);
  }
};

const handleReportNoShow = async (booking: Booking) => {
  const reason = prompt('Briefly describe what happened (this will be sent to an admin for review):');
  if (!reason || !reason.trim()) return;
  try {
    await api.post(`/bookings/${booking.ID}/report-no-show`, { reason: reason.trim() });
    actionMessage.value = { type: 'success', text: 'No-show reported. An admin will review it.' };
  } catch (error: any) {
    actionMessage.value = { type: 'error', text: error.response?.data?.error || 'Failed to report no-show.' };
  } finally {
    setTimeout(() => actionMessage.value = { type: '', text: '' }, 3000);
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

const openAssignmentsModal = async (booking: Booking) => {
  selectedBooking.value = booking;
  showAssignmentsModal.value = true;
  submittingAssignmentId.value = null;
  isLoadingAssignments.value = true;
  assignments.value = await assignmentStore.listBookingAssignments(booking.ID);
  isLoadingAssignments.value = false;
};

const openSubmitForm = (assignment: any) => {
  submittingAssignmentId.value = assignment.id;
  submissionForm.value = {
    submission_text: assignment.submission?.submission_text || '',
    submission_link: assignment.submission?.submission_link || '',
  };
  submissionFile.value = null;
};

const handleSubmissionFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  submissionFile.value = target.files && target.files[0] ? target.files[0] : null;
};

const handleSubmitAssignment = async (assignment: any) => {
  isSubmittingAssignment.value = true;
  const result = await assignmentStore.submitAssignment(assignment.id, {
    submission_text: submissionForm.value.submission_text,
    submission_link: submissionForm.value.submission_link,
    file: submissionFile.value || undefined,
  });
  isSubmittingAssignment.value = false;
  if (result.success && selectedBooking.value) {
    submittingAssignmentId.value = null;
    assignments.value = await assignmentStore.listBookingAssignments(selectedBooking.value.ID);
  } else if (!result.success) {
    alert(result.message);
  }
};

const viewSubmissionFile = async (assignment: any) => {
  try {
    submissionViewerUrl.value = await assignmentStore.viewSubmissionFileBlobUrl(assignment.id);
  } catch (error) {
    console.error('Failed to load submission file:', error);
    alert('Failed to load submission file.');
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
  return formatInUserTimeZone(dateString, authStore.user?.time_zone);
};

const displayTimeZone = computed(() => currentTimeZone(authStore.user?.time_zone));

const downloadIcsBlob = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Failed to download calendar file:', error);
  }
};

const downloadBookingCalendar = (booking: Booking) => downloadIcsBlob(`/bookings/${booking.ID}/calendar.ics`, 'class.ics');
const downloadAllCalendar = () => downloadIcsBlob('/bookings/me/calendar.ics', 'my-classes.ics');

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
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">My Classes</h1>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500">Times shown in {{ displayTimeZone }}</span>
          <button @click="downloadAllCalendar" class="px-3 py-2 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all">
            Export All to Calendar
          </button>
        </div>
      </div>

      <div v-if="actionMessage.text" :class="['mb-6 p-4 rounded-xl border flex items-center gap-3 shadow-lg animate-fade-in', actionMessage.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300']">
         <svg v-if="actionMessage.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
         <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         {{ actionMessage.text }}
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading classes...</span>
         </div>
      </div>

      <div v-else>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span> Upcoming
        </h2>

        <div v-if="upcomingClasses.length > 0" class="space-y-4 mb-10">
          <div v-for="booking in upcomingClasses" :key="booking.ID" class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300 group">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div class="flex items-start gap-4">
                 <div class="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 border border-gray-700 group-hover:border-purple-500/50 group-hover:text-white transition-colors">
                    {{ booking.availability_slot?.language.name.substring(0,2).toUpperCase() }}
                 </div>
                 <div>
                    <p class="font-bold text-lg text-white">{{ booking.availability_slot?.language.name }} Class</p>
                    <p class="text-gray-400">with <span class="text-purple-400">{{ booking.teacher.user.full_name }}</span></p>
                    <p class="text-sm text-gray-500 mt-1 flex items-center gap-1">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       {{ booking.availability_slot?.start_time ? formatDate(booking.availability_slot.start_time) : 'N/A' }}
                    </p>
                 </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <button @click="openResourcesModal(booking)" class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all">Resources</button>
                <button @click="openAssignmentsModal(booking)" class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all">Assignments</button>
                <button @click="downloadBookingCalendar(booking)" class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all">Add to Calendar</button>

                <a v-if="booking.meeting_link" :href="booking.meeting_link" target="_blank" class="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg shadow-lg shadow-green-500/20 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all">Join Class</a>
                <span v-else class="px-4 py-2 text-sm font-medium text-gray-500 bg-black/30 border border-white/5 rounded-lg cursor-not-allowed">Link Pending</span>

                <button @click="openRescheduleModal(booking)" class="px-4 py-2 text-sm font-semibold text-yellow-400 bg-yellow-900/20 border border-yellow-500/20 rounded-lg hover:bg-yellow-900/40 transition-all">Reschedule</button>
                <button @click="openRefundModal(booking)" class="px-4 py-2 text-sm font-semibold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 transition-all">Refund</button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 mb-12 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">You have no upcoming classes scheduled.</p>

        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-gray-500"></span> Past History
        </h2>

        <div v-if="pastClasses.length > 0" class="space-y-4">
          <div v-for="booking in pastClasses" :key="booking.ID" class="bg-gray-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-gray-900/60 transition-colors">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p class="font-bold text-white">{{ booking.availability_slot?.language.name }}</p>
                <p class="text-gray-400 text-sm">with {{ booking.teacher.user.full_name }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <p class="text-xs text-gray-500 font-mono">{{ booking.availability_slot?.start_time ? formatDate(booking.availability_slot.start_time) : 'N/A' }}</p>
                   <span class="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 capitalize">{{ booking.status }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button @click="openResourcesModal(booking)" class="text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline">Resources</button>
                <button @click="openAssignmentsModal(booking)" class="text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline">Assignments</button>
                <button v-if="booking.status === 'completed'" @click="openReviewModal(booking)" class="px-4 py-2 text-sm font-semibold text-blue-400 bg-blue-900/20 border border-blue-500/20 rounded-lg hover:bg-blue-900/40 transition-all">Leave Review</button>
                <button v-if="booking.status === 'completed'" @click="handleReportNoShow(booking)" class="text-sm font-medium text-gray-500 hover:text-red-400">Report No-Show</button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">You have no past class history.</p>

        <template v-if="waitlistEntries.length > 0">
          <h2 class="text-xl font-bold text-white mb-4 mt-10 flex items-center gap-2">
             <span class="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></span> Waitlisted Classes
          </h2>
          <div class="space-y-4">
            <div v-for="entry in waitlistEntries" :key="entry.id" class="bg-gray-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p class="font-bold text-white">{{ entry.availability_slot.language.name }}</p>
                <p class="text-gray-400 text-sm">with {{ entry.availability_slot.teacher.full_name }}</p>
                <p class="text-xs text-gray-500 font-mono mt-1">{{ formatDate(entry.availability_slot.start_time) }}</p>
              </div>
              <button @click="handleLeaveWaitlist(entry)" class="px-4 py-2 text-sm font-semibold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 transition-all">
                Leave Waitlist
              </button>
            </div>
          </div>
        </template>
      </div>

      <Teleport to="body">
        <div v-if="showReviewModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-4">Leave a Review</h3>
              <div class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                    <input type="number" min="1" max="5" v-model="reviewData.rating" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                    <textarea v-model="reviewData.comment" rows="4" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600" placeholder="Share your experience..."></textarea>
                 </div>
                 <div class="flex justify-end gap-3 pt-2">
                    <button @click="showReviewModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                    <button @click="submitReview" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30">Submit Review</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showRefundModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-red-900/20 w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-4">Request Refund</h3>
              <div>
                 <label class="block text-sm font-medium text-gray-300 mb-2">Reason for Request</label>
                 <textarea v-model="refundReason" rows="4" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-600" placeholder="Please explain why..."></textarea>
              </div>
              <div class="flex justify-end gap-3 pt-6">
                 <button @click="showRefundModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                 <button @click="submitRefundRequest" class="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 shadow-lg shadow-red-500/30">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showRescheduleModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-2">Request to Reschedule</h3>
              <p class="text-sm text-gray-400 mb-6">Propose a new time. This will be sent to the teacher for approval.</p>

              <div class="space-y-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">New Start Time</label>
                    <input type="datetime-local" v-model="rescheduleData.new_start_time" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]" />
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">New End Time</label>
                    <input type="datetime-local" v-model="rescheduleData.new_end_time" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]" />
                 </div>
              </div>

              <div class="flex justify-end gap-3 pt-6">
                 <button @click="showRescheduleModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                 <button @click="submitRescheduleRequest" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30">Send Request</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showResourcesModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                 <h3 class="text-xl font-bold text-white">Class Resources</h3>
                 <button @click="showResourcesModal = false" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>

              <div v-if="isLoadingResources" class="py-8 text-center">
                 <svg class="animate-spin h-8 w-8 text-purple-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 <span class="text-gray-400 text-sm">Loading files...</span>
              </div>

              <div v-else-if="selectedBookingResources.length > 0" class="space-y-2">
                 <a
                    v-for="resource in selectedBookingResources"
                    :key="resource.id"
                    :href="resource.file_url"
                    target="_blank"
                    download
                    class="flex items-center gap-3 p-3 bg-black/30 border border-white/5 rounded-xl hover:bg-purple-900/20 hover:border-purple-500/30 transition-all group"
                 >
                    <div class="bg-gray-800 p-2 rounded-lg group-hover:bg-purple-900/40 transition-colors">
                       <svg class="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span class="text-sm text-gray-300 group-hover:text-white font-medium truncate">{{ resource.file_name }}</span>
                    <svg class="w-4 h-4 text-gray-600 group-hover:text-purple-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 </a>
              </div>

              <div v-else class="py-8 text-center border border-dashed border-gray-700 rounded-xl bg-black/20">
                 <p class="text-gray-500 text-sm">No resources uploaded yet.</p>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="showAssignmentsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-4">Assignments</h3>

              <div v-if="isLoadingAssignments" class="text-center text-gray-400 py-4">Loading...</div>
              <div v-else-if="assignments.length > 0" class="space-y-3">
                <div v-for="assignment in assignments" :key="assignment.id" class="bg-gray-900/60 border border-white/10 rounded-xl p-4">
                  <div class="flex justify-between items-start gap-3">
                    <div>
                      <p class="font-bold text-white">{{ assignment.title }}</p>
                      <p class="text-sm text-gray-400 mt-1">{{ assignment.instructions }}</p>
                      <p v-if="assignment.due_date" class="text-xs text-gray-500 mt-1">Due: {{ formatDate(assignment.due_date) }}</p>
                    </div>
                    <span v-if="assignment.submission?.grade != null" class="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-500/30 whitespace-nowrap">
                      Graded: {{ assignment.submission.grade }}/100
                    </span>
                    <span v-else-if="assignment.submission" class="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 whitespace-nowrap">
                      Submitted
                    </span>
                    <span v-else class="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 whitespace-nowrap">
                      Not submitted
                    </span>
                  </div>

                  <div v-if="assignment.submission?.feedback" class="mt-3 pt-3 border-t border-white/5 text-sm">
                    <p class="text-gray-500 text-xs mb-1">Teacher feedback:</p>
                    <p class="text-gray-300">{{ assignment.submission.feedback }}</p>
                  </div>

                  <button v-if="assignment.submission?.file_name" @click="viewSubmissionFile(assignment)" class="mt-2 text-xs text-purple-400 hover:underline">
                    View my submitted file: {{ assignment.submission.file_name }}
                  </button>

                  <div v-if="submittingAssignmentId === assignment.id" class="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <textarea v-model="submissionForm.submission_text" rows="2" placeholder="Write your answer..." class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                    <input v-model="submissionForm.submission_link" type="url" placeholder="Or paste a link (optional)" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <input type="file" @change="handleSubmissionFileSelect" class="w-full text-sm text-gray-300" />
                    <div class="flex gap-2">
                      <button @click="handleSubmitAssignment(assignment)" :disabled="isSubmittingAssignment" class="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
                        {{ isSubmittingAssignment ? 'Submitting...' : 'Submit' }}
                      </button>
                      <button @click="submittingAssignmentId = null" class="px-3 py-1.5 text-xs text-gray-300 hover:text-white">Cancel</button>
                    </div>
                  </div>
                  <button v-else @click="openSubmitForm(assignment)" class="mt-2 text-xs font-semibold text-purple-400 hover:text-purple-300">
                    {{ assignment.submission ? 'Update Submission' : 'Submit Assignment' }}
                  </button>
                </div>
              </div>
              <p v-else class="text-gray-500 text-center py-6">No assignments yet.</p>

              <div class="flex justify-end pt-4">
                <button @click="showAssignmentsModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Close</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="submissionViewerUrl" class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] overflow-hidden flex flex-col">
            <div class="p-4 border-b border-white/10 flex justify-end">
              <button @click="submissionViewerUrl = null" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <iframe :src="submissionViewerUrl" class="flex-grow border-0"></iframe>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
