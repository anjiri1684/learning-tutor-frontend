<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Language {
  ID: string;
  name: string;
  PricePerSession: number;
}

const languages = ref<Language[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const currentLanguage = ref<Partial<Language>>({ name: '', PricePerSession: 0 });

const fetchLanguages = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/admin/languages');
    languages.value = response.data;
  } catch (error) {
    console.error('Failed to fetch languages:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchLanguages);

const openAddModal = () => {
  isEditing.value = false;
  currentLanguage.value = { name: '', PricePerSession: 0 };
  showModal.value = true;
};

const openEditModal = (language: Language) => {
  isEditing.value = true;
  currentLanguage.value = { ...language };
  showModal.value = true;
};

const handleSave = async () => {
  try {
    const payload = {
      name: currentLanguage.value.name,
      price_per_session: Number(currentLanguage.value.PricePerSession),
      currency: 'USD',
    };
    if (isEditing.value) {
      await api.put(`/admin/languages/${currentLanguage.value.ID}`, payload);
    } else {
      await api.post('/admin/languages', payload);
    }
    showModal.value = false;
    await fetchLanguages();
  } catch (error) {
    console.error('Failed to save language:', error);
    alert('Failed to save language.');
  }
};

const handleDelete = async (languageId: string) => {
  if (confirm('Are you sure you want to delete this language?')) {
    try {
      await api.delete(`/admin/languages/${languageId}`);
      await fetchLanguages();
    } catch (error) {
      console.error('Failed to delete language:', error);
      alert('Failed to delete language.');
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Language Management</h1>
        <button
          @click="openAddModal"
          class="px-6 py-2.5 font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Language
        </button>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Language Name</th>
                <th class="p-4 font-semibold">Price Per Session</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="isLoading">
                 <td colspan="3" class="p-8 text-center">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <svg class="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-sm text-gray-400">Loading languages...</span>
                    </div>
                 </td>
              </tr>
              <tr v-else v-for="lang in languages" :key="lang.ID" class="hover:bg-white/5 transition-colors group">
                <td class="p-4">
                   <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700">
                         {{ lang.name.substring(0,2).toUpperCase() }}
                      </div>
                      <span class="font-bold text-white text-lg">{{ lang.name }}</span>
                   </div>
                </td>
                <td class="p-4">
                  <span class="text-green-400 font-medium bg-green-900/20 px-3 py-1 rounded-full border border-green-500/20">
                    ${{ lang.PricePerSession.toFixed(2) }}
                  </span>
                </td>
                <td class="p-4 text-right space-x-3">
                  <button @click="openEditModal(lang)" class="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
                  <button @click="handleDelete(lang.ID)" class="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Delete</button>
                </td>
              </tr>
              <tr v-if="!isLoading && languages.length === 0">
                 <td colspan="3" class="p-8 text-center text-gray-500">No languages found. Add one to get started.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
            {{ isEditing ? 'Edit Language' : 'Add New Language' }}
          </h3>
          <form @submit.prevent="handleSave" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Language Name</label>
              <input
                type="text"
                v-model="currentLanguage.name"
                required
                placeholder="e.g. Spanish"
                class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Price Per Session ($)</label>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  v-model="currentLanguage.PricePerSession"
                  required
                  class="w-full pl-8 pr-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                />
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
