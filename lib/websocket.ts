import { io, Socket } from 'socket.io-client'

class WebSocketManager {
  private socket: Socket | null = null
  private isConnected = false

  connect() {
    if (this.socket?.connected) return

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('WebSocket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  joinChannel(channelId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('join_channel', { channelId, userId })
    }
  }

  joinDirectChat(chatId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('join_direct_chat', { chatId, userId })
    }
  }

  leaveChannel(channelId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leave_channel', { channelId, userId })
    }
  }

  leaveDirectChat(chatId: string, userId: string) {
    if (this.socket) {
      this.socket.emit('leave_direct_chat', { chatId, userId })
    }
  }

  sendMessage(data: any) {
    if (this.socket) {
      this.socket.emit('send_message', data)
    }
  }

  startTyping(channelId: string | null, directChatId: string | null, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('start_typing', { channelId, directChatId, userId, userName })
    }
  }

  stopTyping(channelId: string | null, directChatId: string | null, userId: string) {
    if (this.socket) {
      this.socket.emit('stop_typing', { channelId, directChatId, userId })
    }
  }

  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onStopTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback)
    }
  }

  onUserOnline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_online', callback)
    }
  }

  onUserOffline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_offline', callback)
    }
  }

  getSocket() {
    return this.socket
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }
}

export const wsManager = new WebSocketManager()
