import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(3000, 'Comment is too long').trim(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(3000).trim(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
