# 🩺 Diagnóstico de Saúde Técnica — Fase 1 da Modernização

**Data:** 02 de julho de 2026
**Objetivo:** medir o débito técnico real do projeto, sem alterar nenhum comportamento.
**Comandos executados:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm audit --json`.

> Este relatório é o entregável da **Fase 1** do `docs/ROADMAP-MODERNIZACAO.md`. As correções em si
> ficam para a **Fase 3** (por severidade); a **Fase 2** (faxina de arquivos legados) já pode usar
> os dados daqui para saber exatamente o que remover.

---

## 1. Build (`npm run build`)

✅ **Compila limpo.** 24 páginas geradas, ~54s, First Load JS entre 102 kB e 330 kB — dentro do
esperado. Isso confirma que `eslint.ignoreDuringBuilds` e `typescript.ignoreBuildErrors` (ambos
`true` no `next.config.js`) estão de fato escondendo os problemas listados abaixo: o build passa
mesmo com 57 erros de tipo e 204 erros de lint.

## 2. Lint (`npm run lint`) — 46 arquivos afetados, 204 erros + 223 warnings

| Regra | Ocorrências | Natureza |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | 215 | cosmético |
| `react/no-unescaped-entities` | 100 | cosmético (aspas/apóstrofos não escapados em JSX) |
| `@typescript-eslint/no-explicit-any` | 90 | qualidade de tipo |
| `react-hooks/rules-of-hooks` | 6 | ⚠️ risco real — ver seção 5 |
| `@next/next/no-img-element` | 5 | performance (usar `next/image`) |
| `@typescript-eslint/no-require-imports` | 4 | estilo |
| `react-hooks/exhaustive-deps` | 3 | risco de bug sutil (deps de `useEffect`) |

A maior parte do volume (unused-vars, unescaped-entities) está concentrada nos **arquivos de
backup/legado** que a Fase 2 vai remover — a faxina reduz esse número drasticamente de graça.

## 3. Type-check (`npx tsc --noEmit`) — 57 erros em 23 arquivos

### 3.1 — Erros em arquivos do "cemitério" (Fase 2 resolve sozinha, ~21 erros)
Confirma exatamente a lista de legado já mapeada no `CLAUDE.md`:
- `mapa-atividades-modular.tsx` (raiz)
- `src/app/page-backup-v2-251001.tsx`
- `src/app/plano-acao/page-backup-082025.tsx`, `page-backup-250907.tsx`, `page-backup.tsx`
- `src/components/mapa-atividades-modular-backup-antes-ajustes.tsx`, `-backup3.tsx`
- `src/components/plano/index-backupanteskanban250912.tsx`
- `src/lib/heuristica-engine.backup.ts`, `heuristica-engine.v2.0.backup.ts`

Não corrigir — apagar na Fase 2.

### 3.2 — Erros em arquivos ativos (Fase 3, ~36 erros)
- `src/app/api/prediag/diagnose/route.ts`, `lead/route.ts` — `NextRequest.ip` não existe mais no
  tipo (API do Next mudou), `any` implícito em variáveis.
- `src/app/api/admin/assinantes/route.ts` — parâmetro implícito `any`.
- `src/app/painel-semanal/components/KanbanPage.tsx` — `estimativa_horas` vs `estimativaHoras`
  (nome de propriedade divergente do tipo `TaticaKanban`), `any` implícito.
- `src/components/diagnostico/index.tsx`, `src/components/plano/index.tsx` — propriedades que não
  existem nos tipos de union (`botaoIcone`, `destaque`, `acao`, `botaoTexto`).
- `src/lib/heuristica-engine.ts`, `src/lib/diagnostico-engine.ts`, `src/lib/prediag-heuristics.ts` —
  index signatures e possíveis `null` não tratados.
- ⚠️ **`src/components/prediagnostico/EmailGate.tsx:65-66`** — `Cannot find name 'gtag'`. É só
  falta de declaração de tipo global (o `gtag` existe em runtime via script do GTM, então não
  quebra nada hoje) — mas é o arquivo do **tracking de conversão protegido pelo CLAUDE.md**.
  Qualquer correção aqui exige validar o disparo de conversão antes de commitar.

## 4. `npm audit` — 23 vulnerabilidades (1 crítica, 15 altas, 6 moderadas, 1 baixa)

| Pacote | Instalado | Severidade | Observação |
|---|---|---|---|
| **jspdf** | 3.0.4 | 🔴 crítica | dependência direta — ver análise na seção 5 |
| **next** | 15.5.12 | alta | várias CVEs corrigidas em 15.5.13+ (patch simples) |
| **next-pwa** | 5.6.0 | alta | via `workbox-webpack-plugin` — ver aviso na seção 5 |
| demais 20 pacotes | — | várias | transitivas (ajv, lodash, tar, ws, dompurify, minimatch, etc.) |

## 5. Achados de risco real (investigados em profundidade)

### 5.1 — Hooks chamados dentro de callback (`src/app/page.tsx:184-241`)
O "PWA Install Banner" está implementado como uma IIFE dentro do JSX:
```jsx
{(() => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  React.useEffect(() => { ... }, []);
  // ...
})()}
```
Isso viola as Regras dos Hooks (só podem ser chamados no corpo de um componente/custom hook).
**Por que não quebra hoje:** a IIFE é chamada incondicionalmente, sempre na mesma posição do
render, então a ordem dos hooks se mantém estável entre renders. **Risco:** se no futuro esse
bloco for envolvido numa condicional ou movido, os hooks passam a ser condicionais e o React
quebra em runtime ("Rendered fewer hooks than expected"). Também impede DevTools/Fast Refresh
de tratar esse trecho como componente.
**Correção recomendada (Fase 3):** extrair para um componente nomeado `<PWAInstallBanner />`.

### 5.2 — jsPDF crítico, mas exposição real baixa
Uso real do jsPDF (`src/app/diagnostico/page.tsx:179-266`) é só `pdf.text()`,
`pdf.splitTextToSize()` e `pdf.addPage()` — gerando client-side um PDF com dados que o **próprio
usuário** digitou, para **o próprio usuário** baixar. As CVEs críticas do jsPDF (path traversal,
injeção em AcroForm, DoS via BMP/GIF, `addJS`) dependem de APIs não usadas aqui (`addImage`,
formulários, `addJS`, nova janela). **Blast radius prático: baixo.** Ainda assim, vale migrar para
`4.2.1` (major bump) na Fase 3 como higiene, por ser dependência direta.

### 5.3 — `npm audit fix` sugere rebaixar o `next-pwa` — não seguir cegamente
O fix automático do `next-pwa` aponta para a versão **2.0.2**, uma **regressão** em relação aos
`5.6.0` instalados hoje — isso quase certamente quebraria o PWA lançado na v3.5.0. As
vulnerabilidades subjacentes (`workbox-build`, `rollup-plugin-terser`, `serialize-javascript`) são
**de build-time** (rodam durante `next build`, nunca chegam ao navegador do usuário final) — risco
real também baixo. **Não rodar `npm audit fix --force` sem revisar isso manualmente na Fase 3.**

---

## Resumo para a Fase 3 (priorização sugerida)

1. Corrigir os hooks em `page.tsx` (risco de crash futuro).
2. Atualizar `next` para 15.5.13+ (patch, sem breaking change esperado).
3. Resolver os 36 erros de tipo em arquivos ativos (principalmente `NextRequest.ip` e tipos de
   união em `diagnostico/index.tsx` / `plano/index.tsx`).
4. Avaliar upgrade do `jspdf` para 4.2.1 (checar breaking changes do major bump).
5. Decidir sobre `next-pwa`/`workbox` com calma (não é urgente — risco de build-time apenas).
6. Lint cosmético (`any`, unused vars, aspas não escapadas) por último.
