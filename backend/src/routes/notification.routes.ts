import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.post('/read-all', markAllAsRead);
router.post('/:id/read', markAsRead);

export default router;
