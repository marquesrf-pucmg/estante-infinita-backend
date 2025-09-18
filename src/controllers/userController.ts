import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  userId?: string;
}

export default class UserController {
  public router: Router;
  private prisma: PrismaClient = new PrismaClient();

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.get('/me', this.getMe);
  }

  private getMe = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Não foi possível buscar o usuário." });
    }
  };
}