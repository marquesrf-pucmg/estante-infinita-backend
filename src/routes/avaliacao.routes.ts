import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createAvaliacao, updateAvaliacao, deleteAvaliacao, listByAnuncio } from "../controllers/avaliacaoController";

const router: Router = Router();

router.post('/createAvaliacao', authMiddleware, createAvaliacao);
router.put('/:id', authMiddleware, updateAvaliacao);
router.delete('/:id', authMiddleware, deleteAvaliacao);
router.get('/listByAnuncio/:anuncioId', listByAnuncio);

export default router;
