<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLibraryStore } from '@/stores/library';

const libraryStore = useLibraryStore();
const actionMessage = ref({ type: '', text: '' });

const showUploadModal = ref(false);
const uploadForm = ref({ title: '', description: '' });
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);

const showAccessModal = ref(false);
const selectedResource = ref<any>(null);
const emailsInput = ref('');

const showViewerModal = ref(false);
const viewerUrl = ref<string | null>(null);
const viewerTitle = ref('');
const viewerResourceId = ref('');
const isLoadingViewer = ref(false);
const viewerError = ref('');

const noteText = ref('');
const isSavingNote = ref(false);
const noteSavedMessage = ref('');
let noteSaveTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  libraryStore.fetchMyResources();
});

onUnmounted(() => {
  revokeCurrentBlobUrl();
});

const revokeCurrentBlobUrl = () => {
  if (viewerUrl.value) {
    URL.revokeObjectURL(viewerUrl.value);
    viewerUrl.value = null;
  }
};

const openResourceViewer = async (resource: any) => {
  showViewerModal.value = true;
  viewerTitle.value = resource.title;
  viewerResourceId.value = resource.id;
  isLoadingViewer.value = true;
  viewerError.value = '';
  noteText.value = '';
  noteSavedMessage.value = '';
  try {
    const [url, note] = await Promise.all([
      libraryStore.viewResourceBlobUrl(resource.id),
      libraryStore.getResourceNote(resource.id),
    ]);
    revokeCurrentBlobUrl();
    viewerUrl.value = url;
    noteText.value = note;
  } catch (error) {
    console.error('Failed to load resource:', error);
    viewerError.value = 'Failed to load this resource.';
  } finally {
    isLoadingViewer.value = false;
  }
};

const closeViewer = () => {
  showViewerModal.value = false;
  revokeCurrentBlobUrl();
  if (noteSaveTimeout) clearTimeout(noteSaveTimeout);
};

const handleNoteInput = () => {
  noteSavedMessage.value = '';
  if (noteSaveTimeout) clearTimeout(noteSaveTimeout);
  noteSaveTimeout = setTimeout(async () => {
    isSavingNote.value = true;
    const result = await libraryStore.saveResourceNote(viewerResourceId.value, noteText.value);
    isSavingNote.value = false;
    noteSavedMessage.value = result.success ? 'Saved' : 'Failed to save';
  }, 800);
};

const showMessage = (type: string, text: string) => {
  actionMessage.value = { type, text };
  setTimeout(() => (actionMessage.value = { type: '', text: '' }), 3000);
};

const openUploadModal = () => {
  uploadForm.value = { title: '', description: '' };
  selectedFile.value = null;
  showUploadModal.value = true;
};

const handleDeleteResource = async (resource: any) => {
  if (!confirm(`Delete "${resource.title}"? This will remove it for all students who have access. This cannot be undone.`)) return;
  const result = await libraryStore.deleteResource(resource.id);
  if (result.success) {
    showMessage('success', 'Resource deleted.');
    await libraryStore.fetchMyResources();
  } else {
    showMessage('error', result.message || 'Failed to delete resource.');
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files && target.files[0] ? target.files[0] : null;
};

const handleUpload = async () => {
  if (!selectedFile.value || !uploadForm.value.title) return;
  isSubmitting.value = true;
  const result = await libraryStore.uploadResource({
    title: uploadForm.value.title,
    description: uploadForm.value.description,
    file: selectedFile.value,
  });
  isSubmitting.value = false;
  if (result.success) {
    showUploadModal.value = false;
    showMessage('success', 'Resource uploaded successfully.');
    await libraryStore.fetchMyResources();
  } else {
    showMessage('error', result.message || 'Upload failed.');
  }
};

const openAccessModal = (resource: any) => {
  selectedResource.value = resource;
  emailsInput.value = '';
  showAccessModal.value = true;
};

const handleGrantAccess = async () => {
  if (!selectedResource.value || !emailsInput.value.trim()) return;
  const emails = emailsInput.value.split(',').map((e) => e.trim()).filter(Boolean);
  isSubmitting.value = true;
  const result = await libraryStore.grantAccess(selectedResource.value.id, emails);
  isSubmitting.value = false;
  if (result.success) {
    emailsInput.value = '';
    await libraryStore.fetchMyResources();
    selectedResource.value = libraryStore.myResources.find((r: any) => r.id === selectedResource.value.id);

    if (result.granted.length > 0 && result.skipped.length === 0) {
      showMessage('success', `Access granted to ${result.granted.length} student(s).`);
    } else if (result.granted.length > 0 && result.skipped.length > 0) {
      showMessage('error', `Granted to ${result.granted.length}, but skipped: ${result.skipped.map((s: any) => `${s.email} (${s.reason})`).join('; ')}`);
    } else {
      showMessage('error', result.skipped.length > 0
        ? `No access granted. ${result.skipped.map((s: any) => `${s.email}: ${s.reason}`).join('; ')}`
        : 'No valid emails were provided.');
    }
  } else {
    showMessage('error', result.message || 'Failed to grant access.');
  }
};

const handleRevokeAccess = async (email: string) => {
  if (!selectedResource.value) return;
  const result = await libraryStore.revokeAccess(selectedResource.value.id, email);
  if (result.success) {
    showMessage('success', 'Access revoked.');
    await libraryStore.fetchMyResources();
    selectedResource.value = libraryStore.myResources.find((r: any) => r.id === selectedResource.value.id);
  } else {
    showMessage('error', result.message || 'Failed to revoke access.');
  }
};

const activeAccess = (resource: any) => (resource.access || []).filter((a: any) => !a.revoked_at);
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Resource Library (All Uploads)</h1>
        <button @click="openUploadModal" class="px-4 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-500/30 transition-all">
          + Upload Resource
        </button>
      </div>

      <div v-if="actionMessage.text" :class="['mb-6 p-4 rounded-xl border flex items-center gap-3', actionMessage.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300']">
        {{ actionMessage.text }}
      </div>

      <div v-if="libraryStore.isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
        <span class="text-gray-400">Loading resources...</span>
      </div>

      <div v-else-if="libraryStore.myResources.length > 0" class="space-y-4">
        <div v-for="resource in libraryStore.myResources" :key="resource.id" class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <p class="font-bold text-lg text-white">{{ resource.title }}</p>
              <p class="text-sm text-gray-400">{{ resource.description }}</p>
              <p class="text-xs text-gray-500 mt-1">Uploaded by {{ resource.uploader?.full_name || 'Unknown' }} &middot; {{ activeAccess(resource).length }} student(s) with access</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="openResourceViewer(resource)" class="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-all">
                View
              </button>
              <button @click="openAccessModal(resource)" class="px-4 py-2 text-sm font-semibold text-purple-400 bg-purple-900/20 border border-purple-500/20 rounded-lg hover:bg-purple-900/40 transition-all">
                Manage Access
              </button>
              <button @click="handleDeleteResource(resource)" class="px-4 py-2 text-sm font-semibold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">You haven't uploaded any resources yet.</p>
    </div>

    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-4">Upload Resource</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input v-model="uploadForm.title" type="text" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea v-model="uploadForm.description" rows="3" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
              </div>
              <div class="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer relative">
                <input type="file" @change="handleFileSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <p class="text-sm text-gray-300 font-medium" v-if="!selectedFile">Click to select a file</p>
                <p class="text-sm text-purple-400 font-bold" v-else>{{ selectedFile.name }}</p>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button @click="showUploadModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Cancel</button>
                <button @click="handleUpload" :disabled="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                  {{ isSubmitting ? 'Uploading...' : 'Upload' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showAccessModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-lg overflow-hidden">
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2">Manage Access</h3>
            <p class="text-sm text-gray-400 mb-4">{{ selectedResource?.title }}</p>

            <div class="space-y-2 mb-6 max-h-48 overflow-y-auto">
              <div v-for="access in activeAccess(selectedResource)" :key="access.id" class="flex justify-between items-center bg-black/30 border border-white/5 rounded-lg px-3 py-2">
                <span class="text-sm text-gray-300">{{ access.student_email }}</span>
                <button @click="handleRevokeAccess(access.student_email)" class="text-xs font-medium text-red-400 hover:text-red-300">Revoke</button>
              </div>
              <p v-if="activeAccess(selectedResource).length === 0" class="text-sm text-gray-500 text-center py-4">No students have access yet.</p>
            </div>

            <label class="block text-sm font-medium text-gray-300 mb-2">Grant access by email (comma-separated)</label>
            <textarea v-model="emailsInput" rows="2" placeholder="student1@example.com, student2@example.com" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"></textarea>
            <p class="text-xs text-gray-500 mt-2">Students must have an active or completed class with you to be granted access.</p>

            <div class="flex justify-end gap-3 pt-4">
              <button @click="showAccessModal = false" class="px-4 py-2.5 text-sm text-gray-300 hover:text-white">Close</button>
              <button @click="handleGrantAccess" :disabled="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-500 shadow-lg shadow-purple-500/30 disabled:opacity-50">
                Grant Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showViewerModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
          <div class="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white truncate">{{ viewerTitle }}</h3>
            <button @click="closeViewer" class="text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="flex-grow flex overflow-hidden">
            <div class="flex-grow bg-black/40 flex items-center justify-center overflow-hidden">
              <div v-if="isLoadingViewer" class="text-gray-400">Loading...</div>
              <div v-else-if="viewerError" class="text-red-400 p-6 text-center">{{ viewerError }}</div>
              <iframe v-else-if="viewerUrl" :src="viewerUrl" class="w-full h-full border-0"></iframe>
            </div>

            <div class="w-72 border-l border-white/10 bg-gray-900/60 p-4 flex flex-col flex-shrink-0">
              <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-bold text-white">My Notes</h4>
                <span class="text-xs text-gray-500">{{ isSavingNote ? 'Saving...' : noteSavedMessage }}</span>
              </div>
              <textarea
                v-model="noteText"
                @input="handleNoteInput"
                placeholder="Jot down notes about this resource..."
                class="flex-grow w-full px-3 py-2 bg-black/50 border border-gray-700 text-white text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
