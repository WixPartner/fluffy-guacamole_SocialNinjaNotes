import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { PageSharing } from '../models/ShareSettings';
import { Comment } from '../models/Comment';
import { ChangeHistory, ChangeType } from '../models/ChangeHistory';

interface CursorPosition {
  userId: Types.ObjectId;
  pageId: Types.ObjectId;
  blockId?: string;
  position: {
    line: number;
    ch: number;
  };
  selection?: {
    anchor: { line: number; ch: number };
    head: { line: number; ch: number };
  };
}

interface PageUpdate {
  pageId: Types.ObjectId;
  blockId?: string;
  content: any;
  userId: Types.ObjectId;
  version: number;
}

export class CollaborationService {
  private io: Server;
  private activeSessions: Map<string, Set<string>> = new Map(); // pageId -> Set of userIds
  private cursorPositions: Map<string, Map<string, CursorPosition>> = new Map(); // pageId -> (userId -> position)
  private pageVersions: Map<string, number> = new Map(); // pageId -> version

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      // Authenticate socket connection
      const userId = this.authenticateSocket(socket);
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Handle joining page collaboration
      socket.on('join_page', async (pageId: string) => {
        await this.handleJoinPage(socket, pageId, userId);
      });

      // Handle leaving page
      socket.on('leave_page', async (pageId: string) => {
        await this.handleLeavePage(socket, pageId, userId);
      });

      // Handle cursor updates
      socket.on('cursor_update', (position: CursorPosition) => {
        this.handleCursorUpdate(socket, position);
      });

      // Handle page updates
      socket.on('page_update', async (update: PageUpdate) => {
        await this.handlePageUpdate(socket, update);
      });

      // Handle comments
      socket.on('comment_add', async (data: { pageId: string; comment: any }) => {
        await this.handleAddComment(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  private authenticateSocket(socket: Socket): string | null {
    const token = socket.handshake.auth.token;
    // Implement your JWT verification here
    // Return userId if valid, null if invalid
    return token ? 'userId' : null;
  }

  private async handleJoinPage(socket: Socket, pageId: string, userId: string): Promise<void> {
    try {
      // Check permissions
      const sharing = await PageSharing.findOne({ pageId });
      if (!sharing) {
        socket.emit('error', { message: 'Page not found' });
        return;
      }

      const hasAccess = sharing.shareSettings.some(
        setting => setting.userId.toString() === userId
      );

      if (!hasAccess && !sharing.isPublic) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Join socket room
      socket.join(`page:${pageId}`);

      // Track active users
      if (!this.activeSessions.has(pageId)) {
        this.activeSessions.set(pageId, new Set());
      }
      this.activeSessions.get(pageId)?.add(userId);

      // Send current state to user
      const activeUsers = Array.from(this.activeSessions.get(pageId) || []);
      const cursors = Array.from(this.cursorPositions.get(pageId)?.values() || []);

      socket.emit('page_joined', {
        activeUsers,
        cursors,
        version: this.pageVersions.get(pageId) || 0
      });

      // Notify others
      socket.to(`page:${pageId}`).emit('user_joined', {
        userId,
        activeUsers
      });
    } catch (error) {
      console.error('Error joining page:', error);
      socket.emit('error', { message: 'Failed to join page' });
    }
  }

  private async handleLeavePage(socket: Socket, pageId: string, userId: string): Promise<void> {
    try {
      // Remove from active sessions
      this.activeSessions.get(pageId)?.delete(userId);
      if (this.activeSessions.get(pageId)?.size === 0) {
        this.activeSessions.delete(pageId);
      }

      // Remove cursor position
      this.cursorPositions.get(pageId)?.delete(userId);

      // Leave socket room
      socket.leave(`page:${pageId}`);

      // Notify others
      const activeUsers = Array.from(this.activeSessions.get(pageId) || []);
      this.io.to(`page:${pageId}`).emit('user_left', {
        userId,
        activeUsers
      });
    } catch (error) {
      console.error('Error leaving page:', error);
    }
  }

  private handleCursorUpdate(socket: Socket, position: CursorPosition): void {
    const { pageId, userId } = position;
    const pageIdStr = pageId.toString();

    // Store cursor position
    if (!this.cursorPositions.has(pageIdStr)) {
      this.cursorPositions.set(pageIdStr, new Map());
    }
    this.cursorPositions.get(pageIdStr)?.set(userId.toString(), position);

    // Broadcast to others
    socket.to(`page:${pageIdStr}`).emit('cursor_moved', position);
  }

  private async handlePageUpdate(socket: Socket, update: PageUpdate): Promise<void> {
    try {
      const { pageId, content, userId, version, blockId } = update;
      const pageIdStr = pageId.toString();
      const currentVersion = this.pageVersions.get(pageIdStr) || 0;

      // Version conflict check
      if (version < currentVersion) {
        socket.emit('version_conflict', {
          currentVersion,
          serverContent: null // You should implement getting current content
        });
        return;
      }

      // Update version
      this.pageVersions.set(pageIdStr, version + 1);

      // Create change history
      await ChangeHistory.create({
        pageId,
        blockId,
        userId,
        type: blockId ? ChangeType.UPDATE : ChangeType.CREATE,
        newContent: content,
        timestamp: new Date()
      });

      // Update page sharing last edit info
      await PageSharing.findOneAndUpdate(
        { pageId },
        {
          lastEditedBy: userId,
          lastEditedAt: new Date()
        }
      );

      // Broadcast to others
      socket.to(`page:${pageIdStr}`).emit('page_updated', {
        pageId,
        blockId,
        content,
        userId,
        version: version + 1
      });
    } catch (error) {
      console.error('Error handling page update:', error);
      socket.emit('error', { message: 'Failed to update page' });
    }
  }

  private async handleAddComment(socket: Socket, data: { pageId: string; comment: any }): Promise<void> {
    try {
      const { pageId, comment } = data;
      const newComment = await Comment.create(comment);
      await newComment.populate('userId', 'name avatar');

      // Broadcast to all users in the page
      this.io.to(`page:${pageId}`).emit('comment_added', newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      socket.emit('error', { message: 'Failed to add comment' });
    }
  }

  private handleDisconnect(socket: Socket, userId: string): void {
    // Clean up all sessions for this user
    this.activeSessions.forEach((users, pageId) => {
      if (users.has(userId)) {
        this.handleLeavePage(socket, pageId, userId);
      }
    });
  }

  // Public methods for external use
  public getActiveUsers(pageId: string): string[] {
    return Array.from(this.activeSessions.get(pageId) || []);
  }

  public getCursorPositions(pageId: string): CursorPosition[] {
    return Array.from(this.cursorPositions.get(pageId)?.values() || []);
  }
} 