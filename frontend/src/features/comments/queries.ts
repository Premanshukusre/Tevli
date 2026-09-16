import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from './api';

export const useComments = (taskId: string) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentApi.getComments(taskId),
    enabled: !!taskId,
  });
};

export const useCreateComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentApi.createComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      // We don't invalidate activity here directly, but the project activity will catch it on next fetch
    },
  });
};

export const useUpdateComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string, content: string }) => commentApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
};

export const useDeleteComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
};
