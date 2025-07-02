'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CollaborativeEditingService, 
  DocumentChange, 
  UserCursor, 
  CollaborativeSession 
} from '@/lib/collaborativeEditing';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Edit3,
  Clock,
  UserCheck
} from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'reconnecting';
  message: string;
}

export default function CollaborativeEditor({ 
  documentId, 
  initialContent = '', 
  readOnly = false,
  onSave,
  onContentChange 
}: CollaborativeEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [collaborativeService] = useState(() => new CollaborativeEditingService());
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserCursor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    message: 'Not connected'
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositions = useRef<Map<string, number>>(new Map());

  // Initialize collaborative session
  useEffect(() => {
    if (!user || !documentId) return;

    initializeCollaboration();

    return () => {
      collaborativeService.leaveSession();
    };
  }, [documentId, user]);

  const initializeCollaboration = async () => {
    if (!user) return;

    try {
      setIsInitializing(true);
      setError(null);

      // Set up event handlers
      collaborativeService.onContentChange((newContent, change) => {
        setContent(newContent);
        setHasUnsavedChanges(true);
        onContentChange?.(newContent);
      });

      collaborativeService.onCursorChange((cursors) => {
        setConnectedUsers(cursors.filter(c => c.userId !== user.id));
      });

      collaborativeService.onUserJoin((userCursor) => {
        console.log(`User joined: ${userCursor.userName}`);
      });

      collaborativeService.onUserLeave((userId) => {
        console.log(`User left: ${userId}`);
      });

      collaborativeService.onConnectionStatus((status) => {
        setConnectionStatus({
          status,
          message: status === 'connected' ? 'Connected' : 
                  status === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'
        });
      });

      // Initialize session
      const success = await collaborativeService.initializeSession(
        documentId,
        user.id,
        user.name || user.username || 'Unknown User'
      );

      if (success) {
        const currentSession = collaborativeService.getCurrentSession();
        setSession(currentSession);
        
        // Use initial content from session if available
        if (currentSession?.documentContent) {
          setContent(currentSession.documentContent);
        } else if (initialContent) {
          setContent(initialContent);
        }
      } else {
        setError('Failed to join collaborative session');
      }

    } catch (error) {
      console.error('Error initializing collaboration:', error);
      setError('Failed to connect to collaborative editing');
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle text area content changes
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    const newContent = event.target.value;
    const cursorPosition = event.target.selectionStart;

    // Calculate the change
    const oldContent = content;
    const change = calculateChange(oldContent, newContent, cursorPosition);

    if (change) {
      // Apply the change through collaborative service
      collaborativeService.applyChange({
        ...change,
        userId: user?.id || 'unknown',
        timestamp: Date.now()
      });
    }

    // Update cursor position
    collaborativeService.updateCursor(cursorPosition);
    
  }, [content, readOnly, user, collaborativeService]);

  // Calculate document change between old and new content
  const calculateChange = (oldContent: string, newContent: string, cursorPosition: number): DocumentChange | null => {
    if (oldContent === newContent) return null;

    // Simple diff calculation
    if (newContent.length > oldContent.length) {
      // Text was inserted
      const insertPosition = findInsertPosition(oldContent, newContent);
      const insertedText = newContent.slice(insertPosition, insertPosition + (newContent.length - oldContent.length));
      
      return {
        type: 'insert',
        position: insertPosition,
        text: insertedText,
        userId: user?.id || 'unknown',
        timestamp: Date.now()
      };
    } else {
      // Text was deleted
      const deletePosition = findDeletePosition(oldContent, newContent);
      const deleteLength = oldContent.length - newContent.length;
      
      return {
        type: 'delete',
        position: deletePosition,
        length: deleteLength,
        userId: user?.id || 'unknown',
        timestamp: Date.now()
      };
    }
  };

  // Find where text was inserted
  const findInsertPosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return oldContent.length;
  };

  // Find where text was deleted
  const findDeletePosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return newContent.length;
  };

  // Handle cursor position changes
  const handleCursorChange = useCallback((event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const cursorPosition = textarea.selectionStart;
    
    collaborativeService.updateCursor(cursorPosition, {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    });
  }, [collaborativeService]);

  // Save document
  const handleSave = async () => {
    try {
      setError(null);
      
      const success = await collaborativeService.saveDocument();
      
      if (success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        onSave?.(content);
      } else {
        setError('Failed to save document');
      }
    } catch (error) {
      setError('Error saving document');
      console.error('Save error:', error);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges]);

  const getConnectionStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'reconnecting':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'secondary';
      case 'reconnecting':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  if (isInitializing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Collaborative Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Connecting to collaborative session...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Collaboration Status Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {getConnectionStatusIcon()}
                <Badge variant={getConnectionStatusBadge() as any}>
                  {connectionStatus.message}
                </Badge>
              </div>

              {/* Connected Users */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {connectedUsers.length + 1} user{connectedUsers.length !== 0 ? 's' : ''} editing
                </span>
              </div>

              {/* User Avatars */}
              <div className="flex -space-x-2">
                {/* Current user */}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#3B82F6' }}
                  title={user?.name || 'You'}
                >
                  {(user?.name || user?.username || 'U')[0].toUpperCase()}
                </div>
                
                {/* Other users */}
                {connectedUsers.slice(0, 4).map((userCursor) => (
                  <div
                    key={userCursor.userId}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: userCursor.color }}
                    title={userCursor.userName}
                  >
                    {userCursor.userName[0].toUpperCase()}
                  </div>
                ))}
                
                {connectedUsers.length > 4 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-bold text-white">
                    +{connectedUsers.length - 4}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              {hasUnsavedChanges ? (
                <Badge variant="outline" className="text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved changes
                </Badge>
              ) : lastSaved ? (
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              ) : null}

              {/* Save Button */}
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!hasUnsavedChanges || readOnly}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Document Content
          </CardTitle>
          <CardDescription>
            {readOnly ? 'Read-only mode' : 'Real-time collaborative editing'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* User Cursors Overlay */}
            {connectedUsers.map((userCursor) => (
              <div
                key={userCursor.userId}
                className="absolute pointer-events-none z-10"
                style={{
                  // Position would be calculated based on cursor position
                  // This is a simplified version
                  top: '10px',
                  left: `${(userCursor.position % 80) * 10}px`
                }}
              >
                <div 
                  className="w-0.5 h-6 bg-current"
                  style={{ color: userCursor.color }}
                />
                <div 
                  className="text-xs px-1 py-0.5 rounded text-white whitespace-nowrap"
                  style={{ backgroundColor: userCursor.color }}
                >
                  {userCursor.userName}
                </div>
              </div>
            ))}

            {/* Text Editor */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleCursorChange}
              onKeyUp={handleCursorChange}
              onMouseUp={handleCursorChange}
              className="w-full h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={readOnly ? "Document content (read-only)" : "Start typing to collaborate..."}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      {session && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Document ID: {session.documentId}</span>
                <span>Version: {session.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Session active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 