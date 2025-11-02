import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getAllAnuncios,
  getAnuncioById,
  getAnunciosByUser,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
  inactivateAnuncio,
} from "../controllers/anuncioController";

const router: Router = Router();


// --- ROTAS PÚBLICAS ---
// Qualquer um pode ver a lista de anúncios e os detalhes de um anúncio
router.get("/getAllAnuncios", getAllAnuncios);
router.get("/getAnuncioById/:id", getAnuncioById);
router.get("/getAnunciosByUser/:userId", getAnunciosByUser);

// --- ROTAS PRIVADAS ---
// Apenas usuários logados podem criar, atualizar ou deletar anúncios.
// O middleware de autenticação é aplicado a todas as rotas abaixo.
router.post("/createAnuncio", authMiddleware, createAnuncio);
router.put("/updateAnuncio/:id", authMiddleware, updateAnuncio);
router.patch("/inactivateAnuncio/:id", authMiddleware, inactivateAnuncio);
router.delete("/deleteAnuncio/:id", authMiddleware, deleteAnuncio);

export default router;
