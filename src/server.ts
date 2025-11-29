import express from "express";
import routes from "./routes/index";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3333;

const corsOptions = {
  origin: ["http://localhost:4200", "http://localhost:8081", "http://localhost:8082"], // Pode ser a string direta, já que é só uma
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Garanta que OPTIONS está aqui
  allowedHeaders: "Content-Type, Authorization", // Adicione outros headers que seu front-end envia
  optionsSuccessStatus: 204 // Responde ao preflight com 204 No Content
};

// Aplica o middleware CORS com essas opções para TODAS as rotas
app.use(cors(corsOptions));

// Agora o app.use(cors(corsOptions)) vai tratar
// corretamente as requisições OPTIONS e as outras (POST, GET, etc.)

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
