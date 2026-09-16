import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthRequest } from '../middleware/requireAuth';

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.user!.id, req.params.workspaceId, req.body);
      res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectsByWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getProjectsByWorkspace(req.user!.id, req.params.workspaceId);
      res.status(200).json({ success: true, data: { projects } });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProjectById(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const members = await ProjectService.getProjectMembers(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { members } });
    } catch (error) {
      next(error);
    }
  }

  static async addProjectMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.addProjectMember(req.user!.id, req.params.id, req.body);
      res.status(201).json({ success: true, data: { member } });
    } catch (error) {
      next(error);
    }
  }

  static async removeProjectMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.removeProjectMember(req.user!.id, req.params.id, req.params.userId);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getRecentProjects(req.user!.id);
      res.status(200).json({ success: true, data: { projects } });
    } catch (error) {
      next(error);
    }
  }

  static async getStarredProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getStarredProjects(req.user!.id);
      res.status(200).json({ success: true, data: { projects } });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStarProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isStarred = req.body.is_starred === true;
      const result = await ProjectService.toggleStarProject(req.user!.id, req.params.id, isStarred);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(req.user!.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.deleteProject(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}
