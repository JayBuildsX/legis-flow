import { NextRequest, NextResponse } from 'next/server';

// Import the mock data and state from the main notifications route
// In a real app, this would be shared via a service or database
const mockNotifications = [
  {
    id: "notif-001",
    title: "Document mis à jour",
    message: "Le document 'Draft Legislation on Environmental Protection' a été modifié par Jean Dupont.",
    type: "info",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/documents/doc-001"
  },
  {
    id: "notif-002", 
    title: "Nouvelle version créée",
    message: "Une nouvelle version du document ENV-2023-001 est disponible pour révision.",
    type: "success",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/documents/doc-001"
  },
  {
    id: "notif-003",
    title: "Révision requise",
    message: "Le document 'Policy Framework Update' nécessite votre révision avant publication.",
    type: "warning", 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/documents/doc-002"
  },
  {
    id: "notif-004",
    title: "Signature requise",
    message: "Votre signature est requise pour finaliser le document 'Legal Amendment Draft'.",
    type: "error",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: "/documents/doc-003"
  },
  {
    id: "notif-005",
    title: "Document publié",
    message: "Le document 'Environmental Compliance Guidelines' a été publié avec succès.",
    type: "success",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: "/documents/doc-004"
  },
  {
    id: "notif-006",
    title: "Workflow assigné",
    message: "Un nouveau workflow de validation vous a été assigné pour le document 'Budget Proposal 2024'.",
    type: "info",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/workflows/workflow-001"
  },
  {
    id: "notif-007",
    title: "Commentaire ajouté",
    message: "Marie Martin a ajouté un commentaire sur votre document 'Technical Specifications'.",
    type: "info", 
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: "/documents/doc-005"
  }
];

// Store read states (shared with main route)
let notificationStates = new Map(
  mockNotifications.map(notif => [notif.id, { read: notif.read }])
);

/**
 * PATCH /api/v1/notifications/[id]
 * Update a specific notification (e.g., mark as read)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const notificationId = params.id;
    const body = await request.json();

    // Check if notification exists
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update the notification state
    const currentState = notificationStates.get(notificationId) || { read: notification.read };
    
    if (body.read !== undefined) {
      currentState.read = body.read;
      notificationStates.set(notificationId, currentState);
    }

    const updatedNotification = {
      ...notification,
      ...currentState,
      readAt: currentState.read ? new Date().toISOString() : null
    };

    return NextResponse.json({
      notification: updatedNotification,
      message: 'Notification updated successfully',
      mockData: true
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/notifications/[id]
 * Delete a specific notification
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const notificationId = params.id;

    // Check if notification exists
    const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Remove from mock data (in real app, would delete from database)
    mockNotifications.splice(notificationIndex, 1);
    notificationStates.delete(notificationId);

    return NextResponse.json({
      message: 'Notification deleted successfully',
      mockData: true
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/notifications/[id]
 * Get a specific notification
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const notificationId = params.id;

    const notification = mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const currentState = notificationStates.get(notificationId) || { read: notification.read };
    
    const fullNotification = {
      ...notification,
      ...currentState
    };

    return NextResponse.json({
      notification: fullNotification,
      mockData: true
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
} 