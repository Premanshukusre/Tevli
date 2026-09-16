import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../schemas/auth.schema';
import { requireAuth } from '../middleware/requireAuth';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login/register requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many authentication attempts, please try again later' } }
});

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), AuthController.updateProfile);
router.put('/password', requireAuth, validate(changePasswordSchema), AuthController.changePassword);

export default router;
