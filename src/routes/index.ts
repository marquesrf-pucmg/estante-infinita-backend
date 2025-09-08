// src/routes/index.ts
import { Router } from "express";
import {
  getAllAnuncios,
  getAnuncioById,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
} from "../controllers/anuncioController";

const router = Router();

// Rota de teste/health check
router.get("/", (req, res) => {
  res.json({ message: "API da Plataforma de Livros está no ar!" });
});

// Rotas de Anúncios
router.get("/anuncios", getAllAnuncios); // Listar todos os anúncios
router.get("/anuncios/:id", getAnuncioById); // Buscar um anúncio por ID
router.post("/anuncios", createAnuncio); // Criar um novo anúncio
router.put("/anuncios/:id", updateAnuncio); // Atualizar um anúncio
router.delete("/anuncios/:id", deleteAnuncio); // Deletar um anúncio

export default router;
