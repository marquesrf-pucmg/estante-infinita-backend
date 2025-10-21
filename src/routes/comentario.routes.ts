import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createComentario, updateComentario, deleteComentario, listByAnuncio } from '../controllers/comentarioController';

const router = Router();

router.post('/createComentario', authMiddleware, createComentario);
router.put('/:id', authMiddleware, updateComentario);
router.delete('/:id', authMiddleware, deleteComentario);
router.get('/listByAnuncio/:anuncioId', listByAnuncio);

export default router;
