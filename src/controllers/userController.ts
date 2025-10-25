import { type Request, type Response } from "express";
import prisma from "@src/lib/prisma";
import { parseNumericId } from "@src/helpers/number";

interface AuthRequest extends Request {
  userId?: string;
}

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const userId = parseNumericId(req.userId);

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Não foi possível buscar o usuário." });
  }
};
