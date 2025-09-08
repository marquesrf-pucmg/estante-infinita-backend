// src/controllers/anuncioController.ts
import express, { type Request, type Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// --- GET /api/anuncios ---
// Lista todos os anúncios
export const getAllAnuncios = async (req: Request, res: Response) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
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
    const anuncio = await prisma.anuncio.findUnique({
      where: { id },
      include: {
        owner: {
          select: { name: true, email: true },
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
export const createAnuncio = async (req: Request, res: Response) => {
  // TODO: No futuro, o ID virá do token de autenticação (req.user.id)
  // Por enquanto, vamos pegar um usuário existente do banco para simular.
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    return res.status(400).json({
      error:
        "Nenhum usuário encontrado para associar ao anúncio. Rode o seed primeiro.",
    });
  }

  const { titulo, autor, descricao, tipo, condicao, preco } = req.body;

  try {
    const novoAnuncio = await prisma.anuncio.create({
      data: {
        titulo,
        autor,
        descricao,
        tipo,
        condicao,
        preco,
        ownerId: firstUser.id, // Associa o anúncio ao primeiro usuário encontrado
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
export const updateAnuncio = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  const { titulo, autor, descricao, tipo, condicao, preco, publicado } =
    req.body;

  // TODO: Adicionar lógica para verificar se o usuário logado é o dono do anúncio

  try {
    const anuncioAtualizado = await prisma.anuncio.update({
      where: { id },
      data: {
        titulo,
        autor,
        descricao,
        tipo,
        condicao,
        preco,
        publicado,
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
export const deleteAnuncio = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  // TODO: Adicionar lógica para verificar se o usuário logado é o dono do anúncio

  try {
    const anuncioDeletado = await prisma.anuncio.delete({
      where: { id },
    });
    // 204 No Content é a resposta padrão para delete com sucesso
    // Porém, estamos enviando uma mensagem junto para facilitar o feedback no frontend
    // Assim, o código de status muda para 200 OK
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
