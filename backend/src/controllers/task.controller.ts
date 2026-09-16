import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthRequest } from '../middleware/requireAuth';

export class TaskController {
  static async getTasksByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await TaskService.getTasksByProject(req.user!.id, req.params.projectId);
      res.status(200).json({ success: true, data: { tasks } });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await TaskService.getMyTasks(req.user!.id);
      res.status(200).json({ success: true, data: { tasks } });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(req.user!.id, req.params.projectId, req.body);
      res.status(201).json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateTask(req.user!.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: { task } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteTask(req.user!.id, req.params.id);
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
