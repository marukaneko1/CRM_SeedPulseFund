const { Server } = require('socket.io')
const http = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3001

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res)
  })

  // Create Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Store active users and their typing status
  const activeUsers = new Map()
  const typingUsers = new Map()

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Handle user joining
    socket.on('join_channel', (data) => {
      const { channelId, userId } = data
      socket.join(`channel_${channelId}`)
      activeUsers.set(socket.id, { userId, channelId, type: 'channel' })
      console.log(`User ${userId} joined channel ${channelId}`)
    })

    socket.on('join_direct_chat', (data) => {
      const { chatId, userId } = data
      socket.join(`direct_${chatId}`)
      activeUsers.set(socket.id, { userId, chatId, type: 'direct' })
      console.log(`User ${userId} joined direct chat ${chatId}`)
    })

    // Handle user leaving
    socket.on('leave_channel', (data) => {
      const { channelId, userId } = data
      socket.leave(`channel_${channelId}`)
      console.log(`User ${userId} left channel ${channelId}`)
    })

    socket.on('leave_direct_chat', (data) => {
      const { chatId, userId } = data
      socket.leave(`direct_${chatId}`)
      console.log(`User ${userId} left direct chat ${chatId}`)
    })

    // Handle typing indicators
    socket.on('start_typing', (data) => {
      const { channelId, directChatId, userId, userName } = data
      const room = channelId ? `channel_${channelId}` : `direct_${directChatId}`
      
      typingUsers.set(userId, { userName, timestamp: Date.now() })
      
      // Broadcast to room except sender
      socket.to(room).emit('user_typing', {
        userId,
        userName,
        channelId,
        directChatId
      })
    })

    socket.on('stop_typing', (data) => {
      const { channelId, directChatId, userId } = data
      const room = channelId ? `channel_${channelId}` : `direct_${directChatId}`
      
      typingUsers.delete(userId)
      
      // Broadcast to room except sender
      socket.to(room).emit('user_stop_typing', {
        userId,
        channelId,
        directChatId
      })
    })

    // Handle new messages
    socket.on('send_message', (data) => {
      const { channelId, directChatId, senderId, senderName, ...messageData } = data
      const room = channelId ? `channel_${channelId}` : `direct_${directChatId}`
      
      // Broadcast to room except sender
      socket.to(room).emit('new_message', {
        ...messageData,
        senderId,
        senderName,
        channelId,
        directChatId,
        timestamp: new Date().toISOString()
      })
    })

    // Handle user online/offline status
    socket.on('user_online', (data) => {
      const { userId, userName } = data
      const userInfo = activeUsers.get(socket.id)
      if (userInfo) {
        socket.broadcast.emit('user_online', { userId, userName })
      }
    })

    socket.on('user_offline', (data) => {
      const { userId } = data
      socket.broadcast.emit('user_offline', { userId })
    })

    // Clean up on disconnect
    socket.on('disconnect', () => {
      const userInfo = activeUsers.get(socket.id)
      if (userInfo) {
        const { userId, channelId, chatId, type } = userInfo
        
        // Remove from typing users
        typingUsers.delete(userId)
        
        // Notify others
        if (type === 'channel') {
          socket.to(`channel_${channelId}`).emit('user_offline', { userId })
        } else if (type === 'direct') {
          socket.to(`direct_${chatId}`).emit('user_offline', { userId })
        }
        
        activeUsers.delete(socket.id)
      }
      
      console.log('User disconnected:', socket.id)
    })
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server running on port ${port}`)
  })
})
