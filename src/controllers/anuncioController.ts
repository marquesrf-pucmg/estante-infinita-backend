// src/controllers/anuncioController.ts
import { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from '@src/lib/prisma'; // Verifique o caminho da importação

// Interface para estender o Request do Express e adicionar o userId
interface AuthRequest extends Request {
  userId?: string;
}

// --- GET /api/anuncios ---
// Lista todos os anúncios
export const getAllAnuncios = async (req: Request, res: Response) => {
  try {
    const anuncios = await prisma.anuncio.findMany({
      include: {
        // Inclui informações do usuário que criou o anúncio
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
  const { id } = req.params;

  try {
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'ID do anúncio inválido.' });
    }

    const anuncio = await prisma.anuncio.findUnique({
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
    console.error("Erro ao buscar anúncio por ID:", error);
    res.status(500).json({ error: "Não foi possível buscar o anúncio" });
  }
};

// --- POST /api/anuncios ---
// Cria um novo anúncio
export const createAnuncio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  // Desestruturando todos os campos do model Anuncio do body
  const {
    titulo, autor, descricao, isbn, editora, ano, genero, preco, condicao, tipo
  } = req.body;

  // Validação dos campos obrigatórios
  if (!titulo || !autor || !genero || !condicao || !tipo) {
    return res.status(400).json({
      error: "Campos obrigatórios não preenchidos: titulo, autor, genero, condicao, tipo."
    });
  }

  try {
    const usuarioId = Number(userId);

    const novoAnuncio = await prisma.anuncio.create({
      data: {
        titulo,
        autor,
        descricao,
        isbn,
        editora,
        ano: ano ? Number(ano) : null, // Converte para número ou define como nulo
        genero,
        preco: preco ? new Prisma.Decimal(preco) : null, // Converte para Decimal
        condicao,
        tipo,
        usuarioId, // Associa ao usuário logado
      },
    });
    res.status(201).json(novoAnuncio);
  } catch (error) {
    // Tratamento de erro específico para valores de enum inválidos
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        error: "Erro de validação. Verifique se os valores para genero, condicao e tipo são válidos.",
        details: error.message
      });
    }
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({ error: "Não foi possível criar o anúncio." });
  }
};


// --- PUT /api/anuncios/:id ---
// Atualiza um anúncio existente
export const updateAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  try {
    const idNum = Number(id);
    const usuarioIdNum = Number(userId);

    if (isNaN(idNum) || isNaN(usuarioIdNum)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    // Verifica se o anúncio existe e se pertence ao usuário
    const anuncio = await prisma.anuncio.findUnique({ where: { id: idNum } });
    if (!anuncio) {
      return res.status(404).json({ error: 'Anúncio não encontrado' });
    }
    if (anuncio.usuarioId !== usuarioIdNum) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste anúncio.' });
    }

    const {
      titulo, autor, descricao, isbn, editora, ano, genero, preco, condicao, tipo, ativo
    } = req.body;

    // Converte os tipos de dados antes de enviar para o banco
    const data: Prisma.AnuncioUpdateInput = {
      ...req.body,
      ano: ano !== undefined ? (ano === null ? null : Number(ano)) : undefined,
      preco: preco !== undefined ? (preco === null ? null : new Prisma.Decimal(preco)) : undefined,
    };

    const anuncioAtualizado = await prisma.anuncio.update({
      where: { id: idNum },
      data,
    });

    res.status(200).json(anuncioAtualizado);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        error: "Erro de validação. Verifique se os valores para genero, condicao e tipo são válidos.",
      });
    }
    console.error("Erro ao atualizar anúncio:", error);
    res.status(500).json({ error: "Não foi possível atualizar o anúncio." });
  }
};


// --- DELETE /api/anuncios/:id ---
// Deleta um anúncio
export const deleteAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  try {
    const idNum = Number(id);
    const usuarioIdNum = Number(userId);

    if (isNaN(idNum) || isNaN(usuarioIdNum)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    // Verifica se o anúncio existe e se pertence ao usuário
    const anuncio = await prisma.anuncio.findUnique({ where: { id: idNum } });
    if (!anuncio) {
      return res.status(404).json({ error: 'Anúncio não encontrado' });
    }
    if (anuncio.usuarioId !== usuarioIdNum) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste anúncio.' });
    }

    await prisma.anuncio.delete({ where: { id: idNum } });

    res.status(200).json({ message: "Anúncio deletado com sucesso." });
  } catch (error) {
    // Trata o erro caso o registro a ser deletado não seja encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Anúncio não encontrado para deleção." });
    }
    console.error("Erro ao deletar anúncio:", error);
    res.status(500).json({ error: "Não foi possível deletar o anúncio." });
  }
};