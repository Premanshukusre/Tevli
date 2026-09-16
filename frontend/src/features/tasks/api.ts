import { fetchApi } from '../../lib/api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  due_date: string | null;
  assignee_id: string | null;
  assignee?: { id: string; name: string; email: string } | null;
}

export const taskApi = {
  getMyTasks: () => fetchApi('/tasks/me').then(res => res.tasks as (Task & { project: { id: string; name: string; workspace_id: string } })[]),
  getTasks: (projectId: string) => fetchApi(`/projects/${projectId}/tasks`).then(res => res.tasks as Task[]),
  createTask: (projectId: string, data: Partial<Task>) => fetchApi(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.task as Task),
  updateTask: (taskId: string, data: Partial<Task>) => fetchApi(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }).then(res => res.task as Task),
  deleteTask: (taskId: string) => fetchApi(`/tasks/${taskId}`, {
    method: 'DELETE'
  })
};
