<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
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
  student_rating?: number | null;
  student: {
    id: string;
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

const bookings = ref<Booking[]>([]);
const isLoading = ref(true);
const actionMessage = ref({ type: '', text: '' });
const selectedBooking = ref<Booking | null>(null);
const router = useRouter();

const showFeedbackModal = ref(false);
const feedbackText = ref('');
const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);
const showRatingModal = ref(false);
const ratingData = ref({ rating: 5, comment: '' });

const showAssignmentsModal = ref(false);
const assignments = ref<any[]>([]);
const isLoadingAssignments = ref(false);
const newAssignment = ref({ title: '', instructions: '', due_date: '' });
const isCreatingAssignment = ref(false);
const gradingAssignmentId = ref<string | null>(null);
const gradeForm = ref({ grade: 100, feedback: '' });
const isGrading = ref(false);
const submissionViewerUrl = ref<string | null>(null);

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

const upcomingClasses = computed(() => {
  if (!Array.isArray(bookings.value)) return [];
  return bookings.value.filter(b => new Date(b.availability_slot.start_time) >= new Date() && b.status === 'confirmed');
});
const pastClasses = computed(() => {
  if (!Array.isArray(bookings.value)) return [];
  return bookings.value.filter(b => new Date(b.availability_slot.start_time) < new Date() || b.status !== 'confirmed');
});

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

const openAssignmentsModal = async (booking: Booking) => {
  selectedBooking.value = booking;
  showAssignmentsModal.value = true;
  newAssignment.value = { title: '', instructions: '', due_date: '' };
  gradingAssignmentId.value = null;
  isLoadingAssignments.value = true;
  assignments.value = await assignmentStore.listBookingAssignments(booking.ID);
  isLoadingAssignments.value = false;
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

const handleCreateAssignment = async () => {
  if (!selectedBooking.value || !newAssignment.value.title) return;
  isCreatingAssignment.value = true;
  const payload: any = { title: newAssignment.value.title, instructions: newAssignment.value.instructions };
  if (newAssignment.value.due_date) {
    payload.due_date = new Date(newAssignment.value.due_date).toISOString();
  }
  const result = await assignmentStore.createAssignment(selectedBooking.value.ID, payload);
  isCreatingAssignment.value = false;
  if (result.success) {
    newAssignment.value = { title: '', instructions: '', due_date: '' };
    assignments.value = await assignmentStore.listBookingAssignments(selectedBooking.value.ID);
  } else {
    alert(result.message);
  }
};

const openGradeForm = (assignment: any) => {
  gradingAssignmentId.value = assignment.id;
  gradeForm.value = { grade: assignment.submission?.grade ?? 100, feedback: assignment.submission?.feedback || '' };
};

const handleGradeAssignment = async (assignment: any) => {
  isGrading.value = true;
  const result = await assignmentStore.gradeAssignment(assignment.id, gradeForm.value.grade, gradeForm.value.feedback);
  isGrading.value = false;
  if (result.success && selectedBooking.value) {
    gradingAssignmentId.value = null;
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

const openRatingModal = (booking: Booking) => {
  selectedBooking.value = booking;
  ratingData.value = { rating: 5, comment: '' };
  showRatingModal.value = true;
};
const handleSubmitRating = async () => {
  if (!selectedBooking.value) return;
  isSubmitting.value = true;
  try {
    await api.post(`/teacher/bookings/${selectedBooking.value.ID}/rate-student`, ratingData.value);
    showRatingModal.value = false;
    actionMessage.value = { type: 'success', text: 'Student rated successfully.' };
    await fetchBookings();
  } catch (error) {
    console.error('Failed to submit rating:', error);
    actionMessage.value = { type: 'error', text: 'Failed to submit rating.' };
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

const formatDate = (dateString: string) => formatInUserTimeZone(dateString, authStore.user?.time_zone);
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

      <div v-if="actionMessage.text" :class="['mb-6 p-4 rounded-xl flex items-center gap-3 border animate-fade-in',
        actionMessage.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300'
      ]">
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
           <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span> Upcoming Classes
        </h2>

        <div v-if="upcomingClasses.length > 0" class="space-y-4 mb-10">
          <div
            v-for="booking in upcomingClasses"
            :key="booking.ID"
            class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all duration-300"
          >
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div class="flex items-start gap-4">
                 <div class="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400 border border-gray-700">
                    {{ booking.availability_slot.language.name.substring(0,2).toUpperCase() }}
                 </div>
                 <div>
                    <p class="font-bold text-lg text-white">{{ booking.availability_slot.language.name }} Class</p>
                    <div class="flex items-center gap-2 mt-1">
                       <RouterLink :to="`/teacher/student-progress/${booking.student.id}`" class="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                          with {{ booking.student.full_name }}
                       </RouterLink>
                       <button @click="handleStartConversationWithStudent(booking.student.id)" class="text-gray-500 hover:text-white transition-colors" title="Message Student">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                       </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 flex items-center gap-1 font-mono">
                       <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       {{ formatDate(booking.availability_slot.start_time) }}
                    </p>
                 </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <button
                  @click="openUploadModal(booking)"
                  class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                >
                  Upload Resources
                </button>
                <button
                  @click="openAssignmentsModal(booking)"
                  class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                >
                  Assignments
                </button>
                <button
                  @click="downloadBookingCalendar(booking)"
                  class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                >
                  Add to Calendar
                </button>

                <a
                  v-if="booking.meeting_link"
                  :href="booking.meeting_link"
                  target="_blank"
                  class="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg shadow-lg shadow-green-500/20 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Start Class
                </a>
                <span v-else class="px-4 py-2 text-sm font-medium text-gray-500 bg-black/30 border border-white/5 rounded-lg cursor-not-allowed">Link Pending</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 mb-10 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">You have no upcoming classes.</p>

        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-gray-500"></span> Past History
        </h2>

        <div v-if="pastClasses.length > 0" class="space-y-4">
          <div v-for="booking in pastClasses" :key="booking.ID" class="bg-gray-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-gray-900/60 transition-colors">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p class="font-bold text-white">{{ booking.availability_slot.language.name }}</p>
                <div class="flex items-center gap-2 text-sm mt-1">
                   <RouterLink :to="`/teacher/student-progress/${booking.student.id}`" class="text-gray-400 hover:text-purple-400 transition-colors">
                      with {{ booking.student.full_name }}
                   </RouterLink>
                   <button @click="handleStartConversationWithStudent(booking.student.id)" class="text-gray-600 hover:text-white transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                   </button>
                </div>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 font-mono">
                   <span>{{ formatDate(booking.availability_slot.start_time) }}</span>
                   <span class="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 capitalize">{{ booking.status }}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <button @click="openUploadModal(booking)" class="text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline">Uploads</button>
                <button @click="openAssignmentsModal(booking)" class="text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline">Assignments</button>

                <button
                  v-if="booking.status === 'confirmed' && new Date(booking.availability_slot.start_time) < new Date()"
                  @click="handleMarkAsComplete(booking.ID)"
                  class="px-4 py-2 text-sm font-semibold text-green-400 bg-green-900/20 border border-green-500/20 rounded-lg hover:bg-green-900/40 transition-all"
                >
                  Mark Complete
                </button>

                <button
                  v-if="booking.status === 'completed'"
                  @click="openFeedbackModal(booking)"
                  class="px-4 py-2 text-sm font-semibold text-blue-400 bg-blue-900/20 border border-blue-500/20 rounded-lg hover:bg-blue-900/40 transition-all"
                >
                  Feedback
                </button>

                <button
                  v-if="booking.status === 'completed' && !booking.student_rating"
                  @click="openRatingModal(booking)"
                  class="px-4 py-2 text-sm font-semibold text-yellow-400 bg-yellow-900/20 border border-yellow-500/20 rounded-lg hover:bg-yellow-900/40 transition-all"
                >
                  Rate Student
                </button>
                <span
                  v-else-if="booking.status === 'completed' && booking.student_rating"
                  class="px-4 py-2 text-sm font-medium text-gray-400 bg-black/30 border border-white/5 rounded-lg"
                >
                  Rated {{ booking.student_rating }}/5
                </span>
                <button v-if="booking.status === 'completed'" @click="handleReportNoShow(booking)" class="text-sm font-medium text-gray-500 hover:text-red-400">Report No-Show</button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">You have no past class history.</p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden transform transition-all scale-100">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Submit Feedback</h3>
            <p class="text-sm text-gray-400 mb-4">For student: <strong class="text-white">{{ selectedBooking?.student.full_name }}</strong></p>

            <form @submit.prevent="handleSubmitFeedback">
              <textarea
                v-model="feedbackText"
                rows="5"
                required
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600 custom-scrollbar"
                placeholder="Enter feedback on the student's progress..."
              ></textarea>

              <div class="flex justify-end gap-3 pt-6">
                <button type="button" @click="showFeedbackModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-all">
                   <span v-if="isSubmitting">Submitting...</span><span v-else>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden transform transition-all scale-100">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Upload Resources</h3>
            <p class="text-sm text-gray-400 mb-6">For class with: <strong class="text-white">{{ selectedBooking?.student.full_name }}</strong></p>

            <form @submit.prevent="handleUploadResource">
              <div class="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer relative">
                 <input type="file" @change="handleFileSelect" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                 <svg class="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                 <p class="text-sm text-gray-300 font-medium" v-if="!selectedFile">Click to select a file</p>
                 <p class="text-sm text-purple-400 font-bold" v-else>{{ selectedFile.name }}</p>
              </div>

              <div class="flex justify-end gap-3 pt-6">
                <button type="button" @click="showUploadModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" :disabled="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-all">
                   <span v-if="isSubmitting">Uploading...</span><span v-else>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showRatingModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Rate Student</h3>
            <p class="text-sm text-gray-400 mb-4">For student: <strong class="text-white">{{ selectedBooking?.student.full_name }}</strong></p>
            <div class="space-y-4">
               <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                  <input type="number" min="1" max="5" v-model="ratingData.rating" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
               </div>
               <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                  <textarea v-model="ratingData.comment" rows="4" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600" placeholder="How did the student do?"></textarea>
               </div>
               <div class="flex justify-end gap-3 pt-2">
                  <button @click="showRatingModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                  <button @click="handleSubmitRating" :disabled="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                    {{ isSubmitting ? 'Submitting...' : 'Submit Rating' }}
                  </button>
               </div>
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
            <p class="text-sm text-gray-400 mb-4">For class with: <strong class="text-white">{{ selectedBooking?.student.full_name }}</strong></p>

            <div class="bg-black/30 border border-white/5 rounded-xl p-4 mb-6">
              <h4 class="text-sm font-bold text-white mb-3">New Assignment</h4>
              <div class="space-y-3">
                <input v-model="newAssignment.title" type="text" placeholder="Title" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <textarea v-model="newAssignment.instructions" rows="2" placeholder="Instructions" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                <input v-model="newAssignment.due_date" type="datetime-local" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 [color-scheme:dark]" />
                <button @click="handleCreateAssignment" :disabled="isCreatingAssignment" class="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">
                  {{ isCreatingAssignment ? 'Creating...' : '+ Assign' }}
                </button>
              </div>
            </div>

            <div v-if="isLoadingAssignments" class="text-center text-gray-400 py-4">Loading...</div>
            <div v-else-if="assignments.length > 0" class="space-y-3">
              <div v-for="assignment in assignments" :key="assignment.id" class="bg-gray-900/60 border border-white/10 rounded-xl p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-bold text-white">{{ assignment.title }}</p>
                    <p class="text-sm text-gray-400 mt-1">{{ assignment.instructions }}</p>
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

                <div v-if="assignment.submission" class="mt-3 pt-3 border-t border-white/5 text-sm space-y-1">
                  <p v-if="assignment.submission.submission_text" class="text-gray-300">{{ assignment.submission.submission_text }}</p>
                  <a v-if="assignment.submission.submission_link" :href="assignment.submission.submission_link" target="_blank" class="text-purple-400 hover:underline block">{{ assignment.submission.submission_link }}</a>
                  <button v-if="assignment.submission.file_name" @click="viewSubmissionFile(assignment)" class="text-purple-400 hover:underline">{{ assignment.submission.file_name }}</button>

                  <div v-if="gradingAssignmentId === assignment.id" class="mt-3 space-y-2">
                    <input v-model.number="gradeForm.grade" type="number" min="0" max="100" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <textarea v-model="gradeForm.feedback" rows="2" placeholder="Feedback" class="w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                    <div class="flex gap-2">
                      <button @click="handleGradeAssignment(assignment)" :disabled="isGrading" class="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50">Save Grade</button>
                      <button @click="gradingAssignmentId = null" class="px-3 py-1.5 text-xs text-gray-300 hover:text-white">Cancel</button>
                    </div>
                  </div>
                  <button v-else @click="openGradeForm(assignment)" class="mt-2 text-xs font-semibold text-purple-400 hover:text-purple-300">
                    {{ assignment.submission.grade != null ? 'Edit Grade' : 'Grade Submission' }}
                  </button>
                </div>
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
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 3px;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
