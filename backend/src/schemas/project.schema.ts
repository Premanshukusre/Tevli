import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100).trim(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const addProjectMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100).trim(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
