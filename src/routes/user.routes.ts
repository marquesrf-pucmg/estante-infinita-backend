import { Router } from 'express';
import { deleteMe, editMe, getMe } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/me', authMiddleware, getMe);
router.delete('/deleteMe', authMiddleware, deleteMe);
router.put('/editMe', authMiddleware, editMe);



export default router;
