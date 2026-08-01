<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLibraryStore } from '@/stores/library';

const libraryStore = useLibraryStore();

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
  libraryStore.fetchAccessibleResources();
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

const openResource = async (resource: any) => {
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
    viewerError.value = 'Failed to load this resource. Access may have been revoked.';
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
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">My Library</h1>

      <div v-if="libraryStore.isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
        <span class="text-gray-400">Loading resources...</span>
      </div>

      <div v-else-if="libraryStore.accessibleResources.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="resource in libraryStore.accessibleResources"
          :key="resource.id"
          @click="openResource(resource)"
          class="text-left bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 transition-all"
        >
          <div class="bg-gray-800 p-3 rounded-lg w-fit mb-4 border border-gray-700">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <p class="font-bold text-white">{{ resource.title }}</p>
          <p class="text-sm text-gray-400 mt-1 line-clamp-2">{{ resource.description }}</p>
          <p class="text-xs text-gray-500 mt-3">by {{ resource.uploader?.full_name || 'Your teacher' }}</p>
        </button>
      </div>
      <p v-else class="text-gray-500 bg-black/20 p-6 rounded-xl border border-white/5 border-dashed text-center">No resources have been shared with you yet.</p>
    </div>

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
