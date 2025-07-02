import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

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

    try {
      // Check if notification exists
      const notification = await prisma.systemNotification.findUnique({
        where: { id: notificationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Update the notification
      const updateData: any = {};
      if (body.read !== undefined) {
        updateData.isRead = body.read;
        if (body.read) {
          updateData.readAt = new Date();
        }
      }

      const updatedNotification = await prisma.systemNotification.update({
        where: { id: notificationId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        notification: {
          id: updatedNotification.id,
          title: updatedNotification.title,
          message: updatedNotification.message,
          type: updatedNotification.notificationType,
          timestamp: updatedNotification.createdAt.toISOString(),
          read: updatedNotification.isRead,
          readAt: updatedNotification.readAt?.toISOString() || null,
          actionUrl: updatedNotification.relatedEntityId ? `/documents/${updatedNotification.relatedEntityId}` : null
        },
        message: 'Notification updated successfully',
        mockData: false
      });

    } catch (error) {
      console.error('Error updating notification in database:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

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

    try {
      // Check if notification exists
      const notification = await prisma.systemNotification.findUnique({
        where: { id: notificationId }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Delete the notification
      await prisma.systemNotification.delete({
        where: { id: notificationId }
      });

      return NextResponse.json({
        message: 'Notification deleted successfully',
        mockData: false
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      );
    }

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

    try {
      const notification = await prisma.systemNotification.findUnique({
        where: { id: notificationId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        notification: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.notificationType,
          timestamp: notification.createdAt.toISOString(),
          read: notification.isRead,
          readAt: notification.readAt?.toISOString() || null,
          actionUrl: notification.relatedEntityId ? `/documents/${notification.relatedEntityId}` : null
        },
        mockData: false
      });

    } catch (error) {
      console.error('Error fetching notification:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
} 