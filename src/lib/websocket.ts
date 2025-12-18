import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export interface WebSocketEvents {
  access_code_created: {
    id: string
    code: string
    createdAt: string
    createdBy: string
  }
  access_code_revoked: {
    id: string
    code: string
  }
  access_code_used: {
    id: string
    code: string
    usedAt: string
    usedBy: string
  }
  user_registered: {
    username: string
    profileImageUrl: string
    accessCode: string
  }
}

export const initWebSocket = (server: HTTPServer) => {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized')
  }
  return io
}

export const emitEvent = <K extends keyof WebSocketEvents>(
  event: K,
  data: WebSocketEvents[K]
) => {
  if (io) {
    io.emit(event, data)
  }
}

