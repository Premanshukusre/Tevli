import { Request, Response, NextFunction } from 'express';

export const requireCsrfHeader = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-changing methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const csrfHeader = req.headers['x-requested-with'];
    
    if (csrfHeader !== 'XMLHttpRequest') {
      return res.status(403).json({
        success: false,
        error: { message: 'CSRF protection: Missing or invalid X-Requested-With header' }
      });
    }
  }
  
  next();
};
