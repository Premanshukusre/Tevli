import prisma from '../utils/prisma';
import { CreateWorkspaceInput, AddWorkspaceMemberInput, UpdateWorkspaceInput } from '../schemas/workspace.schema';

export class WorkspaceService {
  static async createWorkspace(userId: string, data: CreateWorkspaceInput) {
    return await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
        }
      });

      await tx.workspaceMember.create({
        data: {
          user_id: userId,
          workspace_id: workspace.id,
          role: 'ADMIN'
        }
      });

      return workspace;
    });
  }

  static async getWorkspacesByUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { user_id: userId },
      include: {
        workspace: true
      },
      orderBy: {
        workspace: {
          created_at: 'desc'
        }
      }
    });

    return memberships.map(m => m.workspace);
  }

  static async getWorkspaceById(userId: string, workspaceId: string) {
    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        user_id_workspace_id: {
          user_id: userId,
          workspace_id: workspaceId
        }
      },
      include: {
        workspace: true
      }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to access this workspace' };
    }

    return membership.workspace;
  }

  static async getWorkspaceMembers(userId: string, workspaceId: string) {
    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        user_id_workspace_id: { user_id: userId, workspace_id: workspaceId }
      }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to view members of this workspace' };
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspace_id: workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        role: 'asc'
      }
    });

    return members;
  }

  static async addWorkspaceMember(userId: string, workspaceId: string, data: AddWorkspaceMemberInput) {
    // 1. Verify requester is ADMIN
    const requester = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: userId, workspace_id: workspaceId } }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only workspace admins can add members' };
    }

    // 2. Find target user by email
    const targetUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (!targetUser) {
      throw { statusCode: 404, message: 'User with this email not found' };
    }

    // 3. Check for existing membership
    const existing = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: targetUser.id, workspace_id: workspaceId } }
    });

    if (existing) {
      throw { statusCode: 400, message: 'User is already a member of this workspace' };
    }

    // 4. Add member
    const newMember = await prisma.workspaceMember.create({
      data: {
        user_id: targetUser.id,
        workspace_id: workspaceId,
        role: 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return newMember;
  }

  static async removeWorkspaceMember(userId: string, workspaceId: string, targetUserId: string) {
    // 1. Verify requester is ADMIN (or removing themselves)
    const requester = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: userId, workspace_id: workspaceId } }
    });

    if (!requester) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    if (requester.role !== 'ADMIN' && userId !== targetUserId) {
      throw { statusCode: 403, message: 'Only workspace admins can remove other members' };
    }

    // 2. Check if removing the last admin
    if (requester.role === 'ADMIN') {
      const target = await prisma.workspaceMember.findUnique({
        where: { user_id_workspace_id: { user_id: targetUserId, workspace_id: workspaceId } }
      });
      
      if (target?.role === 'ADMIN') {
        const adminCount = await prisma.workspaceMember.count({
          where: { workspace_id: workspaceId, role: 'ADMIN' }
        });
        if (adminCount <= 1) {
          throw { statusCode: 400, message: 'Cannot remove the last workspace admin' };
        }
      }
    }

    // 3. Remove
    await prisma.workspaceMember.delete({
      where: { user_id_workspace_id: { user_id: targetUserId, workspace_id: workspaceId } }
    });

    // Note: Project cascade/removal logic might be needed here to remove them from projects too,
    // but for now, we just remove workspace membership. Actually, we should probably clean up project members.
    await prisma.projectMember.deleteMany({
      where: { 
        user_id: targetUserId,
        project: { workspace_id: workspaceId }
      }
    });

    return { success: true };
  }

  static async updateWorkspace(userId: string, workspaceId: string, data: UpdateWorkspaceInput) {
    // Verify requester is ADMIN
    const requester = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: userId, workspace_id: workspaceId } }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only workspace admins can rename the workspace' };
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: data.name }
    });

    return updatedWorkspace;
  }

  static async deleteWorkspace(userId: string, workspaceId: string) {
    // Verify requester is ADMIN
    const requester = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: userId, workspace_id: workspaceId } }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only workspace admins can delete the workspace' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find all projects in the workspace
      const projects = await tx.project.findMany({
        where: { workspace_id: workspaceId },
        select: { id: true }
      });
      const projectIds = projects.map(p => p.id);

      // 2. Find all tasks in those projects
      let taskIds: string[] = [];
      if (projectIds.length > 0) {
        const tasks = await tx.task.findMany({
          where: { project_id: { in: projectIds } },
          select: { id: true }
        });
        taskIds = tasks.map(t => t.id);
      }

      // 3. Delete orphaned notifications
      const entityIdsToDelete = [workspaceId, ...projectIds, ...taskIds];
      
      if (entityIdsToDelete.length > 0) {
        await tx.notification.deleteMany({
          where: {
            entity_id: { in: entityIdsToDelete },
            entity_type: { in: ['Workspace', 'Project', 'Task'] }
          }
        });
      }

      // 4. Delete workspace (cascades to WorkspaceMember, Project, ProjectMember, Task, Comment, ActivityLog)
      await tx.workspace.delete({
        where: { id: workspaceId }
      });
    });

    return { success: true };
  }
}
