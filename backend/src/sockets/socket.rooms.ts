import { Socket } from 'socket.io';
import prisma from '../utils/prisma';

export const handleRoomEvents = (socket: Socket) => {
  socket.on('join_project', async (projectId: string, callback?: (response: { success: boolean, error?: string }) => void) => {
    try {
      if (!socket.user) {
        if (callback) callback({ success: false, error: 'Not authenticated' });
        return;
      }

      // Verify project access
      const membership = await prisma.projectMember.findUnique({
        where: {
          user_id_project_id: { user_id: socket.user.id, project_id: projectId }
        }
      });

      if (!membership) {
        if (callback) callback({ success: false, error: 'Not authorized for this project' });
        return;
      }

      const roomName = `project:${projectId}`;
      socket.join(roomName);
      
      if (callback) callback({ success: true });
    } catch (error) {
      if (callback) callback({ success: false, error: 'Internal server error' });
    }
  });

  socket.on('leave_project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });
};
