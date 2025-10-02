import { Request, Response } from 'express';
import prisma from '@src/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  // Aceitamos o payload no formato esperado pelos testes ({ name, email, password })
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const existingUser = await (prisma as any).user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Mapeamos `name` -> `nome` e `password` -> `senha` para compatibilidade com o schema Prisma
    const newUser = await (prisma as any).user.create({
      data: {
        nome: name,
        email,
        senha: hashedPassword,
      },
    });

    // Normalizamos o objeto de resposta para manter shape esperada nos testes (name/email/id)
    const userWithoutPassword = {
      id: newUser.id,
      name: newUser.nome ?? name,
      email: newUser.email,
      criadoEm: newUser.criadoEm,
      atualizadoEm: newUser.atualizadoEm,
    };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro no register:', error);
    res.status(500).json({ error: 'Não foi possível registrar o usuário.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail and senha são obrigatórios.' });
  }

  try {
    // usamos (prisma as any).user para evitar erro de tipagem até gerar o client localmente
    const user = await (prisma as any).user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // O campo no schema é `senha` — o mock/test pode retornar `password` dependendo do teste.
    const hash = user.senha ?? user.password;

    const isPasswordValid = await bcrypt.compare(password, hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("A chave secreta do JWT não foi definida no .env");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Não foi possível fazer o login.' });
  }
};