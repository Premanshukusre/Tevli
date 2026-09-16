import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from './api';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getWorkspaces,
  });
};

export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getWorkspace(id),
    enabled: !!id,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useWorkspaceMembers = (id: string) => {
  return useQuery({
    queryKey: ['workspace', id, 'members'],
    queryFn: () => workspaceApi.getWorkspaceMembers(id),
    enabled: !!id,
  });
};

export const useAddWorkspaceMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (email: string) => workspaceApi.addWorkspaceMember(workspaceId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    }
  });
};

export const useRemoveWorkspaceMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => workspaceApi.removeWorkspaceMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    }
  });
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => workspaceApi.updateWorkspace(workspaceId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.setQueryData(['workspace', workspaceId], data.workspace);
    }
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });
};
