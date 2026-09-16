import prisma from '../utils/prisma';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { ActivityService } from './activity.service';
import { SocketEvents } from '../sockets/socket.events';

export class TaskService {
  static async verifyProjectAccess(userId: string, projectId: string) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        user_id_project_id: { user_id: userId, project_id: projectId }
      }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to access tasks for this project' };
    }
    return membership;
  }

  static async verifyTaskAccess(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, project_id: true, status: true, assignee_id: true, priority: true, title: true }
    });

    if (!task) {
      throw { statusCode: 404, message: 'Task not found' };
    }

    await this.verifyProjectAccess(userId, task.project_id);
    return task;
  }

  static async getTasksByProject(userId: string, projectId: string) {
    await this.verifyProjectAccess(userId, projectId);

    return await prisma.task.findMany({
      where: { project_id: projectId },
      orderBy: { position: 'asc' },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  static async getMyTasks(userId: string) {
    return await prisma.task.findMany({
      where: { assignee_id: userId },
      orderBy: [
        { due_date: 'asc' },
        { position: 'asc' }
      ],
      include: {
        project: {
          select: { id: true, name: true, workspace_id: true }
        }
      }
    });
  }

  static async createTask(userId: string, projectId: string, data: CreateTaskInput) {
    await this.verifyProjectAccess(userId, projectId);

    if (data.assignee_id) {
      await this.verifyProjectAccess(data.assignee_id, projectId).catch(() => {
        throw { statusCode: 400, message: 'Assignee is not a member of this project' };
      });
    }

    // Determine initial position (bottom of the TODO list by default)
    const lastTask = await prisma.task.findFirst({
      where: { project_id: projectId, status: data.status || 'TODO' },
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    
    const position = lastTask ? lastTask.position + 1024 : 1024;

    const createdTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          ...data,
          project_id: projectId,
          position
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } }
        }
      });

      await ActivityService.logActivity(tx, {
        projectId,
        userId,
        action: 'TASK_CREATED',
        entityType: 'Task',
        entityId: task.id,
        details: `created task "${task.title}"`
      });
      
      if (data.assignee_id && data.assignee_id !== userId) {
        await tx.notification.create({
          data: {
            user_id: data.assignee_id,
            actor_id: userId,
            type: 'TASK_ASSIGNED',
            entity_type: 'Task',
            entity_id: task.id,
            project_id: task.project_id,
            task_id: task.id,
          }
        });
      }

      return task;
    });

    SocketEvents.emitTaskCreated(projectId, createdTask);
    return createdTask;
  }

  static async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const task = await this.verifyTaskAccess(userId, taskId);

    if (data.assignee_id) {
      await this.verifyProjectAccess(data.assignee_id, task.project_id).catch(() => {
        throw { statusCode: 400, message: 'Assignee is not a member of this project' };
      });
    }

    const resultTask = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data,
        include: {
          assignee: { select: { id: true, name: true, email: true } }
        }
      });

      // Determine changes and log them
      if (data.status && data.status !== task.status) {
        await ActivityService.logActivity(tx, {
          projectId: task.project_id,
          userId,
          action: 'TASK_MOVED',
          entityType: 'Task',
          entityId: task.id,
          details: `moved from ${task.status} to ${data.status}`
        });
      }

      if (data.assignee_id !== undefined && data.assignee_id !== task.assignee_id) {
        await ActivityService.logActivity(tx, {
          projectId: task.project_id,
          userId,
          action: 'TASK_ASSIGNED',
          entityType: 'Task',
          entityId: task.id,
          details: data.assignee_id ? `assigned task` : `unassigned task`
        });
        
        if (data.assignee_id && data.assignee_id !== userId) {
          await tx.notification.create({
            data: {
              user_id: data.assignee_id,
              actor_id: userId,
              type: 'TASK_ASSIGNED',
              entity_type: 'Task',
              entity_id: task.id,
              project_id: task.project_id,
              task_id: task.id,
            }
          });
        }
      }

      if (data.priority && data.priority !== task.priority) {
        await ActivityService.logActivity(tx, {
          projectId: task.project_id,
          userId,
          action: 'TASK_UPDATED',
          entityType: 'Task',
          entityId: task.id,
          details: `changed priority from ${task.priority} to ${data.priority}`
        });
      }

      return updatedTask;
    });

    SocketEvents.emitTaskUpdated(task.project_id, resultTask);
    return resultTask;
  }

  static async deleteTask(userId: string, taskId: string) {
    const task = await this.verifyTaskAccess(userId, taskId);

    await prisma.$transaction(async (tx) => {
      // Clean up orphaned notifications linked to this task
      await tx.notification.deleteMany({
        where: { task_id: taskId }
      });

      await tx.task.delete({
        where: { id: taskId }
      });

      await ActivityService.logActivity(tx, {
        projectId: task.project_id,
        userId,
        action: 'TASK_DELETED',
        entityType: 'Task',
        entityId: task.id,
        details: `deleted task "${task.title}"`
      });
    });

    SocketEvents.emitTaskDeleted(task.project_id, taskId);
  }
}
