import { Server } from 'socket.io';
import { Types } from 'mongoose';

export enum NotificationType {
  PAGE_SHARED = 'page_shared',
  PERMISSION_UPDATED = 'permission_updated',
  COMMENT_ADDED = 'comment_added',
  COMMENT_RESOLVED = 'comment_resolved',
  MENTION = 'mention',
  PAGE_UPDATED = 'page_updated'
}

interface INotification {
  id: string;
  type: NotificationType;
  userId: Types.ObjectId;
  pageId: Types.ObjectId;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      const userId = this.getUserIdFromSocket(socket);
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Track user's socket
      this.addUserSocket(userId, socket.id);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.removeUserSocket(userId, socket.id);
      });

      // Handle notification read status
      socket.on('mark_notification_read', async (notificationId: string) => {
        await this.markNotificationRead(userId, notificationId);
      });

      // Handle clearing all notifications
      socket.on('clear_notifications', async () => {
        await this.clearNotifications(userId);
      });
    });
  }

  private getUserIdFromSocket(socket: any): string | null {
    // Implement your socket authentication logic here
    return socket.handshake.auth.userId || null;
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string): void {
    this.userSockets.get(userId)?.delete(socketId);
    if (this.userSockets.get(userId)?.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  /**
   * Send notification to specific user
   */
  public async sendNotification(
    userId: Types.ObjectId,
    type: NotificationType,
    pageId: Types.ObjectId,
    message: string,
    metadata?: any
  ): Promise<void> {
    const notification: INotification = {
      id: new Types.ObjectId().toString(),
      type,
      userId,
      pageId,
      message,
      metadata,
      read: false,
      createdAt: new Date()
    };

    // Send to all user's sockets
    const userSocketIds = this.userSockets.get(userId.toString());
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        this.io.to(socketId).emit('notification', notification);
      });
    }

    // Store notification in database (implement your storage logic)
    await this.storeNotification(notification);
  }

  /**
   * Send notification to all users with access to a page
   */
  public async sendPageNotification(
    pageId: Types.ObjectId,
    type: NotificationType,
    message: string,
    metadata?: any,
    excludeUserId?: Types.ObjectId
  ): Promise<void> {
    // Get all users with access to the page
    const users = await this.getUsersWithPageAccess(pageId);

    // Send notification to each user
    for (const userId of users) {
      if (!excludeUserId || !userId.equals(excludeUserId)) {
        await this.sendNotification(userId, type, pageId, message, metadata);
      }
    }
  }

  /**
   * Send mention notification
   */
  public async sendMentionNotification(
    mentionedBy: Types.ObjectId,
    mentionedUser: Types.ObjectId,
    pageId: Types.ObjectId,
    blockId: string
  ): Promise<void> {
    const message = `You were mentioned in a comment`;
    const metadata = {
      mentionedBy,
      blockId
    };

    await this.sendNotification(
      mentionedUser,
      NotificationType.MENTION,
      pageId,
      message,
      metadata
    );
  }

  /**
   * Mark notification as read
   */
  private async markNotificationRead(
    userId: string,
    notificationId: string
  ): Promise<void> {
    // Implement your storage update logic here
    
    // Notify user's sockets about the update
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        this.io.to(socketId).emit('notification_updated', {
          id: notificationId,
          read: true
        });
      });
    }
  }

  /**
   * Clear all notifications for a user
   */
  private async clearNotifications(userId: string): Promise<void> {
    // Implement your storage clear logic here

    // Notify user's sockets about the clear
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.forEach(socketId => {
        this.io.to(socketId).emit('notifications_cleared');
      });
    }
  }

  /**
   * Get all users with access to a page
   */
  private async getUsersWithPageAccess(pageId: Types.ObjectId): Promise<Types.ObjectId[]> {
    // Implement your logic to get users with access to the page
    // This should use your PermissionService or directly query your database
    return [];
  }

  /**
   * Store notification in database
   */
  private async storeNotification(notification: INotification): Promise<void> {
    // Implement your storage logic here
    // This could be storing in MongoDB, Redis, etc.
  }
} 