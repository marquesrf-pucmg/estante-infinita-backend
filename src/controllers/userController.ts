import { Request, Response } from 'express';
import prisma from '@src/lib/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const idNum = Number(userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: 'ID do usuário inválido.' });
    }

    const user = await (prisma as any).user.findUnique({ where: { id: idNum } });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // O schema pode usar `nome` e `senha`. Normalizamos para `name` e removemos a senha
    const userWithoutPassword = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      criadoEm: user.criadoEm ?? user.createdAt,
      atualizadoEm: user.atualizadoEm ?? user.updatedAt,
    };

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Não foi possível buscar o usuário." });
  }
};