import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createAvaliacao,
  updateAvaliacao,
  deleteAvaliacao,
  listByAnuncio,
} from '../controllers/avaliacaoController';

const router = Router();

router.post('/', authMiddleware, createAvaliacao);
router.put('/:id', authMiddleware, updateAvaliacao);
router.delete('/:id', authMiddleware, deleteAvaliacao);
router.get('/anuncio/:anuncioId', listByAnuncio);

export default router;
