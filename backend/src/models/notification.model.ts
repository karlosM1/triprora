import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/app-error.js'

export type AppNotification = {
  id: string
  type: string
  title: string
  body: string
  data: Prisma.JsonValue | null
  readAt: string | null
  createdAt: string
}

function serialize(
  notification: {
    id: string
    type: string
    title: string
    body: string
    data: Prisma.JsonValue | null
    readAt: Date | null
    createdAt: Date
  },
): AppNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  }
}

export const NotificationModel = {
  async listForUser(userId: string, limit = 30): Promise<AppNotification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    })
    return notifications.map(serialize)
  },

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, readAt: null },
    })
  },

  async markRead(userId: string, notificationId: string): Promise<AppNotification> {
    const existing = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!existing) {
      throw new AppError('Notification not found', 404)
    }

    if (existing.readAt) {
      return serialize(existing)
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    })

    return serialize(updated)
  },

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
    return result.count
  },
}
