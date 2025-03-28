import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { updateDocumentContent } from '../store/slices/documentSlice';

class SocketService {
  private socket: Socket | null = null;
  private documentListeners: Map<string, Function[]> = new Map();

  connect(userId: string) {
    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        userId
      }
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('document_updated', (data: {
      documentId: string;
      content: any;
      version: number;
      userId: string;
    }) => {
      store.dispatch(updateDocumentContent({
        content: data.content,
        version: data.version
      }));
    });

    this.socket.on('cursor_moved', (data: {
      documentId: string;
      userId: string;
      position: { line: number; ch: number };
      selection?: {
        anchor: { line: number; ch: number };
        head: { line: number; ch: number };
      };
    }) => {
      this.documentListeners.get(data.documentId)?.forEach(listener => {
        listener('cursor_moved', data);
      });
    });

    this.socket.on('user_joined', (data: {
      documentId: string;
      userId: string;
      activeUsers: string[];
    }) => {
      this.documentListeners.get(data.documentId)?.forEach(listener => {
        listener('user_joined', data);
      });
    });

    this.socket.on('user_left', (data: {
      documentId: string;
      userId: string;
      activeUsers: string[];
    }) => {
      this.documentListeners.get(data.documentId)?.forEach(listener => {
        listener('user_left', data);
      });
    });
  }

  joinDocument(documentId: string) {
    if (!this.socket) return;
    this.socket.emit('join_document', documentId);
  }

  leaveDocument(documentId: string) {
    if (!this.socket) return;
    this.socket.emit('leave_document', documentId);
  }

  updateDocument(data: {
    documentId: string;
    content: any;
    version: number;
  }) {
    if (!this.socket) return;
    this.socket.emit('document_change', data);
  }

  updateCursor(data: {
    documentId: string;
    position: { line: number; ch: number };
    selection?: {
      anchor: { line: number; ch: number };
      head: { line: number; ch: number };
    };
  }) {
    if (!this.socket) return;
    this.socket.emit('cursor_move', data);
  }

  addDocumentListener(documentId: string, listener: Function) {
    if (!this.documentListeners.has(documentId)) {
      this.documentListeners.set(documentId, []);
    }
    this.documentListeners.get(documentId)?.push(listener);
  }

  removeDocumentListener(documentId: string, listener: Function) {
    const listeners = this.documentListeners.get(documentId);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

export default new SocketService(); 