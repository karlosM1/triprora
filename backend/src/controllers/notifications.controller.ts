import type { Request, Response } from 'express'
import { NotificationModel } from '../models/notification.model.js'

export async function listMyNotifications(req: Request, res: Response) {
  const [notifications, unreadCount] = await Promise.all([
    NotificationModel.listForUser(req.profile!.id),
    NotificationModel.unreadCount(req.profile!.id),
  ])

  res.json({ notifications, unreadCount })
}

export async function markNotificationRead(req: Request, res: Response) {
  const notification = await NotificationModel.markRead(
    req.profile!.id,
    req.params.notificationId,
  )
  res.json(notification)
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  const updated = await NotificationModel.markAllRead(req.profile!.id)
  res.json({ updated })
}
