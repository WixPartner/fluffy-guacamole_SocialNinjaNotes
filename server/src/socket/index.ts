import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import DocumentCollaborationService from '../services/DocumentCollaboration';

interface UserSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Initialize collaboration service
  const collaborationService = new DocumentCollaborationService(io);

  // Keep track of connected users
  const connectedUsers = new Map<string, Set<string>>();

  io.on('connection', (socket: UserSocket) => {
    logger.info('New client connected');

    // Handle user authentication
    socket.on('authenticate', (userId: string) => {
      socket.userId = userId;

      // Add user to connected users
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)?.add(socket.id);

      // Broadcast user presence
      io.emit('user_presence', {
        userId,
        status: 'online',
        connectedClients: connectedUsers.get(userId)?.size || 0
      });

      logger.info(`User ${userId} authenticated with socket ${socket.id}`);
    });

    // Handle document collaboration
    socket.on('join_document', async (documentId: string) => {
      if (!socket.userId) {
        return;
      }

      await collaborationService.initializeDocument(documentId);
      collaborationService.handleJoinDocument(socket, documentId, socket.userId);

      // Send current cursor positions to the joining user
      socket.emit('cursor_positions', {
        documentId,
        positions: collaborationService.getCursorPositions(documentId)
      });
    });

    socket.on('leave_document', (documentId: string) => {
      if (!socket.userId) {
        return;
      }

      collaborationService.handleLeaveDocument(socket, documentId, socket.userId);
    });

    socket.on('document_change', (data: {
      documentId: string;
      content: any;
      version: number;
    }) => {
      if (!socket.userId) {
        return;
      }

      collaborationService.handleDocumentUpdate({
        ...data,
        userId: socket.userId
      });
    });

    socket.on('cursor_move', (data: {
      documentId: string;
      position: { line: number; ch: number };
      selection?: {
        anchor: { line: number; ch: number };
        head: { line: number; ch: number };
      };
    }) => {
      if (!socket.userId) {
        return;
      }

      collaborationService.handleCursorUpdate({
        ...data,
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        const userSockets = connectedUsers.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          
          // If no more connections for this user, remove them from connected users
          if (userSockets.size === 0) {
            connectedUsers.delete(socket.userId);
            io.emit('user_presence', {
              userId: socket.userId,
              status: 'offline',
              connectedClients: 0
            });
          } else {
            // Update connected clients count
            io.emit('user_presence', {
              userId: socket.userId,
              status: 'online',
              connectedClients: userSockets.size
            });
          }

          // Clean up document collaborations
          collaborationService.handleDisconnect(socket, socket.userId);
        }
      }
      logger.info('Client disconnected');
    });
  });
}; 