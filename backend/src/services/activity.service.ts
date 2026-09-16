import prisma from '../utils/prisma';
import { ActivityAction } from '@prisma/client';
import { SocketEvents } from '../sockets/socket.events';

export class ActivityService {
  static async logActivity(
    tx: any,
    data: {
      projectId: string;
      userId: string;
      action: ActivityAction;
      entityType: string;
      entityId: string;
      details?: string;
    }
  ) {
    const client = tx || prisma;
    const activity = await client.activityLog.create({
      data: {
        project_id: data.projectId,
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        details: data.details,
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    SocketEvents.emitActivityCreated(data.projectId, activity);

    return activity;
  }

  static async getProjectActivity(userId: string, projectId: string) {
    // Verify membership
    const membership = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to view this project activity' };
    }

    return await prisma.activityLog.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
  }
}
