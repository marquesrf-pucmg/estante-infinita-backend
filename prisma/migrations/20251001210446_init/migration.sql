-- CreateEnum
CREATE TYPE "public"."CONDICAO_LIVRO" AS ENUM ('NOVO', 'SEMINOVO', 'USADO');

-- CreateEnum
CREATE TYPE "public"."TIPO_ANUNCIO" AS ENUM ('VENDA', 'TROCA', 'COMPRA');

-- CreateEnum
CREATE TYPE "public"."AVALIACAO" AS ENUM ('EXCELENTE', 'MUITO_BOM', 'BOM', 'REGULAR', 'RUIM');

-- CreateEnum
CREATE TYPE "public"."GENERO" AS ENUM ('ACAO', 'AVENTURA', 'COMEDIA', 'DRAMA', 'FICCAO_CIENTIFICA', 'FANTASIA', 'ROMANCE', 'SUSPENSE', 'TERROR', 'BIOGRAFIA', 'HISTORIA', 'AUTOAJUDA', 'SAUDE', 'NEGOCIOS', 'TECNOLOGIA', 'ARTES', 'CULINARIA', 'VIAGENS', 'RELIGIAO', 'POESIA');

-- CreateTable
CREATE TABLE "public"."Anuncio" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "descricao" TEXT,
    "isbn" TEXT,
    "editora" TEXT,
    "ano" INTEGER,
    "genero" "public"."GENERO" NOT NULL,
    "preco" DECIMAL(10,2),
    "condicao" "public"."CONDICAO_LIVRO" NOT NULL,
    "tipo" "public"."TIPO_ANUNCIO" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Avaliacao" (
    "id" SERIAL NOT NULL,
    "avaliacao" "public"."AVALIACAO" NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "anuncioId" INTEGER NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comentario" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "anuncioId" INTEGER NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Anuncio_usuarioId_idx" ON "public"."Anuncio"("usuarioId");

-- CreateIndex
CREATE INDEX "Anuncio_ativo_idx" ON "public"."Anuncio"("ativo");

-- CreateIndex
CREATE INDEX "Anuncio_tipo_idx" ON "public"."Anuncio"("tipo");

-- CreateIndex
CREATE INDEX "Avaliacao_anuncioId_idx" ON "public"."Avaliacao"("anuncioId");

-- CreateIndex
CREATE INDEX "Avaliacao_usuarioId_idx" ON "public"."Avaliacao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_usuarioId_anuncioId_key" ON "public"."Avaliacao"("usuarioId", "anuncioId");

-- CreateIndex
CREATE INDEX "Comentario_anuncioId_idx" ON "public"."Comentario"("anuncioId");

-- CreateIndex
CREATE INDEX "Comentario_usuarioId_idx" ON "public"."Comentario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."Anuncio" ADD CONSTRAINT "Anuncio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avaliacao" ADD CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avaliacao" ADD CONSTRAINT "Avaliacao_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "public"."Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comentario" ADD CONSTRAINT "Comentario_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "public"."Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
