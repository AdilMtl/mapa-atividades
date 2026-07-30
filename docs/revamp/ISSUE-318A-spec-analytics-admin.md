# ISSUE-318A — Spec: Painel de Analytics do admin

> **Criado em** 2026-07-29 · sessão de análise + spec (Opus, persona Analytics & Ads)
> **Origem:** pedido do dono — "quero ver os resultados na prática; tem e-mails captados e
> pessoas que fizeram diagnóstico, e eu não capto nenhuma estatística, nenhum gráfico".
> **Status:** spec fechada, execução não iniciada.
> **Antes de executar:** ler esta spec inteira + `07_mapa_tracking_ads.md` (trava de conversão) +
> a seção "Tracking & Conversão" do `CLAUDE.md`.

---

## 1. Decisões travadas com o dono (2026-07-29)

Estas quatro decisões saíram da sessão de grilling. **Não reabrir na execução** — se a execução
achar motivo forte para divergir, para e registra, não decide sozinha.

| # | Decisão | Escolha do dono |
|---|---|---|
| 1 | Fonte de dados | **Só Supabase.** GA4 continua sendo consultado no GA4. Nada de Data API do Google nesta issue. |
| 2 | Decisões que o painel precisa servir | **(a) onde investir em Ads · (b) qual conteúdo escrever · (c) pipeline do Lab.** Comparação funil novo × legado ficou FORA. |
| 3 | Instrumentação nova | **Nenhuma.** Zero evento novo, zero coluna nova. O painel usa exclusivamente o que já grava hoje. |
| 4 | Restyle do `/admin/assinantes` + navegação admin | **Issue separada (318B)**, depois desta. |

**Consequência direta da decisão 3:** dois números **não existem** e o painel precisa dizer isso
na cara, em vez de esconder:

- **Não há topo de funil.** Sem evento de pageview no nosso banco, "visitante → começou radar" é
  incalculável. O funil do painel **começa em "sessão de radar criada"**.
- **Não há dropout por pergunta no radar.** O `answers` só é gravado no PATCH final (junto com o
  `result_key`), então quem abandona na pergunta 5 deixa uma sessão com `answers = NULL`,
  indistinguível de quem abandonou na pergunta 1.

**Achado que compensa em parte:** no Lab o dropout POR FASE é mensurável hoje —
`lab_step_completed` carrega `{ project_id, fase_id }`. O que não dá no radar, dá na Caminhada.

---

## 2. Inventário real do que está gravado (auditado no código, não presumido)

### 2.1 Funil novo — radares

**`radar_sessions`** (uma linha por pessoa que ABRIU um radar)
`id · kind('maturidade'|'oportunidades') · answers JSONB · result_key · utm_source · utm_medium ·
utm_campaign · utm_content · utm_term · ip_address · user_agent · created_at · completed_at`

- `completed_at IS NOT NULL` = concluiu o radar. É o denominador limpo de conclusão.
- `answers` só é escrito no PATCH final (`api/radar/session` PATCH) — ver limitação acima.
- `result_key` é o veredito: 1 de 5 níveis (maturidade) ou 1 de 9 tipos (oportunidades).
- UTM é capturado no POST de criação da sessão, truncado a 100 chars.

**`radar_leads`** (uma linha por captura de e-mail)
`id · session_id (FK) · kind · name · email · newsletter_optin · lab_interest · ip_address · created_at`

- ⚠️ **Sem UNIQUE em `email`.** A mesma pessoa nos dois radares gera 2 linhas.
  **Toda contagem de lead usa `COUNT(DISTINCT lower(email))`.** `COUNT(*)` é bug de análise.

**`radar_events`** (log de eventos — 19 nomes `radar_*` + 10 `lab_*`, MESMA tabela)
`id · session_id (FK, nullable) · event_name · page_url · payload JSONB · ip_address · user_agent · created_at`

- Todo evento carrega no payload os UTMs (`track()` injeta `lerUtm()`) + `entry_path`.
- Eventos `lab_*` **nunca** têm `session_id` (a FK aponta pra `radar_sessions`); o `project_id`
  viaja no payload.
- Payloads confirmados no código:
  - `email_capture_viewed` / `email_submitted` → `{ assessment_type, session_id }`
    (+ `premium_interest` no submitted)
  - `lab_asset_opened` → `{ slug }`
  - `lab_branch_opened` → `{ slug, solution_type }`
  - `lab_step_completed` → `{ project_id, fase_id }`
  - `lab_plan_generated` → `{ project_id }`

### 2.2 Lab

**`lab_projects`**: `id · user_id · title · status('rascunho'|'em_construcao'|'concluido') ·
wizard_answers JSONB · diagnosis JSONB · plan JSONB · created_at/updated_at`
- `diagnosis->>'tipo'` = tipo de solução; `plan->'checklist'` = array `[{id,label,done}]`;
  `plan->'resultado'` = check-up da 314D.

**`lab_profiles`**: `user_id · role_area · seniority · ai_fluency_level · main_goal ·
biggest_bottleneck · tools_used JSONB · origin`

**`lab_leads`**: `email · utm_* · created_at` (lista de interesse da vitrine `/lab`)

### 2.3 Segmentação disponível (a resposta ao pedido de "demografia")

**Não temos demografia** — nada de idade, gênero ou cidade. Temos **segmentação profissional
autodeclarada**, que serve melhor à decisão de conteúdo:

| Dimensão | Onde | Cardinalidade |
|---|---|---|
| Área de atuação | `answers->>'op_area'` · `lab_profiles.role_area` | 12 opções |
| Entrega principal | `answers->>'op_entrega'` | 10 |
| Onde perde tempo | `answers->>'op_perda'` | 10 |
| Frequência da dor | `answers->>'op_frequencia'` | 5 |
| Público atendido | `answers->>'op_publico'` | — |
| Dado sensível | `answers->>'op_dado'` | — |
| Desejo | `answers->>'op_desejo'` | — |
| Conforto com tecnologia | `answers->>'op_conforto'` | — |
| Nível de fluência em IA | `result_key` (maturidade) · `lab_profiles.ai_fluency_level` | 5 níveis |
| **O que quer evoluir** | `answers->>'mat_fronteira'` | 5 — **sinal editorial mais direto** |
| Tipo de solução recomendado | `result_key` (oportunidades) · `diagnosis->>'tipo'` | 9 |
| Senioridade | `lab_profiles.seniority` | — |
| Maior gargalo (texto livre) | `lab_profiles.biggest_bottleneck` | texto |

**Geolocalização: fora de escopo por decisão de risco.** O `ip_address` existe e permitiria geo,
mas é dado pessoal e o site ainda não tem banner de consentimento (ISSUE-209 pendente). Ganho
analítico baixo, exposição LGPD real. Não fazer.

---

## 3. Armadilhas metodológicas que a execução DEVE tratar

Não são detalhes de implementação — são a diferença entre um painel que informa e um que mente.

### 3.1 O tráfego de teste do dono está dentro do dado
Semanas de teste em produção (contas `adilson.matioli@`, `adilson.matioli1@`, IP doméstico e
celular). Com N pequeno, o dono pode ser 30% da amostra.

**Tratamento (o que dá com dado atual):**
- Lista de e-mails excluídos, no padrão de `src/lib/admin.ts`: constante no código com override
  por env (`ANALYTICS_EMAILS_EXCLUIDOS`, separados por vírgula). Aplica a `radar_leads`,
  `lab_leads` e ao join de projetos por `user_id` do dono.
- **Seletor "dados a partir de"** (data de corte) no topo do painel — é o instrumento honesto
  para sessões abandonadas de teste, que não têm e-mail e são impossíveis de identificar.
- **Nota explícita na tela:** "sessões sem e-mail não podem ser filtradas por identidade — use
  a data de corte".

### 3.2 Exato × direcional — a distinção precisa aparecer na UI
- **Exato:** contagens em `radar_sessions`, `radar_leads`, `lab_projects` (uma linha por
  pessoa/sessão/projeto).
- **Direcional:** contagens em `radar_events` — `sendBeacon` pode duplicar ou perder, e o mesmo
  usuário dispara vários eventos.

**Regra de UI:** todo número derivado de `radar_events` leva um marcador visual discreto
(ex.: badge "evento") e o painel explica a diferença uma vez, no bloco de notas de leitura.
**Nunca** apresentar contagem de evento como contagem de pessoa.

### 3.3 Taxa sem denominador é desinformação
Com volume de beta, "33%" pode ser 1 de 3. **Todo percentual na tela vem acompanhado do N
absoluto** — formato `18% · 7 de 39`. Sem exceção. E abaixo de N=20 num degrau, o painel marca
o número como amostra insuficiente em vez de sugerir precisão que não existe.

### 3.4 Série diária vira serrote
Não construir 8 gráficos de linha. **Uma** série temporal (sessões e leads por dia na janela),
e o resto em tabelas/barras ordenadas.

### 3.5 Grafana está morto — CONFIRMADO, decisão: aposentar
`docs/dashboard-grafana-supabase.md` configura o data source apontando para o projeto Supabase
`ghscflemhgrbfflmxqbk`, que é o ref **antigo** (pausado e migrado em julho/2026 —
ver `CHANGELOG` v3.5.2).

**Confirmado pelo dono em 2026-07-29:** "não vejo nada no Grafana... deu trabalho configurar e aí
não me mostra muita coisa". **Decisão: aposentar o Grafana**, não reconectar. Este painel é o
substituto — e é por isso que a §4.1 (agregação em TS, sem views) é a escolha certa: não faz
sentido investir em views SQL cuja razão de existir era alimentar um dashboard que está sendo
desligado.

**Ação já executada na sessão de spec (2026-07-29):** `docs/dashboard-grafana-supabase.md` e
`docs/views-analytics-supabase.md` receberam cabeçalho de **documento histórico** — um guia de
setup que aponta pra um banco morto é armadilha para sessão futura. Nada a fazer na execução.

### 3.6 Funil legado `/pre-diagnostico` — FORA de escopo, por decisão do dono
Levantei o risco de aposentar o Grafana deixar o funil legado sem visibilidade nenhuma, já que a
conversão do Google Ads dispara no `EmailGate` dele. **Resposta do dono (2026-07-29):** "o funil
legado nem uso; estou tentando remodelar o funil novo para esse novo esquema da Newsletter" — e
ele vai aposentar o funil legado junto com o Grafana.

**Consequência checada no código, para o registro:** aposentar o legado **não** derruba a
conversão do Ads. A ISSUE-103 já replicou o disparo no lead do radar de oportunidades
(`gtag('event','conversion', …)` quando `triggerConversion: true`), no **mesmo label**
`AW-16601345592/0K0dCMm6oo4bELjckew9` (decisão registrada em `07_mapa_tracking_ads.md` §3.3).
Os dois funis alimentam a mesma conversão hoje.

→ Reforça a **ISSUE-207** (aposentadoria do `/pre-diagnostico`), que passa a ser intenção
declarada do dono e não mais hipótese condicionada à paridade de CPL. As 7 views `vw_*` seguem
existindo no banco, sem consumidor.

---

## 4. Arquitetura escolhida

### 4.1 Sem SQL novo — agregação em TypeScript

**Decisão:** zero view nova, zero função nova, zero tabela nova. Nada para o dono rodar no
painel do Supabase.

**Por quê** (e por que NÃO views, que seria o reflexo natural):
- Volume atual é de beta (dezenas a poucas centenas de sessões). Agregar em TS é adequado.
- O projeto tem cultura forte de vitest (372 testes) — agregação em `src/lib/admin/analytics.ts`
  fica **testável com fixtures**, o que uma view SQL não fica.
- A regra de exclusão de tráfego de teste é lógica de produto; em TS ela é versionada,
  revisável em diff e coberta por teste.
- Evita mais um round-trip "dono roda SQL e cola o resultado" e uma nova superfície de
  segurança no banco.

**Limite explícito e como respeitá-lo** (o risco real dessa escolha):
- O client JS do Supabase tem teto default de 1000 linhas por query. Ignorar isso produz
  **silenciosamente** um painel que subconta.
- **`radar_events` NUNCA é lido em bulk.** Só por contagem: `.select('id', { count: 'exact',
  head: true })` com filtros — não transfere linha, funciona em qualquer volume.
- `radar_sessions` / `radar_leads` / `lab_projects` (uma linha por pessoa, volume pequeno) podem
  ser lidas para agregar distribuições, **com cap explícito e sinalização na resposta** quando o
  cap é atingido (`amostraTruncada: true` → o painel avisa em vez de mentir).
- **Gatilho de migração para views SQL, registrado agora:** quando qualquer tabela lida em bulk
  passar de ~5.000 linhas, abrir issue de migração para views `vw_*` com
  `security_invoker = true` (regra da casa). O painel foi desenhado para essa troca ser interna
  à camada de dados.

### 4.2 Funil pela tabela, não pelo evento

Os degraus com tabela equivalente usam a **tabela** (denominador exato). Só os degraus que
existem exclusivamente como evento usam `radar_events`, marcados como direcionais.

| Degrau | Fonte | Natureza |
|---|---|---|
| Abriu o radar | `radar_sessions` (count) | exato |
| Concluiu o radar | `radar_sessions.completed_at NOT NULL` | exato |
| Viu o gate de e-mail | evento `email_capture_viewed` | direcional |
| Virou lead | `radar_leads` (DISTINCT email) | exato |
| Pediu o Lab | `radar_leads.lab_interest` + `lab_leads` | exato |
| Clicou em leitura/newsletter | eventos `recommended_article_clicked`, `newsletter_cta_clicked` | direcional |

### 4.3 Segurança — herda o padrão da 318, sem exceção

- Página em `src/app/(app)/admin/analytics/page.tsx`, Server Component, gate
  `exigirAdminSessao()` de `src/lib/admin.ts` → `redirect('/dashboard')` se não for admin.
  Middleware já cobre `/admin/:path*`.
- Rota `GET /api/admin/analytics` valida a **sessão do cookie no servidor** (mesmo gate). Nunca
  header do cliente — foi exatamente a falha corrigida na ISSUE-318.
- Client `service_role` instanciado **local na rota** (nunca importado de `lib/supabase`).
- **Somente leitura.** A rota não tem POST/PATCH/DELETE.
- **Zero PII na resposta agregada.** Nenhum e-mail, nome ou IP atravessa a API. Lista de
  e-mail continua exclusividade do painel de convites (`/admin/lab-beta`), que já existe.
- Cache: `revalidate` de 5 minutos (ou `Cache-Control` equivalente). Não precisa ser real-time.

### 4.4 Trava de tracking — o que esta issue NÃO toca

`src/app/layout.tsx`, `src/components/prediagnostico/EmailGate.tsx`, `src/app/api/prediag/*`,
`src/lib/analytics.ts`, `src/lib/radar-events.ts`, `src/lib/lab-events.ts` e qualquer página
pública: **diff obrigatoriamente vazio**. Esta issue só LÊ o que o tracking gravou.
Critério de aceite verificável por `git diff --stat`.

---

## 5. Conteúdo da tela (mobile-first, DS2)

Blocos empilhados em coluna única no mobile; grid a partir de `md`. Componentes de
`src/components/ds2` (mesmo vocabulário do `PainelConvitesLab`). Zero hex fora dos tokens DS2.

### Controles (topo, fixos)
- Janela: **7 · 28 (default) · 90 · tudo**
- Data de corte "dados a partir de" (trata o tráfego de teste — §3.1)
- Toggle "incluir meu tráfego" (default: **excluído**)

### Bloco 1 — Números da janela
4 tiles: sessões de radar · conclusões · **leads únicos** (DISTINCT email) · projetos no Lab.
Cada tile mostra o valor absoluto e a variação vs. janela anterior **só quando N ≥ 20**.

### Bloco 2 — Funil dos radares  → *decisão: Ads*
Funil desenhado como funil (degraus com a queda entre eles), **separado por `kind`** —
maturidade e oportunidades têm jornadas diferentes de propósito (doc 10) e misturar destrói a
leitura. Degraus da tabela em §4.2. Cada degrau: `% · N de M`.

### Bloco 3 — Origem do tráfego  → *decisão: Ads*
Tabela ordenada por sessões: `utm_source / utm_medium / utm_campaign` → sessões · % conclusão ·
leads únicos · **lead por sessão**. Linha própria para "direto / sem UTM".
Mais **uma** série temporal: sessões e leads por dia na janela.

> A pergunta que este bloco responde: *qual campanha traz gente que TERMINA*, não qual traz clique.

### Bloco 4 — Quem chega  → *decisão: conteúdo*
Barras horizontais ordenadas: área de atuação (`op_area`) · nível de maturidade (`result_key` do
radar de maturidade) · tipo de solução recomendado (`result_key` de oportunidades).

### Bloco 5 — O que dói  → *decisão: conteúdo*
Top 5 de cada: onde perde tempo (`op_perda`) · entrega principal (`op_entrega`) ·
**o que quer evoluir (`mat_fronteira`)** — este último é o sinal editorial mais direto que
existe no banco. Mais uma matriz compacta **área × tipo recomendado** (só células com N ≥ 2,
para não virar ruído).

### Bloco 6 — Pipeline do Lab  → *decisão: Lab*
Funil: interesse (`lab_leads` + `radar_leads.lab_interest`, dedupe) → convidados
(`authorized_emails` `plan_type='lab_beta'`) → contas criadas → projetos criados →
**plano gerado (métrica norte)** → em construção → concluídos.
Mais: distribuição de `lab_projects.status`, progressão média do checklist
(`plan->'checklist'` done/total), **dropout por fase** (`lab_step_completed.fase_id` — o dado que
o radar não tem), e guias mais abertos (`lab_asset_opened.slug`).

### Bloco 7 — Como ler estes números
Bloco de texto curto, sempre visível (não um accordion escondido). Diz, na voz do projeto:
o que é exato e o que é direcional; que não há topo de funil nem dropout por pergunta no radar,
e por quê; que taxa com N baixo é indício, não conclusão; e qual é a data de corte ativa.

> Este bloco não é rodapé decorativo. É o que impede o dono de tomar decisão de Ads com base em
> 3 sessões.

---

## 6. Arquivos previstos

**Novos**
- `src/lib/admin/analytics.ts` — tipos + agregações puras (distribuições, funis, taxas,
  exclusão de tráfego de teste). Sem I/O, para ser testável.
- `src/lib/admin/analytics.test.ts` — vitest com fixtures: dedupe de e-mail, exclusão de
  tráfego, N=0, N=1, cap de amostra atingido, sessão sem `answers`.
- `src/app/api/admin/analytics/route.ts` — GET, gate de admin, service_role, contagens.
- `src/app/(app)/admin/analytics/page.tsx` — Server Component com gate.
- `src/components/admin/PainelAnalytics.tsx` — client, orquestra os 7 blocos.
- `src/components/admin/analytics/*` — blocos (Funil, Origem, Distribuicao, Matriz, SerieTempo).

**Alterados**
- `src/app/(app)/admin/assinantes/page.tsx` e/ou `PainelConvitesLab.tsx` — apenas o link de
  navegação para o novo painel (mudança mínima; o restyle é a 318B).
- `docs/CURRENT-STATUS.md`, `docs/CHANGELOG.md`, `04_issue_backlog.md`.

**Intocados (verificar com `git diff --stat`)**
`layout.tsx` · `EmailGate.tsx` · `api/prediag/*` · `lib/analytics.ts` · `lib/radar-events.ts` ·
`lib/lab-events.ts` · qualquer página pública · qualquer arquivo do funil `/pre-diagnostico`.

---

## 7. Critérios de aceite

1. `/admin/analytics` renderiza para a sessão do dono; **janela anônima cai no `/auth`** e
   usuário comum logado cai no `/dashboard`.
2. `GET /api/admin/analytics` sem sessão de admin responde **401/403** (testável por `curl`
   sem cookie) e **não** devolve nenhum e-mail, nome ou IP em nenhum cenário.
3. Todo percentual na tela exibe o N absoluto ao lado.
4. Números derivados de `radar_events` estão visualmente marcados como direcionais.
5. Contagem de leads usa e-mail distinto — validado por teste unitário com fixture de duplicata.
6. Toggle de tráfego de teste e data de corte alteram os números de fato (default: excluído).
7. Mobile real (celular do dono): coluna única, sem overflow horizontal, touch ≥ 44px,
   tabelas com scroll interno próprio — nunca a página rolando lateralmente.
8. `npx tsc --noEmit` limpo · lint sem erro nos arquivos tocados · build verde · suíte de testes
   verde com os casos novos.
9. `git diff --stat` comprova diff **zero** nos arquivos da trava de tracking (§4.4).
10. **Validação do dono:** ele abre o painel no celular e consegue responder, sem ajuda, as três
    perguntas que motivaram a issue — de onde vêm as pessoas que terminam, sobre o que escrever,
    e onde o Lab está travando.

---

## 8. Fatiamento

A issue é grande para uma sessão só (rota + camada de agregação testada + 7 blocos de UI).
Mesmo padrão de fatiamento que funcionou na ISSUE-316:

- **Fatia A (ISSUE-318A):** casca da página + gate + camada de dados testada + **Bloco 1, 2, 3 e
  7** (números da janela, funil dos radares, origem do tráfego, notas de leitura).
  Fecha a decisão de **Ads** e já entrega a página no ar.
- **Fatia B (ISSUE-318A2):** **Bloco 4, 5 e 6** (quem chega, o que dói, pipeline do Lab).
  Fecha as decisões de **conteúdo** e **Lab**, reusando a camada de dados da Fatia A.

O Bloco 7 entra na Fatia A de propósito: um painel sem as notas de leitura é um painel que
convida a conclusão errada, e a Fatia A já vai estar no ar.

---

## 9. Fora de escopo (registrado, não esquecido)

| Item | Onde vai |
|---|---|
| Restyle `/admin/assinantes` + casca de navegação admin mobile | **ISSUE-318B** |
| Evento de pageview + dropout por pergunta no radar | **ISSUE-318C** (vetado agora pelo dono) |
| Integração com a GA4 Data API | ISSUE-318C ou issue própria futura |
| Funil legado `roi_*` / `/pre-diagnostico` | **fora por decisão do dono** — ele não usa e vai aposentar (§3.6). Encosta na ISSUE-207 |
| Geolocalização por IP | bloqueado por LGPD até a ISSUE-209 (consentimento) |
| Views `vw_*` para radares/Lab | não fazer — o Grafana que as justificava está sendo desligado (§3.5, §4.1) |
| Export CSV dos agregados | não pedido; avaliar depois de usar o painel |
| Captura e triagem de feedback do dono/usuários | **ISSUE-318D + 318E** (spec própria: `ISSUE-318D-spec-feedback.md`) |
