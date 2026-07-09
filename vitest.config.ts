import { defineConfig } from 'vitest/config'

// Escopo travado por decisão do dono (2026-07-06): vitest cobre APENAS as
// funções puras dos motores (radares + Lab, este último exigido pela
// ISSUE-312). Sem testes de UI na Fase 1.
export default defineConfig({
  test: {
    include: ['src/lib/radar/**/*.test.ts', 'src/lib/lab/**/*.test.ts'],
    environment: 'node',
  },
})
