import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { CommentController } from '../controllers/comment.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { updateTaskSchema } from '../schemas/task.schema';
import { createCommentSchema } from '../schemas/comment.schema';

const router = Router();

router.use(requireAuth);

router.get('/me', TaskController.getMyTasks);

router.patch('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.get('/:taskId/comments', CommentController.getComments);
router.post('/:taskId/comments', validate(createCommentSchema), CommentController.createComment);

export default router;
