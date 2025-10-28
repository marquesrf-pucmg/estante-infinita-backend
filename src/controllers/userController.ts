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

export const editMe = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { nome } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: "ID do usuário inválido." });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: idNum },
      data: { nome },
    });

    res.status(200).json('Usuário atualizado com sucesso.');
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar usuário e seus dados." });
  }
}

export const deleteMe = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const idNum = Number(userId);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: "ID do usuário inválido." });
    }

    await prisma.$transaction(async (tx) => {
      // Deletar primeiro as dependências
      await tx.avaliacao.deleteMany({ where: { usuarioId: idNum } });
      await tx.comentario.deleteMany({ where: { usuarioId: idNum } });
      await tx.anuncio.deleteMany({ where: { usuarioId: idNum } });

      // Depois deletar o usuário
      await tx.usuario.delete({ where: { id: idNum } });
    });

    res.status(200).json("Usuário deletado com sucesso.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar usuário e seus dados." });
  }
};
