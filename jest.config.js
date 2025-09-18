// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,

  // Garante que nosso arquivo de mock seja executado antes dos testes
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/singleton.ts'],

  // Mapeia o alias '@src/' para a pasta 'src'
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};