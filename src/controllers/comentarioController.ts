import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '@src/lib/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

export const createComentario = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  if (Number.isNaN(usuarioId)) return res.status(400).json({ error: 'ID do usuário inválido.' });

  const { texto, anuncioId } = req.body;
  if (!texto || !anuncioId) return res.status(400).json({ error: 'Campos obrigatórios: texto, anuncioId' });

  const anuncioIdNum = Number(anuncioId);
  if (Number.isNaN(anuncioIdNum)) return res.status(400).json({ error: 'ID do anúncio inválido.' });

  try {
    const novo = await prisma.comentario.create({
      data: {
        texto,
        usuarioId,
        anuncioId: anuncioIdNum,
      },
    });
    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar comentário:', err);
    res.status(500).json({ error: 'Não foi possível criar o comentário.' });
  }
};


export const updateComentario = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  const { id } = req.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID do comentário inválido.' });

  const { texto } = req.body;
  if (texto === undefined) return res.status(400).json({ error: 'Campo obrigatório: texto' });

  try {
    const existente = await (prisma as any).comentario.findUnique({ where: { id: idNum } });
    if (!existente) return res.status(404).json({ error: 'Comentário não encontrado' });
    if (existente.usuarioId !== usuarioId) return res.status(403).json({ error: 'Acesso negado.' });

    const atualizado = await (prisma as any).comentario.update({ where: { id: idNum }, data: { texto } });
    res.status(200).json(atualizado);
  } catch (err) {
    console.error('Erro ao atualizar comentário:', err);
    res.status(500).json({ error: 'Não foi possível atualizar o comentário.' });
  }
};

export const deleteComentario = async (req: AuthRequest, res: Response) => {
  const usuarioIdStr = req.userId;
  if (!usuarioIdStr) return res.status(401).json({ error: 'Usuário não autenticado.' });

  const usuarioId = Number(usuarioIdStr);
  const { id } = req.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) return res.status(400).json({ error: 'ID do comentário inválido.' });

  try {
    const existente = await (prisma as any).comentario.findUnique({ where: { id: idNum } });
    if (!existente) return res.status(404).json({ error: 'Comentário não encontrado' });
    if (existente.usuarioId !== usuarioId) return res.status(403).json({ error: 'Acesso negado.' });

    const deletado = await (prisma as any).comentario.delete({ where: { id: idNum } });
    res.status(200).json({ message: 'Comentário deletado com sucesso', comentario: deletado });
  } catch (err) {
    console.error('Erro ao deletar comentário:', err);
    res.status(500).json({ error: 'Não foi possível deletar o comentário.' });
  }
};

export const listByAnuncio = async (req: Request, res: Response) => {
  const { anuncioId } = req.params;
  const anuncioIdNum = Number(anuncioId);
  if (Number.isNaN(anuncioIdNum)) return res.status(400).json({ error: 'ID do anúncio inválido.' });

  try {
    const lista = await prisma.comentario.findMany({
      where: { anuncioId: anuncioIdNum },
      include: {
        usuario: {
          select: {
            nome: true, 
          },
        },
      },
      orderBy: {
        criadoEm: 'desc', 
      },
    });

    res.status(200).json(lista);
  } catch (err) {
    console.error('Erro ao listar comentários:', err);
    res.status(500).json({ error: 'Não foi possível listar comentários.' });
  }
};
