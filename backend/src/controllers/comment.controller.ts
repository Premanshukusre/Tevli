import { Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthRequest } from '../middleware/requireAuth';

export class CommentController {
  static async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.getCommentsForTask(req.user!.id, req.params.taskId);
      res.status(200).json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  static async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.createComment(req.user!.id, req.params.taskId, req.body);
      res.status(201).json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  static async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.updateComment(req.user!.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await CommentService.deleteComment(req.user!.id, req.params.id);
      res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }
}
