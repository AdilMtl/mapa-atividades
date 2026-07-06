# 02 — Technical Spec Inicial

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Baseada em auditoria real do código (2026-07-05, branch `main`, pós-v3.5.3).

---

## 1. Stack detectada (fatos, não suposição)

- **Next.js 15.5.20** (App Router) + **React 19.0.1** + **TypeScript 5** + **Tailwind v4**
  (`@tailwindcss/postcss`), `tw-animate-css`.
- **Supabase** (`@supabase/supabase-js` 2.x + `@supabase/ssr` presente mas cliente atual é
  browser-only em `src/lib/supabase.ts`).
- **PWA:** `next-pwa@5.6.0` no `next.config.js` (único config; SW desligado em dev).
- **UI:** Radix (checkbox/label/slider/slot), lucide-react, framer-motion, recharts, @dnd-kit.
- **E-mail:** `resend@6` usado nas rotas prediag — **entregando normalmente** (plano gratuito;
  confirmado pelo dono em 2026-07-05). Política: e-mail só para quem completa
  radar/pré-diagnóstico; domínio próprio adiado até escalar. Bug separado: reset de senha não
  chega (Supabase Auth/SMTP — fora do revamp, ver `00b` pergunta 1).
- **Sem Stripe. Sem next/font. Sem sitemap/robots. Sem testes automatizados. Sem middleware.**
- **Build:** TS estrito no build (desde v3.5.3); ESLint ignorado no build (dívida aceita);
  deploy automático por push na `main` (Vercel).
- **Analytics:** GTM `GTM-PDJ2K5BX` inline no layout; conversão Google Ads
  `AW-16601345592/0K0dCMm6oo4bELjckew9` disparada em `EmailGate.tsx` quando
  `data.triggerConversion` retorna da rota `/api/prediag/lead`; eventos de funil na tabela
  `roi_events`; 8 views `vw_*` (security_invoker) lidas pelo Grafana.

## 2. Arquitetura atual — limitações que afetam o revamp

1. **`src/app/layout.tsx` é `'use client'`** e concentra: gate de auth client-side com
   allowlist hardcoded (`/`, `/auth`, `/pre-diagnostico`), navegação da plataforma logada, GTM,
   meta tags manuais, CSS inline de tema. Consequências:
   - Impossível usar Metadata API (`export const metadata`) → SEO por página inexistente;
   - Qualquer página pública nova é **redirecionada para `/`** se não entrar na allowlist;
   - `supabase.auth.getSession()` roda em toda página pública (latência + flash de loading para
     visitante frio — custo direto de conversão).
2. **Tema hardcoded** (`#042f2e`/`#d97706`) em três lugares: layout inline `<style>`,
   `design-system.ts`, classes espalhadas. O DS novo precisa de fonte única.
3. **RLS pós-v3.5.3:** `roi_leads`/`roi_prediag_sessions` são service_role-only; rotas usam
   client service_role local. Qualquer tabela nova de lead segue esse padrão.
4. **`docs/supabase-database-schema.txt`** é a referência de schema; confirmar colunas de
   `roi_events` antes de reusar (premissa 8 do `00b`).

## 3. Arquitetura proposta (Fase 1)

### 3.1 Route groups + layout server-first (ISSUE-101)

```text
src/app/
├── layout.tsx                  ← VIRA Server Component: <html>, GTM (byte-idêntico),
│                                  metadata base, fontes (next/font), globals.css
├── (publico)/                  ← rotas públicas SEM auth-gate, com metadata própria
│   ├── page.tsx                ← homepage nova
│   ├── radar/
│   │   ├── maturidade/page.tsx
│   │   └── oportunidades/page.tsx
│   ├── newsletter/page.tsx
│   ├── lab/page.tsx
│   ├── obrigado/page.tsx
│   ├── pre-diagnostico/page.tsx   ← movida sem alteração de conteúdo (rota final idêntica)
│   └── auth/page.tsx              ← idem
└── (app)/                      ← rotas privadas, envolvidas pelo AppShell (client)
    ├── layout.tsx              ← client: gate de auth + sidebar (código atual extraído)
    ├── dashboard/ · diagnostico/ · plano-acao/ · painel-semanal/ · relatorios/
    ├── perfil/ · configuracoes/ · reset-password/ · admin/
    └── privacidade/            ← ATENÇÃO (corrigido na ISSUE-101): hoje é gated (fora da
                                   allowlist + na sidebar de logado); ficou em (app) para
                                   manter a matriz rota×estado idêntica. Torná-la pública
                                   é decisão futura, não parte do refactor.
```

Regras do refactor:
- Route groups `(publico)`/`(app)` **não mudam nenhuma URL** — zero redirect necessário.
- O snippet GTM sai do body do client layout para o server layout **sem alterar uma vírgula**
  do JS; validação obrigatória do disparo de conversão no preview antes de merge.
- PWA meta tags migram para `metadata`/`viewport` exports (conferir equivalência 1:1 com as
  tags atuais; manifest continua em `/pwa/manifest.json`).
- O gate client atual (redirect de não-autenticado) vive só no layout do grupo `(app)` —
  comportamento idêntico ao atual para assinantes.
- `reset-password` requer atenção: hoje é pública na prática? Não — está fora da allowlist,
  mas o fluxo de recovery loga a sessão antes; manter no `(app)` replica o comportamento atual.

### 3.2 Design System v2 (ISSUE-102)

- `src/app/globals.css`: variáveis CSS do Dark Editorial Atelier (paleta/bordas/gradientes do
  DS v1 final, copiadas literalmente) + `@theme` do Tailwind v4 para expor como utilities.
- `src/lib/design-system.ts`: v2 dos tokens TS (manter export antigo `DESIGN_TOKENS` intacto
  enquanto a plataforma legada o consome; adicionar `DS2` novo — migração da plataforma legada
  fica fora da Fase 1).
- Fontes via `next/font/google`: Fraunces (variable), IBM Plex Sans, IBM Plex Mono — subsets
  latinos, `display: swap`. Aplicadas via CSS vars no server layout (páginas legadas continuam
  com aparência aceitável; páginas novas usam as classes novas).
- Componentes base novos em `src/components/ds2/`: `Button` (primário/secundário pill),
  `Card` (padrão/featured/premium), `Badge`, `Module`, `Progress`, `GridBackground`,
  `SectionTitle`. Não tocar em `src/components/ui/*` (usados pela plataforma legada).

### 3.3 Motor de assessment (ISSUE-104)

`src/lib/radar/` — puro TypeScript, zero dependência de rede, 100% testável manualmente:

```ts
// types.ts
type RadarKind = 'maturidade' | 'oportunidades'
interface RadarQuestion { id: string; text: string; options: RadarOption[] }
interface RadarOption { id: string; label: string; score?: number; tags?: string[] }
interface RadarResult {
  kind: RadarKind
  level?: MaturityLevel          // maturidade
  solutionType?: SolutionType    // oportunidades
  headline: string; body: string; complexity?: string; risk?: string
  nextStep: string; readings: Reading[]; crossCta: Cta; labCta: Cta
  // escada de captura (ver doc 10): oportunidades separa o que é grátis do que é gated
  teaser?: ResultTeaser          // oportunidades: direção/forma, mostrada SEM e-mail
  gated?: boolean                // true = há um "completo" atrás do e-mail (oportunidades)
}
// maturidade.ts  → perguntas + score 7..35 → 5 níveis (faixas do doc operacional §10.6).
//                  Resultado COMPLETO é grátis (sem gate) — é o degrau 1 da escada.
// oportunidades.ts → perguntas + decide(answers): SolutionType (ver §6 abaixo).
//                    Expõe teaser (grátis) + completo (gated) — degrau 2, dispara conversão.
// content.ts     → resultados pré-escritos (14 blocos: 5 níveis + 9 tipos)
```

Componente de UI compartilhado `src/components/radar/RadarFlow.tsx`: uma pergunta por tela,
progresso, voltar, resultado, captura embutida. Estado local (useState) — sem URL state, sem
persistência (decisão consciente: recomeçar é barato, privacidade melhor). **Dois estados finais
parametrizáveis por radar** (escada de captura, ver [10_jornada_captura_radares.md](10_jornada_captura_radares.md)):
maturidade → resultado completo aberto + ponte; oportunidades → teaser aberto + gate de e-mail →
completo. O gate nunca esconde o teaser.

### 3.4 Captura e dados (ISSUE-106)

- **Tabelas novas** (SQL entregue ao dono para execução no SQL Editor, padrão da Fase 3):
  - `radar_sessions` (id, kind, answers jsonb, result_key, utm_* , created_at) — INSERT via
    service_role only;
  - `radar_leads` (id, session_id FK, **kind** ('maturidade'|'oportunidades'), name, email,
    newsletter_optin bool, lab_interest bool, created_at) — service_role only; `kind` guarda qual
    radar originou o lead (governa conversão e conteúdo do e-mail, ver escada em doc 10);
  - decisão de reusar `roi_events` OU criar `radar_events`: confirmar schema de `roi_events`
    no início da issue; se colunas servirem (event_name, session_id, properties jsonb),
    reusar com `properties.funnel = 'radar'`.
- **Rotas novas** `src/app/api/radar/session/route.ts` e `src/app/api/radar/lead/route.ts`:
  client service_role local (mesmo padrão de `api/prediag/lead`), validação de e-mail via
  `src/lib/email-validator.ts` (reuso), rate limiting simples por IP via headers
  `x-forwarded-for` (mesmo approach pós-Fase 3).
- A rota de lead retorna `triggerConversion` (mesmo contrato do funil atual) para o front
  disparar a MESMA conversão Google Ads. **Escada de captura (doc 10):** `triggerConversion: true`
  no lead de **oportunidades** (é o evento de conversão do funil novo); o lead de **maturidade**
  é captura suave e **não** dispara a conversão principal (`triggerConversion: false`). Mesmo
  label do funil atual por ora (separação por label é ISSUE-208, Fase 1.5).

### 3.5 E-mail de trilha (ISSUE-113)

- Template HTML novo (base no `email-template.ts` atual, rebrand DS2) com: nível/tipo,
  interpretação, 3 leituras, CTA newsletter, CTA Lab.
- Infra: mesma configuração Resend que já entrega o e-mail do pré-diagnóstico hoje (confirmado
  pelo dono). Robustez: se o envio falhar, a rota ainda salva o lead e responde sucesso com
  `emailSent: false` (lead nunca se perde); resultado completo permanece sempre na tela.
- Política do dono: apenas quem completa radar/pré-diagnóstico recebe e-mail transacional.

### 3.6 SEO (ISSUE-110)

- `export const metadata` por página (title/description únicos, do doc operacional §16);
  `metadataBase` + OG/Twitter cards com imagem estática da marca.
- `src/app/sitemap.ts` (rotas públicas) + `src/app/robots.ts` (bloquear `(app)` e `/api`).
- JSON-LD `WebSite` na home. H1 único por página (auditar na revisão).
- Canonical para o domínio final (depende da decisão de domínio próprio — pendência 1; enquanto
  `*.vercel.app`, usar o padrão atual).

### 3.7 Analytics (ISSUE-109)

- Helper `src/lib/analytics.ts`: `track(event, props)` → (1) `window.dataLayer.push` e
  (2) `navigator.sendBeacon`/fetch para rota de eventos (Supabase). Lista de eventos = §21 do
  doc operacional (15 eventos, nomes literais).
- Propriedades: `utm_source/campaign/medium`, `entry_path`, `assessment_type`,
  `maturity_level`, `recommended_solution_type`, `area`, `frequency`.
- UTMs capturadas no primeiro pageview (searchParams) e guardadas em sessionStorage.
- **Não tocar** no disparo de conversão atual do EmailGate. Views `vw_*` novas para o funil
  radar (com `security_invoker = true`) ficam para o fim da fase, com SQL para o dono.

## 4. Componentes a criar vs refatorar

**Criar:** `components/ds2/*` (base visual), `components/radar/*` (fluxo), `components/home/*`
(seções da homepage como componentes nomeados — evitar repetir o page.tsx monolítico de 1044
linhas), `components/shared/PublicHeader.tsx` + `PublicFooter.tsx`.
**Refatorar:** `layout.tsx` (split server/client — §3.1), `globals.css` (tokens), homepage
(substituição completa; a antiga fica preservada no git, sem arquivo-backup no working tree —
regra da casa pós-faxina).
**Não tocar:** `EmailGate.tsx`, `api/prediag/*`, `ChatFlow.tsx`, plataforma logada,
`components/ui/*`, `mapa-atividades-modular.tsx` (ativo no dashboard).

## 5. Estratégia de formulários

Formulários dos radares são client components controlados, sem lib de forms (escala não
justifica react-hook-form). Validação: seleção obrigatória por pergunta (botões de opção
grandes, touch ≥44px). Captura de e-mail: validação local (regex + `email-validator.ts` no
servidor). Anti-spam: honeypot + rate limit por IP na rota (sem CAPTCHA na Fase 1 — atrito).

## 6. Lógica de decisão do Radar de Oportunidades (proposta inicial)

Eixos → pontuação por tipo (determinística, auditável, pré-escrita em `oportunidades.ts`):

1. **Frequência** (raramente→diário): baixa freq. puxa prompt/template; alta puxa
   automação/app/dashboard.
2. **Estrutura do dado** (texto livre → dados de sistemas): livre puxa prompt/workflow;
   planilha puxa dashboard/app+tabela; sistemas puxam orquestrado.
3. **Público** (só eu → externo): pessoal puxa prompt/app offline; time+ puxa
   template/dashboard/app compartilhado; externo puxa orquestrado.
4. **Resultado desejado**: "criar ferramenta reutilizável" puxa app; "visualização/decisão"
   puxa dashboard; "automatizar" puxa workflow/automação.
5. **Dados sensíveis** (modificador): rebaixa recomendações que exigem subir dado para fora
   (automação/orquestrado) e injeta bloco de Diligência no resultado.
6. **Conforto digital** (modificador): baixo conforto rebaixa um degrau de complexidade e
   ajusta o "primeiro passo".
7. **Sistema agêntico**: nunca é recomendação de entrada — só aparece como "isso PODE virar
   agêntico no futuro" (coerente com §11.9 do doc: reduzir escopo é parte da tese).

A tabela exata de pesos é entregável da ISSUE-105 e deve ser revisada pelo modelo mais forte +
dono antes do launch (é o "cérebro" da experiência).

## 7. Estratégia de testes/QA (Fase 1)

Projeto não tem suite de testes — não vamos fingir que tem. QA da Fase 1:
- `npx tsc --noEmit` + `npm run lint` + `npm run build` verdes por issue;
- teste manual roteirizado por fluxo (roteiros na issue de QA): 2 radares completos × mobile e
  desktop, captura com/sem e-mail, home em 375px/768px/1440px;
- validação de tracking com GTM preview + Tag Assistant (conversão atual E eventos novos);
- Lighthouse (mobile) na home e nos radares: performance ≥85, a11y ≥90, SEO ≥95 como alvo;
- PWA: `npm run build && npm run start` e smoke test de instalação (SW não pode quebrar rotas novas —
  atenção ao cache do `sw.js` publicado: testar hard refresh pós-deploy).
- Único candidato a teste automatizado na Fase 1: funções puras de scoring (`lib/radar/*`) —
  se introduzirmos vitest, que seja APENAS para isso (decisão na ISSUE-104; sem framework de
  testes de UI na Fase 1).

## 8. Riscos técnicos (ordenados)

1. **Quebrar conversão Google Ads no refactor do layout** — mitigação: GTM byte-idêntico,
   validação com Tag Assistant em preview de PR na Vercel antes de merge, persona Analytics.
2. **Service Worker servindo shell antigo pós-deploy** — mitigação: `skipWaiting` já ativo;
   testar navegação pós-update; considerar bump de cache se necessário.
3. **Regressão no gate de auth** (assinante perdendo acesso ou público caindo no gate) —
   mitigação: matriz de rotas × estado (anônimo/logado) no QA.
4. **RLS de tabelas novas mal configurada** — mitigação: padrão service_role-only da Fase 3 +
   verificação SQL pelo dono (método já validado).
5. **React 19 + client components nas páginas novas** — baixo risco (padrões já usados no
   repo), mas manter páginas novas majoritariamente server-rendered com ilhas client (radares).
6. **Fontes (next/font) alterando layout legado** — aplicar família nova só via classes DS2 nas
   páginas novas; legado continua com stack system-ui.

## 9. Decisões que precisam de aprovação do dono

1. ~~Domínio próprio~~ — RESPONDIDO (2026-07-05): adiado até o volume escalar; plano gratuito
   do Resend por enquanto. Canonical segue no domínio `*.vercel.app` atual.
2. ~~Conversão Google Ads: mesmo label ou novo~~ — RESPONDIDO (2026-07-05): **mesmo label
   atual** no funil novo; separação futura registrada no plano de melhoria de Google Ads
   (ISSUE-208). Inventário completo dos marcadores: `07_mapa_tracking_ads.md`.
3. Execução dos SQLs (tabelas novas + RLS + views) — sempre pelo dono via SQL Editor.
4. Go-live: push na `main` só com confirmação explícita (regra da casa).
