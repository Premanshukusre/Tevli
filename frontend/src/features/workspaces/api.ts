import { fetchApi } from '../../lib/api';

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  user_id: string;
  workspace_id: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const workspaceApi = {
  getWorkspaces: () => fetchApi('/workspaces').then(res => res.workspaces as Workspace[]),
  getWorkspace: (id: string) => fetchApi(`/workspaces/${id}`).then(res => res.workspace as Workspace),
  createWorkspace: (data: { name: string }) => fetchApi('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.workspace as Workspace),
  
  getWorkspaceMembers: (id: string) => fetchApi(`/workspaces/${id}/members`).then(res => res.members as WorkspaceMember[]),
  addWorkspaceMember: (id: string, email: string) => fetchApi(`/workspaces/${id}/members`, {
    method: 'POST',
    body: JSON.stringify({ email })
  }).then(res => res.member as WorkspaceMember),
  removeWorkspaceMember: (id: string, userId: string) => fetchApi(`/workspaces/${id}/members/${userId}`, {
    method: 'DELETE'
  }),
  updateWorkspace: (workspaceId: string, data: { name: string }) => fetchApi(`/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteWorkspace: (workspaceId: string) => fetchApi(`/workspaces/${workspaceId}`, {
    method: 'DELETE'
  })
};
