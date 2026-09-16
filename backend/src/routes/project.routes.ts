import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { TaskController } from '../controllers/task.controller';
import { ActivityController } from '../controllers/activity.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { createTaskSchema } from '../schemas/task.schema';
import { addProjectMemberSchema, createProjectSchema, updateProjectSchema } from '../schemas/project.schema';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

router.get('/recent', ProjectController.getRecentProjects);
router.get('/starred', ProjectController.getStarredProjects);

router.post('/:workspaceId', validate(createProjectSchema), ProjectController.createProject);
router.get('/workspace/:workspaceId', ProjectController.getProjectsByWorkspace);
router.get('/:id', ProjectController.getProjectById);
router.put('/:id', validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.put('/:id/star', ProjectController.toggleStarProject);
router.get('/:projectId/activity', ActivityController.getProjectActivity);
router.get('/:projectId/tasks', TaskController.getTasksByProject);
router.post('/:projectId/tasks', validate(createTaskSchema), TaskController.createTask);

// Project Member Routes
router.get('/:id/members', ProjectController.getProjectMembers);
router.post('/:id/members', validate(addProjectMemberSchema), ProjectController.addProjectMember);
router.delete('/:id/members/:userId', ProjectController.removeProjectMember);

export default router;
