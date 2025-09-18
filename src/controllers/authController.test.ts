// src/controllers/authController.test.ts
import { Request, Response } from 'express';
import * as authController from './authController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaMock } from '../__tests__/singleton'; // <-- Importa nosso Prisma Falso

jest.mock('bcryptjs'); // Mantemos o mock do bcrypt

jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Controller', () => {

    beforeAll(() => {
        process.env.JWT_SECRET = 'super-secret-test-key';
    });

    describe('register', () => {
        it('deve registrar um novo usuário com sucesso', async () => {
            const req = { body: { name: 'Test User', email: 'test@example.com', password: 'password123' } } as Request;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const hashedPassword = 'hashed_password';
            const createdUser = { id: '1', name: 'Test User', email: 'test@example.com', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() };

            prismaMock.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            prismaMock.user.create.mockResolvedValue(createdUser);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test User' }));
        });

        it('deve retornar erro 409 se o e-mail já existir', async () => {
            const req = { body: { name: 'Test User', email: 'test@example.com', password: 'password123' } } as Request;
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
            const existingUser = { id: '1', name: 'Existing User', email: 'test@example.com', password: 'hashed_password', createdAt: new Date(), updatedAt: new Date() };

            prismaMock.user.findUnique.mockResolvedValue(existingUser);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'Este e-mail já está em uso.' });
        });

        describe('login', () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashed_password', // Senha já hasheada no "banco"
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            it('deve autenticar o usuário e retornar um token com sucesso', async () => {
                const req = { body: { email: 'test@example.com', password: 'password123' } } as Request;
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

                // Simula que o usuário foi encontrado no banco
                prismaMock.user.findUnique.mockResolvedValue(mockUser);
                // Simula que a senha enviada corresponde à senha hasheada
                (bcrypt.compare as jest.Mock).mockResolvedValue(true);
                (mockedJwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

                await authController.login(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    token: expect.any(String), // Verificamos se um token (qualquer string) foi retornado
                }));
            });

            it('deve retornar erro 401 se o usuário não for encontrado', async () => {
                const req = { body: { email: 'notfound@example.com', password: 'password123' } } as Request;
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

                // Simula que o usuário NÃO foi encontrado
                prismaMock.user.findUnique.mockResolvedValue(null);

                await authController.login(req, res);

                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas.' });
            });

            it('deve retornar erro 401 se a senha estiver incorreta', async () => {
                const req = { body: { email: 'test@example.com', password: 'wrong_password' } } as Request;
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

                // Simula que o usuário foi encontrado
                prismaMock.user.findUnique.mockResolvedValue(mockUser);
                // Simula que a senha enviada NÃO corresponde
                (bcrypt.compare as jest.Mock).mockResolvedValue(false);

                await authController.login(req, res);

                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas.' });
            });
        });
    });
});