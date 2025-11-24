<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Language {
  ID: string
  name: string
}

interface Bundle {
  ID: string
  Name: string
  LanguageID: string
  NumberOfClasses: number
  Price: number
  Currency: string
  IsActive: boolean
  language: Language
  CreatedAt: string
  UpdatedAt: string
}

const bundles = ref<Bundle[]>([])
const languages = ref<Language[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)

const currentBundle = ref<Partial<Bundle>>({
  Name: '',
  LanguageID: '',
  NumberOfClasses: 10,
  Price: 0,
  Currency: 'USD',
  IsActive: true
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const [bundlesRes, langsRes] = await Promise.all([
      api.get('/admin/bundles'),
      api.get('/languages')
    ])
    bundles.value = bundlesRes.data
    languages.value = langsRes.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

const openAddModal = () => {
  isEditing.value = false
  currentBundle.value = {
    Name: '',
    LanguageID: '',
    NumberOfClasses: 10,
    Price: 0,
    Currency: 'USD',
    IsActive: true
  }
  showModal.value = true
}

const openEditModal = (bundle: Bundle) => {
  isEditing.value = true
  currentBundle.value = { ...bundle }
  showModal.value = true
}

const handleSave = async () => {
  try {
    const payload = {
      name: currentBundle.value.Name,
      language_id: currentBundle.value.LanguageID,
      number_of_classes: Number(currentBundle.value.NumberOfClasses),
      price: Number(currentBundle.value.Price)
    }

    if (isEditing.value && currentBundle.value.ID) {
      await api.put(`/admin/bundles/${currentBundle.value.ID}`, payload)
    } else {
      await api.post('/admin/bundles', payload)
    }

    showModal.value = false
    await fetchData()
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to save bundle')
  }
}

// const toggleActive = async (bundle: Bundle) => {
//   try {
//     await api.put(`/admin/bundles/${bundle.ID}/deactivate`)
//     await fetchData()
//   } catch (error) {
//     console.error('Failed to update status:', error)
//     alert('Failed to update status')
//   }
// }
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Bundle Management</h1>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
      >
        Add New Bundle
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div v-if="isLoading" class="p-12 text-center text-gray-500">
        Loading bundles...
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Name</th>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Language</th>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Classes</th>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Total Price</th>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Status</th>
            <th class="px-6 py-4 text-left font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in bundles"
            :key="b.ID"
            class="border-b hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 font-medium">{{ b.Name }}</td>
            <td class="px-6 py-4">{{ b.language.name }}</td>
            <td class="px-6 py-4 text-center">{{ b.NumberOfClasses }}</td>
            <td class="px-6 py-4 font-medium">
              ${{ b.Price.toFixed(2) }} {{ b.Currency }}
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  b.IsActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ b.IsActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 space-x-4">
              <button
                @click="openEditModal(b)"
                class="text-indigo-600 hover:underline font-medium"
              >
                Edit
              </button>
              <!-- <button
                @click="toggleActive(b)"
                class="text-orange-600 hover:underline font-medium"
              >
                {{ b.IsActive ? 'Deactivate' : 'Activate' }}
              </button> -->
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!isLoading && bundles.length === 0" class="p-12 text-center text-gray-500">
        No bundles found.
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
        <h3 class="text-2xl font-bold mb-6">
          {{ isEditing ? 'Edit Bundle' : 'Create New Bundle' }}
        </h3>

        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium mb-2">Bundle Name</label>
              <input
                v-model="currentBundle.Name"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Language</label>
              <select
                v-model="currentBundle.LanguageID"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800"
              >
                <option value="">Select language</option>
                <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">
                  {{ lang.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Number of Classes</label>
              <input
                type="number"
                min="1"
                v-model.number="currentBundle.NumberOfClasses"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Total Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                v-model.number="currentBundle.Price"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-800"
              />
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button
              type="button"
              @click="showModal = false"
              class="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              {{ isEditing ? 'Update' : 'Create' }} Bundle
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
