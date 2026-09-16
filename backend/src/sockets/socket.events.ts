import { io } from './socket.server';

export const SocketEvents = {
  // Tasks
  emitTaskCreated: (projectId: string, task: any) => {
    io?.to(`project:${projectId}`).emit('task:created', task);
  },
  emitTaskUpdated: (projectId: string, task: any) => {
    io?.to(`project:${projectId}`).emit('task:updated', task);
  },
  emitTaskDeleted: (projectId: string, taskId: string) => {
    io?.to(`project:${projectId}`).emit('task:deleted', { id: taskId });
  },

  // Comments
  emitCommentCreated: (projectId: string, comment: any) => {
    io?.to(`project:${projectId}`).emit('comment:created', comment);
  },
  emitCommentUpdated: (projectId: string, comment: any) => {
    io?.to(`project:${projectId}`).emit('comment:updated', comment);
  },
  emitCommentDeleted: (projectId: string, commentId: string) => {
    io?.to(`project:${projectId}`).emit('comment:deleted', { id: commentId });
  },

  // Activity
  emitActivityCreated: (projectId: string, activity: any) => {
    io?.to(`project:${projectId}`).emit('activity:created', activity);
  }
};
