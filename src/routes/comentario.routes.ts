import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createComentario, updateComentario, deleteComentario, listByAnuncio } from '../controllers/comentarioController';

const router = Router();

router.post('/', authMiddleware, createComentario);
router.put('/:id', authMiddleware, updateComentario);
router.delete('/:id', authMiddleware, deleteComentario);
router.get('/anuncio/:anuncioId', listByAnuncio);

export default router;
