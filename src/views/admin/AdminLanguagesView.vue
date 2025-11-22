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
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Language Management</h1>
      <button @click="openAddModal" class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">
        Add New Language
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="isLoading">Loading languages...</div>
      <table v-else class="w-full text-left">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="p-3">Language Name</th>
            <th>Price Per Session</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lang in languages" :key="lang.ID" class="border-b hover:bg-gray-50">
            <td class="p-3 font-semibold">{{ lang.name }}</td>
            <td>${{ lang.PricePerSession.toFixed(2) }}</td>
            <td class="space-x-2">
              <button @click="openEditModal(lang)" class="text-indigo-600 hover:underline">Edit</button>
              <button @click="handleDelete(lang.ID)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Language' : 'Add New Language' }}</h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Language Name</label>
            <input type="text" v-model="currentLanguage.name" required class="w-full mt-1 border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium">Price Per Session ($)</label>
            <input type="number" step="0.01" v-model="currentLanguage.PricePerSession" required class="w-full mt-1 border rounded p-2" />
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-gray-800 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
