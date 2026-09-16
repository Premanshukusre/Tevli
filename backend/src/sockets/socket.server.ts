import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socketAuthMiddleware } from './socket.auth';
import { handleRoomEvents } from './socket.rooms';

export let io: SocketIOServer;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    // Setup room handlers
    handleRoomEvents(socket);

    socket.on('disconnect', () => {
      // Clean up if necessary
    });
  });

  return io;
};
