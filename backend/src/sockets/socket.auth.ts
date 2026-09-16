import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';
import cookie from 'cookie';

// Extend Socket to include user
declare module 'socket.io' {
  interface Socket {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    
    if (!cookieHeader) {
      return next(new Error('Authentication error: No cookies found'));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.tevli_session;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, token_version: true }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (user.token_version !== decoded.version) {
      return next(new Error('Authentication error: Session expired'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Internal server error'));
  }
};
