import { NextRequest, NextResponse } from 'next/server';

// Mock notifications data
const mockNotifications = [
  {
    id: "notif-001",
    title: "Document mis à jour",
    message: "Le document 'Draft Legislation on Environmental Protection' a été modifié par Jean Dupont.",
    type: "info",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    read: false,
    actionUrl: "/documents/doc-001"
  },
  {
    id: "notif-002", 
    title: "Nouvelle version créée",
    message: "Une nouvelle version du document ENV-2023-001 est disponible pour révision.",
    type: "success",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    read: false,
    actionUrl: "/documents/doc-001"
  },
  {
    id: "notif-003",
    title: "Révision requise",
    message: "Le document 'Policy Framework Update' nécessite votre révision avant publication.",
    type: "warning", 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionUrl: "/documents/doc-002"
  },
  {
    id: "notif-004",
    title: "Signature requise",
    message: "Votre signature est requise pour finaliser le document 'Legal Amendment Draft'.",
    type: "error",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: true,
    actionUrl: "/documents/doc-003"
  },
  {
    id: "notif-005",
    title: "Document publié",
    message: "Le document 'Environmental Compliance Guidelines' a été publié avec succès.",
    type: "success",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionUrl: "/documents/doc-004"
  },
  {
    id: "notif-006",
    title: "Workflow assigné",
    message: "Un nouveau workflow de validation vous a été assigné pour le document 'Budget Proposal 2024'.",
    type: "info",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    read: false,
    actionUrl: "/workflows/workflow-001"
  },
  {
    id: "notif-007",
    title: "Commentaire ajouté",
    message: "Marie Martin a ajouté un commentaire sur votre document 'Technical Specifications'.",
    type: "info", 
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    read: false,
    actionUrl: "/documents/doc-005"
  }
];

// Store read states (in a real app this would be in a database)
let notificationStates = new Map(
  mockNotifications.map(notif => [notif.id, { read: notif.read }])
);

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const onlyUnread = url.searchParams.get('unread') === 'true';

    // Apply read states to notifications
    const notifications = mockNotifications.map(notif => ({
      ...notif,
      read: notificationStates.get(notif.id)?.read ?? notif.read
    }));

    // Filter if needed
    const filteredNotifications = onlyUnread 
      ? notifications.filter(n => !n.read)
      : notifications;

    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications: filteredNotifications,
      total: filteredNotifications.length,
      unreadCount,
      mockData: true
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/notifications
 * Create a new notification (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: body.title || 'New Notification',
      message: body.message || 'A new notification was created',
      type: body.type || 'info',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: body.actionUrl
    };

    mockNotifications.unshift(newNotification);
    notificationStates.set(newNotification.id, { read: false });

    return NextResponse.json({
      notification: newNotification,
      message: 'Notification created successfully',
      mockData: true
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/notifications
 * Bulk operations on notifications
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.markAllAsRead) {
      // Mark all notifications as read
      mockNotifications.forEach(notif => {
        notificationStates.set(notif.id, { read: true });
      });
      
      return NextResponse.json({
        message: 'All notifications marked as read',
        mockData: true
      });
    }

    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
} 