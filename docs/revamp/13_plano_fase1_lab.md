# 13 — Plano de Implementação da Fase 1 do Lab (área pós-login)

> Produzido em 2026-07-09 a partir do handoff estratégico
> (`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`), do dossiê de exploração
> (`12_exploracao_lab_chatgpt.md`) e de auditoria real do código. **Nenhuma linha de código
> foi escrita** — este doc é o plano que precede a execução, conforme instrução do handoff (§20).
>
> Tese: *"O Lab ajuda profissionais corporativos não técnicos a transformar problemas reais do
> trabalho em projetos digitais construíveis com IA — com método, repertório e acompanhamento."*

---

## 1. Diagnóstico do estado atual (auditoria de código, não de docs)

### 1.1 Rotas existentes

| Grupo | Rotas | Observação |
|---|---|---|
| `(publico)` | `/`, `/lab`, `/newsletter`, `/obrigado`, `/pre-diagnostico`, `/privacidade`, `/radar/maturidade`, `/radar/oportunidades`, `/auth` | Visual DS2 (exceto pre-diagnostico legado) |
| `(app)` — legado ROI do Foco | `/dashboard`, `/diagnostico`, `/plano-acao`, `/painel-semanal`, `/relatorios`, `/perfil`, `/configuracoes`, `/privacidade`→movida, `/reset-password`, `/admin/assinantes` | Visual antigo (glass/verde `#042f2e`). **Congelado por decisão de 09/07** |
| `api/` | `auth/*` (check-authorization/existing/expiration), `radar/*` (session, lead, event), `lab/interest`, `prediag/*`, `admin/assinantes` | Padrão: service_role + rate-limit + honeypot |

### 1.2 Componentes relevantes

- **DS2 (`src/components/ds2/`)**: `Badge`, `Button`, `Card`, `Eyebrow`, `GridSection`,
  `Module` (card com **barra de progresso** — pronto para "projeto com etapas"), `PageContainer`,
  `Panel`, `Progress`, `SectionTitle`. É o kit visual do Lab.
- **Radar (`src/components/radar/`)**: `RadarFlow` (orquestrador de perguntas passo a passo),
  `QuestionCard`, `OptionButton`, `RadarChartAxes`, resultados, `EmailCaptureRadar`. O padrão
  UX de "formulário guiado uma pergunta por vez" **já existe e está testado em produção**.
- **Shared**: `PublicHeader`, `PublicFooter`, `PWAInstallBanner`.

### 1.3 Página `/lab` atual

100% vitrine: badge "em construção", lista de itens futuros, `LabWaitlistForm` →
`POST /api/lab/interest` → tabela `lab_leads` (RLS zero-acesso, rate-limit 5/h/IP, honeypot,
UTMs). Nenhuma ferramenta construída. A lista de espera é o canal de convite do beta.

### 1.4 Fluxo de autenticação

- Supabase Auth (client-side, `src/lib/supabase.ts`); autorização de acesso é **binária** via
  `authorized_emails` (`expires_at`, `plan_type`, `notes`), checada por API service_role.
- Gate da área logada é **client-side** no `AppShell.tsx` (redireciona não logados via
  `useEffect`). Sem middleware server-side. `@supabase/ssr` está no `package.json` **mas não é
  usado em lugar nenhum** — oportunidade para o Lab nascer com gate server-side.
- Trigger `handle_new_user()` popula `usuarios` e `profiles` no signup.

### 1.5 Tabelas existentes

`usuarios`, `profiles`, `atividades`, `taticas` (legado ROI) · `authorized_emails` (acesso) ·
`roi_*` (funil legado) · `radar_sessions`/`radar_leads`/`radar_events` (ISSUE-106; RLS ligada,
zero políticas, `REVOKE ALL` de anon/authenticated — acesso só via service_role) · `lab_leads`.
Padrão de segurança consolidado: **RLS + REVOKE + escrita só por rota de API**.

### 1.6 Motores e lógicas reaproveitáveis (o coração do plano)

| Ativo | O que é | Uso no Lab |
|---|---|---|
| `src/lib/radar/oportunidades.ts` (472 linhas + testes vitest) | Motor **puro** de classificação em 9 tipos de solução (matriz de pesos, escala de complexidade 1–5, famílias, guard-rails, flag de diligência, desempate determinístico) | **É o motor de classificação do MVP.** O wizard do Lab alimenta o mesmo motor com mais contexto |
| `src/lib/radar/maturidade.ts` | Níveis de fluência (curioso→referência) sobre os 4Ds | Alimenta o Perfil do Builder |
| `src/lib/radar/content.ts` (866 linhas) | Copy estruturada por tipo: por quê, complexidade, risco, primeiro passo, leituras, "na prática", exemplos por área | Semente dos **planos de construção parametrizados** e dos primeiros ativos da biblioteca |
| `radar-events.ts` + `analytics.ts` + `api/radar/event` | Pipeline de eventos (GTM + Supabase) | Estender com eventos `lab_*` |
| Resend (`api/radar/lead`) | E-mail transacional em template dark | E-mail de boas-vindas ao beta / premium |
| Vitest | Já configurado com testes do motor | Testes do adaptador wizard→motor e do gerador de plano |

### 1.7 Stripe / Substack

**Zero Stripe no código** (nem SDK). Substack = assinatura manual (dono insere em
`authorized_emails`). O fluxo Stripe existe apenas mapeado na ISSUE-305. Sem acoplamento a
remover — caminho livre para implementar na Fase 1C.

### 1.8 Riscos técnicos e lacunas

1. **Modelo de acesso binário**: `authorized_emails` não distingue free/premium no login — o
   handoff pressupõe tier gratuito. Resolvido por fase: 1A = beta fechado; 1C = planos reais.
2. **Gate client-side no legado**: não copiar. Lab nasce com `@supabase/ssr` + verificação em
   Server Component/layout.
3. **Nenhum SDK de IA instalado**: 1B adiciona `@anthropic-ai/sdk` + env na Vercel.
4. **Performance mobile já abaixo do alvo** (TBT ~1.100ms na home): Lab deve nascer
   server-first, sem framer-motion pesado, com o mínimo de JS no cliente.
5. **Conflito de rota `/lab`**: página pública existente × área logada. Resolução: `/lab`
   continua pública (vitrine/venda) e as subrotas logadas vivem em route group novo `(lab)`.
6. **Primeira vez com RLS por usuário em tabelas novas**: até hoje o padrão novo é
   "zero acesso + service_role". As tabelas do Lab precisam de políticas `auth.uid() = user_id`
   — território conhecido (legado usa), mas exige a mesma disciplina de auditoria da Fase 3.

### 1.9 Conflitos entre documentos (apontados + decisão recomendada)

| Conflito | Recomendação |
|---|---|
| Backlog 301–304 trata Wizard, Canvas, PRD Kit como **ferramentas separadas**; handoff propõe **uma jornada única** | Handoff vence (mais recente, decisão estratégica). 301–304 ficam **superseded** e são absorvidas pelo backlog novo (série 310+). Canvas/PRD viram *artefatos dentro da jornada e ativos da biblioteca*, não telas próprias |
| Handoff usa rotas em inglês (`/lab/new-project`, `/lab/library`); convenção do projeto é PT (`/plano-acao`, `/radar/oportunidades`) | Rotas em **português**: `/lab/inicio`, `/lab/novo-projeto`, `/lab/projeto/[id]`, `/lab/biblioteca`, `/lab/perfil` |
| Handoff: free cria 1 projeto; realidade: login exige `authorized_emails` | 1A = **beta fechado por convite** (lista `lab_leads`), free tier real só na 1C com Stripe |
| Handoff: 7 telas; princípio "não inflar escopo" | 1A = **5 telas** (entrevista IA some da 1A por definição; diagnóstico+plano viram uma página só — justificativa no §3) |

---

## 2. Jornada pós-login (dois caminhos, uma convergência)

### Caminho A — Pós-workshop
1. Participa do workshop de Vibe Coding / Artesanato Digital → "aha moment".
2. Recebe convite (e-mail Resend) com acesso ao Lab (`authorized_emails`, plan_type dedicado).
3. Login → `/lab/inicio` → CTA "Comece pelo problema que você trouxe do workshop".
4. Cria o projeto no wizard **já com vocabulário do workshop** (mesmos 9 tipos, mesmos 4Ds).
5. Sai com plano salvo + materiais do workshop conectados ao tipo de solução dele.

### Caminho B — Newsletter / tráfego pago / orgânico / lista do Lab
1. Chega pela home, radar ou anúncio → faz um radar gratuito (funil da Fase 1, já no ar).
2. Resultado do radar já diz o tipo de solução + CTA Lab → entra na lista de espera
   (`lab_leads` / `radar_leads.lab_interest`).
3. Recebe convite do beta (1A) ou assina direto (1C via Stripe).
4. Login → `/lab/inicio` → wizard. Se veio do radar, o Lab **reconhece o vocabulário**:
   o tipo apontado no radar aparece como ponto de partida sugerido.

### Convergência
Os dois caminhos aterrissam no mesmo lugar: `/lab/inicio` → **criar o primeiro projeto**. A
diferença é só o estado inicial do Perfil do Builder (A: veio do workshop, fluência maior;
B: veio do radar, traz o resultado como semente). A métrica norte é a mesma para ambos:
**projetos guiados concluídos até o plano de construção**.

---

## 3. Arquitetura de telas da Fase 1

Estrutura física: route group novo **`src/app/(lab)/lab/...`** com `LabLayout` próprio
(gate server-side + navegação DS2). Não usa o `AppShell` legado. `/lab` (vitrine pública)
permanece em `(publico)` e ganha, quando o beta lançar, estado "logado → entrar no Lab".

| Rota | Papel | Fase | Conteúdo/Componentes |
|---|---|---|---|
| `/lab/inicio` | Hub pós-login | 1A | Saudação; card "Novo projeto" (grid técnico DS2 de laboratório); "Continue de onde parou" (`Module` com progresso); lista de projetos com status; acesso à biblioteca; badge do plano |
| `/lab/novo-projeto` | Wizard inicial | 1A | Formulário em etapas (reuso do padrão `RadarFlow`/`QuestionCard`); ~10 campos do handoff §8.1.2 agrupados em 4 passos: Problema → Contexto → Pessoas & dados → Ambição; barra `Progress`; linguagem consultiva |
| `/lab/projeto/[id]` | **Diagnóstico + plano na mesma página** | 1A | Bloco 1: classificação (tipo, família, complexidade, potencial IA/automação, risco, explicação); Bloco 2: plano de construção (resumo, etapas, checklist clicável persistido, artefato sugerido); Bloco 3: materiais recomendados (filtrados por tipo) |
| `/lab/biblioteca` | Biblioteca de apoio | 1A | Filtros por tipo de solução e formato (checklist/template/guia/canvas); cards; conteúdo markdown renderizado; flag `premium_only` já no modelo (sem paywall na 1A) |
| `/lab/perfil` | Perfil do Builder | 1A (enxuto) | Área, senioridade, fluência em IA (link com níveis do radar de maturidade), objetivo, maior gargalo; alimenta personalização da 1B |
| `/lab/projeto/[id]/entrevista` | Entrevista complementar com IA | **1B** | Resumo do que foi entendido; 3–5 perguntas geradas; respostas em formulário (não chat); "Gerar plano revisado" |

**Decisões de corte (com justificativa):**

- **`/lab/project/:id/diagnosis` + `/plan` viram uma página só.** Na 1A a classificação e o
  plano saem do mesmo motor determinístico no mesmo instante — duas telas seriam um clique
  artificial entre dois pedaços do mesmo resultado. Uma página de projeto única também é o
  "endereço permanente" do projeto (retomada, compartilhamento futuro). Quando a entrevista IA
  entrar (1B), ela se encaixa **entre** o wizard e essa página, sem quebrar rota.
- **`/lab/dashboard` → `/lab/inicio`.** "Dashboard" já significa outra coisa neste produto
  (mapa do ROI do Foco) — reutilizar o termo criaria confusão de navegação e de analytics.
- **Entrevista IA fora da 1A** (definição do próprio handoff §15): a 1A valida UX e fluxo com
  motor de regras; a IA entra na 1B com a rota já reservada.
- **Perfil na 1A é um formulário simples**, não um hub — só o suficiente para alimentar a
  personalização da 1B. Histórico/recomendações futuras ficam para Fase 3.

---

## 4. Fluxo funcional do MVP

```
1. Login (authorized_emails, beta) → /lab/inicio
2. "Novo projeto" → /lab/novo-projeto
3. Wizard em 4 passos (salva rascunho a cada passo — lab_projects.status='rascunho')
4. [1B] Entrevista complementar: 3–5 perguntas geradas por IA → respostas → resumo
5. Submissão → adaptador wizard→motor (regras) → diagnóstico gravado (status='diagnosticado')
6. Mesma ação gera o plano parametrizado por tipo (status='planejado') → /lab/projeto/[id]
7. Materiais recomendados aparecem no projeto (match por solution_type + maturidade)
8. Usuário marca etapas do checklist (progresso persiste); /lab/inicio mostra "continue de onde parou"
```

**Obrigatório na 1A (motor de regras, zero IA):** passos 1–3 e 5–8.
**1B (IA controlada):** passo 4; plano enriquecido/personalizado em Markdown; justificativa da
classificação em linguagem natural; recomendação de materiais personalizada.
**1C (premium):** limites por plano, Stripe, exportação, biblioteca premium, materiais do workshop.

---

## 5. Modelo de dados (Supabase)

Princípios: menos tabelas que o handoff (6→4 na Fase 1) — outputs de motor são JSONB
**versionados** (`engine_version`), não colunas; RLS por usuário (`auth.uid() = user_id`) em
tudo que é do usuário; `REVOKE` seletivo seguindo o padrão da ISSUE-106.

### `lab_profiles` (Perfil do Builder) — 1A
| Campo | Tipo | Nota |
|---|---|---|
| `user_id` | UUID PK, FK `auth.users` | 1:1 com usuário |
| `role_area` | VARCHAR(50) | mesmos IDs de área do radar (`area_vendas`…) |
| `seniority` | VARCHAR(30) | |
| `ai_fluency_level` | VARCHAR(20) | IDs do radar de maturidade (`curioso`…`referencia`) |
| `main_goal`, `biggest_bottleneck` | TEXT | |
| `tools_used`, `preferences` | JSONB | listas abertas |
| `origin` | VARCHAR(20) | `workshop` · `radar` · `direto` — mede os caminhos A/B |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

RLS: SELECT/INSERT/UPDATE onde `auth.uid() = user_id`. Sem DELETE (1A).

### `lab_projects` — 1A
| Campo | Tipo | Nota |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | RLS |
| `title` | VARCHAR(120) | |
| `status` | VARCHAR(20) CHECK | `rascunho` → `diagnosticado` → `planejado` → `em_construcao` → `concluido` |
| `wizard_answers` | JSONB | respostas do wizard (schema TS versionado) |
| `diagnosis` | JSONB | output do motor: `{ tipo, familia, complexidade, potencial_ia, potencial_automacao, risco, flags, pontuacao, engine_version }` |
| `plan` | JSONB | `{ resumo, etapas[], checklist[{id,label,done}], artefato_sugerido, materiais_slugs[], generator_version }` |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

Diagnóstico e plano como JSONB dentro do projeto (não tabelas próprias): 1 projeto tem 1
diagnóstico/plano vigente na Fase 1; re-diagnóstico sobrescreve com `engine_version` novo.
Histórico de versões só se a Fase 2 provar necessidade.

### `lab_assets` (biblioteca) — 1A
| Campo | Tipo | Nota |
|---|---|---|
| `id` UUID PK · `slug` VARCHAR(80) UNIQUE | | slug estável p/ recomendação no plano |
| `title`, `description` | VARCHAR/TEXT | |
| `format` | VARCHAR(20) | `checklist` · `template` · `guia` · `canvas` |
| `solution_types` | TEXT[] | match com os 9 tipos do motor |
| `maturity_min` | VARCHAR(20) NULL | filtro opcional por fluência |
| `content_markdown` | TEXT | conteúdo no banco (sem CMS na Fase 1) |
| `premium_only`, `published` | BOOLEAN | flag desde o dia 1; paywall só na 1C |
| `origin` | VARCHAR(20) | `lab` · `workshop` — 1C/2 |

RLS: SELECT para `authenticated` onde `published = true` (única tabela com leitura direta);
escrita só service_role (seed por script/SQL).

### `lab_project_interviews` — 1B
`id` · `project_id` FK · `questions` JSONB · `answers` JSONB · `ai_summary` TEXT ·
`model` VARCHAR · `input_tokens`/`output_tokens` INT (telemetria de custo) · `created_at`.
RLS via join com `lab_projects.user_id`.

**Entidades do handoff dispensadas na Fase 1:** `ProjectDiagnosis`/`ProjectPlan` (viram JSONB,
acima) e `UserProfile` genérico (o legado `profiles` fica intocado; `lab_profiles` é do Lab).

---

## 6. Uso de IA

### Regras simples (sem IA) — tudo na 1A
Classificação (motor de pesos existente + extensão), geração do plano (templates
parametrizados por tipo × área × fluência, semeados pelo `content.ts`), recomendação de
materiais (match `solution_types`), estados/limites/progresso/filtros/premium.

### IA (só na 1B, sempre dentro de fluxo)

> **Provedor decidido (dono, 2026-07-09): API da OpenAI** (única chave que o dono possui),
> sempre no modelo barato da geração vigente (classe "mini/nano") — as chamadas são poucas,
> curtas e estruturadas, então o custo por projeto é de centavos.

1. **Gerar 3–5 perguntas complementares** a partir do wizard (modelo barato).
2. **Resumir o problema** ("o que entendi até aqui") — modelo barato.
3. **Justificar a classificação** em linguagem natural (a classificação em si continua sendo
   do motor de regras — IA explica, não decide).
4. **Enriquecer o plano** em Markdown personalizado (1 chamada por projeto; se a qualidade do
   modelo barato não bastar, sobe um degrau só nesta chamada).
5. **Refinar recomendação de materiais** (opcional, pode continuar em regras).

### Prompts/sistemas necessários (1B)
- System prompt com a metodologia embutida: 9 tipos + complexidade, 4Ds, tom editorial
  (proibido hype), linhas vermelhas (nunca prometer app pronto).
- Saída **estruturada via Structured Outputs / JSON schema da OpenAI** — a UI renderiza
  campos, nunca texto livre de chat.
- Rotas server-side (`api/lab/interview`, `api/lab/plan`), `OPENAI_API_KEY` só em env da
  Vercel — nunca no cliente, nunca commitada.

### Controle de custo
Máx. 1 entrevista + 2 gerações de plano por projeto; resultado persistido (nunca regerar em
re-render); tokens registrados em `lab_project_interviews`; modelo barato por padrão; sem
streaming de conversa.

### Anti-chat-genérico (mitigação do Risco 1 do handoff)
Não existe caixa de texto livre conversacional em nenhuma tela. A IA aparece como: perguntas
numeradas em formulário, resumo em painel, plano em blocos estruturados com checklist. O
usuário nunca "conversa" — ele responde, revisa e avança etapas.

---

## 7. Premium e monetização (preparar na 1A, cobrar na 1C)

| | Gratuito (pós-1C) | Premium |
|---|---|---|
| Projetos | 1 projeto | Ilimitados |
| Diagnóstico | Completo | Completo |
| Plano | Resumo + primeiras etapas | Completo + checklist + artefatos |
| Biblioteca | Ativos `premium_only=false` (~4 de 10) | Tudo, incl. materiais do workshop |
| Exportação | — | Markdown/PDF |
| Workshop | Lista de interesse | Materiais + desconto em turmas |

**O que a 1A já prepara (sem cobrar):** `premium_only` em `lab_assets` desde o dia 1;
`plan_type` em `authorized_emails` diferenciando `lab_beta` de assinante; limites de plano
centralizados em um módulo (`src/lib/lab/limits.ts`) para o paywall ser um switch, não um
refactor; eventos de analytics de interesse premium já instrumentados.

**Fluxo Stripe (1C, ≈ISSUE-305):** `/lab` → Stripe Checkout (R$15–29/mês, preço a definir) →
webhook `checkout.session.completed` → INSERT `authorized_emails` + boas-vindas via Resend →
login liberado; `customer.subscription.deleted` → expira autorização. **Convive com o
Substack** (recomendação já registrada no backlog): Substack segue como base editorial e canal
antigo; Stripe converte direto do site. Materiais do workshop entram como `lab_assets` com
`origin='workshop'` e `premium_only=true` — mesma biblioteca, mesmo mecanismo de recomendação.
Assim a monetização não depende de posts pagos: o que se vende é acesso à jornada + biblioteca,
não conteúdo textual.

---

## 8. Backlog técnico por issues (série 310+; 301–304 ficam superseded)

> Numeração: a Fase 2 do revamp já reservou 301–307. O handoff redefine 301–304 (ferramentas
> separadas → jornada única): marcá-las como **superseded pela série 310** no
> `04_issue_backlog.md`. A 305 (Stripe) é absorvida pela 325; 306 pela 316/326; 307 segue viva
> para o futuro.

### Fase 1A — Protótipo navegável sem IA (ordem de execução)

**ISSUE-310 — Spec técnica + SQL das tabelas do Lab**
*Objetivo:* fundação de dados. *Escopo:* SQL de `lab_profiles`, `lab_projects`, `lab_assets`
com RLS por usuário + REVOKE seletivo (padrão ISSUE-106); doc de schema; SELECTs de
verificação para o dono rodar. *Arquivos:* `docs/revamp/ISSUE-310-sql-lab.md`.
*Aceite:* tabelas criadas em produção; query com chave anon falha; query autenticada só vê as
próprias linhas. *Dep.:* nenhuma. *Risco:* médio (primeira RLS `auth.uid()` em tabela nova —
auditar como na Fase 3).

**ISSUE-311 — Route group `(lab)` + LabShell + gate server-side**
*Objetivo:* casca da área logada. *Escopo:* `src/app/(lab)/lab/{layout,inicio}`; gate com
`@supabase/ssr` (client server-side lendo sessão de cookie) + checagem `authorized_emails`;
navegação DS2 própria (Início · Biblioteca · Perfil); link discreto "plataforma ROI do Foco"
para assinantes antigos; estados de loading/erro. *Arquivos:* `src/app/(lab)/`,
`src/components/lab/LabShell.tsx`, `src/lib/supabase-server.ts` (novo).
*Aceite:* anônimo em `/lab/inicio` → redirect `/auth` sem flash; logado não autorizado → tela
"beta fechado" com CTA lista; build/tsc/lint limpos. *Dep.:* nenhuma (dados mock).
*Risco:* médio (introduz `@supabase/ssr` — testar login/logout ponta a ponta; **não tocar** no
AppShell legado).

**ISSUE-312 — Motor do Lab: adaptador wizard→classificação + gerador de plano (lib pura)**
*Objetivo:* o cérebro da 1A, testável sem UI. *Escopo:* `src/lib/lab/engine.ts` (mapeia
respostas do wizard para o motor de `radar/oportunidades.ts`, estende com potencial de
IA/automação e risco derivados das flags existentes); `src/lib/lab/plan-generator.ts`
(templates de plano por tipo × área × fluência, semeados por `content.ts`: resumo, 4–7 etapas,
checklist, artefato sugerido, slugs de materiais); tipos TS dos JSONB; testes vitest.
*Aceite:* cobertura dos 9 tipos; mesmo input → mesmo output (`engine_version` fixado); testes
verdes. *Dep.:* nenhuma. *Risco:* baixo (padrão já provado no radar).

**ISSUE-313 — Wizard `/lab/novo-projeto`**
*Objetivo:* entrada da jornada. *Escopo:* formulário em 4 passos (Problema → Contexto →
Pessoas & dados → Ambição, ~10 campos do handoff §8.1.2), reuso do padrão
`QuestionCard`/`OptionButton`/`Progress`; salva rascunho por passo em `lab_projects`
(`status='rascunho'`); submissão roda a ISSUE-312 e grava `diagnosis`+`plan`; rotas de API
(`api/lab/projects`) com validação. *Aceite:* fluxo completo cria projeto `planejado` e
redireciona para `/lab/projeto/[id]`; abandono no meio preserva rascunho; mobile <3min;
touch ≥44px. *Dep.:* 310, 311, 312. *Risco:* médio (é a tela com mais estados).

**ISSUE-314 — Página do projeto `/lab/projeto/[id]`**
*Objetivo:* o "endereço" do projeto — diagnóstico + plano + materiais. *Escopo:* blocos de
classificação (tipo/família/complexidade/potenciais/risco, com bloco de Diligência quando a
flag existir), plano com checklist clicável (persiste em `plan.checklist[].done`, atualiza
`status`), materiais recomendados; estados vazio/erro/projeto alheio (404). *Aceite:* marcar
etapa persiste e sobrevive a refresh; projeto de outro usuário → 404 (testado com 2 contas);
visual DS2 (Module/Panel/Progress). *Dep.:* 312, 313. *Risco:* baixo.

**ISSUE-315 — `/lab/inicio` (hub) com estados reais**
*Objetivo:* chegada pós-login. *Escopo:* saudação, card "novo projeto" (grid técnico DS2),
"continue de onde parou" (projeto mais recente + progresso), lista de projetos, atalho
biblioteca; estado vazio caprichado (primeiro login = convite claro à proposta). *Aceite:*
os 3 estados (vazio / 1 projeto / vários) renderizam; clique em projeto abre a página dele.
*Dep.:* 311, 313, 314. *Risco:* baixo.

**ISSUE-316 — Biblioteca `/lab/biblioteca` + seed dos primeiros ativos**
*Objetivo:* repertório conectado. *Escopo:* listagem com filtros (tipo de solução, formato),
página/painel de leitura markdown; seed de **6–10 ativos** (rascunhados a partir de
`content.ts` + lista do handoff §16, aprovados pelo dono antes do seed); conexão com o plano
(slugs recomendados). *Aceite:* filtro funciona; ativo abre e renderiza; plano linka materiais
existentes (zero slug quebrado — teste). *Dep.:* 310, 311; conteúdo aprovado pelo dono.
*Risco:* médio (gargalo é conteúdo, não código).

**ISSUE-317 — Perfil do Builder `/lab/perfil`**
*Objetivo:* base de personalização. *Escopo:* form único (área, senioridade, fluência,
objetivo, gargalo, ferramentas, origem); pré-preenche fluência se houver resultado do radar de
maturidade na sessão; grava `lab_profiles`. *Aceite:* salvar/editar persiste; wizard usa área
do perfil como default. *Dep.:* 310, 311. *Risco:* baixo.

**ISSUE-318 — Analytics do Lab + atualização da vitrine `/lab` + rotina de convites beta**
*Objetivo:* medir a métrica norte desde o dia 1 e ativar o beta. *Escopo:* eventos
`lab_project_started/wizard_completed/diagnosis_viewed/plan_generated/step_completed/asset_opened/profile_completed`
(extensão do padrão `radar-events.ts` + spec de tag/trigger GTM para o dono); vitrine `/lab`
ganha estado "beta no ar" (login para convidados; lista continua para o resto); doc da rotina
de convite (dono: `lab_leads` → `authorized_emails` `plan_type='lab_beta'` + e-mail Resend).
*Aceite:* eventos disparam no GTM Preview; **conversão dos funis existentes revalidada**
(trava do CLAUDE.md); doc de convite testado com 1 convite real. *Dep.:* 313–315.
*Risco:* médio (toca vitrine pública — não pode quebrar captura).

**ISSUE-319 — Gate de QA da Fase 1A**
*Objetivo:* selo de pronto. *Escopo:* tsc/lint/build; fluxo ponta a ponta com conta beta real
(login → wizard → plano → checklist → retorno); RLS (anon e usuário B); mobile real (iPhone +
Android); Lighthouse das rotas novas (alvo ≥85 — nascem leves); checklist do §9 deste doc.
*Aceite:* relatório com zero FALHOU nos critérios do §9. *Dep.:* todas as 31x. *Risco:* baixo.

### Fase 1B — IA controlada

**ISSUE-320 — Infra de IA** (SDK OpenAI, `OPENAI_API_KEY` em env da Vercel, rota server com
auth+rate-limit, telemetria de tokens, limites por projeto). *Dep.:* 319.
**ISSUE-321 — Entrevista complementar** (`/lab/projeto/[id]/entrevista`: 3–5 perguntas
geradas + resumo, saída estruturada via tool use, tabela `lab_project_interviews`; fallback
gracioso se a IA falhar → segue direto pro diagnóstico de regras). *Dep.:* 320.
**ISSUE-322 — Plano enriquecido por IA + export Markdown** (justificativa da classificação,
plano personalizado incorporando a entrevista; regeneração limitada; export .md). *Dep.:* 321.
**ISSUE-323 — Medição da 1B** (eventos de entrevista, custo por projeto no Grafana, critério
do handoff: "a IA melhora o resultado sem virar chat"). *Dep.:* 321–322.

### Fase 1C — Premium inicial

**ISSUE-324 — Modelo de planos** (`src/lib/lab/limits.ts` aplicado: free = 1 projeto/plano
resumido/biblioteca parcial; upsell nos pontos de corte). *Dep.:* 319.
**ISSUE-325 — Stripe** (absorve ISSUE-305: checkout, webhooks, INSERT/expiração em
`authorized_emails`, boas-vindas Resend, decisão Substack-convive confirmada). *Dep.:* 324.
**ISSUE-326 — Biblioteca premium + export PDF** (absorve ISSUE-306: completar 10+ ativos,
paywall efetivo, materiais `origin='workshop'`). *Dep.:* 324–325.

### Fase 2 — Integração com workshops
**ISSUE-330** — acesso/cupom por turma, materiais da turma na biblioteca, projetos dos
participantes como semente de cases, coleta de feedback. (307 — mentoria/palestras — segue
como issue própria fora do app.)

### Fase 3 — Evolução de nível (já esboçada: 401–405)
Trilhas, níveis/badges, App Readiness Checklist, biblioteca de casos, miniapps.

---

## 9. Critérios de aceite da Fase 1A (gate da ISSUE-319)

1. **Proposta clara:** usuário beta de fora descreve `/lab/inicio` como "me ajuda a transformar
   um problema do trabalho em um projeto com plano" (teste dos 5 segundos, ≥3 pessoas).
2. **Jornada completa sem ajuda:** login → wizard → diagnóstico → plano em <10min no celular,
   sem instrução externa.
3. **Diagnóstico útil:** classificação nos 9 tipos com explicação, complexidade, risco e
   Diligência quando aplicável — consistente com o que o radar público diria (mesmo motor).
4. **Plano real:** resumo + etapas + checklist + artefato sugerido + ≥2 materiais linkados
   existentes na biblioteca.
5. **Persistência:** refresh, logout/login e outro dispositivo mantêm projeto e progresso;
   usuário B não vê nada do usuário A (RLS testada).
6. **Biblioteca mínima:** 6–10 ativos publicados, filtráveis, legíveis no mobile.
7. **Diferente de chat:** zero campos de conversa livre; toda IA futura já tem lugar reservado
   em fluxo estruturado.
8. **Não-regressão:** funis públicos (radares, conversão Ads/GTM) revalidados; plataforma
   legada intocada; `tsc`/lint/build limpos; Lighthouse ≥85 nas rotas novas.
9. **Métrica norte instrumentada:** dá para contar "projetos que chegaram a plano" no
   GA4/Supabase desde o primeiro usuário.

---

## 10. Suposições documentadas (seguidas sem perguntar)

1. **Rotas em português** (`/lab/inicio`, `/lab/novo-projeto`, `/lab/projeto/[id]`,
   `/lab/biblioteca`, `/lab/perfil`) — convenção do site inteiro.
2. **Diagnóstico+plano em uma página** (§3) — menos cliques, mesmo motor, rota estável.
3. **JSONB versionado em vez de tabelas de diagnóstico/plano** (§5) — menos superfície de RLS.
4. **Beta fechado na 1A** via `authorized_emails` `plan_type='lab_beta'`, convites manuais da
   lista de espera — free tier de verdade só existe quando houver Stripe (1C).
5. **Vitrine `/lab` continua sendo a página de venda**; a área logada vive nas subrotas.

## Decisões registradas (dono, 2026-07-09 — detalhe no `00b_open_questions.md` pergunta 14)

As 5 perguntas bloqueantes foram respondidas na mesma sessão em que o plano nasceu:

1. **Acesso 1A:** beta fechado por convite (10–20 pessoas da lista `lab_leads`, liberação
   manual em `authorized_emails` com `plan_type='lab_beta'`).
2. **Conteúdo dos ativos:** Claude rascunha a partir do `content.ts` + material editorial;
   nada publica sem aprovação do dono.
3. **Legado (ROI do Foco):** link discreto no LabShell **só para assinantes antigos**;
   convidados novos do beta não veem o legado.
4. **Largada:** Fase 1A começa **já, em paralelo** às pendências do launch do funil
   (ISSUE-112) — as primeiras issues não tocam nada público.
5. **IA da 1B:** **API da OpenAI, modelo barato** (única chave do dono) — supera a suposição
   original de Claude API.
- *(Default assumido, não bloqueante: as perguntas do wizard serão revisadas com o dono na
  abertura da ISSUE-313, antes de codar a tela.)*

## Próximo passo

Decisões tomadas e backlog atualizado → executar **ISSUE-310** (SQL das tabelas do Lab, dono
roda no painel) e **ISSUE-312** (motor puro + testes) primeiro — as duas destravam tudo e não
tocam em nada público.
