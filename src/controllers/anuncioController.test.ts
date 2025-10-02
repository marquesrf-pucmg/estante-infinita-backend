// src/controllers/anuncioController.test.ts
import { Request, Response } from 'express';
import * as anuncioController from './anuncioController';
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
  const anunciosMock = [
        {
          id: 1,
          titulo: 'Livro A',
          autor: 'Autor A',
          usuarioId: 101,
          descricao: null,
          isbn: null,
          editora: null,
          ano: null,
          genero: 'FICCAO',
          preco: null,
          condicao: 'USADO',
          tipo: 'TROCA',
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
        {
          id: 2,
          titulo: 'Livro B',
          autor: 'Autor B',
          usuarioId: 102,
          descricao: null,
          isbn: null,
          editora: null,
          ano: null,
          genero: 'ROMANCE',
          preco: null,
          condicao: 'NOVO',
          tipo: 'VENDA',
          ativo: true,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ];

  (prismaMock as any).anuncio.findMany.mockResolvedValue(anunciosMock as any);
      await anuncioController.getAllAnuncios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(anunciosMock);
    });
  });

  // Testes para getAnuncioById
  describe('getAnuncioById', () => {
    it('deve retornar um único anúncio e status 200 se encontrado', async () => {
      const mockReq = { params: { id: 'anuncio-123' } } as unknown as Request;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const anuncioMock = {
        id: 1,
        titulo: 'Livro Teste',
        autor: 'Autor Teste',
        usuarioId: 101,
        descricao: null,
        isbn: null,
        editora: null,
        ano: null,
        genero: 'FICCAO',
        preco: null,
        condicao: 'NOVO',
        tipo: 'VENDA',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
  };

  (prismaMock as any).anuncio.findUnique.mockResolvedValue(anuncioMock as any);
      await anuncioController.getAnuncioById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(anuncioMock);
    });

    it('deve retornar erro 404 se o anúncio não for encontrado', async () => {
      const mockReq = { params: { id: 'id-inexistente' } } as unknown as Request;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

  (prismaMock as any).anuncio.findUnique.mockResolvedValue(null);
      await anuncioController.getAnuncioById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Anúncio não encontrado' });
    });
  });

  // Testes para createAnuncio
  describe('createAnuncio', () => {
    it('deve criar e retornar um novo anúncio com status 201', async () => {
      const mockReq = {
        userId: 101,
        body: {
          titulo: 'Novo Livro',
          autor: 'Autor Novo',
          genero: 'FICCAO',
          tipo: 'VENDA',
          condicao: 'NOVO',
          ativo: true,
        },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      const anuncioCriadoMock = {
        id: 2,
        usuarioId: 101,
        ...mockReq.body,
        descricao: null,
        isbn: null,
        editora: null,
        ano: null,
        preco: null,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

  (prismaMock as any).anuncio.create.mockResolvedValue(anuncioCriadoMock as any);
      await anuncioController.createAnuncio(mockReq, mockRes);

      expect(prismaMock.anuncio.create).toHaveBeenCalledWith({
        data: { ...mockReq.body, usuarioId: 101 }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(anuncioCriadoMock);
    });
  });

  // Testes para updateAnuncio
  describe('updateAnuncio', () => {
    const mockAnuncio = {
      id: 1,
      titulo: 'Livro Antigo',
      autor: 'Autor Antigo',
      usuarioId: 101,
      descricao: null,
      isbn: null,
      editora: null,
      ano: null,
      genero: 'FICCAO',
      preco: null,
      condicao: 'USADO',
      tipo: 'TROCA',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    it('deve atualizar um anúncio com sucesso se o usuário for o dono', async () => {
      const mockReq = {
        params: { id: 1 },
        userId: 101,
        body: { titulo: 'Livro Atualizado' },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
      
    (prismaMock as any).anuncio.findUnique.mockResolvedValue(mockAnuncio as any);
    (prismaMock as any).anuncio.update.mockResolvedValue({ ...mockAnuncio, ...mockReq.body } as any);

      await anuncioController.updateAnuncio(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Livro Atualizado' }));
    });

    it('deve retornar erro 403 se o usuário não for o dono', async () => {
      const mockReq = {
        params: { id: 1 },
        userId: 999,
        body: { titulo: 'Livro Atualizado' },
      } as unknown as AuthRequest;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    (prismaMock as any).anuncio.findUnique.mockResolvedValue(mockAnuncio as any);
  await anuncioController.updateAnuncio(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(403);
  expect(prismaMock.anuncio.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se o anúncio a ser atualizado não for encontrado', async () => {
        const mockReq = {
          params: { id: 999 },
          userId: 101,
          body: { titulo: 'Livro Atualizado' },
        } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
            (prismaMock as any).anuncio.findUnique.mockResolvedValue(null);
        await anuncioController.updateAnuncio(mockReq, mockRes);
  
        expect(mockRes.status).toHaveBeenCalledWith(404);
      });
  });

  // Testes para deleteAnuncio
  describe('deleteAnuncio', () => {
    const mockAnuncio = {
      id: 1,
      titulo: 'Livro a ser deletado',
      autor: 'Autor',
      usuarioId: 101,
      descricao: null,
      isbn: null,
      editora: null,
      ano: null,
      genero: 'FICCAO',
      preco: null,
      condicao: 'USADO',
      tipo: 'TROCA',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    it('deve deletar um anúncio com sucesso se o usuário for o dono', async () => {
  const mockReq = { params: { id: 1 }, userId: 101 } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

  (prismaMock as any).anuncio.findUnique.mockResolvedValue(mockAnuncio as any);
  (prismaMock as any).anuncio.delete.mockResolvedValue(mockAnuncio as any);

  await anuncioController.deleteAnuncio(mockReq, mockRes);

  expect(prismaMock.anuncio.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('deve retornar erro 403 se o usuário não for o dono', async () => {
  const mockReq = { params: { id: 1 }, userId: 999 } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

  prismaMock.anuncio.findUnique.mockResolvedValue(mockAnuncio);
  await anuncioController.deleteAnuncio(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(403);
  expect(prismaMock.anuncio.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se o anúncio a ser deletado não for encontrado', async () => {
  const mockReq = { params: { id: 999 }, userId: 101 } as unknown as AuthRequest;
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
  (prismaMock as any).anuncio.findUnique.mockResolvedValue(null);
  await anuncioController.deleteAnuncio(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(404);
      });
  });
});