// src/controllers/anuncioController.ts
import express, { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from '@src/lib/prisma';

interface AuthRequest extends Request {
  userId?: string;
}

// --- GET /api/anuncios ---
// Lista todos os anúncios
export const getAllAnuncios = async (req: Request, res: Response) => {
  try {
  const anuncios = await (prisma as any).anuncio.findMany({
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
      },
    });
    res.status(200).json(anuncios);
  } catch (error) {
    res.status(500).json({ error: "Não foi possível buscar os anúncios" });
  }
};

// --- GET /api/anuncios/:id ---
// Busca um anúncio específico pelo seu ID
export const getAnuncioById = async (req: Request, res: Response) => {
  const { id } = req.params; // Pega o ID dos parâmetros da rota

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  try {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID do anúncio inválido.' });
    }

  const anuncio = await (prisma as any).anuncio.findUnique({
      where: { id: idNum },
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
      },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    res.status(200).json(anuncio);
  } catch (error) {
    res.status(500).json({ error: "Não foi possível buscar o anúncio" });
  }
};

// --- POST /api/anuncios ---
// Cria um novo anúncio
export const createAnuncio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  
  if (!userId) {
    // Essa verificação é uma segurança extra, embora o middleware já garanta o userId
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  const { titulo, autor, descricao, tipo, condicao, preco } = req.body;

  try {
    const usuarioId = Number(userId);
    if (Number.isNaN(usuarioId)) {
      return res.status(400).json({ error: 'ID do usuário inválido.' });
    }

  const novoAnuncio = await (prisma as any).anuncio.create({
      data: {
        titulo,
        autor,
        descricao,
        tipo,
        condicao,
        preco,
        usuarioId,
      },
    });
    res.status(201).json(novoAnuncio);
  } catch (error) {
    // Adiciona log para depuração
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({ error: "Não foi possível criar o anúncio" });
  }
};

// --- PUT /api/anuncios/:id ---
// Atualiza um anúncio existente
export const updateAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  const {
    titulo,
    autor,
    descricao,
    isbn,
    editora,
    ano,
    genero,
    tipo,
    condicao,
    preco,
    ativo,
  } = req.body;

  try {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID do anúncio inválido.' });
    }

  const anuncio = await (prisma as any).anuncio.findUnique({ where: { id: idNum } });

    if (!anuncio) {
      return res.status(404).json({ error: 'Anúncio não encontrado' });
    }

    const usuarioId = Number(userId);
    if (anuncio.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste anúncio.' });
    }

    // Construção dinâmica do objeto de update para evitar atualizar campos nulos/indesejados
    const data: any = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (autor !== undefined) data.autor = autor;
    if (descricao !== undefined) data.descricao = descricao;
    if (isbn !== undefined) data.isbn = isbn;
    if (editora !== undefined) data.editora = editora;
    if (ano !== undefined) data.ano = ano;
    if (genero !== undefined) data.genero = genero;
    if (tipo !== undefined) data.tipo = tipo;
    if (condicao !== undefined) data.condicao = condicao;
    if (preco !== undefined) data.preco = preco;
    if (ativo !== undefined) data.ativo = ativo;

  const anuncioAtualizado = await (prisma as any).anuncio.update({
      where: { id: idNum },
      data,
    });

    res.status(200).json(anuncioAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    res.status(500).json({ error: "Não foi possível atualizar o anúncio" });
  }
};

// --- DELETE /api/anuncios/:id ---
// Deleta um anúncio
export const deleteAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  try {
    const idNum = Number(id);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID do anúncio inválido.' });
    }

  const anuncio = await (prisma as any).anuncio.findUnique({ where: { id: idNum } });

    if (!anuncio) {
      return res.status(404).json({ error: 'Anúncio não encontrado' });
    }
    const usuarioId = Number(userId);
    if (anuncio.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste anúncio.' });
    }

  const anuncioDeletado = await (prisma as any).anuncio.delete({ where: { id: idNum } });

    res.status(200).json({ message: "Anúncio deletado com sucesso.", anuncio: anuncioDeletado });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Anúncio não encontrado" });
      }
    }
    console.error("Erro ao deletar anúncio:", error);
    res.status(500).json({ error: "Não foi possível deletar o anúncio" });
  }
};
