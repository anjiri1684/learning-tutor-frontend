<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

// --- Interfaces ---
interface Language { ID: string; name: string; }
interface AvailabilitySlot {
  ID: string;
  start_time: string;
  end_time: string;
  language: Language;
  max_students: number;
  current_students: number;
}

// --- Component State ---
const slots = ref<AvailabilitySlot[]>([]);
const languages = ref<Language[]>([]);
const isLoading = ref(true);
const showAddModal = ref(false);
const newSlot = ref({
  start_time: '',
  end_time: '',
  language_id: '',
  max_students: 1, // Default to 1 for private class
});

// --- Data Fetching ---
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

// --- Computed Properties ---
const upcomingSlots = computed(() =>
  slots.value.filter(s => new Date(s.start_time) >= new Date()).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
);

// --- Methods ---
const handleAddSlot = async () => {
  try {
    const payload = {
      start_time: new Date(newSlot.value.start_time).toISOString(),
      end_time: new Date(newSlot.value.end_time).toISOString(),
      language_id: newSlot.value.language_id,
      max_students: Number(newSlot.value.max_students), // Include max_students
    };
    await api.post('/teacher/availability', payload);
    showAddModal.value = false;
    newSlot.value = { start_time: '', end_time: '', language_id: '', max_students: 1}; // Reset form
    await fetchData(); // Refresh the list
  } catch (error) {
    console.error('Failed to add slot:', error);
    alert('Failed to add slot. Please check the times and try again.');
  }
};

const handleDeleteSlot = async (slotId: string) => {
  if (confirm('Are you sure you want to delete this available slot? This cannot be undone.')) {
    try {
      await api.delete(`/teacher/availability/${slotId}`);
      await fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete slot:', error);
      alert('Failed to delete slot. It might already be booked.');
    }
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">My Availability</h1>
      <button @click="showAddModal = true" class="px-6 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700">
        Add New Slot
      </button>
    </div>

    <div v-if="isLoading">Loading availability...</div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Upcoming Available Slots</h2>
      <div v-if="upcomingSlots.length > 0" class="space-y-3">
        <div v-for="slot in upcomingSlots" :key="slot.ID" class="p-3 bg-gray-50 rounded-md flex justify-between items-center hover:bg-gray-100">
          <div>
            <p class="font-semibold text-gray-800">{{ formatDate(slot.start_time) }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-sm font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{{ slot.language.name }}</span>
              <span v-if="slot.max_students > 1" class="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Group ({{ slot.current_students }}/{{ slot.max_students }})
              </span>
               <span v-else class="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
                Private
              </span>
            </div>
          </div>
          <button @click="handleDeleteSlot(slot.ID)" class="text-red-500 hover:text-red-700" title="Delete Slot">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
      <p v-else class="text-gray-500">You have no upcoming available slots.</p>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">Add a New Availability Slot</h3>
        <form @submit.prevent="handleAddSlot" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Language</label>
              <select v-model="newSlot.language_id" required class="w-full mt-1 border rounded-md p-2 bg-white">
                <option disabled value="">Select a language</option>
                <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">{{ lang.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Max Students (1 for private)</label>
              <input type="number" min="1" v-model="newSlot.max_students" required class="w-full mt-1 border rounded-md p-2" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Start Time</label>
            <input type="datetime-local" v-model="newSlot.start_time" required class="w-full mt-1 border rounded-md p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End Time</label>
            <input type="datetime-local" v-model="newSlot.end_time" required class="w-full mt-1 border rounded-md p-2" />
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showAddModal = false" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-teal-600 text-white rounded-md">Add Slot</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
