import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from './api';

export const useProjectsByWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectApi.getProjectsByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.workspaceId] });
    },
  });
};

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => projectApi.updateProject(projectId, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};


export const useProjectMembers = (id: string) => {
  return useQuery({
    queryKey: ['project', id, 'members'],
    queryFn: () => projectApi.getProjectMembers(id),
    enabled: !!id,
  });
};

export const useAddProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => projectApi.addProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    }
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => projectApi.removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    }
  });
};

export const useRecentProjects = () => {
  return useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: projectApi.getRecentProjects,
  });
};

export const useStarredProjects = () => {
  return useQuery({
    queryKey: ['projects', 'starred'],
    queryFn: projectApi.getStarredProjects,
  });
};

export const useToggleStarProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isStarred }: { id: string, isStarred: boolean }) => 
      projectApi.toggleStarProject(id, isStarred),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};
