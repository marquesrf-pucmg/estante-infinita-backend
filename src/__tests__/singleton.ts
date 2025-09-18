// src/__tests__/singleton.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'jest-mock-extended'

// Usamos o caminho mapeado '@src/lib/prisma' que configuramos no jest.config.js
jest.mock('@src/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

// Resetamos o mock antes de cada teste para garantir isolamento
beforeEach(() => {
  mockReset(prismaMock)
})

// Importamos o prisma DEPOIS do mock ser definido para pegar a versão "falsa"
const prismaMock = require('@src/lib/prisma').default

// Exportamos o mock para que nossos testes possam usá-lo
export { prismaMock }