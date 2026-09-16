import { fetchApi } from '../../lib/api';

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

export interface ProjectMember {
  user_id: string;
  project_id: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const projectApi = {
  getProjectsByWorkspace: (workspaceId: string) => fetchApi(`/workspaces/${workspaceId}/projects`).then(res => res.projects as Project[]),
  getProject: (id: string) => fetchApi(`/projects/${id}`).then(res => res.project as Project),
  createProject: (data: { workspaceId: string, name: string }) => fetchApi(`/workspaces/${data.workspaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify({ name: data.name })
  }).then(res => res.project as Project),
  updateProject: (id: string, name: string) => fetchApi(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name })
  }).then(res => res.project as Project),
  deleteProject: (id: string) => fetchApi(`/projects/${id}`, {
    method: 'DELETE'
  }),

  getProjectMembers: (id: string) => fetchApi(`/projects/${id}/members`).then(res => res.members as ProjectMember[]),
  addProjectMember: (id: string, userId: string) => fetchApi(`/projects/${id}/members`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  }).then(res => res.member as ProjectMember),
  removeProjectMember: (id: string, userId: string) => fetchApi(`/projects/${id}/members/${userId}`, {
    method: 'DELETE'
  }),
  getRecentProjects: () => fetchApi('/projects/recent').then(res => res.projects),
  getStarredProjects: () => fetchApi('/projects/starred').then(res => res.projects),
  toggleStarProject: (id: string, isStarred: boolean) => fetchApi(`/projects/${id}/star`, {
    method: 'PUT',
    body: JSON.stringify({ is_starred: isStarred })
  })
};
