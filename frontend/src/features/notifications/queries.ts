import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../lib/api';

export interface Notification {
  id: string;
  type: 'TASK_ASSIGNED' | 'COMMENT_ADDED' | 'MEMBER_ADDED';
  entity_type: string;
  entity_id: string;
  project_id?: string;
  task_id?: string;
  read: boolean;
  created_at: string;
  actor: {
    id: string;
    name: string;
  };
}

const notificationApi = {
  getNotifications: () => fetchApi('/notifications').then(res => res.notifications as Notification[]),
  markAsRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'POST' }),
  markAllAsRead: () => fetchApi('/notifications/read-all', { method: 'POST' })
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    refetchInterval: 60000 // Refetch every minute
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
