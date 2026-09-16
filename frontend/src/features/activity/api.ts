import { fetchApi } from '../../lib/api';

export interface Activity {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string | null;
  created_at: string;
  user: { id: string; name: string };
}

export const activityApi = {
  getProjectActivity: (projectId: string) => fetchApi(`/projects/${projectId}/activity`).then(res => res.activity as Activity[]),
};
