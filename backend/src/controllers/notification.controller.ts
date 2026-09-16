import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getNotifications(req.user!.id);
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    await notificationService.markAsRead(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};
