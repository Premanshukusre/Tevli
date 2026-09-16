import { Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { AuthRequest } from '../middleware/requireAuth';

export class WorkspaceController {
  static async createWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await WorkspaceService.createWorkspace(req.user!.id, req.body);
      res.status(201).json({ success: true, data: { workspace } });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaces(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspaces = await WorkspaceService.getWorkspacesByUser(req.user!.id);
      res.status(200).json({ success: true, data: { workspaces } });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { workspace } });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaceMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const members = await WorkspaceService.getWorkspaceMembers(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { members } });
    } catch (error) {
      next(error);
    }
  }

  static async addWorkspaceMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await WorkspaceService.addWorkspaceMember(req.user!.id, req.params.id, req.body);
      res.status(201).json({ success: true, data: { member } });
    } catch (error) {
      next(error);
    }
  }

  static async removeWorkspaceMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await WorkspaceService.removeWorkspaceMember(req.user!.id, req.params.id, req.params.userId);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await WorkspaceService.updateWorkspace(req.user!.id, req.params.id, req.body);
      res.status(200).json({ success: true, data: { workspace } });
    } catch (error) {
      next(error);
    }
  }

  static async deleteWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await WorkspaceService.deleteWorkspace(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}
