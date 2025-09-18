import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as dotenv from "dotenv";
dotenv.config();

export default class LivroController {
  public router: Router;
  private prisma: any = new PrismaClient();

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes() {
  }
}