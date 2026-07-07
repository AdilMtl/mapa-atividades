import { defineConfig } from 'vitest/config'

// Escopo travado por decisão do dono (2026-07-06): vitest cobre APENAS as
// funções puras do motor dos radares. Sem testes de UI na Fase 1.
export default defineConfig({
  test: {
    include: ['src/lib/radar/**/*.test.ts'],
    environment: 'node',
  },
})
