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

## ⬜ Fase 1 — Diagnóstico de saúde (medir, não mexer)
**Status:** pendente
- `npm run lint` → contar/classificar erros e warnings
- `npx tsc --noEmit` → contar erros de tipo (hoje escondidos pelo build)
- `npm run build` limpo → confirmar que compila
- Auditar dependências (desatualizadas / vulneráveis)
- **Entregável:** relatório do débito técnico real (sem nenhuma mudança de comportamento)

## ⬜ Fase 2 — Limpeza de baixo risco (cirúrgica)
**Status:** pendente
- Remover o **cemitério de backups** (~22 arquivos em `src/`): `*-backup*`, `*-original*`,
  `page - backup*`, `globals-backup.css`, `heuristica-engine.*.backup.ts`, etc.
- Remover `mapa-atividades-modular.tsx` (raiz, legado)
- Resolver os **dois configs do Next**: apagar `next.config.ts` morto, manter só `next.config.js`
- Cada remoção validada com `npm run build`
- ⚠️ Não confundir arquivo ativo com backup — conferir imports antes de apagar

## ⬜ Fase 3 — Correções por severidade
**Status:** pendente
- Priorizar: **segurança/RLS** → erros que quebram comportamento → erros de tipo → lint cosmético
- **Decisão do dono:** reativar validação no build (remover `ignoreBuildErrors`/`ignoreDuringBuilds`
  do `next.config.js`) de uma vez, OU corrigir incrementalmente mantendo o flag por ora
- Revisar RLS/views (`security_invoker`) e bugs conhecidos do Supabase

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
