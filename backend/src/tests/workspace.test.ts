import { describe, it, expect, vi } from 'vitest';
import { WorkspaceService } from '../services/workspace.service';
import prisma from '../utils/prisma';

describe('WorkspaceService', () => {
  describe('updateWorkspace', () => {
    it('should allow admin to rename workspace', async () => {
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ role: 'ADMIN' } as any);
      vi.mocked(prisma.workspace.update).mockResolvedValue({ id: 'ws-1', name: 'New Name' } as any);

      const result = await WorkspaceService.updateWorkspace('user-1', 'ws-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should prevent non-admin from renaming workspace', async () => {
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ role: 'MEMBER' } as any);

      await expect(WorkspaceService.updateWorkspace('user-1', 'ws-1', { name: 'New Name' }))
        .rejects.toEqual({ statusCode: 403, message: 'Only workspace admins can rename the workspace' });
    });
  });

  describe('deleteWorkspace', () => {
    it('should allow admin to delete workspace and clean up notifications', async () => {
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ role: 'ADMIN' } as any);
      
      // Mock transaction to immediately invoke the callback
      vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return await (callback as any)(prisma);
      });

      vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: 'proj-1' }] as any);
      vi.mocked(prisma.task.findMany).mockResolvedValue([{ id: 'task-1' }] as any);

      const result = await WorkspaceService.deleteWorkspace('user-1', 'ws-1');
      
      expect(result.success).toBe(true);
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          entity_id: { in: ['ws-1', 'proj-1', 'task-1'] },
          entity_type: { in: ['Workspace', 'Project', 'Task'] }
        }
      });
      expect(prisma.workspace.delete).toHaveBeenCalledWith({
        where: { id: 'ws-1' }
      });
    });

    it('should prevent non-admin from deleting workspace', async () => {
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ role: 'MEMBER' } as any);

      await expect(WorkspaceService.deleteWorkspace('user-1', 'ws-1'))
        .rejects.toEqual({ statusCode: 403, message: 'Only workspace admins can delete the workspace' });
    });
  });
});
