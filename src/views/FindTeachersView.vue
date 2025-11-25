<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/services/api';

interface Language {
  ID: string;
  Name: string;
}
interface Teacher {
  user_id: string;
  headline: string;
  avg_rating: number;
  user: {
    full_name: string;
    profile_picture_url?: string;
  };
  languages: Language[];
}

const teachers = ref<Teacher[]>([]);
const languages = ref<Language[]>([]);
const isLoading = ref(true);
const filters = ref({
  language_id: '',
  min_rating: '0',
});

const fetchTeachers = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.language_id) {
      params.append('language_id', filters.value.language_id);
    }
    if (parseFloat(filters.value.min_rating) > 0) {
      params.append('min_rating', filters.value.min_rating);
    }
    const response = await api.get(`/teachers?${params.toString()}`);
    teachers.value = response.data;
    console.log('Fetched teachers:', teachers.value);
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchLanguages = async () => {
  try {
    const response = await api.get('/languages');
    languages.value = response.data;
    console.log('Fetched languages:', languages.value);
  } catch (error) {
    console.error('Failed to fetch languages:', error);
  }
};

onMounted(() => {
  fetchTeachers();
  fetchLanguages();
});

watch(filters, fetchTeachers, { deep: true });
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Find Your Teacher</h1>

      <div class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
        <div class="w-full md:w-64">
          <label for="language" class="block text-sm font-medium text-gray-400 mb-2">Language</label>
          <div class="relative">
             <select
                v-model="filters.language_id"
                id="language"
                class="appearance-none w-full bg-black/50 border border-gray-700 text-white py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer transition-all"
             >
               <option value="">All Languages</option>
               <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">{{ lang.Name }}</option>
             </select>
             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>

        <div class="w-full md:w-64">
          <label for="rating" class="block text-sm font-medium text-gray-400 mb-2">Minimum Rating</label>
          <div class="relative">
             <select
                v-model="filters.min_rating"
                id="rating"
                class="appearance-none w-full bg-black/50 border border-gray-700 text-white py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer transition-all"
             >
               <option value="0">Any Rating</option>
               <option value="4">4 Stars & Up</option>
               <option value="4.5">4.5 Stars & Up</option>
             </select>
             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Finding best teachers...</span>
         </div>
      </div>

      <div v-else-if="teachers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="teacher in teachers"
          :key="teacher.user_id"
          :to="`/teacher/${teacher.user_id}`"
          class="group block bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/50 hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div class="p-6 h-full flex flex-col">
            <div class="flex items-center gap-4 mb-4">
              <div class="relative">
                 <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                 <img
                    class="relative w-16 h-16 rounded-full object-cover border-2 border-gray-900"
                    :src="teacher.user.profile_picture_url || 'https://via.placeholder.com/150'"
                    :alt="teacher.user.full_name"
                 />
              </div>
              <div>
                <h2 class="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{{ teacher.user.full_name }}</h2>
                <div class="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                   <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   <span>{{ teacher.avg_rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>

            <p class="text-gray-400 text-sm line-clamp-2 mb-6 flex-grow">{{ teacher.headline }}</p>

            <div class="flex flex-wrap gap-2 mt-auto">
              <span
                v-for="language in teacher.languages"
                :key="language.ID"
                class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-500/20"
              >
                {{ language.Name }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="bg-gray-900/40 backdrop-blur-sm p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
         <div class="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         </div>
         <h3 class="text-xl font-semibold text-white">No teachers found</h3>
         <p class="text-gray-400 mt-2">Try adjusting your filters to see more results.</p>
      </div>
    </div>
  </div>
</template>
