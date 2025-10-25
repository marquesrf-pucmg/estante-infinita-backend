import { type Request, type Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "@src/lib/prisma";
import { uploadImageToSupabase } from "@src/services/supabase/image-upload";
import { parseNumericId } from "@src/helpers/number";

interface AuthRequest extends Request {
  userId?: string;
}

const verifyAnuncioOwnership = async (anuncioId: number, usuarioId: number) => {
  const anuncio = await prisma.anuncio.findUnique({
    where: { id: anuncioId },
    select: { usuarioId: true },
  });

  if (!anuncio) {
    throw new Error("Anúncio não encontrado");
  }

  if (anuncio.usuarioId !== usuarioId) {
    throw new Error("Acesso negado");
  }

  return anuncio;
};

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

// Busca um anúncio específico pelo seu ID
export const getAnuncioById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const idNum = parseNumericId(id);

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

// Cria um novo anúncio
export const createAnuncio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  // Desestruturando todos os campos do model Anuncio do body
  const { titulo, autor, descricao, isbn, editora, ano, genero, preco, condicao, tipo } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({ erro: "Nenhuma imagem enviada" });
  }

  // Validação dos campos obrigatórios
  if (!titulo || !autor || !genero || !condicao || !tipo) {
    return res.status(400).json({
      error: "Campos obrigatórios não preenchidos: titulo, autor, genero, condicao, tipo.",
    });
  }

  try {
    const usuarioId = parseNumericId(userId);

    const imageUrl = await uploadImageToSupabase(file);

    const novoAnuncio = await prisma.anuncio.create({
      data: {
        titulo,
        autor,
        descricao,
        isbn,
        editora,
        ano: ano ? parseNumericId(ano) : null,
        genero,
        preco: preco ? new Prisma.Decimal(preco) : null,
        condicao,
        tipo,
        imagem: imageUrl,
        usuarioId,
      },
    });

    res.status(201).json(novoAnuncio);
  } catch (error) {
    // Tratamento de erro específico para valores de enum inválidos
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        error: "Erro de validação. Verifique se os valores para genero, condicao e tipo são válidos.",
        details: error.message,
      });
    }
    console.error("Erro ao criar anúncio:", error);
    res.status(500).json({ error: "Não foi possível criar o anúncio." });
  }
};

// Atualiza um anúncio existente
export const updateAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const idNum = parseNumericId(id);
    const usuarioIdNum = parseNumericId(userId);

    // Verifica se o anúncio existe e se pertence ao usuário
    await verifyAnuncioOwnership(idNum, usuarioIdNum);

    const { ano, preco } = req.body;

    // Converte os tipos de dados antes de enviar para o banco
    const data: Prisma.AnuncioUpdateInput = {
      ...req.body,
      ano: ano !== undefined ? (ano === null ? null : parseNumericId(ano)) : undefined,
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

// Deleta um anúncio
export const deleteAnuncio = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  try {
    const idNum = parseNumericId(id);
    const usuarioIdNum = parseNumericId(userId);

    // Verifica se o anúncio existe e se pertence ao usuário
    await verifyAnuncioOwnership(idNum, usuarioIdNum);

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
