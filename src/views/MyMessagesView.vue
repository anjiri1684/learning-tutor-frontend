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
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <!-- Ambient Background Glow -->
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">

      <!-- Error Banner -->
      <div v-if="error" class="bg-red-900/30 border border-red-500/30 text-red-300 p-4 mb-4 rounded-xl flex items-center gap-2">
         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
         {{ error }}
      </div>

      <!-- Chat Interface Container -->
      <div class="flex flex-grow bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl shadow-purple-900/20 border border-white/10 overflow-hidden">

        <!-- Sidebar: Conversations List -->
        <div class="w-1/3 border-r border-white/10 flex flex-col">
          <div class="p-5 border-b border-white/10 bg-black/20">
            <h1 class="text-xl font-bold text-white tracking-wide">Messages</h1>
          </div>

          <div class="flex-grow overflow-y-auto custom-scrollbar bg-black/10">
            <div v-if="conversations.length > 0">
               <div
                 v-for="convo in conversations"
                 :key="convo.ID"
                 @click="selectConversation(convo)"
                 class="p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 group"
                 :class="{ 'bg-purple-900/20 border-l-4 border-l-purple-500': selectedConversation?.ID === convo.ID }"
               >
                 <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 border border-gray-700 group-hover:border-purple-500/50 transition-colors">
                       {{ getParticipantName(convo).charAt(0).toUpperCase() }}
                    </div>
                    <div>
                       <p class="font-semibold text-gray-200 group-hover:text-white transition-colors">{{ getParticipantName(convo) }}</p>
                       <p class="text-xs text-gray-500 truncate max-w-[150px]">Click to view chat</p>
                    </div>
                 </div>
               </div>
            </div>
            <div v-else class="p-8 text-center text-gray-500">
               <p>No conversations found.</p>
            </div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="w-2/3 flex flex-col bg-black/20">

          <div v-if="selectedConversation" class="flex-grow flex flex-col h-full">
            <!-- Chat Header -->
            <div class="p-5 border-b border-white/10 bg-black/20 flex items-center gap-3 shadow-sm">
               <div class="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {{ getParticipantName(selectedConversation).charAt(0).toUpperCase() }}
               </div>
               <div class="font-bold text-white text-lg">{{ getParticipantName(selectedConversation) }}</div>
            </div>

            <!-- Messages Feed -->
            <div class="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div v-for="msg in messages" :key="msg.ID" class="flex w-full">
                <div
                  :class="[
                    'px-5 py-3 rounded-2xl max-w-md text-sm leading-relaxed shadow-md',
                    msg.sender_id === authStore.user?.id
                      ? 'bg-purple-600 text-white ml-auto rounded-tr-none shadow-purple-900/20'
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  ]"
                >
                  {{ msg.content }}
                </div>
              </div>

              <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-500">
                 <p>No messages yet. Start the conversation!</p>
              </div>
            </div>

            <!-- Input Area -->
            <div class="p-5 border-t border-white/10 bg-gray-900/50">
              <form @submit.prevent="handleSendMessage" class="flex gap-3">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Type a message..."
                  class="flex-grow bg-black/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                />
                <button
                  type="submit"
                  class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  <span>Send</span>
                  <svg class="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            </div>
          </div>

          <!-- Empty State (No Conversation Selected) -->
          <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
             <div class="h-20 w-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                <svg class="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-2">Your Messages</h3>
             <p class="text-sm">Select a conversation from the left to start chatting.</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
