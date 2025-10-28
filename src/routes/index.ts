// src/routes/index.ts
import { Router } from "express";
import anuncioRoutes from "./anuncio.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import avaliacaoRoutes from "./avaliacao.routes";
import comentarioRoutes from "./comentario.routes";

const router: Router = Router();

// Rota de teste/health check
router.get("/", (req, res) => {
  res.json({ message: "API da Plataforma de Livros está no ar!" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/anuncios", anuncioRoutes);
router.use("/avaliacoes", avaliacaoRoutes);
router.use("/comentarios", comentarioRoutes);

export default router;
