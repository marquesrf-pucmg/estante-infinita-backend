// src/controllers/anuncioController.test.ts
import { Request, Response } from 'express';
import { Anuncio, TipoAnuncio, CondicaoLivro } from '@prisma/client';
import {
  getAllAnuncios,
  getAnuncioById,
  createAnuncio,
  updateAnuncio,
  deleteAnuncio
} from './anuncioController';
import { prismaMock } from '../__tests__/singleton'; // Nosso Prisma "fake" importado

// Interface para que o TypeScript reconheça o 'userId' na requisição
interface AuthRequest extends Request {
  userId?: string;
}

describe('Anuncio Controller', () => {

  // Testes para getAllAnuncios
  describe('getAllAnuncios', () => {
    it('deve retornar uma lista de anúncios e status 200', async () => {
      const mockReq = {} as Request;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const anunciosMock: Anuncio[] = [
        { id: '1', titulo: 'Livro A', autor: 'Autor A', ownerId: 'user-1', createdAt: new Date(), updatedAt: new Date(), descricao: null, preco: null, tipo: 'TROCA', condicao: 'USADO', publicado: true },
        { id: '2', titulo: 'Livro B', autor: 'Autor B', ownerId: 'user-2', createdAt: new Date(), updatedAt: new Date(), descricao: null, preco: null, tipo: 'VENDA', condicao: 'NOVO', publicado: true },
      ];

  prismaMock.anuncio.findMany.mockResolvedValue(anunciosMock);
  await getAllAnuncios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(anunciosMock);
    });
  });

  // Testes para getAnuncioById
  describe('getAnuncioById', () => {
    it('deve retornar um único anúncio e status 200 se encontrado', async () => {
      const mockReq = { params: { id: 'anuncio-123' } } as unknown as Request;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const anuncioMock = { id: 'anuncio-123', titulo: 'Livro Teste' } as Anuncio;

  prismaMock.anuncio.findUnique.mockResolvedValue(anuncioMock);
  await getAnuncioById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(anuncioMock);
    });

    it('deve retornar erro 404 se o anúncio não for encontrado', async () => {
      const mockReq = { params: { id: 'id-inexistente' } } as unknown as Request;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

  prismaMock.anuncio.findUnique.mockResolvedValue(null);
  await getAnuncioById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Anúncio não encontrado' });
    });
  });

  // Testes para createAnuncio
  describe('createAnuncio', () => {
    it('deve criar e retornar um novo anúncio com status 201', async () => {
      const mockReq = {
        userId: 'user-123',
        body: {
          titulo: 'Novo Livro',
          autor: 'Autor Novo',
          tipo: TipoAnuncio.VENDA,
          condicao: CondicaoLivro.NOVO
        },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const anuncioCriadoMock = { id: 'anuncio-456', ownerId: 'user-123', ...mockReq.body } as Anuncio;

  prismaMock.anuncio.create.mockResolvedValue(anuncioCriadoMock);
  await createAnuncio(mockReq, mockRes);

      expect(prismaMock.anuncio.create).toHaveBeenCalledWith({
        data: { ...mockReq.body, ownerId: 'user-123' }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(anuncioCriadoMock);
    });
  });

  // Testes para updateAnuncio
  describe('updateAnuncio', () => {
    const mockAnuncio = { id: 'anuncio-123', ownerId: 'user-123', titulo: 'Livro Antigo' } as Anuncio;

    it('deve atualizar um anúncio com sucesso se o usuário for o dono', async () => {
      const mockReq = {
        params: { id: 'anuncio-123' },
        userId: 'user-123',
        body: { titulo: 'Livro Atualizado' },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      
      prismaMock.anuncio.findUnique.mockResolvedValue(mockAnuncio);
      prismaMock.anuncio.update.mockResolvedValue({ ...mockAnuncio, ...mockReq.body });

  await updateAnuncio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Livro Atualizado' }));
    });

    it('deve retornar erro 403 se o usuário não for o dono', async () => {
      const mockReq = {
        params: { id: 'anuncio-123' },
        userId: 'user-diferente-456',
        body: { titulo: 'Livro Atualizado' },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      prismaMock.anuncio.findUnique.mockResolvedValue(mockAnuncio);
  await updateAnuncio(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(prismaMock.anuncio.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se o anúncio a ser atualizado não for encontrado', async () => {
        const mockReq = {
          params: { id: 'id-inexistente' },
          userId: 'user-123',
          body: { titulo: 'Livro Atualizado' },
        } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        prismaMock.anuncio.findUnique.mockResolvedValue(null);
  await updateAnuncio(mockReq, mockRes);
  
        expect(mockRes.status).toHaveBeenCalledWith(404);
      });
  });

  // Testes para deleteAnuncio
  describe('deleteAnuncio', () => {
    const mockAnuncio = { id: 'anuncio-123', ownerId: 'user-123', titulo: 'Livro a ser deletado' } as Anuncio;

    it('deve deletar um anúncio com sucesso se o usuário for o dono', async () => {
        const mockReq = { params: { id: 'anuncio-123' }, userId: 'user-123' } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

        prismaMock.anuncio.findUnique.mockResolvedValue(mockAnuncio);
        prismaMock.anuncio.delete.mockResolvedValue(mockAnuncio);

  await deleteAnuncio(mockReq, mockRes);

        expect(prismaMock.anuncio.delete).toHaveBeenCalledWith({ where: { id: 'anuncio-123' } });
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 403 se o usuário não for o dono', async () => {
        const mockReq = { params: { id: 'anuncio-123' }, userId: 'user-diferente-456' } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

        prismaMock.anuncio.findUnique.mockResolvedValue(mockAnuncio);
  await deleteAnuncio(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(prismaMock.anuncio.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se o anúncio a ser deletado não for encontrado', async () => {
        const mockReq = { params: { id: 'id-inexistente' }, userId: 'user-123' } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
        prismaMock.anuncio.findUnique.mockResolvedValue(null);
  await deleteAnuncio(mockReq, mockRes);
  
        expect(mockRes.status).toHaveBeenCalledWith(404);
      });
  });
});