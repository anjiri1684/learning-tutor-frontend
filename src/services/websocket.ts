/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'

let socket: WebSocket | null = null
const isConnected = ref(false)
const messageListeners: ((msg: any) => void)[] = []

export function useWebSocket() {
  const connect = (token: string, retries = 3, delay = 3000) => {
    console.log('Connecting with token:', token)
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.')
      return
    }

    const attemptConnect = (remainingRetries: number) => {
      const socketURL = 'http://localhost:8080/api/v1/ws'
      console.log('Attempting to connect to:', socketURL)
      socket = new WebSocket(socketURL)

      socket.onopen = () => {
        console.log('WebSocket connected.')
        isConnected.value = true
        socket?.send(JSON.stringify({ type: 'auth', token }))
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('Received message:', message)
          messageListeners.forEach((listener) => listener(message))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      socket.onclose = () => {
        console.log('WebSocket disconnected.')
        isConnected.value = false
        socket = null
        if (remainingRetries > 0) {
          console.log(`Retrying connection (${remainingRetries} attempts left)...`)
          setTimeout(() => attemptConnect(remainingRetries - 1), delay)
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        console.log('WebSocket URL:', socketURL)
        console.log('WebSocket readyState:', socket?.readyState)
        isConnected.value = false
      }
    }

    attemptConnect(retries)
  }

  const disconnect = () => {
    socket?.close()
  }

  const sendMessage = (payload: { conversation_id: string; content: string }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
    } else {
      console.error('WebSocket is not connected.')
    }
  }

  const onMessage = (callback: (msg: any) => void) => {
    messageListeners.push(callback)
  }

  return { isConnected, connect, disconnect, sendMessage, onMessage }
}
