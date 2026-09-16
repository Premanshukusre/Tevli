import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, Task } from './api';

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => taskApi.getMyTasks(),
  });
};

export const useTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId),
    enabled: !!projectId,
  });
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Task>) => taskApi.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) => taskApi.updateTask(taskId, data),
    // Optimistic UI updates could be added here, but invalidating is safer for now to ensure server truth
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
};
