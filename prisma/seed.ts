// prisma/seed.ts
import {
  Prisma,
  PrismaClient,
  TIPO_ANUNCIO as tipo_anuncio,
  CONDICAO_LIVRO as condicao_livro,
  GENERO // Adicione a importação do seu enum de gênero
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from 'bcryptjs'; // Recomendado para hashear a senha

const prisma = new PrismaClient();

// Array com os 5 livros que você pediu
const bookData = [
  {
    titulo: "Duna",
    autor: "Frank Herbert",
    descricao: "Primeiro volume da aclamada série de ficção científica. Edição de colecionador com capa dura.",
    isbn: "9788576574826",
    editora: "Aleph",
    ano: 2017,
    genero: GENERO.FICCAO_CIENTIFICA, // Usando o enum
    preco: new Prisma.Decimal("89.90"),
    condicao: condicao_livro.SEMINOVO, // Usando o enum
    tipo: tipo_anuncio.VENDA // Usando o enum
  },
  {
    titulo: "O Hobbit",
    autor: "J.R.R. Tolkien",
    descricao: "Livro clássico que precede a trilogia 'O Senhor dos Anéis'. Possui algumas marcas de uso na lombada.",
    isbn: "9788595084733",
    editora: "HarperCollins",
    ano: 2019,
    genero: GENERO.FANTASIA,
    preco: new Prisma.Decimal("45.00"),
    condicao: condicao_livro.USADO,
    tipo: tipo_anuncio.VENDA
  },
  {
    titulo: "Hábitos Atômicos",
    autor: "James Clear",
    descricao: "Um método fácil e comprovado de criar bons hábitos e se livrar dos maus. Livro novo, lacrado.",
    isbn: "9786555640399",
    editora: "Sextante",
    ano: 2021,
    genero: GENERO.AUTOAJUDA,
    preco: new Prisma.Decimal("55.00"),
    condicao: condicao_livro.NOVO,
    tipo: tipo_anuncio.VENDA
  },
  {
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    descricao: "Edição de bolso. Ótima para estudos e transporte. Aceito trocar por outros clássicos.",
    isbn: null,
    editora: "Antofágica",
    ano: 2019,
    genero: GENERO.ROMANCE,
    preco: null,
    condicao: condicao_livro.USADO,
    tipo: tipo_anuncio.TROCA
  },
  {
    titulo: "A Garota do Lago",
    autor: "Charlie Donlea",
    descricao: "Suspense policial envolvente. Livro em perfeito estado, lido apenas uma vez.",
    isbn: "9788562409795",
    editora: "Faro Editorial",
    ano: 2017,
    genero: GENERO.SUSPENSE,
    preco: new Prisma.Decimal("30.00"),
    condicao: condicao_livro.SEMINOVO,
    tipo: tipo_anuncio.VENDA
  }
];

async function main() {
  console.log("Iniciando o processo de seeding...");

  // Limpar dados existentes (respeitando a ordem das chaves estrangeiras)
  await prisma.avaliacao.deleteMany({});
  await prisma.anuncio.deleteMany({});
  await prisma.usuario.deleteMany({});
  console.log("Banco de dados limpo.");

  // Criar 5 usuários
  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10); // Hash da senha uma vez

  for (let i = 0; i < 5; i++) {
    const user = await prisma.usuario.create({
      data: {
        nome: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        senha: hashedPassword,
      },
    });
    users.push(user);
  }
  console.log(`${users.length} usuários criados.`);

  // Criar 5 anúncios, um para cada usuário
  for (let i = 0; i < bookData.length; i++) {
    const book = bookData[i];
    const user = users[i];

    if (!book || !user) continue;

    await prisma.anuncio.create({
      data: {
        ...book,
        usuarioId: user.id, // Associa o anúncio ao usuário
      },
    });
  }
  console.log(`${bookData.length} anúncios criados.`);

  console.log("Seeding finalizado com sucesso!");
}

async function runSeed() {
  try {
    await main();
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runSeed();
