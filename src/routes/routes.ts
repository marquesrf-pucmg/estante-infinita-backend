import express, { Request, Response } from 'express';
import UserController from '../controllers/userController';
import AnuncioController from '../controllers/anuncioController';
import AuthController from '../controllers/authController';

const routes = (server: express.Application): void => {
    server._router.get("/", (req: Request, res: Response) => {
        res.json({ message: `Deu certo?!` });
    });

    server.use('/user', new UserController().router);
    server.use('/auth', new AuthController().router);
    server.use('/anuncio', new AnuncioController().router);


    server.use((req, res, next) => {
        res.status(404).json({ message: 'Caminho não encontrado!' });
    })
};

export default routes