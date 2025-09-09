// src/routes/anuncio.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAllAnuncios,
  getAnuncioById,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
} from "../controllers/anuncioController";

const router = Router();

// --- ROTAS PÚBLICAS ---
// Qualquer um pode ver a lista de anúncios e os detalhes de um anúncio
router.get("/", getAllAnuncios);
router.get("/:id", getAnuncioById);

// --- ROTAS PRIVADAS ---
// Apenas usuários logados podem criar, atualizar ou deletar anúncios.
// O middleware de autenticação é aplicado a todas as rotas abaixo.
router.post("/", authMiddleware, createAnuncio);
router.put("/:id", authMiddleware, updateAnuncio);
router.delete("/:id", authMiddleware, deleteAnuncio);

export default router;