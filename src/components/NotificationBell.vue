<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notifications';

const notificationStore = useNotificationStore();
const router = useRouter();
const isOpen = ref(false);

onMounted(() => {
  notificationStore.startPolling();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  notificationStore.stopPolling();
  document.removeEventListener('click', handleClickOutside);
});

const rootEl = ref<HTMLElement | null>(null);
const handleClickOutside = (event: MouseEvent) => {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    notificationStore.fetchNotifications();
  }
};

const handleNotificationClick = async (notification: any) => {
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id);
  }
  isOpen.value = false;
  if (notification.link) {
    router.push(notification.link);
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
};
</script>

<template>
  <div ref="rootEl" class="relative">
    <button @click="toggleOpen" class="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-purple-500/30"
      >
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50"
    >
      <div class="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900">
        <h3 class="font-bold text-white text-sm">Notifications</h3>
        <button
          v-if="notificationStore.unreadCount > 0"
          @click="notificationStore.markAllAsRead"
          class="text-xs text-purple-400 hover:text-purple-300"
        >
          Mark all read
        </button>
      </div>
      <div v-if="notificationStore.notifications.length === 0" class="p-6 text-center text-gray-500 text-sm">
        No notifications yet.
      </div>
      <button
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        class="w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3"
        :class="!notification.read_at ? 'bg-purple-900/10' : ''"
      >
        <span
          class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
          :class="!notification.read_at ? 'bg-purple-500 shadow-[0_0_6px_#a855f7]' : 'bg-gray-700'"
        ></span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-white truncate">{{ notification.title }}</p>
          <p class="text-xs text-gray-400 line-clamp-2 mt-0.5">{{ notification.body }}</p>
          <p class="text-[10px] text-gray-600 mt-1">{{ formatTime(notification.created_at) }}</p>
        </div>
      </button>
    </div>
  </div>
</template>
