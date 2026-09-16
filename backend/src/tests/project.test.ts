import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../services/project.service';
import prisma from '../utils/prisma';

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Recents & Starred', () => {
    it('should update last_accessed when getting a project by ID', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({
        project: { id: 'p-1', name: 'P1' },
        is_starred: false
      } as any);
      
      const updateMock = vi.mocked(prisma.projectMember.update).mockResolvedValue({} as any);

      await ProjectService.getProjectById('u-1', 'p-1');
      
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id_project_id: { user_id: 'u-1', project_id: 'p-1' } },
        data: { last_accessed: expect.any(Date) }
      }));
    });

    it('should return recent projects ordered by last_accessed', async () => {
      vi.mocked(prisma.projectMember.findMany).mockResolvedValue([
        { project: { id: 'p-1', name: 'P1' }, is_starred: true, last_accessed: new Date('2023-01-02') },
        { project: { id: 'p-2', name: 'P2' }, is_starred: false, last_accessed: new Date('2023-01-01') }
      ] as any);

      const projects = await ProjectService.getRecentProjects('u-1');
      expect(projects).toHaveLength(2);
      expect(projects[0].id).toBe('p-1');
      expect(projects[0].is_starred).toBe(true);
      expect(prisma.projectMember.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { last_accessed: 'desc' }
      }));
    });

    it('should fetch only starred projects', async () => {
      vi.mocked(prisma.projectMember.findMany).mockResolvedValue([
        { project: { id: 'p-1', name: 'P1' }, is_starred: true, last_accessed: new Date() }
      ] as any);

      const projects = await ProjectService.getStarredProjects('u-1');
      expect(projects).toHaveLength(1);
      expect(projects[0].is_starred).toBe(true);
      expect(prisma.projectMember.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: 'u-1', is_starred: true }
      }));
    });

    it('should allow a member to toggle star state', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({} as any);
      const updateMock = vi.mocked(prisma.projectMember.update).mockResolvedValue({} as any);

      const result = await ProjectService.toggleStarProject('u-1', 'p-1', true);
      expect(result.is_starred).toBe(true);
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id_project_id: { user_id: 'u-1', project_id: 'p-1' } },
        data: { is_starred: true }
      }));
    });
  });

  describe('Rename and Delete (BUG-001)', () => {
    it('should allow project admin to rename project', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({ role: 'ADMIN' } as any);
      const updateMock = vi.mocked(prisma.project.update).mockResolvedValue({ id: 'p-1', name: 'New Name' } as any);

      const result = await ProjectService.updateProject('u-1', 'p-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'p-1' },
        data: { name: 'New Name' }
      }));
    });

    it('should reject rename from non-admin', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({ role: 'MEMBER' } as any);
      
      await expect(ProjectService.updateProject('u-1', 'p-1', { name: 'New Name' }))
        .rejects.toEqual({ statusCode: 403, message: 'Only project admins can rename the project' });
    });

    it('should allow project admin to delete project and cleanup notifications', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({ role: 'ADMIN' } as any);
      
      // Mock the transaction callback directly
      const transactionMock = vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
        return callback(prisma as any);
      });
      
      const findTasksMock = vi.mocked(prisma.task.findMany).mockResolvedValue([{ id: 't-1' }] as any);
      const deleteNotificationsMock = vi.mocked(prisma.notification.deleteMany).mockResolvedValue({} as any);
      const deleteProjectMock = vi.mocked(prisma.project.delete).mockResolvedValue({} as any);

      await ProjectService.deleteProject('u-1', 'p-1');
      
      expect(findTasksMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { project_id: 'p-1' }
      }));
      expect(deleteNotificationsMock).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          entity_id: { in: ['p-1', 't-1'] },
          entity_type: { in: ['Project', 'Task'] }
        }
      }));
      expect(deleteProjectMock).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'p-1' }
      }));
    });

    it('should reject delete from non-admin', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({ role: 'MEMBER' } as any);
      
      await expect(ProjectService.deleteProject('u-1', 'p-1'))
        .rejects.toEqual({ statusCode: 403, message: 'Only project admins can delete the project' });
    });
  });
});
