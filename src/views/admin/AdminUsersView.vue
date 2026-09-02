<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const ADMIN_PERMISSION_OPTIONS: { section: string; label: string }[] = [
  { section: 'dashboard', label: 'Dashboard' },
  { section: 'users', label: 'User Management' },
  { section: 'teacher-applications', label: 'Teacher Applications' },
  { section: 'bookings', label: 'Booking Management' },
  { section: 'languages', label: 'Language Management' },
  { section: 'bundles', label: 'Class Bundles' },
  { section: 'corporate-enquiries', label: 'Corporate Enquiries' },
  { section: 'requests', label: 'Requests' },
  { section: 'exams', label: 'Exam Management' },
  { section: 'payouts', label: 'Payout Requests' },
  { section: 'refunds', label: 'Refund Requests' },
  { section: 'payments', label: 'Payment History' },
  { section: 'reviews', label: 'Review Management' },
  { section: 'reports', label: 'Reports' },
  { section: 'library', label: 'Resource Library' },
  { section: 'audit-log', label: 'Audit Log' },
];

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

const showCreateModal = ref(false);
const showEditModal = ref(false);
const isSaving = ref(false);
const formError = ref('');
const editingUser = ref<any>(null);

const showImportModal = ref(false);
const importFile = ref<File | null>(null);
const isImporting = ref(false);
const importResult = ref<{ created: any[]; skipped: any[] } | null>(null);
const importError = ref('');

const selectedUserIds = ref<Set<string>>(new Set());
const showEmailModal = ref(false);
const isSendingEmail = ref(false);
const emailError = ref('');
const emailResult = ref<string | null>(null);
const emailForm = ref({
  manualEmails: '',
  subject: '',
  message: '',
  toAllStudents: false,
  toAllTeachers: false,
});

const toggleUserSelected = (userId: string) => {
  if (selectedUserIds.value.has(userId)) {
    selectedUserIds.value.delete(userId);
  } else {
    selectedUserIds.value.add(userId);
  }
  selectedUserIds.value = new Set(selectedUserIds.value);
};

const openEmailModal = () => {
  emailForm.value = { manualEmails: '', subject: '', message: '', toAllStudents: false, toAllTeachers: false };
  emailError.value = '';
  emailResult.value = null;
  showEmailModal.value = true;
};

const submitSendEmail = async () => {
  const manualEmails = emailForm.value.manualEmails
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
  const roles: string[] = [];
  if (emailForm.value.toAllStudents) roles.push('student');
  if (emailForm.value.toAllTeachers) roles.push('teacher');
  const userIds = Array.from(selectedUserIds.value);

  if (manualEmails.length === 0 && roles.length === 0 && userIds.length === 0) {
    emailError.value = 'Select at least one recipient (checkbox, typed email, or role).';
    return;
  }
  if (!emailForm.value.subject.trim() || !emailForm.value.message.trim()) {
    emailError.value = 'Subject and message are required.';
    return;
  }

  isSendingEmail.value = true;
  emailError.value = '';
  emailResult.value = null;
  try {
    const response = await api.post('/admin/send-email', {
      emails: manualEmails,
      user_ids: userIds,
      roles,
      subject: emailForm.value.subject,
      message: emailForm.value.message,
    });
    emailResult.value = response.data.message;
    selectedUserIds.value = new Set();
  } catch (error: any) {
    emailError.value = error?.response?.data?.error || 'Failed to send email.';
  } finally {
    isSendingEmail.value = false;
  }
};

const createForm = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'student',
  headline: '',
  bio: '',
  admin_permissions: [] as string[],
});

const editForm = ref({
  full_name: '',
  email: '',
  role: 'student',
  admin_permissions: [] as string[],
});

const openCreateModal = () => {
  createForm.value = { full_name: '', email: '', password: '', role: 'student', headline: '', bio: '', admin_permissions: [] };
  formError.value = '';
  showCreateModal.value = true;
};

const submitCreateUser = async () => {
  isSaving.value = true;
  formError.value = '';
  try {
    const payload = {
      ...createForm.value,
      admin_permissions:
        createForm.value.role === 'coach' ? createForm.value.admin_permissions : [],
    };
    await api.post('/admin/users', payload);
    showCreateModal.value = false;
    await fetchUsers();
  } catch (error: any) {
    formError.value = error?.response?.data?.error || 'Failed to create user.';
  } finally {
    isSaving.value = false;
  }
};

const openImportModal = () => {
  importFile.value = null;
  importResult.value = null;
  importError.value = '';
  showImportModal.value = true;
};

const handleImportFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  importFile.value = target.files && target.files[0] ? target.files[0] : null;
};

const submitImport = async () => {
  if (!importFile.value) return;
  isImporting.value = true;
  importError.value = '';
  importResult.value = null;
  try {
    const formData = new FormData();
    formData.append('file', importFile.value);
    const response = await api.post('/admin/users/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    importResult.value = { created: response.data.created || [], skipped: response.data.skipped || [] };
    await fetchUsers();
  } catch (error: any) {
    importError.value = error.response?.data?.error || 'Failed to import users.';
  } finally {
    isImporting.value = false;
  }
};

const openEditModal = (user: any) => {
  editingUser.value = user;
  let perms: string[] = [];
  if (user.admin_permissions) {
    try {
      const parsed = JSON.parse(user.admin_permissions);
      if (Array.isArray(parsed)) perms = parsed;
    } catch {
      /* ignore */
    }
  }
  editForm.value = { full_name: user.full_name, email: user.email, role: user.role, admin_permissions: perms };
  formError.value = '';
  showEditModal.value = true;
};

const submitEditUser = async () => {
  if (!editingUser.value) return;
  isSaving.value = true;
  formError.value = '';
  try {
    const payload = {
      ...editForm.value,
      admin_permissions:
        editForm.value.role === 'coach' ? editForm.value.admin_permissions : [],
    };
    await api.put(`/admin/users/${editingUser.value.id}`, payload);
    showEditModal.value = false;
    await fetchUsers();
  } catch (error: any) {
    formError.value = error?.response?.data?.error || 'Failed to update user.';
  } finally {
    isSaving.value = false;
  }
};

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
  if (confirm('Are you sure you want to permanently delete this user and all their data? This action cannot be undone.')) {
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user.');
    }
  }
};

const isImpersonating = ref(false);
const handleImpersonate = async (user: any) => {
  if (!confirm(`View the platform as ${user.full_name}? You'll be able to return to your admin account at any time.`)) return;
  isImpersonating.value = true;
  try {
    const response = await api.post(`/admin/users/${user.id}/impersonate`);
    await authStore.startImpersonation(response.data.token, response.data.user);
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to impersonate user.');
  } finally {
    isImpersonating.value = false;
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

        <div class="flex items-center gap-3 w-full md:w-auto">
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
          <button
            @click="openCreateModal"
            class="whitespace-nowrap px-4 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-500/30 transition-all"
          >
            + Create User
          </button>
          <button
            @click="openImportModal"
            class="whitespace-nowrap px-4 py-2.5 text-sm font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white transition-all"
          >
            Bulk Import (CSV)
          </button>
          <button
            @click="openEmailModal"
            class="whitespace-nowrap px-4 py-2.5 text-sm font-bold text-gray-300 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white transition-all"
          >
            Send Email<span v-if="selectedUserIds.size > 0"> ({{ selectedUserIds.size }})</span>
          </button>
        </div>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                <th class="p-4 font-semibold w-10"></th>
                <th class="p-4 font-semibold">Name</th>
                <th class="p-4 font-semibold">Email</th>
                <th class="p-4 font-semibold">Role</th>
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
                    <span class="text-sm text-gray-400">Loading users...</span>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="user in users" :key="user.id" class="hover:bg-white/5 transition-colors group">
                <td class="p-4">
                  <input
                    type="checkbox"
                    :checked="selectedUserIds.has(user.id)"
                    @change="toggleUserSelected(user.id)"
                    class="h-4 w-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500"
                  />
                </td>
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
                             user.role === 'coach' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
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
                    @click="openEditModal(user)"
                    class="text-xs font-medium text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Edit
                  </button>

                  <button
                    v-if="user.id !== authStore.user?.id"
                    :disabled="isImpersonating"
                    @click="handleImpersonate(user)"
                    class="text-xs font-medium text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    View As
                  </button>

                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="handleDeleteUser(user.id)"
                    class="text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="!isLoading && users.length === 0">
                 <td colspan="6" class="p-8 text-center text-gray-500">No users found matching your search.</td>
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

    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-2xl overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Create User</h3>
            <div v-if="formError" class="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">{{ formError }}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input v-model="createForm.full_name" type="text" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input v-model="createForm.email" type="email" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input v-model="createForm.password" type="password" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select v-model="createForm.role" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="coach">Coach (limited admin)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>
              <div v-if="createForm.role === 'teacher'">
                <label class="block text-sm font-medium text-gray-300 mb-2">Headline</label>
                <input v-model="createForm.headline" type="text" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div v-if="createForm.role === 'teacher'" class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea v-model="createForm.bio" rows="2" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
              </div>

              <div v-if="createForm.role === 'coach'" class="sm:col-span-2 border-t border-gray-800 pt-4">
                <p class="text-sm font-medium text-gray-200">Areas this coach can access</p>
                <p class="mt-1 text-xs text-gray-500">The coach only sees the sections you tick here when they log in.</p>
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label v-for="opt in ADMIN_PERMISSION_OPTIONS" :key="opt.section" class="flex items-center gap-2 text-sm text-gray-300 bg-black/30 border border-white/5 rounded-lg px-3 py-2">
                    <input type="checkbox" :value="opt.section" v-model="createForm.admin_permissions" class="h-4 w-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500" />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <div class="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button @click="showCreateModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                <button @click="submitCreateUser" :disabled="isSaving" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                  {{ isSaving ? 'Creating...' : 'Create User' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2">Bulk Import Users (CSV)</h3>
            <p class="text-sm text-gray-400 mb-4">
              Columns: <code class="text-purple-300">full_name,email,password,role</code> (role must be <code class="text-purple-300">student</code> or <code class="text-purple-300">teacher</code>). A header row is optional.
            </p>

            <div v-if="importError" class="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">{{ importError }}</div>

            <input type="file" accept=".csv,text/csv" @change="handleImportFileSelect" class="w-full text-sm text-gray-300 mb-4" />

            <div v-if="importResult" class="mb-4 space-y-2 max-h-64 overflow-y-auto">
              <p class="text-sm text-green-400">Created {{ importResult.created.length }} user(s).</p>
              <div v-if="importResult.skipped.length > 0">
                <p class="text-sm text-yellow-400 mb-1">Skipped {{ importResult.skipped.length }}:</p>
                <div v-for="s in importResult.skipped" :key="s.row" class="text-xs text-gray-400 bg-black/30 border border-white/5 rounded px-2 py-1 mb-1">
                  Row {{ s.row }}<span v-if="s.email"> ({{ s.email }})</span>: {{ s.reason }}
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="showImportModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Close</button>
              <button @click="submitImport" :disabled="isImporting || !importFile" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                {{ isImporting ? 'Importing...' : 'Import' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Edit User</h3>
            <div v-if="formError" class="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">{{ formError }}</div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input v-model="editForm.full_name" type="text" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input v-model="editForm.email" type="email" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select v-model="editForm.role" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="coach">Coach (limited admin)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>

              <div v-if="editForm.role === 'coach'" class="border-t border-gray-800 pt-4">
                <p class="text-sm font-medium text-gray-200">Areas this coach can access</p>
                <p class="mt-1 text-xs text-gray-500">The coach only sees the sections you tick here when they log in.</p>
                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label v-for="opt in ADMIN_PERMISSION_OPTIONS" :key="opt.section" class="flex items-center gap-2 text-sm text-gray-300 bg-black/30 border border-white/5 rounded-lg px-3 py-2">
                    <input type="checkbox" :value="opt.section" v-model="editForm.admin_permissions" class="h-4 w-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500" />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button @click="showEditModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                <button @click="submitEditUser" :disabled="isSaving" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEmailModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-xl overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2">Send Email</h3>
            <p class="text-sm text-gray-400 mb-4">
              Send to users checked in the table, emails typed below, and/or an entire role.
            </p>

            <div v-if="emailError" class="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm">{{ emailError }}</div>
            <div v-if="emailResult" class="mb-4 p-3 rounded-lg bg-green-900/30 border border-green-500/30 text-green-300 text-sm">{{ emailResult }}</div>

            <div class="space-y-4">
              <div v-if="selectedUserIds.size > 0" class="text-sm text-purple-300">
                {{ selectedUserIds.size }} user(s) selected from the table.
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Additional Emails (comma or newline separated)</label>
                <textarea
                  v-model="emailForm.manualEmails"
                  rows="3"
                  placeholder="jane@example.com, john@example.com"
                  class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div class="flex gap-6">
                <label class="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" v-model="emailForm.toAllStudents" class="h-4 w-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500" />
                  All Students
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" v-model="emailForm.toAllTeachers" class="h-4 w-4 rounded border-gray-600 bg-black/50 text-purple-600 focus:ring-purple-500" />
                  All Teachers
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <input v-model="emailForm.subject" type="text" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea v-model="emailForm.message" rows="6" class="w-full px-4 py-2.5 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button @click="showEmailModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Close</button>
                <button @click="submitSendEmail" :disabled="isSendingEmail" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                  {{ isSendingEmail ? 'Sending...' : 'Send Email' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
