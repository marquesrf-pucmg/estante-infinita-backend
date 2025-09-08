// prisma/seed.ts
import { PrismaClient, TipoAnuncio, CondicaoLivro } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de seeding...");

  // Limpar dados existentes
  await prisma.anuncio.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Banco de dados limpo.");

  // Criar 5 usuários
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "password123", // Lembre-se, em produção use hash!
      },
    });
    users.push(user);
  }
  console.log(`${users.length} usuários criados.`);

  // Criar 20 anúncios associados a usuários aleatórios
  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    if (!randomUser) {
      throw new Error("No users available to assign as owner.");
    }
    await prisma.anuncio.create({
      data: {
        titulo: faker.lorem.words(3),
        autor: faker.person.fullName(),
        descricao: faker.lorem.paragraph(),
        tipo: faker.helpers.arrayElement([
          TipoAnuncio.VENDA,
          TipoAnuncio.TROCA,
          TipoAnuncio.COMPRA,
        ]),
        condicao: faker.helpers.arrayElement([
          CondicaoLivro.NOVO,
          CondicaoLivro.SEMINOVO,
          CondicaoLivro.USADO,
        ]),
        preco: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
        ownerId: randomUser.id,
      },
    });
  }
  console.log("20 anúncios criados.");

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
