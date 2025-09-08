// src/server.ts
import express from "express";
import routes from "./routes/index";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json()); // Habilita o uso de JSON no corpo das requisições
app.use("/api", routes); // Prefixo para todas as rotas da API

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
