import { fetchApi } from '../../lib/api';

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: { id: string; name: string };
}

export const commentApi = {
  getComments: (taskId: string) => fetchApi(`/tasks/${taskId}/comments`).then(res => res.comments as Comment[]),
  createComment: (taskId: string, content: string) => fetchApi(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }).then(res => res.comment as Comment),
  updateComment: (commentId: string, content: string) => fetchApi(`/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content })
  }).then(res => res.comment as Comment),
  deleteComment: (commentId: string) => fetchApi(`/comments/${commentId}`, {
    method: 'DELETE'
  })
};
