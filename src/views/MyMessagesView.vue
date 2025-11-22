<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWebSocket } from '@/services/websocket'
import api from '@/services/api'

const authStore = useAuthStore()
const { connect, disconnect, sendMessage, onMessage } = useWebSocket()

const conversations = ref<any[]>([])
const selectedConversation = ref<any>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const response = await api.get('/conversations')
    conversations.value = response.data
    if (authStore.token) {
      connect(authStore.token)
    }
    onMessage((msg) => {
      if (selectedConversation.value && msg.conversation_id === selectedConversation.value.ID) {
        messages.value.push(msg)
      }
    })
  } catch (err) {
    console.error('Failed to fetch conversations:', err)
    error.value = 'Failed to load conversations. Please try again.'
  }
})

onUnmounted(() => {
  disconnect()
})

const selectConversation = async (convo: any) => {
  try {
    selectedConversation.value = convo
    const response = await api.get(`/conversations/${convo.ID}/messages`)
    messages.value = response.data
    error.value = null
  } catch (err) {
    console.error('Failed to fetch messages:', err)
    error.value = 'Failed to load messages. Please try again.'
  }
}

const handleSendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  sendMessage({
    conversation_id: selectedConversation.value.ID,
    content: newMessage.value,
  })
  newMessage.value = ''
}

const getParticipantName = (convo: any) => {
  const other = convo.Participants.find((p: any) => p.id !== authStore.user?.id)
  return other ? other.full_name : 'Unknown'
}
</script>

<template>
  <div class="container mx-auto p-8 h-[calc(100vh-100px)]">
    <div v-if="error" class="bg-red-100 text-red-700 p-4 mb-4 rounded">{{ error }}</div>
    <div class="flex h-full bg-white rounded-lg shadow-md">
      <div class="w-1/3 border-r border-gray-200">
        <div class="p-4 border-b">
          <h1 class="text-xl font-bold">Conversations</h1>
        </div>
        <div class="overflow-y-auto">
          <div
            v-for="convo in conversations"
            :key="convo.ID"
            @click="selectConversation(convo)"
            class="p-4 border-b cursor-pointer hover:bg-gray-50"
            :class="{ 'bg-indigo-50': selectedConversation?.ID === convo.ID }"
          >
            <p class="font-semibold">{{ getParticipantName(convo) }}</p>
          </div>
        </div>
      </div>
      <div class="w-2/3 flex flex-col">
        <div v-if="selectedConversation" class="flex-grow flex flex-col">
          <div class="p-4 border-b font-bold">{{ getParticipantName(selectedConversation) }}</div>
          <div class="flex-grow p-4 overflow-y-auto">
            <div v-for="msg in messages" :key="msg.ID" class="mb-4">
              <div
                :class="[
                  'p-3 rounded-lg max-w-xs',
                  msg.sender_id === authStore.user?.id ? 'bg-indigo-500 text-white ml-auto' : 'bg-gray-200 text-gray-800',
                ]"
              >
                {{ msg.content }}
              </div>
            </div>
          </div>
          <div class="p-4 border-t">
            <form @submit.prevent="handleSendMessage" class="flex">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-grow border rounded-l-md p-2 focus:outline-none"
              />
              <button type="submit" class="bg-indigo-600 text-white px-4 rounded-r-md">Send</button>
            </form>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-full text-gray-500">
          Select a conversation to start chatting.
        </div>
      </div>
    </div>
  </div>
</template>
