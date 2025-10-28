import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '@src/lib/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

export const createAvaliacao = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  if (Number.isNaN(usuarioId)) return res.status(400).json({ error: 'ID do usuário inválido.' });

  const { avaliacao, comentario, anuncioId } = req.body;
  if (!avaliacao || !anuncioId) return res.status(400).json({ error: 'Campos obrigatórios: avaliacao, anuncioId' });

  const avaliacaoEnumMap: Record<number, string> = {
    5: 'EXCELENTE',
    4: 'MUITO_BOM',
    3: 'BOM',
    2: 'REGULAR',
    1: 'RUIM',
  };

  const avaliacaoEnum = avaliacaoEnumMap[avaliacao];
  if (!avaliacaoEnum) return res.status(400).json({ error: 'Valor de avaliação inválido.' });

  try {
    // tenta criar uma nova avaliação
    const nova = await prisma.avaliacao.create({
      data: {
        avaliacao: avaliacaoEnum as any,
        comentario: comentario ?? null,
        usuarioId,
        anuncioId: Number(anuncioId),
      },
    });

    res.status(201).json(nova);

  } catch (err) {
    // Caso o usuário já tenha avaliado o mesmo anúncio (violação de unique)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      try {
        // Busca a avaliação existente
        const existente = await prisma.avaliacao.findFirst({
          where: { usuarioId, anuncioId: Number(anuncioId) },
        });

        if (!existente) {
          return res.status(404).json({ error: 'Avaliação existente não encontrada.' });
        }

        // Atualiza a avaliação
        const atualizado = await prisma.avaliacao.update({
          where: { id: existente.id },
          data: {
            avaliacao: avaliacaoEnum as any,
            comentario: comentario ?? existente.comentario,
          },
        });

        return res.status(200).json(atualizado);

      } catch (updateErr) {
        console.error('Erro ao atualizar avaliação existente:', updateErr);
        return res.status(500).json({ error: 'Erro ao atualizar avaliação existente.' });
      }
    }

    console.error('Erro ao criar avaliação:', err);
    res.status(500).json({ error: 'Não foi possível criar a avaliação.' });
  }
};



// Atualiza avaliação — somente autor pode atualizar
export const updateAvaliacao = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  const { id } = req.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID da avaliação inválido.' });

  const { avaliacao, comentario } = req.body;

  try {
    const avaliacaoExistente = await (prisma as any).avaliacao.findUnique({ where: { id: idNum } });
    if (!avaliacaoExistente) return res.status(404).json({ error: 'Avaliação não encontrada' });
    if (avaliacaoExistente.usuarioId !== usuarioId) return res.status(403).json({ error: 'Acesso negado.' });

    const data: any = {};
    if (avaliacao !== undefined) data.avaliacao = avaliacao;
    if (comentario !== undefined) data.comentario = comentario;

    const atualizado = await (prisma as any).avaliacao.update({ where: { id: idNum }, data });
    res.status(200).json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar avaliação:', err);
    res.status(500).json({ error: 'Não foi possível atualizar a avaliação.' });
  }
};

// Deleta avaliação — somente autor pode deletar
export const deleteAvaliacao = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  const { id } = req.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID da avaliação inválido.' });

  try {
    const avaliacaoExistente = await (prisma as any).avaliacao.findUnique({ where: { id: idNum } });
    if (!avaliacaoExistente) return res.status(404).json({ error: 'Avaliação não encontrada' });
    if (avaliacaoExistente.usuarioId !== usuarioId) return res.status(403).json({ error: 'Acesso negado.' });

    const deletado = await (prisma as any).avaliacao.delete({ where: { id: idNum } });
    res.status(200).json({ message: 'Avaliação deletada com sucesso', avaliacao: deletado });
  } catch (err) {
    console.error('Erro ao deletar avaliação:', err);
    res.status(500).json({ error: 'Não foi possível deletar a avaliação.' });
  }
};

// (Opcional) Listar avaliações por anúncio
export const listByAnuncio = async (req: Request, res: Response) => {
  const { anuncioId } = req.params;
  const anuncioIdNum = Number(anuncioId);

  if (Number.isNaN(anuncioIdNum)) {
    return res.status(400).json({ error: 'ID do anúncio inválido.' });
  }

  try {
    const avals = await prisma.avaliacao.findMany({
      where: { anuncioId: anuncioIdNum },
      select: {
        id: true,
        avaliacao: true,
        comentario: true,
        usuarioId: true,
        anuncioId: true,
      },
    });

    // 🔹 Mapeia o enum para número
    const mapAvaliacaoToNumber = {
      EXCELENTE: 5,
      MUITO_BOM: 4,
      BOM: 3,
      REGULAR: 2,
      RUIM: 1,
    };

    const avaliacoesConvertidas = avals.map(a => ({
      ...a,
      avaliacao: mapAvaliacaoToNumber[a.avaliacao as keyof typeof mapAvaliacaoToNumber],
    }));

    res.status(200).json(avaliacoesConvertidas);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    res.status(500).json({ error: 'Não foi possível buscar avaliações.' });
  }
};

