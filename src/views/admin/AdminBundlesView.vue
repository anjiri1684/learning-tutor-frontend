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
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Bundle Management</h1>
        <button
          @click="openAddModal"
          class="px-6 py-2.5 font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Bundle
        </button>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Name</th>
                <th class="p-4 font-semibold">Language</th>
                <th class="p-4 font-semibold text-center">Classes</th>
                <th class="p-4 font-semibold">Total Price</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="isLoading">
                 <td colspan="6" class="p-8 text-center">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <svg class="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-sm text-gray-400">Loading bundles...</span>
                    </div>
                 </td>
              </tr>
              <tr v-else v-for="b in bundles" :key="b.ID" class="hover:bg-white/5 transition-colors group">
                <td class="p-4 font-medium text-white">{{ b.Name }}</td>
                <td class="p-4 text-gray-300">{{ b.language?.name }}</td>
                <td class="p-4 text-center">
                   <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 font-mono">
                      {{ b.NumberOfClasses }}
                   </span>
                </td>
                <td class="p-4 font-medium text-white">
                   ${{ b.Price.toFixed(2) }} <span class="text-xs text-gray-500">{{ b.Currency }}</span>
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    :class="b.IsActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                    <span class="w-1.5 h-1.5 mr-1.5 rounded-full" :class="b.IsActive ? 'bg-green-400' : 'bg-red-400'"></span>
                    {{ b.IsActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button
                    @click="openEditModal(b)"
                    class="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                </td>
              </tr>
              <tr v-if="!isLoading && bundles.length === 0">
                 <td colspan="6" class="p-8 text-center text-gray-500">No bundles found. Create one to get started.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        <div class="p-8">
          <h3 class="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
            {{ isEditing ? 'Edit Bundle' : 'Create New Bundle' }}
          </h3>

          <form @submit.prevent="handleSave" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-2">Bundle Name</label>
                <input
                  v-model="currentBundle.Name"
                  required
                  placeholder="e.g. Starter Pack"
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select
                  v-model="currentBundle.LanguageID"
                  required
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled class="text-gray-500">Select language</option>
                  <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">
                    {{ lang.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Number of Classes</label>
                <input
                  type="number"
                  min="1"
                  v-model.number="currentBundle.NumberOfClasses"
                  required
                  class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                />
              </div>

              <div class="col-span-1 md:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-2">Total Price (USD)</label>
                <div class="relative">
                   <span class="absolute left-4 top-3.5 text-gray-500">$</span>
                   <input
                     type="number"
                     step="0.01"
                     min="0.01"
                     v-model.number="currentBundle.Price"
                     required
                     class="w-full pl-8 pr-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                   />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
              <button
                type="button"
                @click="showModal = false"
                class="px-6 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all"
              >
                {{ isEditing ? 'Update' : 'Create' }} Bundle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
