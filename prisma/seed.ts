// prisma/seed.ts
import { PrismaClient, tipo_anuncio, condicao_livro } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de seeding...");

  // Limpar dados existentes
  await (prisma as any).anuncio.deleteMany({});
  await (prisma as any).usuario.deleteMany({});
  console.log("Banco de dados limpo.");

  // Criar 5 usuários
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await (prisma as any).usuario.create({
      data: {
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        senha: "password123", // Lembre-se: em produção use hash!
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
    await (prisma as any).anuncio.create({
      data: {
        titulo: faker.lorem.words(3),
        autor: faker.person.fullName(),
        descricao: faker.lorem.paragraph(),
        tipo: faker.helpers.arrayElement([
          tipo_anuncio.VENDA,
          tipo_anuncio.TROCA,
          tipo_anuncio.COMPRA,
        ]),
        condicao: faker.helpers.arrayElement([
          condicao_livro.NOVO,
          condicao_livro.SEMINOVO,
          condicao_livro.USADO,
        ]),
  preco: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
        usuarioId: randomUser.id,
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
