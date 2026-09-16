import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { ProjectController } from '../controllers/project.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { createWorkspaceSchema, addWorkspaceMemberSchema, updateWorkspaceSchema } from '../schemas/workspace.schema';
import { createProjectSchema } from '../schemas/project.schema';

const router = Router();

// All workspace routes require authentication
router.use(requireAuth);

router.get('/', WorkspaceController.getWorkspaces);
router.post('/', validate(createWorkspaceSchema), WorkspaceController.createWorkspace);
router.get('/:id', WorkspaceController.getWorkspaceById);
router.put('/:id', validate(updateWorkspaceSchema), WorkspaceController.updateWorkspace);
router.delete('/:id', WorkspaceController.deleteWorkspace);

// Workspace Member Routes
router.get('/:id/members', WorkspaceController.getWorkspaceMembers);
router.post('/:id/members', validate(addWorkspaceMemberSchema), WorkspaceController.addWorkspaceMember);
router.delete('/:id/members/:userId', WorkspaceController.removeWorkspaceMember);

// Nested routes for projects within a workspace
router.get('/:workspaceId/projects', ProjectController.getProjectsByWorkspace);
router.post('/:workspaceId/projects', validate(createProjectSchema), ProjectController.createProject);

export default router;
