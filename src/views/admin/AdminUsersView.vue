<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

const users = ref<any[]>([]);
const isLoading = ref(true);
const updatingUserId = ref<string | null>(null);
const searchQuery = ref('');
const pagination = ref({
  page: 1,
  limit: 10,
  totalUsers: 0,
  totalPages: 1,
});

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      search: searchQuery.value,
    });
    const response = await api.get(`/admin/users?${params.toString()}`);
    users.value = response.data.data;
    pagination.value.totalUsers = response.data.meta.total_users;
    pagination.value.totalPages = response.data.meta.total_pages;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchUsers);

watch(() => pagination.value.page, fetchUsers);

let searchTimeout: number;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchUsers();
  }, 300);
});

const toggleStatus = async (user: any) => {
  updatingUserId.value = user.id;
  try {
    await api.put(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
    user.is_active = !user.is_active;
  } catch (error) {
    console.error('Failed to update status:', error);
    alert('Failed to update user status.');
  } finally {
    updatingUserId.value = null;
  }
};

const handleDeleteUser = async (userId: string) => {
  if (confirm('Are you sure you want to permanently delete this teacher and all their data? This action cannot be undone.')) {
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user.');
    }
  }
};

const changePage = (newPage: number) => {
  if (newPage > 0 && newPage <= pagination.value.totalPages) {
    pagination.value.page = newPage;
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">User Management</h1>

        <div class="relative w-full md:w-80">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name or email..."
            class="block w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold">Name</th>
                <th class="p-4 font-semibold">Email</th>
                <th class="p-4 font-semibold">Role</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-if="isLoading">
                <td colspan="5" class="p-8 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <svg class="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-400">Loading users...</span>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors group">
                <td class="p-4">
                   <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-700">
                         {{ user.full_name?.charAt(0).toUpperCase() || 'U' }}
                      </div>
                      <span class="font-medium text-white">{{ user.full_name }}</span>
                   </div>
                </td>
                <td class="p-4 text-gray-300">{{ user.email }}</td>
                <td class="p-4">
                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize"
                     :class="user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                             user.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                             'bg-gray-700/30 text-gray-400 border-gray-600/30'">
                     {{ user.role }}
                   </span>
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    :class="user.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                    <span class="w-1.5 h-1.5 mr-1.5 rounded-full" :class="user.is_active ? 'bg-green-400' : 'bg-red-400'"></span>
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="p-4 text-right space-x-2">
                  <button
                    @click="toggleStatus(user)"
                    :disabled="updatingUserId === user.id"
                    class="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="user.is_active
                      ? 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10'
                      : 'text-green-400 border-green-500/30 hover:bg-green-500/10'"
                  >
                    <span v-if="updatingUserId === user.id" class="flex items-center gap-1">
                       <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Saving
                    </span>
                    <span v-else>{{ user.is_active ? 'Deactivate' : 'Activate' }}</span>
                  </button>

                  <button
                    v-if="user.role === 'teacher'"
                    @click="handleDeleteUser(user.id)"
                    class="text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="!isLoading && users.length === 0">
                 <td colspan="5" class="p-8 text-center text-gray-500">No users found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-gray-800 bg-gray-900/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span class="text-sm text-gray-400">
            Showing <span class="text-white font-medium">{{ users.length }}</span> of <span class="text-white font-medium">{{ pagination.totalUsers }}</span> users
          </span>
          <div class="flex items-center space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 px-2">Page <span class="text-white">{{ pagination.page }}</span> of {{ pagination.totalPages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
