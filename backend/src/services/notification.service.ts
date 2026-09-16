import { NotificationType } from '@prisma/client';
import prisma from '../utils/prisma';

export class NotificationService {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      }
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, user_id: userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
  }

  async createNotification(data: {
    user_id: string;
    actor_id: string;
    type: NotificationType;
    entity_type: string;
    entity_id: string;
    project_id?: string;
    task_id?: string;
  }) {
    if (data.user_id === data.actor_id) return null; // Don't notify self

    return prisma.notification.create({
      data,
    });
  }
}
