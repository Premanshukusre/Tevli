import { describe, it, expect, vi } from 'vitest';
import { TaskService } from '../services/task.service';
import prisma from '../utils/prisma';

describe('TaskService Authorization', () => {
  const mockUserId = 'user-1';
  const mockProjectId = 'project-1';
  const mockTaskId = 'task-1';

  describe('verifyProjectAccess', () => {
    it('should throw 403 if user is not a member of the project', async () => {
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(null);

      await expect(TaskService.verifyProjectAccess(mockUserId, mockProjectId))
        .rejects.toEqual({ statusCode: 403, message: 'Not authorized to access tasks for this project' });
    });

    it('should return membership if user is authorized', async () => {
      const mockMembership = { user_id: mockUserId, project_id: mockProjectId, role: 'MEMBER' as any, joined_at: new Date() };
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(mockMembership);

      const result = await TaskService.verifyProjectAccess(mockUserId, mockProjectId);
      expect(result).toEqual(mockMembership);
    });
  });

  describe('verifyTaskAccess', () => {
    it('should throw 404 if task does not exist', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      await expect(TaskService.verifyTaskAccess(mockUserId, mockTaskId))
        .rejects.toEqual({ statusCode: 404, message: 'Task not found' });
    });

    it('should throw 403 if user cannot access the project the task belongs to', async () => {
      const mockTask = { id: mockTaskId, description: null, project_id: mockProjectId, status: 'TODO' as any, title: 'title', priority: 'MEDIUM' as any, due_date: null, assignee_id: null, position: 1024, created_at: new Date(), updated_at: new Date() };
      vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(null); // Deny access

      await expect(TaskService.verifyTaskAccess(mockUserId, mockTaskId))
        .rejects.toEqual({ statusCode: 403, message: 'Not authorized to access tasks for this project' });
    });
  });

  describe('deleteTask', () => {
    it('should delete task and log activity in a transaction', async () => {
      const mockTask = { id: mockTaskId, description: null, project_id: mockProjectId, status: 'TODO' as any, title: 'Test Task', priority: 'MEDIUM' as any, due_date: null, assignee_id: null, position: 1024, created_at: new Date(), updated_at: new Date() };
      vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue({ user_id: mockUserId, project_id: mockProjectId, role: 'MEMBER' });
      
      // Mock the transaction to just execute the callback
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback(prisma);
      });

      // Mock ActivityService.logActivity to avoid dealing with its internal Prisma calls during this unit test
      // but since we are just checking if prisma methods are called, we can let it run and check prisma.activityLog.create
      
      await TaskService.deleteTask(mockUserId, mockTaskId);

      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { task_id: mockTaskId }
      });

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: mockTaskId } });
      expect(prisma.activityLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          action: 'TASK_DELETED',
          details: 'deleted task "Test Task"'
        })
      }));
    });
  });
});
