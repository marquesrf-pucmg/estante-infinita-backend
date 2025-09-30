// src/controllers/anuncioController.ts

import { Prisma } from "@prisma/client";
import prisma from '@src/lib/prisma';
import { Request, Response, Router } from "express";
import { PrismaClient } from '@prisma/client';
import * as dotenv from "dotenv";
dotenv.config();

// Funções exportadas para testes
export async function getAllAnuncios(req: Request, res: Response) {
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
}

export async function getAnuncioById(req: Request, res: Response) {
  const { anuncioID } = req.params;

  if (!anuncioID) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  try {
    const anuncio = await prisma.anuncio.findUnique({
      where: { id: anuncioID },
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
}

export async function createAnuncio(req: Request, res: Response) {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
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
        ownerId: userId,
      },
    });
    res.status(201).json(novoAnuncio);
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({ error: "Não foi possível criar o anúncio" });
  }
}

export async function updateAnuncio(req: Request, res: Response) {
  const anuncioID = req.params.anuncioID;
  const userId = req.params.userId;

  if (!anuncioID) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const { titulo, autor, descricao, tipo, condicao, preco, publicado } = req.body;

  try {
    const anuncio = await prisma.anuncio.findUnique({ where: { id: anuncioID } });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    if (anuncio.ownerId !== userId) {
      return res.status(403).json({ error: "Acesso negado. Você não é o dono deste anúncio." });
    }

    const anuncioAtualizado = await prisma.anuncio.update({
      where: { id: anuncioID },
      data: { titulo, autor, descricao, tipo, condicao, preco, publicado },
    });

    res.status(200).json(anuncioAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    res.status(500).json({ error: "Não foi possível atualizar o anúncio" });
  }
}

export async function deleteAnuncio(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.params.userID;

  if (!id) {
    return res.status(400).json({ error: "O ID do anúncio é obrigatório." });
  }

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const anuncio = await prisma.anuncio.findUnique({ where: { id } });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }

    if (anuncio.ownerId !== userId) {
      return res.status(403).json({ error: "Acesso negado. Você não é o dono deste anúncio." });
    }

    const anuncioDeletado = await prisma.anuncio.delete({ where: { id } });

    res.status(200).json({
      message: "Anúncio deletado com sucesso.",
      anuncio: anuncioDeletado,
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return res.status(404).json({ error: "Anúncio não encontrado" });
    }
    console.error("Erro ao deletar anúncio:", error);
    res.status(500).json({ error: "Não foi possível deletar o anúncio" });
  }
}

// Classe para rotas (mantém uso na aplicação)
export default class AnuncioController {
  public router: Router;
  private prisma: any = new PrismaClient();

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get("/getAllAnuncios", getAllAnuncios);
    this.router.get("/getAnuncioById/:id", getAnuncioById);
    this.router.post("/createAnuncio", createAnuncio);
    this.router.put("/updateAnuncio/:anuncioID/:userID", updateAnuncio);
    this.router.delete("/deleteAnuncio/:id", deleteAnuncio);
  }
}