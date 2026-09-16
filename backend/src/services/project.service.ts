import prisma from '../utils/prisma';
import { CreateProjectInput, AddProjectMemberInput, UpdateProjectInput } from '../schemas/project.schema';

export class ProjectService {
  static async createProject(userId: string, workspaceId: string, data: CreateProjectInput) {
    // 1. Verify user belongs to the workspace
    const workspaceMembership = await prisma.workspaceMember.findUnique({
      where: {
        user_id_workspace_id: {
          user_id: userId,
          workspace_id: workspaceId
        }
      }
    });

    if (!workspaceMembership) {
      throw { statusCode: 403, message: 'Not authorized to create projects in this workspace' };
    }

    // 2. Create the project and add the creator as Project ADMIN within a transaction
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          workspace_id: workspaceId
        }
      });

      await tx.projectMember.create({
        data: {
          user_id: userId,
          project_id: project.id,
          role: 'ADMIN'
        }
      });

      return project;
    });
  }

  static async getProjectsByWorkspace(userId: string, workspaceId: string) {
    // Verify workspace access first
    const workspaceMembership = await prisma.workspaceMember.findUnique({
      where: {
        user_id_workspace_id: {
          user_id: userId,
          workspace_id: workspaceId
        }
      }
    });

    if (!workspaceMembership) {
      throw { statusCode: 403, message: 'Not authorized to access this workspace' };
    }

    return await prisma.project.findMany({
      where: { workspace_id: workspaceId },
      include: {
        members: {
          where: { user_id: userId },
          select: { is_starred: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async getProjectById(userId: string, projectId: string) {
    // Verify project membership
    const membership = await prisma.projectMember.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId
        }
      },
      include: {
        project: true
      }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to access this project' };
    }

    // Fire-and-forget timestamp update (don't block the request)
    prisma.projectMember.update({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } },
      data: { last_accessed: new Date() }
    }).catch(console.error);

    return {
      ...membership.project,
      is_starred: membership.is_starred
    };
  }

  static async getProjectMembers(userId: string, projectId: string) {
    const membership = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to view project members' };
    }

    const members = await prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { role: 'asc' }
    });

    return members;
  }

  static async addProjectMember(userId: string, projectId: string, data: AddProjectMemberInput) {
    // 1. Verify requester is Project ADMIN
    const requester = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } },
      include: { project: true }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only project admins can add members' };
    }

    // 2. Verify target user is in the Workspace
    const workspaceId = requester.project.workspace_id;
    const targetWorkspaceMember = await prisma.workspaceMember.findUnique({
      where: { user_id_workspace_id: { user_id: data.user_id, workspace_id: workspaceId } }
    });

    if (!targetWorkspaceMember) {
      throw { statusCode: 400, message: 'User must be a workspace member before they can be added to a project' };
    }

    // 3. Check existing project membership
    const existing = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: data.user_id, project_id: projectId } }
    });

    if (existing) {
      throw { statusCode: 400, message: 'User is already a member of this project' };
    }

    // 4. Add member
    const newMember = await prisma.projectMember.create({
      data: {
        user_id: data.user_id,
        project_id: projectId,
        role: 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    return newMember;
  }

  static async removeProjectMember(userId: string, projectId: string, targetUserId: string) {
    const requester = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!requester) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    if (requester.role !== 'ADMIN' && userId !== targetUserId) {
      throw { statusCode: 403, message: 'Only project admins can remove other members' };
    }

    if (requester.role === 'ADMIN') {
      const target = await prisma.projectMember.findUnique({
        where: { user_id_project_id: { user_id: targetUserId, project_id: projectId } }
      });
      
      if (target?.role === 'ADMIN') {
        const adminCount = await prisma.projectMember.count({
          where: { project_id: projectId, role: 'ADMIN' }
        });
        if (adminCount <= 1) {
          throw { statusCode: 400, message: 'Cannot remove the last project admin' };
        }
      }
    }

    await prisma.projectMember.delete({
      where: { user_id_project_id: { user_id: targetUserId, project_id: projectId } }
    });

    return { success: true };
  }

  static async getRecentProjects(userId: string) {
    const memberships = await prisma.projectMember.findMany({
      where: { user_id: userId },
      include: {
        project: {
          include: {
            workspace: { select: { name: true } }
          }
        }
      },
      orderBy: { last_accessed: 'desc' },
      take: 20
    });

    return memberships.map(m => ({
      ...m.project,
      is_starred: m.is_starred,
      last_accessed: m.last_accessed
    }));
  }

  static async getStarredProjects(userId: string) {
    const memberships = await prisma.projectMember.findMany({
      where: { 
        user_id: userId,
        is_starred: true
      },
      include: {
        project: {
          include: {
            workspace: { select: { name: true } }
          }
        }
      },
      orderBy: { project: { name: 'asc' } }
    });

    return memberships.map(m => ({
      ...m.project,
      is_starred: true,
      last_accessed: m.last_accessed
    }));
  }

  static async toggleStarProject(userId: string, projectId: string, isStarred: boolean) {
    const membership = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!membership) {
      throw { statusCode: 403, message: 'Not authorized to access this project' };
    }

    await prisma.projectMember.update({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } },
      data: { is_starred: isStarred }
    });

    return { success: true, is_starred: isStarred };
  }

  static async updateProject(userId: string, projectId: string, data: UpdateProjectInput) {
    const requester = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only project admins can rename the project' };
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: data.name }
    });

    return updatedProject;
  }

  static async deleteProject(userId: string, projectId: string) {
    const requester = await prisma.projectMember.findUnique({
      where: { user_id_project_id: { user_id: userId, project_id: projectId } }
    });

    if (!requester || requester.role !== 'ADMIN') {
      throw { statusCode: 403, message: 'Only project admins can delete the project' };
    }

    await prisma.$transaction(async (tx) => {
      // Find all tasks in the project
      const tasks = await tx.task.findMany({
        where: { project_id: projectId },
        select: { id: true }
      });
      const taskIds = tasks.map(t => t.id);

      // Delete orphaned notifications (Project notifications and Task notifications)
      const entityIdsToDelete = [projectId, ...taskIds];
      
      if (entityIdsToDelete.length > 0) {
        await tx.notification.deleteMany({
          where: {
            entity_id: { in: entityIdsToDelete },
            entity_type: { in: ['Project', 'Task'] }
          }
        });
      }

      // Delete project (cascades to ProjectMember, Task, Comment, ActivityLog)
      await tx.project.delete({
        where: { id: projectId }
      });
    });

    return { success: true };
  }
}
