import { io, Socket } from 'socket.io-client';

export interface DocumentChange {
  type: 'insert' | 'delete' | 'retain';
  length?: number;
  text?: string;
  position: number;
  userId: string;
  timestamp: number;
}

export interface UserCursor {
  userId: string;
  userName: string;
  position: number;
  color: string;
  selection?: {
    start: number;
    end: number;
  };
}

export interface CollaborativeSession {
  documentId: string;
  userId: string;
  userName: string;
  isActive: boolean;
  connectedUsers: UserCursor[];
  documentContent: string;
  version: number;
}

export interface OperationalTransform {
  operation: DocumentChange;
  transformedPosition: number;
  conflicts: DocumentChange[];
}

/**
 * Collaborative Editing Service
 * Handles real-time document collaboration using operational transforms
 */
export class CollaborativeEditingService {
  private socket: Socket | null = null;
  private currentSession: CollaborativeSession | null = null;
  private pendingOperations: DocumentChange[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Event handlers
  private onContentChangeHandler?: (content: string, change: DocumentChange) => void;
  private onCursorChangeHandler?: (cursors: UserCursor[]) => void;
  private onUserJoinHandler?: (user: UserCursor) => void;
  private onUserLeaveHandler?: (userId: string) => void;
  private onConnectionStatusHandler?: (status: 'connected' | 'disconnected' | 'reconnecting') => void;

  /**
   * Initialize collaborative editing session
   */
  async initializeSession(documentId: string, userId: string, userName: string): Promise<boolean> {
    try {
      // Initialize WebSocket connection
      this.socket = io('/collaborative', {
        auth: {
          token: localStorage.getItem('auth_token'),
          documentId,
          userId,
          userName
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000
      });

      // Set up event listeners
      this.setupSocketListeners();

      // Join document session
      return new Promise((resolve, reject) => {
        this.socket?.emit('join-document', { documentId, userId, userName }, (response: any) => {
          if (response.success) {
            this.currentSession = {
              documentId,
              userId,
              userName,
              isActive: true,
              connectedUsers: response.connectedUsers || [],
              documentContent: response.documentContent || '',
              version: response.version || 0
            };
            this.isConnected = true;
            this.onConnectionStatusHandler?.('connected');
            resolve(true);
          } else {
            reject(new Error(response.error || 'Failed to join document session'));
          }
        });
      });

    } catch (error) {
      console.error('[COLLABORATIVE] Error initializing session:', error);
      return false;
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[COLLABORATIVE] Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnectionStatusHandler?.('connected');

      // Send any pending operations
      this.flushPendingOperations();
    });

    this.socket.on('disconnect', () => {
      console.log('[COLLABORATIVE] Disconnected from server');
      this.isConnected = false;
      this.onConnectionStatusHandler?.('disconnected');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[COLLABORATIVE] Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
      this.onConnectionStatusHandler?.('reconnecting');
    });

    // Document collaboration events
    this.socket.on('document-change', (change: DocumentChange) => {
      this.applyRemoteChange(change);
    });

    this.socket.on('cursor-update', (cursors: UserCursor[]) => {
      if (this.currentSession) {
        this.currentSession.connectedUsers = cursors;
        this.onCursorChangeHandler?.(cursors);
      }
    });

    this.socket.on('user-joined', (user: UserCursor) => {
      console.log(`[COLLABORATIVE] User joined: ${user.userName}`);
      if (this.currentSession) {
        this.currentSession.connectedUsers.push(user);
        this.onUserJoinHandler?.(user);
      }
    });

    this.socket.on('user-left', (userId: string) => {
      console.log(`[COLLABORATIVE] User left: ${userId}`);
      if (this.currentSession) {
        this.currentSession.connectedUsers = this.currentSession.connectedUsers.filter(u => u.userId !== userId);
        this.onUserLeaveHandler?.(userId);
      }
    });

    this.socket.on('operation-acknowledged', (operationId: string) => {
      // Remove acknowledged operation from pending list
      this.pendingOperations = this.pendingOperations.filter(op => 
        (op as any).operationId !== operationId
      );
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('[COLLABORATIVE] Socket error:', error);
    });

    this.socket.on('collaborative-error', (error: any) => {
      console.error('[COLLABORATIVE] Collaboration error:', error);
    });
  }

  /**
   * Apply a text change to the document
   */
  applyChange(change: DocumentChange): boolean {
    if (!this.currentSession || !this.isConnected) {
      // Store for later if not connected
      this.pendingOperations.push(change);
      return false;
    }

    try {
      // Generate unique operation ID
      const operationId = `${this.currentSession.userId}-${Date.now()}-${Math.random()}`;
      const changeWithId = { ...change, operationId } as any;

      // Apply locally first (optimistic update)
      this.applyLocalChange(change);

      // Send to server
      this.socket?.emit('document-change', changeWithId);

      // Add to pending operations for conflict resolution
      this.pendingOperations.push(changeWithId);

      return true;
    } catch (error) {
      console.error('[COLLABORATIVE] Error applying change:', error);
      return false;
    }
  }

  /**
   * Apply local change to document content
   */
  private applyLocalChange(change: DocumentChange): void {
    if (!this.currentSession) return;

    let content = this.currentSession.documentContent;

    switch (change.type) {
      case 'insert':
        if (change.text) {
          content = content.slice(0, change.position) + 
                   change.text + 
                   content.slice(change.position);
        }
        break;

      case 'delete':
        if (change.length) {
          content = content.slice(0, change.position) + 
                   content.slice(change.position + change.length);
        }
        break;

      case 'retain':
        // No content change, just cursor movement
        break;
    }

    this.currentSession.documentContent = content;
    this.currentSession.version++;

    // Notify content change handler
    this.onContentChangeHandler?.(content, change);
  }

  /**
   * Apply remote change with operational transform
   */
  private applyRemoteChange(change: DocumentChange): void {
    if (!this.currentSession) return;

    // Transform the operation against pending local operations
    const transformed = this.transformOperation(change);

    // Apply the transformed operation
    this.applyLocalChange(transformed.operation);
  }

  /**
   * Operational Transform - resolve conflicts between concurrent operations
   */
  private transformOperation(remoteOp: DocumentChange): OperationalTransform {
    let transformedOp = { ...remoteOp };
    const conflicts: DocumentChange[] = [];

    // Transform against each pending local operation
    for (const localOp of this.pendingOperations) {
      const result = this.transformTwoOperations(transformedOp, localOp);
      transformedOp = result.remote;
      
      if (result.conflict) {
        conflicts.push(result.conflict);
      }
    }

    return {
      operation: transformedOp,
      transformedPosition: transformedOp.position,
      conflicts
    };
  }

  /**
   * Transform two operations against each other
   */
  private transformTwoOperations(op1: DocumentChange, op2: DocumentChange): {
    remote: DocumentChange;
    local: DocumentChange;
    conflict?: DocumentChange;
  } {
    const remote = { ...op1 };
    const local = { ...op2 };

    // Insert vs Insert
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        local.position += op1.text?.length || 0;
      } else {
        remote.position += op2.text?.length || 0;
      }
    }

    // Insert vs Delete
    else if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        local.position += op1.text?.length || 0;
      } else if (op1.position < op2.position + (op2.length || 0)) {
        // Conflict: insert within deleted range
        return {
          remote,
          local,
          conflict: op1
        };
      } else {
        remote.position -= op2.length || 0;
      }
    }

    // Delete vs Insert
    else if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        remote.position += op2.text?.length || 0;
      } else if (op2.position < op1.position + (op1.length || 0)) {
        // Conflict: insert within deleted range
        return {
          remote,
          local,
          conflict: op2
        };
      } else {
        local.position -= op1.length || 0;
      }
    }

    // Delete vs Delete
    else if (op1.type === 'delete' && op2.type === 'delete') {
      if (op1.position + (op1.length || 0) <= op2.position) {
        local.position -= op1.length || 0;
      } else if (op2.position + (op2.length || 0) <= op1.position) {
        remote.position -= op2.length || 0;
      } else {
        // Overlapping deletes - conflict
        return {
          remote,
          local,
          conflict: op1
        };
      }
    }

    return { remote, local };
  }

  /**
   * Update cursor position
   */
  updateCursor(position: number, selection?: { start: number; end: number }): void {
    if (!this.currentSession || !this.socket) return;

    const cursorUpdate: UserCursor = {
      userId: this.currentSession.userId,
      userName: this.currentSession.userName,
      position,
      color: this.getUserColor(this.currentSession.userId),
      selection
    };

    this.socket.emit('cursor-update', cursorUpdate);
  }

  /**
   * Send pending operations when reconnected
   */
  private flushPendingOperations(): void {
    if (!this.socket || this.pendingOperations.length === 0) return;

    console.log(`[COLLABORATIVE] Sending ${this.pendingOperations.length} pending operations`);
    
    for (const operation of this.pendingOperations) {
      this.socket.emit('document-change', operation);
    }
  }

  /**
   * Get consistent color for user
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green  
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16'  // lime
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Event handler setters
   */
  onContentChange(handler: (content: string, change: DocumentChange) => void): void {
    this.onContentChangeHandler = handler;
  }

  onCursorChange(handler: (cursors: UserCursor[]) => void): void {
    this.onCursorChangeHandler = handler;
  }

  onUserJoin(handler: (user: UserCursor) => void): void {
    this.onUserJoinHandler = handler;
  }

  onUserLeave(handler: (userId: string) => void): void {
    this.onUserLeaveHandler = handler;
  }

  onConnectionStatus(handler: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void {
    this.onConnectionStatusHandler = handler;
  }

  /**
   * Get current session info
   */
  getCurrentSession(): CollaborativeSession | null {
    return this.currentSession;
  }

  /**
   * Check if connected
   */
  isConnectedToSession(): boolean {
    return this.isConnected;
  }

  /**
   * Leave document session
   */
  leaveSession(): void {
    if (this.socket) {
      this.socket.emit('leave-document', {
        documentId: this.currentSession?.documentId,
        userId: this.currentSession?.userId
      });
      
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentSession = null;
    this.isConnected = false;
    this.pendingOperations = [];
    this.reconnectAttempts = 0;
  }

  /**
   * Save document content
   */
  async saveDocument(): Promise<boolean> {
    if (!this.currentSession) return false;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const response = await fetch(`/api/v1/documents/${this.currentSession.documentId}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: this.currentSession.documentContent,
          version: this.currentSession.version
        })
      });

      return response.ok;
    } catch (error) {
      console.error('[COLLABORATIVE] Error saving document:', error);
      return false;
    }
  }
} 