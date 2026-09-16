import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Tevli API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
