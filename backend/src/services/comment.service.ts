import prisma from '../utils/prisma';
import { CreateCommentInput, UpdateCommentInput } from '../schemas/comment.schema';
import { ActivityService } from './activity.service';
import { TaskService } from './task.service';
import { SocketEvents } from '../sockets/socket.events';

export class CommentService {
  static async getCommentsForTask(userId: string, taskId: string) {
    // Throws if user cannot access task
    await TaskService.verifyTaskAccess(userId, taskId);

    return await prisma.comment.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: 'asc' },
      include: {
        user: { select: { id: true, name: true } }
      }
    });
  }

  static async createComment(userId: string, taskId: string, data: CreateCommentInput) {
    const task = await TaskService.verifyTaskAccess(userId, taskId);

    const createdComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          task_id: taskId,
          user_id: userId,
          content: data.content
        },
        include: {
          user: { select: { id: true, name: true } }
        }
      });

      await ActivityService.logActivity(tx, {
        projectId: task.project_id,
        userId: userId,
        action: 'COMMENT_ADDED',
        entityType: 'Comment',
        entityId: comment.id,
        details: `added a comment`
      });

      // Notify task assignee if someone else commented
      if (task.assignee_id && task.assignee_id !== userId) {
        await tx.notification.create({
          data: {
            user_id: task.assignee_id,
            actor_id: userId,
            type: 'COMMENT_ADDED',
            entity_type: 'Comment',
            entity_id: comment.id,
            project_id: task.project_id,
            task_id: task.id,
          }
        });
      }

      return comment;
    });

    SocketEvents.emitCommentCreated(task.project_id, createdComment);
    return createdComment;
  }

  static async updateComment(userId: string, commentId: string, data: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw { statusCode: 404, message: 'Comment not found' };
    if (comment.user_id !== userId) throw { statusCode: 403, message: 'Cannot edit another users comment' };

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: { 
        user: { select: { id: true, name: true } },
        task: { select: { project_id: true } } 
      }
    });

    SocketEvents.emitCommentUpdated(updatedComment.task.project_id, updatedComment);
    return updatedComment;
  }

  static async deleteComment(userId: string, commentId: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { task: true } });
    if (!comment) throw { statusCode: 404, message: 'Comment not found' };
    if (comment.user_id !== userId) throw { statusCode: 403, message: 'Cannot delete another users comment' };

    await prisma.comment.delete({ where: { id: commentId } });

    SocketEvents.emitCommentDeleted(comment.task.project_id, commentId);
  }
}
