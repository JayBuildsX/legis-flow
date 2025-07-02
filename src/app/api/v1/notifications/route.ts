import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const onlyUnread = url.searchParams.get('unread') === 'true';

    try {
      // Get notifications from database
      const where = onlyUnread ? { isRead: false } : {};
      
      const notifications = await prisma.systemNotification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
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

      const unreadCount = await prisma.systemNotification.count({
        where: { isRead: false }
      });

      const formattedNotifications = notifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.notificationType,
        timestamp: notif.createdAt.toISOString(),
        read: notif.isRead,
        actionUrl: notif.relatedEntityId ? `/documents/${notif.relatedEntityId}` : null
      }));

      return NextResponse.json({
        notifications: formattedNotifications,
        total: formattedNotifications.length,
        unreadCount,
        mockData: false
      });

    } catch (error) {
      console.error('Error fetching notifications from database:', error);
      
      // Return empty notifications instead of mock data
      return NextResponse.json({
        notifications: [],
        total: 0,
        unreadCount: 0,
        mockData: false,
        message: 'Database unavailable. Please try again later.'
      });
    }

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
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    try {
      const newNotification = await prisma.systemNotification.create({
        data: {
          title: body.title,
          message: body.message,
          notificationType: body.type || 'info',
          relatedEntityType: body.entityType,
          relatedEntityId: body.entityId,
          userId: 'admin-user-id', // Should come from JWT token
          priority: body.priority || 'MEDIUM'
        }
      });

      return NextResponse.json({
        notification: {
          id: newNotification.id,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.notificationType,
          timestamp: newNotification.createdAt.toISOString(),
          read: newNotification.isRead,
          actionUrl: newNotification.relatedEntityId ? `/documents/${newNotification.relatedEntityId}` : null
        },
        message: 'Notification created successfully',
        mockData: false
      }, { status: 201 });

    } catch (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/notifications
 * Mark all notifications as read
 */
export async function PUT(request: NextRequest) {
  try {
    await prisma.systemNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    return NextResponse.json({
      message: 'All notifications marked as read',
      mockData: false
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
} 