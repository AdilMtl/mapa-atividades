import path from 'node:path'

import { defineConfig } from 'vitest/config'

// Escopo travado por decisão do dono (2026-07-06): vitest cobre APENAS as
// funções puras dos motores (radares + Lab, este último exigido pela
// ISSUE-312) — e, desde a ISSUE-318A, as agregações puras de admin/analytics
// (mesma regra: sem I/O, sem rede, sem DOM). Sem testes de UI na Fase 1.
// ISSUE-318D somou src/lib/feedback: a lista de rotas onde o FAB é suprimido é
// regra de conversão, e o aceite da issue exige teste dela.
// ISSUE-601A somou src/lib/marketing: os 6 segmentos do painel de Funil são
// consultas puras sobre os contatos já buscados de vw_marketing_contatos.
export default defineConfig({
  // Mesmo alias do tsconfig — até a 601C só havia import de TIPO via `@/`
  // (apagado na compilação); o motor de disparo importa valor de verdade.
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: [
      'src/lib/radar/**/*.test.ts',
      'src/lib/lab/**/*.test.ts',
      'src/lib/admin/**/*.test.ts',
      'src/lib/feedback/**/*.test.ts',
      'src/lib/marketing/**/*.test.ts',
    ],
    environment: 'node',
  },
})
