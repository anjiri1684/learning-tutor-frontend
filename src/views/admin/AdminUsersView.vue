<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';

// --- Component State ---
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

// --- Data Fetching ---
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

// --- Watch for changes to re-fetch data ---
watch(() => pagination.value.page, fetchUsers);

// Debounced search
let searchTimeout: number;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1; // Reset to first page on new search
    fetchUsers();
  }, 300); // Wait 300ms after user stops typing
});

// --- Action Methods ---
const toggleStatus = async (user: any) => {
  updatingUserId.value = user.id;
  try {
    await api.put(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
    user.is_active = !user.is_active; // Optimistically update UI
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
      await fetchUsers(); // Refresh the list
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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by name or email..."
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="p-4 text-center">Loading users...</td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="border-b hover:bg-gray-50">
              <td class="p-3">{{ user.full_name }}</td>
              <td>{{ user.email }}</td>
              <td class="capitalize">{{ user.role }}</td>
              <td>
                <span :class="['px-2 py-1 text-xs font-semibold rounded-full', user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="space-x-3">
                <button @click="toggleStatus(user)" :disabled="updatingUserId === user.id" class="text-indigo-600 hover:underline disabled:text-gray-400">
                  <span v-if="updatingUserId === user.id">Saving...</span>
                  <span v-else>{{ user.is_active ? 'Deactivate' : 'Activate' }}</span>
                </button>
                <button v-if="user.role === 'teacher'" @click="handleDeleteUser(user.id)" class="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <span class="text-sm text-gray-700">
          Showing {{ users.length }} of {{ pagination.totalUsers }} users
        </span>
        <div class="flex items-center space-x-2">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1" class="px-3 py-1 border rounded disabled:text-gray-400">Prev</button>
          <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="px-3 py-1 border rounded disabled:text-gray-400">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
