import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.tevli_session;
    
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired session' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'User no longer exists' } });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
