<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking';
import api from '@/services/api';

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
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading profile...</span>
         </div>
      </div>

      <div v-else-if="teacher" class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-8">

          <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 relative z-10">
              <div class="flex items-start gap-6">
                <div class="relative group">
                   <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                   <img
                      class="relative h-24 w-24 rounded-full object-cover border-2 border-gray-900"
                      :src="teacher.user.profile_picture_url || 'https://via.placeholder.com/150'"
                      :alt="teacher.user.full_name"
                   />
                </div>
                <div>
                  <h1 class="text-3xl font-bold text-white">{{ teacher.user.full_name }}</h1>
                  <p class="text-purple-400 font-medium mt-1">{{ teacher.headline }}</p>
                  <div class="flex items-center gap-1 mt-2 text-yellow-400 font-bold">
                     <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                     <span>{{ teacher.avg_rating.toFixed(1) }}</span>
                  </div>
                </div>
              </div>

              <button
                @click="handleStartConversation"
                class="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 font-bold text-white bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-purple-400 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                Message Teacher
              </button>
            </div>
          </div>

          <div class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg">
            <h2 class="text-xl font-bold mb-6 text-white flex items-center gap-2">
               <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
               About Me
            </h2>
            <div class="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
               {{ teacher.bio }}
            </div>
          </div>
        </div>

        <div class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg h-fit">
          <h2 class="text-xl font-bold mb-6 text-white flex items-center gap-2">
             <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             Available Slots
          </h2>

          <div v-if="availability.length > 0" class="space-y-3">
            <button
              v-for="slot in availability"
              :key="slot.id"
              @click="handleSelectSlot(slot)"
              class="w-full text-left p-4 bg-black/40 border border-gray-700 rounded-xl hover:border-purple-500 hover:bg-purple-900/10 transition-all group relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div class="relative z-10">
                 <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-white group-hover:text-purple-300 transition-colors">
                       {{ new Date(slot.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) }}
                    </span>
                    <span class="text-xs text-gray-400 font-mono">
                       {{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}
                    </span>
                 </div>

                 <div>
                    <span v-if="slot.max_students > 1" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                       Group Class ({{ slot.max_students - slot.current_students }} left)
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-500/30">
                       Private Class (1-on-1)
                    </span>
                 </div>
              </div>
            </button>
          </div>

          <div v-else class="text-center py-8 border border-dashed border-gray-700 rounded-xl bg-black/20">
             <p class="text-gray-500 text-sm">No available slots at the moment.</p>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
         <div class="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         </div>
         <h3 class="text-xl font-bold text-white">Teacher Not Found</h3>
         <p class="text-gray-500 mt-2">Sorry, this profile could not be loaded.</p>
      </div>
    </div>
  </div>
</template>
