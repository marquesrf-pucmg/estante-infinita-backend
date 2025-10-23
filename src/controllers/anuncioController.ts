// src/controllers/anuncioController.ts
import { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "@src/lib/prisma";

interface AuthRequest extends Request {
  userId?: string;
}

// --- GET /api/anuncios ---
// Lista todos os anúncios
export const getAllAnuncios = async (req: Request, res: Response) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      where: { ativo: true },
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
      },
    });
    res.status(200).json(anuncios);
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({ error: "Não foi possível buscar os anúncios" });
  }
};

// --- GET /api/anuncios/:id ---
// Busca um anúncio específico pelo seu ID
export const getAnuncioById = async (req: Request, res: Response) => {
  const { id } = req.params; // Pega o ID dos parâmetros da rota

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      error: "O ID do anúncio é obrigatório e deve ser um número válido.",
    });
  }

  try {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
        avaliacoes: {
          include: {
            usuario: {
              select: { nome: true },
            },
          },
        },
        comentarios: {
          include: {
            usuario: {
              select: { nome: true },
            },
          },
        },
      },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    res.status(200).json(anuncio);
  } catch (error) {
    console.error("Erro ao buscar anúncio:", error);
    res.status(500).json({ error: "Não foi possível buscar o anúncio" });
  }
};

// --- POST /api/anuncios ---
// Cria um novo anúncio
export const createAnuncio = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    // Essa verificação é uma segurança extra, embora o middleware já garanta o userId
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const userId = parseInt(req.userId, 10);
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
  } = req.body;

  if (!titulo || !autor || !genero || !tipo || !condicao) {
    return res.status(400).json({
      error: "Campos obrigatórios: titulo, autor, genero, tipo e condicao.",
    });
  }

  try {
    const novoAnuncio = await prisma.anuncio.create({
      data: {
        titulo,
        autor,
        descricao,
        isbn,
        editora,
        ano: ano ? parseInt(ano, 10) : null,
        genero,
        tipo,
        condicao,
        preco: preco ? new Prisma.Decimal(preco) : null,
        usuarioId: userId,
      },
      include: {
        usuario: {
          select: { nome: true, email: true },
        },
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

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      error: "O ID do anúncio é obrigatório e deve ser um número válido.",
    });
  }

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
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
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    if (anuncio.usuarioId !== parseInt(userId, 10)) {
      return res
        .status(403)
        .json({ error: "Acesso negado. Você não é o dono deste anúncio." });
    }

    const anuncioAtualizado = await prisma.anuncio.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(titulo && { titulo }),
        ...(autor && { autor }),
        ...(descricao !== undefined && { descricao }),
        ...(isbn !== undefined && { isbn }),
        ...(editora !== undefined && { editora }),
        ...(ano && { ano: parseInt(ano, 10) }),
        ...(genero && { genero }),
        ...(tipo && { tipo }),
        ...(condicao && { condicao }),
        ...(preco !== undefined && {
          preco: preco ? new Prisma.Decimal(preco) : null,
        }),
        ...(ativo !== undefined && { ativo }),
      },
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

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      error: "O ID do anúncio é obrigatório e deve ser um número válido.",
    });
  }

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    if (anuncio.usuarioId !== parseInt(userId, 10)) {
      return res
        .status(403)
        .json({ error: "Acesso negado. Você não é o dono deste anúncio." });
    }

    const anuncioDeletado = await prisma.anuncio.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({
      message: "Anúncio deletado com sucesso.",
      anuncio: anuncioDeletado,
    });
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
