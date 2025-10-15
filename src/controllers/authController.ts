import { Request, Response } from 'express';
import prisma from '@src/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  // 1. A desestruturação agora espera 'nome' e 'senha' diretamente do body
  const { nome, email, senha } = req.body;

  // 2. A validação é atualizada para as novas variáveis
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Os campos nome, email e senha são obrigatórios.' });
  }

  try {
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }

    // 3. O hash é feito diretamente na variável 'senha'
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.usuario.create({
      data: {
        // 4. Como os nomes são iguais, podemos usar a forma abreviada
        nome,
        email,
        senha: hashedPassword, // A senha salva no banco é a versão com hash
      },
    });

    if (!process.env.JWT_SECRET) {
      // É uma boa prática manter essa verificação
      throw new Error("A chave secreta do JWT não foi definida no .env");
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '8h', // 8 horas de validade para o token
    });

    // 5. O objeto de resposta também usará 'nome' para manter a consistência
    const userWithoutPassword = {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      criadoEm: newUser.criadoEm,
      atualizadoEm: newUser.atualizadoEm,
    };

    res.status(201).json({userWithoutPassword, token});
  } catch (error) {
    console.error('Erro no register:', error);
    res.status(500).json({ error: 'Não foi possível registrar o usuário.' });
  }
};

export const login = async (req: Request, res: Response) => {
  // 1. Espera 'senha' em vez de 'password'
  const { email, senha } = req.body;

  if (!email || !senha) {
    // Mensagem de erro consistente
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 2. Busca no model 'usuario' e sem o '(as any)'
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // 3. Compara a 'senha' recebida com a 'user.senha' do banco
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!process.env.JWT_SECRET) {
      // É uma boa prática manter essa verificação
      throw new Error("A chave secreta do JWT não foi definida no .env");
    }

    const userWithoutPassword = {
      id: user.id,
      nome: user.nome,
      email: user.email,
    };

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '8h', // 8 horas de validade para o token
    });

    res.status(200).json({userWithoutPassword, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Não foi possível fazer o login.' });
  }
};