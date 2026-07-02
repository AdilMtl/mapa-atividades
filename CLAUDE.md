# CLAUDE.md — +Conversas no Corredor (ROI do Foco)

> Guia operacional para o Claude Code trabalhar neste projeto. Leia antes de qualquer alteração.
> **Idioma:** todo output, commits e docs em **português (Brasil)**.

## O que é

SaaS/PWA que ajuda profissionais a **mapear, diagnosticar e otimizar o foco** usando a
metodologia *ROI do Foco* + *Framework DAR CERTO*. Ligado à newsletter *Conversas no Corredor*
(Substack). Em produção: https://conversas-no-corredor.vercel.app

- **Versão atual:** v3.5.0 (fonte da verdade: `docs/CURRENT-STATUS.md`)
- **Dono/autor:** Adilson Matioli (solo). Projeto construído de forma incremental e manual.

> 🗺️ **Modernização em andamento — leia `docs/ROADMAP-MODERNIZACAO.md` no início de cada sessão.**
> Seguimos fases em ordem (medir → limpar → corrigir → implementar). Não pule etapas.

## Comandos (os que EXISTEM de verdade)

```bash
npm run dev      # servidor de desenvolvimento (localhost:3000)
npm run build    # build de produção
npm run start    # roda o build — ÚNICO jeito de testar o PWA (SW desligado em dev)
npm run lint     # ESLint (next lint)
```

⚠️ **NÃO existem** `type-check` nem `analyze`, apesar do README antigo citá-los. Para checar
tipos, rode `npx tsc --noEmit`.

## Stack

- **Front:** Next.js `^15.5.12` (App Router) + React `19.0.1` + TypeScript `^5` + Tailwind `v4`
- **Back:** Supabase (Postgres + Auth + RLS). Cliente em `src/lib/supabase.ts`
- **Email:** Supabase Email Service (Resend ainda no `package.json`, mas o envio migrou p/ Supabase)
- **PWA:** `next-pwa@5.6.0` (Service Worker + Workbox), config em `next.config.js`
- **UI:** Radix + lucide-react + framer-motion + recharts; Kanban com `@dnd-kit`
- **Deploy:** Vercel — **push na branch `main` dispara deploy automático**

## ⚠️ Armadilhas importantes (leia!)

1. **O build NÃO valida qualidade.** `next.config.js` tem `eslint.ignoreDuringBuilds: true` e
   `typescript.ignoreBuildErrors: true`. Um build verde **não** significa código correto.
   → Sempre rode `npm run lint` e `npx tsc --noEmit` manualmente antes de finalizar.
2. **Dois configs do Next convivem:** `next.config.js` (ATIVO, com PWA) e `next.config.ts`
   (morto, de ago/2025). Edite **apenas o `.js`**. O `.ts` é dívida técnica a remover.
3. **PWA só funciona em produção.** Em `npm run dev` o Service Worker está desligado por design.
   Teste PWA com `npm run build && npm run start`.
4. **Segredos:** `.env*` está no `.gitignore`. **Nunca** commitar `.env.local` nem colar chaves
   (Supabase service role, etc.) em código, docs ou mensagens.
5. **Cemitério de arquivos legados (~22 em `src/`):** vários `*-backup*`, `*-original*`,
   `page - backup*.tsx`, `globals-backup.css`, `heuristica-engine.*.backup.ts`, além de
   `mapa-atividades-modular.tsx` (raiz). **Não edite nem confie neles** — só `page.tsx`/`index.tsx`
   são as versões ativas. Limpeza planejada na Fase 2 do roadmap.
6. **RLS é sensível.** Várias regressões históricas vieram de políticas RLS muito restritivas
   quebrando APIs públicas (ex.: `roi_leads`). Mudança em RLS = teste o fluxo público ponta a ponta.

## Arquitetura

```
src/
├── app/
│   ├── page.tsx                 # Landing mobile-first
│   ├── pre-diagnostico/         # Funil de captura de lead (público)
│   ├── auth/                    # Login/cadastro (autorização server-side)
│   ├── dashboard/               # Mapa: matriz Impacto × Clareza
│   ├── diagnostico/             # Análise automática do foco
│   ├── plano-acao/              # Framework DAR CERTO
│   ├── painel-semanal/          # Kanban (drag & drop @dnd-kit)
│   ├── perfil/ · configuracoes/ · relatorios/ · privacidade/ · reset-password/
│   ├── admin/assinantes/        # Dashboard admin (acesso restrito)
│   └── api/
│       ├── prediag/             # diagnose · lead · options (+ helpers de email/recomendações)
│       ├── auth/                # check-authorization · check-existing · check-expiration
│       └── admin/assinantes/    # CRUD de assinantes
├── components/  base/ · mapa/ · plano/ · diagnostico/ · prediagnostico/ · ui/
└── lib/
    ├── design-system.ts         # tokens centralizados (cores/espaçamentos)
    ├── diagnostico-engine.ts    # motor de análise
    ├── heuristica-engine.ts     # IA de táticas (V2.1)  ← a .backup.* são legado
    ├── prediag-heuristics.ts    # 450+ recomendações do pré-diagnóstico
    ├── email-validator.ts · supabase.ts · utils.ts
    └── kanban/database.ts       # integração Supabase do Kanban
```

### Banco (Supabase) — tabelas principais
- `auth.users` (Supabase Auth) → trigger `handle_new_user()` popula `usuarios` e `profiles`
- `authorized_emails` — controle de acesso (server-side, service role)
- `roi_prediag_sessions`, `roi_leads`, `roi_events` — funil e analytics do pré-diagnóstico
- `taticas` — plano de ação / Kanban (sincroniza localStorage + Supabase)
- 7 views `vw_*` para analytics (Grafana). **Sempre criar views com `WITH (security_invoker = true)`.**
- Schema detalhado: `docs/supabase-database-schema.txt`

## 🚨 Tracking & Conversão (NÃO QUEBRAR — fonte de leads/receita)

Este tracking está funcionando e trazendo conversão. Trate como infraestrutura crítica:
- **GTM:** container `GTM-PDJ2K5BX` em `src/app/layout.tsx` (script `afterInteractive` + `<noscript>`).
- **Google Ads conversão:** `gtag('event','conversion', { send_to: 'AW-16601345592/...' })`
  disparada na captura de lead (`EmailGate.tsx` → `api/prediag/email-template.ts`).
- **GA4 / eventos:** via container GTM + eventos `roi_events` no Supabase.

→ Qualquer mudança em `layout.tsx`, no funil `/pre-diagnostico` ou no `EmailGate` **exige validar
o disparo de conversão antes de commitar**, com a persona de **Analytics & Ads** (ver `/iniciar-sessao`).

## Design System (tokens em `src/lib/design-system.ts`)

- Background `#042f2e` (verde escuro) · Accent `#d97706` (laranja)
- Zonas ROI: Essencial `#22c55e` · Estratégica `#3b82f6` · Tática `#eab308` · Distração `#ef4444`
- **Mobile-first sempre.** Touch targets ≥ 44px, fonte base 16px (evita zoom iOS).

## Fluxo de documentação (OBRIGATÓRIO manter)

O projeto documenta cada sessão. Ao terminar mudanças relevantes:
1. Atualizar `docs/CURRENT-STATUS.md` (sessão atual = topo do arquivo).
2. Adicionar entrada em `docs/CHANGELOG.md` (formato Keep a Changelog + SemVer).
3. Se breaking change / versão nova, criar `docs/versions/vX.Y.Z-descricao.md`.
4. Docs `.md` são a fonte oficial; alguns `.txt` em `docs/` são anexos técnicos.

## Skills deste projeto (`.claude/skills/`)

- **`/iniciar-sessao`** — abre a sessão: lê status/changelog, detecta o tipo de tarefa e assume a persona especialista.
- **`/nova-feature`** — planeja e implementa uma feature nova com disciplina.
- **`/corrigir-bug`** — reproduz → diagnostica causa raiz → corrige → verifica.
- **`/finalizar-sessao`** — atualiza docs, commita e (com confirmação) faz push/deploy.

## Convenções de commit

Mensagens em português, formato `tipo: descrição vX.Y.Z` (ex.: `feat: PWA instalável v3.5.0`,
`fix: admin listUsers via RPC v3.4.3`). Branch de trabalho quando fizer sentido; deploy via push em `main`.
