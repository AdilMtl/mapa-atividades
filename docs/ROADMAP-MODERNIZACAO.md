# 🗺️ Roadmap de Modernização — +Conversas no Corredor

> **Documento de referência de cada sessão.** Leia no início de toda sessão (a skill
> `/iniciar-sessao` aponta pra cá). Seguimos as fases **em ordem** — medir antes de corrigir,
> limpar o óbvio antes de mexer no delicado, e nunca empilhar feature nova sobre débito desconhecido.

**Contexto:** projeto de 2024/2025 construído manualmente (sem Claude Code). Modernização iniciada
em 2026-07-01. Objetivos gerais do dono: (1) otimizar, (2) skills + CLAUDE.md ✅, (3) fluxo Claude+Codex.

---

## ✅ Fase 0 — Salvar o alicerce
**Status:** concluída em 2026-07-01
- `CLAUDE.md` (guia operacional real, sem as mentiras do README antigo)
- 4 skills em `.claude/skills/`: `iniciar-sessao`, `nova-feature`, `corrigir-bug`, `finalizar-sessao`
- Este roadmap
- Memórias de projeto (perfil, objetivos, armadilhas, tracking)
- Commit da fundação antes de tocar em qualquer código de produto

## ✅ Fase 1 — Diagnóstico de saúde (medir, não mexer)
**Status:** concluída em 2026-07-02
- `npm run lint` → 204 erros + 223 warnings em 46 arquivos
- `npx tsc --noEmit` → 57 erros de tipo em 23 arquivos (21 em arquivos de backup, 36 em ativos)
- `npm run build` → compila limpo (confirma que o build esconde os erros acima)
- `npm audit` → 23 vulnerabilidades (1 crítica, 15 altas, 6 moderadas, 1 baixa)
- **Entregável:** `docs/diagnostico-fase1-debito-tecnico.md` — relatório completo com achados de
  risco investigados a fundo (hooks em `page.tsx`, exposição real do jsPDF, alerta sobre
  `npm audit fix` querer rebaixar o `next-pwa`)

## ✅ Fase 2 — Limpeza de baixo risco (cirúrgica)
**Status:** concluída em 2026-07-02
- 25 arquivos removidos (22 do cemitério em `src/` + 2 achados extras na varredura +
  `mapa-atividades-modular.tsx` da raiz), todos confirmados sem import antes de apagar
- `next.config.ts` morto removido — só `next.config.js` (com PWA) permanece
- Build validado idêntico antes/depois (`npm run build`) — zero mudança de comportamento
- Débito medido caiu: tsc 57→37 erros, lint 204→92 erros / 223→123 warnings
- **Rastreabilidade:** toda a remoção está em um único commit isolado (v3.5.1), documentado
  no CHANGELOG, revertível com `git revert <hash>` caso algo quebre
- Detalhes: `docs/CHANGELOG.md` v3.5.1

## 🟡 Fase 3 — Correções por severidade
**Status:** código concluído e validado (v3.5.3) — SQL de RLS pendente de execução manual

> ⚠️ **Interrupção registrada:** entre a Fase 2 e o início da Fase 3, um incidente de produção
> (Supabase pausado por >90 dias) exigiu migração completa de banco de dados. Resolvido e
> documentado em `docs/CHANGELOG.md` v3.5.2. Não muda o escopo desta fase, só o timing.

- ✅ Hooks fora das regras em `src/app/page.tsx` corrigidos (extraído `PWAInstallBanner`)
- ✅ `next` atualizado 15.5.12 → 15.5.20 (patch)
- ✅ 36 erros de `tsc --noEmit` em arquivos ativos corrigidos um a um (achado 1 bug real de
  quebra: `estimativa_horas` vs `estimativaHoras` no Kanban)
- ✅ **Decisão do dono aplicada:** `typescript.ignoreBuildErrors` removido do `next.config.js`
  (build falha de verdade em erro de tipo); `eslint.ignoreDuringBuilds` mantido — lint cosmético
  fica para depois, por decisão explícita do dono
- ✅ Auditoria de RLS/views feita via SQL Editor — achou 2 problemas reais (`roi_leads` aberta
  pra `public`, INSERT irrestrito em `usuarios`/`profiles`) e corrigiu o código das rotas que
  dependiam da chave anon. Detalhes completos: `docs/CHANGELOG.md` v3.5.3
- ⬜ **Pendente:** dono executar o SQL de correção de RLS (Parte A agora, Parte B só após
  deploy) e confirmar as 2 funções `SECURITY DEFINER` não documentadas
  (`get_auth_user_by_email`, `rls_auto_enable`)
- ⬜ Adiado para depois (fora do núcleo da Fase 3, por decisão do dono): upgrade major do
  `jspdf` (3.0.4 → 4.2.1), decisão sobre `next-pwa`/workbox, lint cosmético

## ⬜ Fase 4 — Otimização + features + Claude/Codex
**Status:** pendente
- Otimização: performance, bundle, Web Vitals
- Features novas (usar `/nova-feature`)
- Objetivo 3: documentar o fluxo de trabalho Claude + Codex

---

## 🚨 Travas a respeitar em TODAS as fases

**Tracking de conversão (NÃO QUEBRAR — é a fonte de leads/receita):**
- **GTM:** container `GTM-PDJ2K5BX` em `src/app/layout.tsx` (script `afterInteractive` + `<noscript>`)
- **Google Ads conversão:** `gtag('event','conversion', { send_to: 'AW-16601345592/0K0dCMm6oo4bELjckew9' })`
  disparada na captura de lead (`src/components/prediagnostico/EmailGate.tsx` → `email-template.ts`)
- **GA4/eventos:** geridos via container GTM + eventos `roi_events` no Supabase
- Qualquer mudança em `layout.tsx`, no funil `/pre-diagnostico` ou no EmailGate exige
  **validar o disparo de conversão** antes de commitar. Envolver a persona de Analytics/Ads.

**Outras travas:**
- Build ignora TS/ESLint → validar sempre manualmente (`lint` + `tsc --noEmit`)
- Deploy = push na `main` → só com confirmação explícita
- Nunca commitar `.env.local` / segredos
- PWA só testável em produção (`build && start`)
