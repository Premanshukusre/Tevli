import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { AuthRequest } from '../middleware/requireAuth';

export class ActivityController {
  static async getProjectActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.getProjectActivity(req.user!.id, req.params.projectId);
      res.status(200).json({ success: true, data: { activity } });
    } catch (error) {
      next(error);
    }
  }
}
