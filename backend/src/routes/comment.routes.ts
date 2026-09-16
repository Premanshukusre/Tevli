import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { updateCommentSchema } from '../schemas/comment.schema';

const router = Router();

router.use(requireAuth);

router.patch('/:id', validate(updateCommentSchema), CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
