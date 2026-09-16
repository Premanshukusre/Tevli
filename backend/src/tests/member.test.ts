import request from 'supertest';
import app from '../index';
import prisma from '../utils/prisma';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll } from 'vitest';

describe.skip('Multi-User Collaboration & Membership API', () => {
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let user1Token: string;
  let user2Token: string;
  let user3Token: string;
  let workspaceId: string;
  let projectId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany();
    await prisma.workspace.deleteMany();

    // Create 3 users
    const user1 = await prisma.user.create({
      data: { name: 'Alice', email: 'alice@example.com', password_hash: 'hash' }
    });
    user1Id = user1.id;
    user1Token = jwt.sign({ id: user1.id }, process.env.JWT_SECRET || 'test_secret');

    const user2 = await prisma.user.create({
      data: { name: 'Bob', email: 'bob@example.com', password_hash: 'hash' }
    });
    user2Id = user2.id;
    user2Token = jwt.sign({ id: user2.id }, process.env.JWT_SECRET || 'test_secret');

    const user3 = await prisma.user.create({
      data: { name: 'Charlie', email: 'charlie@example.com', password_hash: 'hash' }
    });
    user3Id = user3.id;
    user3Token = jwt.sign({ id: user3.id }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('Workspace Membership', () => {
    it('should create a workspace and make creator ADMIN', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Cookie', [`token=${user1Token}`])
        .send({ name: 'Alice Workspace' });
      
      expect(res.status).toBe(201);
      workspaceId = res.body.data.workspace.id;

      const members = await prisma.workspaceMember.findMany({ where: { workspace_id: workspaceId } });
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(user1Id);
      expect(members[0].role).toBe('ADMIN');
    });

    it('should fail to add member if not admin', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspaceId}/members`)
        .set('Cookie', [`token=${user2Token}`]) // user2 is not in workspace
        .send({ email: 'charlie@example.com' });
      
      expect(res.status).toBe(403);
    });

    it('should add member successfully by admin', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspaceId}/members`)
        .set('Cookie', [`token=${user1Token}`])
        .send({ email: 'bob@example.com' });
      
      expect(res.status).toBe(201);
      expect(res.body.data.member.user_id).toBe(user2Id);
      expect(res.body.data.member.role).toBe('MEMBER');
    });

    it('should prevent duplicate workspace membership', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspaceId}/members`)
        .set('Cookie', [`token=${user1Token}`])
        .send({ email: 'bob@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already a member/i);
    });

    it('should list workspace members', async () => {
      const res = await request(app)
        .get(`/api/workspaces/${workspaceId}/members`)
        .set('Cookie', [`token=${user1Token}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.data.members).toHaveLength(2); // Alice and Bob
    });
  });

  describe('Project Membership', () => {
    it('should create a project and make creator ADMIN', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspaceId}/projects`)
        .set('Cookie', [`token=${user1Token}`])
        .send({ name: 'Project Alpha' });
      
      expect(res.status).toBe(201);
      projectId = res.body.data.project.id;

      const members = await prisma.projectMember.findMany({ where: { project_id: projectId } });
      expect(members).toHaveLength(1);
      expect(members[0].user_id).toBe(user1Id);
      expect(members[0].role).toBe('ADMIN');
    });

    it('should add member to project from workspace', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Cookie', [`token=${user1Token}`])
        .send({ user_id: user2Id }); // Bob is in workspace
      
      expect(res.status).toBe(201);
      expect(res.body.data.member.user_id).toBe(user2Id);
    });

    it('should fail to add member not in workspace', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Cookie', [`token=${user1Token}`])
        .send({ user_id: user3Id }); // Charlie is not in workspace
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/must be a workspace member/i);
    });

    it('should let project members access project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', [`token=${user2Token}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.data.project.id).toBe(projectId);
    });

    it('should prevent non-members from accessing project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Cookie', [`token=${user3Token}`]); // Charlie is not in project
      
      expect(res.status).toBe(403);
    });
  });

  describe('Membership Removal', () => {
    it('should prevent removing the last workspace admin', async () => {
      const res = await request(app)
        .delete(`/api/workspaces/${workspaceId}/members/${user1Id}`)
        .set('Cookie', [`token=${user1Token}`]);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/last workspace admin/i);
    });

    it('should allow admin to remove a member', async () => {
      const res = await request(app)
        .delete(`/api/workspaces/${workspaceId}/members/${user2Id}`)
        .set('Cookie', [`token=${user1Token}`]);
      
      expect(res.status).toBe(200);

      // Verify cascading logic (Bob should also be removed from the project inside the workspace)
      const projectMembers = await prisma.projectMember.findMany({ where: { project_id: projectId } });
      expect(projectMembers).toHaveLength(1); // Only Alice left
      expect(projectMembers[0].user_id).toBe(user1Id);
    });
  });
});
