// src/routes/index.ts
import express from "express";
import routes from "./src/routes/routes";

const cors = require('cors');

class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    public config(): void {
        this.app.set('port', 3000);
        // Configurar o tamanho máximo do payload para JSON
        this.app.use(express.json({ limit: '5000kb' })); // Ajuste o limite conforme necessário

        // Configurar o tamanho máximo do payload para dados URL-encoded
        this.app.use(express.urlencoded({ limit: '5000kb', extended: true }));
        const allowedDomains = ["http://localhost:4200"];

        this.app.use(cors(allowedDomains))
        routes(this.app);
    }

    public async start(): Promise<void> {
        this.app.listen(this.app.get('port'), () => {
            console.log('Server listening on port 3000');
        });
    }
}

const server = new Server();
server.start();
