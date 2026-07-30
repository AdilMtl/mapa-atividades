import { defineConfig } from 'vitest/config'

// Escopo travado por decisão do dono (2026-07-06): vitest cobre APENAS as
// funções puras dos motores (radares + Lab, este último exigido pela
// ISSUE-312) — e, desde a ISSUE-318A, as agregações puras de admin/analytics
// (mesma regra: sem I/O, sem rede, sem DOM). Sem testes de UI na Fase 1.
export default defineConfig({
  test: {
    include: [
      'src/lib/radar/**/*.test.ts',
      'src/lib/lab/**/*.test.ts',
      'src/lib/admin/**/*.test.ts',
    ],
    environment: 'node',
  },
})
