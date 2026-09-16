import { useQuery } from '@tanstack/react-query';
import { activityApi } from './api';

export const useProjectActivity = (projectId: string) => {
  return useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => activityApi.getProjectActivity(projectId),
    enabled: !!projectId,
  });
};
