<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

interface Language { ID: string; name: string; }
interface AvailabilitySlot {
  ID: string;
  start_time: string;
  end_time: string;
  language: Language;
  max_students: number;
  current_students: number;
}

const slots = ref<AvailabilitySlot[]>([]);
const languages = ref<Language[]>([]);
const isLoading = ref(true);
const showAddModal = ref(false);
const newSlot = ref({
  start_time: '',
  end_time: '',
  language_id: '',
  max_students: 1,
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [slotsRes, langsRes] = await Promise.all([
      api.get('/teacher/availability/me'),
      api.get('/languages'),
    ]);
    slots.value = slotsRes.data;
    languages.value = langsRes.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const upcomingSlots = computed(() =>
  slots.value.filter(s => new Date(s.start_time) >= new Date()).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
);

const handleAddSlot = async () => {
  try {
    const payload = {
      start_time: new Date(newSlot.value.start_time).toISOString(),
      end_time: new Date(newSlot.value.end_time).toISOString(),
      language_id: newSlot.value.language_id,
      max_students: Number(newSlot.value.max_students),
    };
    await api.post('/teacher/availability', payload);
    showAddModal.value = false;
    newSlot.value = { start_time: '', end_time: '', language_id: '', max_students: 1 };
    await fetchData();
  } catch (error) {
    console.error('Failed to add slot:', error);
    alert('Failed to add slot. Please check the times and try again.');
  }
};

const handleDeleteSlot = async (slotId: string) => {
  if (confirm('Are you sure you want to delete this available slot? This cannot be undone.')) {
    try {
      await api.delete(`/teacher/availability/${slotId}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete slot:', error);
      alert('Failed to delete slot. It might already be booked.');
    }
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">My Availability</h1>
        <button
          @click="showAddModal = true"
          class="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Slot
        </button>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading availability...</span>
         </div>
      </div>

      <div v-else class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-purple-900/10 border border-white/10">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
           Upcoming Available Slots
        </h2>

        <div v-if="upcomingSlots.length > 0" class="space-y-3">
          <div
            v-for="slot in upcomingSlots"
            :key="slot.ID"
            class="group p-4 bg-black/40 border border-gray-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300"
          >
            <div>
              <p class="font-bold text-white text-lg">{{ formatDate(slot.start_time) }}</p>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span class="text-xs font-bold text-purple-300 bg-purple-900/30 px-2.5 py-1 rounded border border-purple-500/20 uppercase tracking-wide">
                   {{ slot.language.name }}
                </span>

                <span v-if="slot.max_students > 1" class="text-xs font-bold text-green-400 bg-green-900/30 px-2.5 py-1 rounded border border-green-500/20 uppercase tracking-wide">
                  Group ({{ slot.current_students }}/{{ slot.max_students }})
                </span>

                <span v-else class="text-xs font-bold text-gray-400 bg-gray-800 px-2.5 py-1 rounded border border-gray-700 uppercase tracking-wide">
                  Private
                </span>
              </div>
            </div>

            <button
              @click="handleDeleteSlot(slot.ID)"
              class="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
              title="Delete Slot"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <div v-else class="text-center py-10 border border-dashed border-gray-700 rounded-xl bg-black/20">
           <p class="text-gray-500">You have no upcoming available slots.</p>
           <p class="text-sm text-gray-600 mt-1">Add a new slot to start receiving bookings.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden transform transition-all scale-100">
          <div class="p-8">
            <h3 class="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Add Availability Slot</h3>

            <form @submit.prevent="handleAddSlot" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    v-model="newSlot.language_id"
                    required
                    class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer appearance-none"
                  >
                    <option disabled value="" class="text-gray-500">Select a language</option>
                    <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">{{ lang.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    v-model="newSlot.max_students"
                    required
                    class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                  />
                  <p class="text-xs text-gray-500 mt-1">1 for Private Class</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  v-model="newSlot.start_time"
                  required
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  v-model="newSlot.end_time"
                  required
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [color-scheme:dark]"
                />
              </div>

              <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  @click="showAddModal = false"
                  class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
