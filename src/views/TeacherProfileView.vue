<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking';
import api from '@/services/api';

// --- Interfaces for our data shapes ---
interface TeacherProfile {
  user_id: string;
  headline: string;
  bio: string;
  avg_rating: number;
  user: {
    full_name: string;
    profile_picture_url?: string;
  };
  languages: { name: string }[];
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  language_id: string;
  max_students: number;
  current_students: number;
}

// --- Component State ---
const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();

const teacher = ref<TeacherProfile | null>(null);
const availability = ref<AvailabilitySlot[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  const teacherId = route.params.id as string;
  if (!teacherId || teacherId === 'undefined') {
    isLoading.value = false;
    console.error("Teacher ID is undefined, cannot fetch profile.");
    return;
  }

  try {
    const [profileRes, availabilityRes] = await Promise.all([
      api.get(`/teachers/${teacherId}`),
      api.get(`/teachers/${teacherId}/availability`),
    ]);
    teacher.value = profileRes.data;
    availability.value = availabilityRes.data;
  } catch (error) {
    console.error('Failed to fetch teacher details:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleSelectSlot = (slot: AvailabilitySlot) => {
  if (!teacher.value) return;
  bookingStore.setBookingContext(teacher.value, slot);
  router.push('/dashboard/book');
};

const handleStartConversation = async () => {
  if (!teacher.value) return;
  try {
    await api.post('/conversations', { recipient_id: teacher.value.user_id });
    router.push('/dashboard/my-messages');
  } catch (error) {
    console.error("Failed to start conversation:", error);
    alert("Could not start a conversation with this teacher.");
  }
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

</script>

<template>
  <div class="container mx-auto p-8">
    <div v-if="isLoading" class="text-center text-gray-500">
      Loading profile...
    </div>

    <div v-else-if="teacher" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div class="flex items-center">
              <img
                class="h-24 w-24 rounded-full object-cover"
                :src="teacher.user.profile_picture_url || 'https://via.placeholder.com/150'"
                :alt="teacher.user.full_name"
              />
              <div class="ml-6">
                <h1 class="text-3xl font-bold text-gray-800">{{ teacher.user.full_name }}</h1>
                <p class="text-gray-600 mt-1">{{ teacher.headline }}</p>
                <p class="text-yellow-500 font-bold mt-1">⭐ {{ teacher.avg_rating.toFixed(1) }}</p>
              </div>
            </div>
            <button @click="handleStartConversation" class="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Message Teacher
            </button>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-800">About Me</h2>
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ teacher.bio }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Available Slots</h2>
        <div v-if="availability.length > 0" class="space-y-2">
          <button
            v-for="slot in availability"
            :key="slot.id"
            @click="handleSelectSlot(slot)"
            class="w-full text-left p-3 bg-indigo-50 rounded-md text-indigo-800 font-semibold hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
          >
            <div>
              {{ new Date(slot.start_time).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) }}
              <br>
              {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
            </div>
            <div class="text-sm mt-1">
              <span v-if="slot.max_students > 1" class="font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Group Class ({{ slot.max_students - slot.current_students }} spots left)
              </span>
              <span v-else class="font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Private Class (1-on-1)
              </span>
            </div>
          </button>
        </div>
        <p v-else class="text-gray-500 text-sm">This teacher has no available slots at the moment.</p>
      </div>
    </div>

    <div v-else class="text-center text-red-500">
      Sorry, this teacher could not be found.
    </div>
  </div>
</template>
