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
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Find Your Teacher</h1>

    <div class="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center space-x-4">
      <div>
        <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
        <select v-model="filters.language_id" id="language" class="mt-1 p-2 border rounded-md">
          <option value="">All Languages</option>
          <option v-for="lang in languages" :key="lang.ID" :value="lang.ID">{{ lang.Name }}</option>
        </select>
      </div>
      <div>
        <label for="rating" class="block text-sm font-medium text-gray-700">Minimum Rating</label>
        <select v-model="filters.min_rating" id="rating" class="mt-1 p-2 border rounded-md">
          <option value="0">Any Rating</option>
          <option value="4">4 Stars & Up</option>
          <option value="4.5">4.5 Stars & Up</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500">Loading teachers...</div>

    <div v-else-if="teachers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <RouterLink
        v-for="teacher in teachers"
        :key="teacher.user_id"
        :to="`/teacher/${teacher.user_id}`"
        class="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
      >
        <div class="p-6">
          <div class="flex items-center">
            <img class="h-16 w-16 rounded-full object-cover" :src="teacher.user.profile_picture_url || 'https://via.placeholder.com/150'" :alt="teacher.user.full_name" />
            <div class="ml-4">
              <h2 class="text-xl font-bold text-gray-800">{{ teacher.user.full_name }}</h2>
              <p class="text-sm text-yellow-500 font-bold">⭐ {{ teacher.avg_rating.toFixed(1) }}</p>
            </div>
          </div>
          <p class="mt-4 text-gray-600 text-sm">{{ teacher.headline }}</p>
          <div class="mt-4">
            <span v-for="language in teacher.languages" :key="language.ID" class="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {{ language.Name }}
            </span>
          </div>
        </div>
      </RouterLink>
    </div>

    <div v-else class="text-center bg-white p-8 rounded-lg shadow-md">
      <p class="text-gray-600">No teachers found matching your criteria.</p>
    </div>
  </div>
</template>
