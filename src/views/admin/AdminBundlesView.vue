<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Language {
  ID: string;
  Name: string;
}

interface Bundle {
  ID: string;
  Name: string;
  language: Language;
  LanguageID: string;
  NumberOfClasses: number;
  Price: number;
  IsActive: boolean;
}

const bundles = ref<Bundle[]>([]);
const languages = ref<Language[]>([]);
const isLoading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const currentBundle = ref<Partial<Bundle>>({ Name: '', LanguageID: '', NumberOfClasses: 10, Price: 0.00 });

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [bundlesRes, langsRes] = await Promise.all([
      api.get('/admin/bundles'),
      api.get('/languages'),
    ]);
    bundles.value = bundlesRes.data;
    languages.value = langsRes.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchData);

const openAddModal = () => {
  isEditing.value = false;
  currentBundle.value = { Name: '', LanguageID: '', NumberOfClasses: 10, Price: 0.00, IsActive: true };
  showModal.value = true;
};

const openEditModal = (bundle: Bundle) => {
  isEditing.value = true;
  currentBundle.value = { ...bundle, LanguageID: bundle.language.ID };
  showModal.value = true;
};

const handleSave = async () => {
  try {
    const payload = {
      name: currentBundle.value.Name,
      language_id: currentBundle.value.LanguageID,
      number_of_classes: Number(currentBundle.value.NumberOfClasses),
      price: Number(currentBundle.value.Price),
    };
    if (isEditing.value) {
      await api.put(`/admin/bundles/${currentBundle.value.ID}`, payload);
    } else {
      await api.post('/admin/bundles', payload);
    }
    showModal.value = false;
    await fetchData();
  } catch (error) {
    console.error('Failed to save bundle:', error);
    alert('Failed to save bundle.');
  }
};

const handleToggleStatus = async (bundle: Bundle) => {
  try {
    await api.put(`/admin/bundles/${bundle.ID}/status`, { is_active: !bundle.IsActive });
    await fetchData();
  } catch (error) {
    console.error('Failed to toggle status:', error);
    alert('Failed to update bundle status.');
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Bundle Management</h1>
      <button @click="openAddModal" class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">
        Add New Bundle
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <div v-if="isLoading">Loading bundles...</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 border-b">
              <th class="p-3">Name</th>
              <th>Language</th>
              <th>Classes</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bundle in bundles" :key="bundle.ID" class="border-b hover:bg-gray-50">
              <td class="p-3 font-semibold">{{ bundle.Name }}</td>
              <td>{{ bundle.language.Name }}</td>
              <td>{{ bundle.NumberOfClasses }}</td>
              <td>${{ bundle.Price.toFixed(2) }}</td>
              <td>
                <span :class="['px-2 py-1 text-xs font-semibold rounded-full', bundle.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                  {{ bundle.IsActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="space-x-2">
                <button @click="openEditModal(bundle)" class="text-indigo-600 hover:underline">Edit</button>
                <button @click="handleToggleStatus(bundle)" class="text-yellow-600 hover:underline">
                  {{ bundle.IsActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Bundle' : 'Add New Bundle' }}</h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Bundle Name</label>
            <input type="text" v-model="currentBundle.Name" required class="w-full mt-1 border rounded p-2" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium">Language</label>
              <select v-model="currentBundle.LanguageID" required class="w-full mt-1 border rounded p-2 bg-white">
                <option disabled value="">Select</option>
                <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">{{ lang.Name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium">Number of Classes</label>
              <input type="number" min="1" v-model="currentBundle.NumberOfClasses" required class="w-full mt-1 border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm font-medium">Price ($)</label>
              <input type="number" step="0.01" min="0" v-model="currentBundle.Price" required class="w-full mt-1 border rounded p-2" />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-4">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-gray-800 text-white rounded">Save Bundle</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
