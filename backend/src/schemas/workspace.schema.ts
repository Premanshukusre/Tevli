import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100).trim(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const addWorkspaceMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters long').max(100).trim(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
