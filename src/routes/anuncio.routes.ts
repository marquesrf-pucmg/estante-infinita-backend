import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getAllAnuncios,
  getAnuncioById,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
} from "../controllers/anuncioController";
import multer from "multer";

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- ROTAS PÚBLICAS ---
// Qualquer um pode ver a lista de anúncios e os detalhes de um anúncio
router.get("/getAllAnuncios", getAllAnuncios);
router.get("/getAnuncioById/:id", getAnuncioById);

// --- ROTAS PRIVADAS ---
// Apenas usuários logados podem criar, atualizar ou deletar anúncios.
// O middleware de autenticação é aplicado a todas as rotas abaixo.
router.post("/createAnuncio", authMiddleware, upload.single("file"), createAnuncio);
router.put("/updateAnuncio/:id", authMiddleware, updateAnuncio);
router.delete("/deleteAnuncio/:id", authMiddleware, deleteAnuncio);

export default router;
