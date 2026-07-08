# 📅 CHANGELOG - ROI DO FOCO

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

# 📅 CHANGELOG - ROI DO FOCO

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [v3.9.1] - 2026-07-08 - ✍️ Revisão de copy (voz editorial) — ISSUE-111

### 🎨 Melhorado
- **ISSUE-111 — 7 ajustes de copy nas superfícies novas da Fase 1**, com três lentes: voz da
  newsletter (sem "cheiro de IA"), português do Brasil (caça a decalque de tradução) e CTAs de
  intenção que motivam clique:
  - `/lab`: parágrafo principal reescrito em tensão→contraste (era lista de features emendada)
    + microcopy da lista alinhada com a da home;
  - Pricing (home): "cursos exclusivos" → "séries exclusivas" — eliminava contradição com "não
    por quem vende curso" na mesma página (⚠️ descreve a oferta paga; dono pode vetar);
  - Demo da plataforma (home): "a mesma engenharia que recebe os radares" → "a mesma casa onde
    agora rodam os radares de IA";
  - Radar de Maturidade P1: "Qual frase soa mais como você?" → "Qual frase é mais a sua cara?"
    (decalque de *sounds like you*; pergunta canônica do doc 11 — pede olhar do dono);
  - Diagnóstico de automação (`content.ts`): "sair do caminho" → "deixar rodar" (decalque de
    *get out of the way*);
  - Resultado de Oportunidades: link "Fazer o Radar de Maturidade" → "Descobrir meu nível de
    verdade" (CTA de função → intenção).
- **Avaliado e mantido de propósito:** mensagens de erro (clareza > personalidade), perguntas do
  Radar de Oportunidades (literais do doc operacional), hero (spec do mock) e os 14 blocos de
  resultado do `content.ts` (padrão-ouro da voz — risco da issue era homogeneizar e perder punch).

### ✅ Adicionado
- `docs/revamp/ISSUE-111-briefing-copy.md` — mapa da varredura de copy (o que foi olhado, o que
  foi achado, o que ficou de fora e por quê).
- **ISSUE-111.1 no backlog** — otimização de conversão da home (seção de fechamento, embed do
  Substack, reordenação de seções, micro-reasseguro, AutorSection robusta), nascida do
  diagnóstico de marketing da sessão. Prova social adiada por decisão do dono (Fase 1.5).

### 📊 Técnico
- Mudanças 100% em strings — nenhum componente, prop, rota ou tracking alterado. `tsc --noEmit`
  e `build` limpos (34 rotas); `lint` sem ocorrências nos arquivos tocados; grep da lista
  proibida de copy zerado em `src/`.
- Status no backlog: ⚠️ aplicada — aguarda o veto de leitura do dono (critério de aceite).

---

## [v3.9.0] - 2026-07-08 - 🔍 SEO técnico — ISSUE-110

### ✅ Adicionado
- **ISSUE-110 — Estrutura mínima de SEO em todas as páginas públicas.** Em termos simples: o
  site ganhou "etiquetas" para o Google (e para quem compartilha o link) entender do que se
  trata — antes disso não existia nada disso.
  - **Preview ao compartilhar o link** (og:image/twitter:image): imagem de capa da marca gerada
    automaticamente (1200×630, via `next/og`), título e descrição de cada página aparecendo no
    card do WhatsApp/LinkedIn/Twitter.
  - **`sitemap.xml`**: lista as 5 páginas de conteúdo que devem ser indexadas (home, os 2
    radares, `/newsletter`, `/lab`).
  - **`robots.txt`**: bloqueia o Google de tentar indexar as 9 rotas privadas (dashboard,
    diagnóstico, plano de ação, painel semanal, relatórios, perfil, configurações, privacidade,
    admin) e as rotas de `/api/`.
  - **JSON-LD `WebSite`** na home: identifica formalmente o site como "+ConverSaaS, o
    ecossistema virtual da newsletter Conversas no Corredor".
  - **H1 corrigido**: `/newsletter`, `/lab` e `/obrigado` não tinham nenhum H1 (só H2) — corrigido
    com uma prop `as="h1"` nova no `SectionTitle` do DS2, sem mudar nada visual.
  - `/obrigado` (pós-conversão) ganhou `robots: noindex` e ficou fora do sitemap — prática padrão
    para thank-you pages.

### 📊 Técnico
- `metadataBase` + `openGraph`/`twitter` base em `src/app/layout.tsx` — title/description de
  cada página passam a espelhar automaticamente em `og:*`/`twitter:*`.
- `src/app/opengraph-image.tsx` + `twitter-image.tsx` (gerador compartilhado em
  `src/lib/og-image.tsx`): imagem estática em build via `ImageResponse`, tokens DS2. Sem
  ferramenta de edição de imagem disponível neste ambiente para produzir um PNG manual em
  `public/og/*` — a rota de imagem gerada pelo Next cumpre o mesmo papel prático.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/site-config.ts` (constantes `SITE_URL`/
  `SITE_NAME` compartilhadas) novos.
- `(app)/layout.tsx` era client component e não podia exportar `metadata`; lógica extraída 100%
  intacta para `src/app/(app)/AppShell.tsx`, `layout.tsx` virou Server Component só com
  `robots: {index:false, follow:false}` — cobre as 9 rotas privadas de uma vez, zero mudança de
  comportamento na plataforma logada.
- `tsc --noEmit`, `lint` e `build` limpos (34 rotas). Smoke test via curl no build de produção:
  og:title/description corretos, imagens OG/Twitter reais (200, PNG, 1200×630), JSON-LD válido,
  `/dashboard` com `noindex, nofollow`, H1 único nas páginas tocadas, GTM e CTAs da home
  intactos, todas as rotas em 200.
- **Não verificado** (sem browser/internet neste ambiente): Rich Results Test do Google e
  Lighthouse SEO real.

---

## [v3.8.1] - 2026-07-08 - 🔧 Fecha ISSUE-109 — 2 eventos do hero pendentes

### 🔧 Corrigido
- **ISSUE-109 (analytics do funil novo) — fechada 15/15 eventos:** os CTAs do hero da home
  (`HeroSection.tsx`) não disparavam `hero_cta_opportunities_clicked` nem
  `hero_cta_maturity_clicked` — ficaram esquecidos na ISSUE-107, que criou a home mas não
  instrumentou os cliques. Extraído `src/components/home/HeroCtas.tsx` (client) do
  `HeroSection.tsx` (que continua server component) para chamar `track()` no `onClick` dos 2
  CTAs, sem mudar copy, destino ou visual.

### 📊 Técnico
- `tsc --noEmit`, `lint` e `build` limpos (33 rotas). Smoke test via curl no build de produção:
  os 2 nomes de evento presentes no HTML gerado, `href` dos CTAs intactos, `/` respondendo `200`.

---

## [v3.8.0] - 2026-07-08 - 📰 Periferia do Funil — ISSUE-108

### ✅ Adicionado
- **ISSUE-108 — Páginas /newsletter, /lab e /obrigado**: completa a periferia do funil da Fase 1
  do revamp (+ConverSaaS)
  - `/newsletter`: página editorial com temas, exemplos de leitura e CTA de assinatura (Substack)
  - `/lab`: premium em construção + formulário de lista de interesse
    (`src/components/lab/LabWaitlistForm.tsx`), gravando em tabela nova e isolada `lab_leads`
    via `POST /api/lab/interest` (validação de e-mail, honeypot, rate limit 5/h/IP)
  - `/obrigado`: leituras recomendadas + CTA newsletter + CTA Lab; dispara `thank_you_page_viewed`
    (evento que a ISSUE-109 tinha deixado pendente esperando esta página existir)
  - `PublicHeader`: links "Newsletter"/"Lab" corrigidos de âncoras quebradas (`#newsletter`,
    `#lab`, só funcionavam dentro da home) para rotas reais
  - `LabSection` (home): CTA "Quero entrar na lista do Lab" ganhou destino real (`/lab`)

### 📊 Técnico
- **Decisão de arquitetura:** `api/radar/lead` exige `sessionId` de uma `radar_sessions`
  existente — inviável para visita solta à `/lab` sem radar prévio. Tabela nova `lab_leads`
  (RLS habilitada, zero política pública, mesmo padrão da ISSUE-106) em vez de relaxar o schema
  do radar. SQL: `docs/revamp/ISSUE-108-sql-lab-leads.md` — rodado e verificado em produção.
- `LEITURAS` exportado de `src/lib/radar/content.ts` para reuso em `/newsletter` e `/obrigado`
  (mesmas URLs verificadas, sem duplicar/reinventar link)
- `tsc --noEmit`, `lint` e `build` limpos (33 rotas). Grep de hex solto no diff: zero. Smoke test
  via curl no build de produção em todas as páginas tocadas + `/api/lab/interest`
- **Decisão do dono:** `/obrigado` fica standalone por enquanto — nenhum redirecionamento dos
  radares para lá ainda (arquivos de resultado já revisados/travados no gate do Sprint 1);
  ligação fica para issue futura
- **Achado registrado, não corrigido:** a home não tem chamada óbvia para `/newsletter` (seção
  da home linka direto pro Substack; links do header somem no mobile) — oportunidade de UX para
  issue futura
- **Achado de ambiente:** build de produção falhava intermitentemente por um `npm run dev`
  concorrente na mesma pasta corrompendo a `.next` compartilhada — não é bug de código

---

## [v3.7.0] - 2026-07-08 - 🏠 Homepage Reposicionada — ISSUE-107

### ✅ Adicionado
- **ISSUE-107 — Homepage reposicionada**: substitui a landing de produtividade antiga pela home
  da nova tese "+ConverSaaS", go-live visual do reposicionamento (Fase 1)
  - `src/app/(publico)/page.tsx` reescrito: monólito de 1106 linhas → composição das 12 seções
    da spec em `src/components/home/*` (Hero, Problema, Reframe, Portas, ComoFunciona,
    PlataformaDemo, Newsletter, Diferenciacao, Pricing, Lab, Autor), pixel-a-pixel com
    `docs/revamp/mockups/landing-preview-final.html`
  - `src/components/shared/`: `PublicHeader`/`PublicFooter` novos (DS2) + `PWAInstallBanner`
    extraído do `page.tsx` antigo (lógica intocada, só mudou de arquivo)
  - CTAs seguem a escada de captura (`10_jornada_captura_radares.md`): hero primário + card
    "Oportunidades" → `/radar/oportunidades`; hero secundário + card "Maturidade" →
    `/radar/maturidade` — direto, sem fallback, já que os radares (103–106) já existem
  - Pricing (3 planos) e os 4 vídeos de demo reais preservados por decisão do dono, com
    progressive loading (1º autoplay mudo, demais clique-para-tocar)
  - `HeroAppPreview.tsx`: janela de app animada e decorativa no hero (prévia do Radar de
    Oportunidades ciclando opção/progresso), respeita `prefers-reduced-motion`

### 📊 Técnico
- **ISSUE-107B fechada sem execução** — ficou obsoleta porque os radares já existiam quando a
  107 rodou (CTAs nasceram diretos, nada para trocar depois)
- `tsc --noEmit`, `lint` e `build` limpos; 29 rotas; home com 4,35 kB / 119 kB first load. Grep
  de hex solto no diff limpo (zero fora dos tokens DS2). `src/app/layout.tsx` (GTM) confirmado
  byte-idêntico — zero diff nesta sessão
- Smoke test via `curl` no build de produção: `/`, `/radar/maturidade`, `/radar/oportunidades`,
  `/auth`, `/privacidade` respondendo `200`; GTM presente no HTML; CTAs dos radares presentes
- Validação manual do dono via `npm run dev` (mobile e desktop) — aprovado
- CTA "Quero entrar na lista do Lab" fica sem destino funcional por enquanto (é vitrine; a
  captura real via banco é a ISSUE-108) — não é regressão, é o escopo esperado desta issue
- **Não verificado:** disparo real da conversão Google Ads via GTM Preview/Tag Assistant (exige
  login do dono); o código do disparo não foi tocado por esta issue e já estava validado nas
  sessões da ISSUE-106/109
- Próxima natural: **ISSUE-108** (`/newsletter`, `/lab`, `/obrigado`)

---

## [v3.6.9] - 2026-07-08 - 🛡️ Gate de Revisão do Sprint 1 (Fable 5)

### 🔧 Corrigido
- **Corrida do duplo clique no auto-avanço** (`src/components/radar/RadarFlow.tsx`): corrigir a
  resposta de uma pergunta em menos de 320ms enfileirava dois `setTimeout` sem cancelamento — o
  índice avançava duas vezes, pulava uma pergunta sem resposta, e o motor
  (`calcularMaturidade`/`decidirOportunidade`) lançava erro não tratado dentro do timeout: o
  usuário respondia tudo e ficava travado sem resultado. Corrigido guardando o timeout num `ref`
  e cancelando-o em toda seleção nova, "Continuar" e "Voltar".
- **Estouro de `VARCHAR` sem sanitização** (`src/app/api/radar/session/route.ts`,
  `src/app/api/radar/lead/route.ts`): `utm_*` (VARCHAR(100)), `name` (VARCHAR(100)) e `email`
  (VARCHAR(255)) eram inseridos sem teto de tamanho — um valor maior (comum em UTM de campanha
  paga) estourava o `INSERT` no Postgres (`22001`) e virava `500`, perdendo sessão/lead
  justamente no tráfego pago. Truncado/validado antes do insert; `answers` do `PATCH` ganhou
  teto (máx. 40 chaves, valores ≤100 chars) contra abuso de JSONB sem limite.
- **`session_id` ausente em 3 eventos de conversão** (`OportunidadesResultado.tsx`,
  `MaturidadeResultado.tsx`): `result_full_requested` (o evento do próprio gate de e-mail),
  `recommended_article_clicked` e `newsletter_cta_clicked` gravavam em `radar_events` com
  `session_id` nulo, quebrando o join do funil por sessão. Helper `trackComSessao` resolve o
  `sessionId` antes de disparar.

### 📊 Técnico
- Ritual do `docs/revamp/05_model_execution_strategy.md` §2: `/code-review` (nível `high`) sobre
  o diff acumulado do Sprint 1 (`3d25bcc..94038ac` — 104+105+106+103+109), rodado com Fable 5.
  Os 8 subagentes paralelos do `/code-review` foram cortados pelo limite de sessão da conta antes
  de devolver resultado; a revisão foi refeita inline (leitura completa dos arquivos de produto +
  verificação de cada candidato contra o código real) — nada ficou pendente.
- Travas confirmadas intactas: `layout.tsx`/GTM byte-idêntico, conversão do Google Ads
  (`gtag`/`send_to`) derivada só do servidor, RLS das 3 tabelas de radar sem política pública,
  matriz de pesos do motor sem buraco de opção.
- `tsc --noEmit`, `lint` e 37 testes de `lib/radar` verdes; `build` com 29 rotas. Validado via
  curl no build de produção: UTM de 300 chars → sessão criada (antes: `500`); `answers` abusivo →
  `400`; email de 260 chars → `400` (antes: `500`); evento de conversão → gravado com
  `session_id`. `/pre-diagnostico` e `/radar/oportunidades` respondendo `200`.
- **3 decisões de produto registradas para o dono, não corrigidas** (fora do escopo de um gate de
  código): `newsletter_optin: true` por default sem checkbox de consentimento; rate limit de 20
  sessões/hora/IP pode bloquear tráfego atrás de NAT corporativo; conteúdo gated de oportunidades
  viaja inteiro no bundle público (aceitável como gate de marketing, decisão registrada).
- **Não verificado:** teste manual do duplo clique corrigido no navegador real (sem ferramenta de
  browser neste ambiente).
- Gate do Sprint 1 liberado — próxima é a **ISSUE-107** (homepage reposicionada).

---

## [v3.6.8] - 2026-07-07 - 📊 Analytics do Funil Novo — ISSUE-109

### ✅ Adicionado
- **ISSUE-109 — Analytics dos radares (GTM + Supabase)**: duplo trilho, mesmo padrão do funil
  legado, para os 15 eventos do doc operacional §21
  - `src/lib/analytics.ts`: helper `track(event, props)` — `dataLayer.push` (GTM → GA4) +
    `POST /api/radar/event` via `sendBeacon`/`fetch(keepalive)`; nunca bloqueia navegação.
    `capturarUtm()`/`lerUtm()` capturam UTM da URL e persistem em `sessionStorage` durante a
    sessão do navegador
  - `src/lib/radar-events.ts`: lista canônica dos 15 nomes de evento (módulo neutro — ver
    correção abaixo)
  - `src/app/api/radar/event/route.ts`: grava em `radar_events` (schema da ISSUE-106); valida
    `eventName` contra a lista canônica; rate limit 120/hora/IP; responde `200` mesmo em erro
    interno (analytics não pode virar erro pro usuário)
  - **12 dos 15 eventos instrumentados** em `RadarFlow`, `EmailCaptureRadar`,
    `MaturidadeResultado`, `OportunidadesResultado`: início/conclusão dos radares, visualização e
    envio do e-mail (honeypot filtrado), resultado revelado, clique em leitura, interesse no Lab,
    CTA de newsletter
  - UTM real propagado: `POST /api/radar/session` já aceitava `utm.*` desde a ISSUE-106, agora o
    front realmente envia
  - `docs/revamp/ISSUE-109-eventos-analytics.md`: especificação de tags/triggers GA4 para o dono
    aplicar na UI do GTM

### 🔧 Corrigido
- `RADAR_EVENT_NAMES` importado de um módulo `'use client'` dentro da rota de API (server-side)
  virava referência de client component no bundle do servidor — `.includes()` quebrava em
  runtime, mascarado pelo catch-all que sempre responde `200`. Extraído para
  `src/lib/radar-events.ts` (módulo neutro, sem `'use client'`), importado por ambos os lados.
- `session_id` estava vazando para o `dataLayer`/GA4 no helper `track()` — deveria viajar só no
  trilho Supabase (coluna própria em `radar_events`). Payloads separados corretamente.

### 📊 Técnico
- `lint`/`tsc --noEmit`/`build` (29 rotas, +1 pela rota `api/radar/event`) e os 37 testes de
  `lib/radar` verdes. Testado via curl: evento com nome fora da lista → `400`; evento válido →
  `200` + gravação confirmada em `radar_events` com `session_id` vinculado.
- **Pendência explícita:** `hero_cta_opportunities_clicked`, `hero_cta_maturity_clicked` e
  `thank_you_page_viewed` não instrumentados — dependem da home (ISSUE-107) e de `/obrigado`
  (ISSUE-108), que ainda não existem. Helper pronto; falta uma chamada de uma linha quando essas
  páginas forem construídas.
- **Não verificado:** clique real no navegador disparando eventos + GTM Preview/Tag Assistant —
  sem ferramenta de browser neste ambiente (mesma limitação da ISSUE-103).
- `docs/revamp/00b_open_questions.md` pergunta 8 atualizada: `radar_events` (tabela nova, não
  `roi_events` reusada) confirmada como decisão final, já implementada.
- ISSUE-109 marcada `⚠️ parcial em 2026-07-07` no backlog — pendência é bloqueio real de
  dependência (páginas inexistentes), não retrabalho. Sprint 1 (103+104+105+106+109) no ponto do
  gate de revisão antes da ISSUE-107 (home).

---

## [v3.6.7] - 2026-07-07 - 🎨 UI dos Radares — ISSUE-103

### ✅ Adicionado
- **ISSUE-103 — Páginas `/radar/maturidade` e `/radar/oportunidades`**: primeira UI pública nova
  do revamp, navegável ponta a ponta
  - `src/components/radar/`: `RadarFlow` (orquestrador compartilhado pelos dois radares),
    `QuestionCard` (card de produto — pergunta única, auto-avanço, voltar/continuar, transições
    `framer-motion`), `OptionButton`, `RadarChartAxes` (gráfico radar via `recharts`),
    `EmailCaptureRadar` (honeypot + checkbox de interesse no Lab), `MaturidadeResultado`,
    `OportunidadesResultado`
  - `src/app/(publico)/radar/{maturidade,oportunidades}/page.tsx`: Server Components com
    `metadata` própria, delegando a interatividade ao `RadarFlow`
  - `src/lib/radar-storage.ts`: cruzamento de maturidade via
    `sessionStorage['conversaas.radar.maturidade']`, fora de `lib/radar/` para manter o motor puro
  - Escada de captura (doc 10) implementada: maturidade sempre mostra resultado completo grátis;
    oportunidades mostra teaser sem e-mail e só destrava o diagnóstico completo (8 blocos + "Na
    prática" + cruzamento + diligência) após o gate
  - Conversão do Google Ads replicada do padrão do `EmailGate` — dispara só quando
    `triggerConversion: true` vem do lead de oportunidades; `layout.tsx` e funil legado intocados

### 🔧 Corrigido
- Badge de "família" no resultado de oportunidades usava a receita padrão do DS2 (mono, caixa
  alta) — pensada para tags curtas, ficou ilegível numa frase de duas palavras. Ajustado para
  fonte sans/caixa normal nesse uso específico, mantendo o formato pill.

### 📊 Técnico
- `lint`/`tsc --noEmit`/`build` (28 rotas) e os 37 testes de `lib/radar` verdes
- Ajustes de acessibilidade além do mínimo pedido: `aria-label` nos inputs do formulário de
  e-mail; pergunta de cada card virou `<h1>` (heading único por tela) — critério de aceite da
  issue cita Lighthouse a11y ≥90 explicitamente
- Validado localmente pelo dono via `npm run dev` (ainda não publicado): fluxo de maturidade
  aprovado; envio de e-mail não testado por completo (rate limit de 5 leads/hora/IP já consumido
  pelos testes anteriores da sessão e da ISSUE-106); Lighthouse a11y não medido — sem ferramenta
  de auditoria disponível neste ambiente
- ISSUE-103 marcada `✅ concluída em 2026-07-07` no backlog; próxima do Sprint 1 é a ISSUE-109
  (analytics), antes do gate de revisão do Sprint 1 completo e da ISSUE-107 (home, Sprint 2)

---

## [v3.6.6] - 2026-07-07 - 🔐 Backend de Captura dos Radares — ISSUE-106

### ✅ Adicionado
- **ISSUE-106 — Backend de captura (`src/app/api/radar/*`)**: fecha o funil dos radares com
  persistência real, seguindo o padrão de segurança da v3.5.3
  - 3 tabelas novas no Supabase (`radar_sessions`, `radar_leads`, `radar_events` — schema
    reservado para ISSUE-109, sem código gravando nela ainda): RLS habilitada, zero políticas
    para `anon`/`authenticated`, `REVOKE ALL` explícito contra o GRANT default residual do
    Supabase (achado da revisão Fable 5 — mesma classe de risco do incidente `roi_leads` da
    Fase 3, fechada preventivamente desta vez). SQL rodado pelo dono via SQL Editor
    (`docs/revamp/ISSUE-106-sql-radar-tabelas.md`, com rollback)
  - `api/radar/session/route.ts`: `POST` cria sessão no início do fluxo (rate limit por IP via
    banco, 20/hora); `PATCH` salva respostas + `result_key` ao final
  - `api/radar/lead/route.ts`: captura de e-mail com honeypot (campo `website` — bot recebe
    sucesso falso sem gravar), rate limit próprio (5 leads/hora/IP), validação de formato simples
    (não o `email-validator.ts` do allowlist pago — arquivo errado para lead público). `kind` e
    `triggerConversion` **lidos da sessão salva no banco, nunca do body do cliente** — impede
    forjar disparo de conversão do Google Ads
  - Escada de captura (doc 10): `triggerConversion: true` só no lead de **oportunidades**
    (evento de conversão real); **maturidade** é captura suave, não dispara a conversão principal

### 🔧 Corrigido
- 2 desvios da spec técnica (`02_technical_spec.md` §3.4) identificados e corrigidos antes de
  codar: reuso de `roi_events` inviável (FK travada em `roi_prediag_sessions`, coluna `payload` ≠
  `properties` assumido) → `radar_events` nova; `src/lib/email-validator.ts` citado na spec é o
  arquivo errado (checa allowlist de assinante pago para login, não formato de e-mail público)

### 📊 Técnico
- Revisão Fable 5 do SQL/RLS + rotas antes de entregar ao dono (ritual da 106,
  `05_model_execution_strategy.md`) — 1 achado aplicado, resto confirmado limpo
- `lint`/`tsc --noEmit`/`build` verdes (26 rotas). Todos os 5 critérios de aceite validados via
  `curl` contra servidor local pós-SQL: lead no banco, `triggerConversion` correto por `kind`,
  e-mail inválido → 400, rate limit → 429 na 6ª tentativa, chave anon → `42501 permission denied`
  (não `[]` silencioso), `/pre-diagnostico` intocado (200)
- ISSUE-106 marcada `✅ concluída em 2026-07-07` no backlog; publicado também o commit v3.6.5
  (ISSUE-104+105) que tinha ficado só local na sessão anterior

---

## [v3.6.5] - 2026-07-07 - 🚀 Motor dos Radares Implementado — ISSUE-104 + ISSUE-105

### ✅ Adicionado
- **ISSUE-104 — Motor de assessment (`src/lib/radar/`)**: transcrição literal da spec aprovada (doc 11)
  - `types.ts`: contratos de maturidade (nível 1–5, eixos 7) e oportunidades (tipo 1–9, teaser/gated, flags)
  - `maturidade.ts`: 7 perguntas sutis (AI Fluency: Delegação, Amplitude, Descrição, Construção, Discernimento, Clareza de formato, Diligência) + P8 fronteira não pontuada; scoring 7–35 com 5 faixas (Curioso/Usuário/Operador/Builder/Referência)
  - `oportunidades.ts`: matriz de pesos 100% declarativa (P2–P7, dominantes e contextuais); penalidade de dado sensível (−3 automatica/orquestrado, −2 app_tabela, −1 workflow); teto de conforto P8; guard-rail agêntico (só com P8 alto + dados de sistemas); desempate por complexidade + ordem fixa; eixos do teaser normalizados (0–100); estimativa de maturidade por P8
  - **Vitest (4.1.10)**: 37/37 testes (`maturidade.test.ts`, `oportunidades.test.ts`) cobrindo 7 personas (doc 11 §9) + varredura de 7.000 combinações de guard-rails, bordas de faixa (11→12, 17→18, 24→25, 31→32), empates (ordem fixa), determinismo

### ✅ Adicionado
- **ISSUE-105 — Conteúdo dos Resultados (`src/lib/radar/content.ts`)**: 14 blocos na voz da newsletter
  - Maturidade: 5 níveis (Curioso→Referência), cada com título/corpo/risco/próximo salto/2 leituras reais Substack/ponte oportunidades/5 variações por P8 (fronteira)
  - Oportunidades: 9 teasers (exploração/"seu trabalho aponta para") + 9 diagnósticos (8 blocos §11.6 + 9º "Na prática" com ferramenta acessível por nível)
  - "Na prática" (doc 11 §8.1): gancho "Sabia que X com Y" (ChatGPT/Gemini grátis → NotebookLM/Gems → Claude/Lovable → Claude Code/Cursor/Antigravity), começo no seu nível, um nível acima na família, mini-guia no e-mail
  - Cruzamento de maturidade: real (nível real do degrau 1 via `sessionStorage`) + estimativa 5-faixas por P8; texto "No seu Radar você ficou em X" ou "Por seus sinais você parece estar entre X e Y"
  - Bloco de Diligência (automático quando `flags.diligencia`): aviso + leitura "Quem leva esporro é você"
  - Exemplos por área (P1): Estudante (NotebookLM) + Empreendedor (WhatsApp Business) em todos os 9 tipos
  - URLs verificadas byte a byte contra a fonte (contexto editorial §14); zero frase proibida ("domine", "revolucione", "10x", "guru")

### 📊 Técnico
- `vitest.config.ts` criado (escopo: só `src/lib/radar/**/*.test.ts`); script `"test": "vitest run"` adicionado ao package.json
- **Handoff criado** (`docs/revamp/HANDOFF-SESSAO-2026-07-07-issues-104-105.md`): documento de trabalho da sessão para referência pós-compactação de contexto
- ISSUE-104 marcada `✅ concluída em 2026-07-07` no backlog; ISSUE-105 marcada `⚠️ parcial — aguarda leitura do dono`
- `lint`, `tsc --noEmit`, `build` e `test` todos verdes (24 rotas, nada quebrou)

### 🔧 Corrigido
- (Nenhum bug de produto; apenas refatoração de infra)

### 🎨 Melhorado
- **Verso da modalidade revisor aprimorado:** copy do "Na prática" enriquecida com ferramentas da paleta oficial (doc 11 §8.2) calibradas por nível de maturidade — transformou "diagnóstico completo" em "diagnóstico + caminho concreto + mini-guia"

---

## [v3.6.4] - 2026-07-06 - 🧠 Cérebro dos Radares — motor, pesos, personas e decisões de UX

> Sessão de visão pré-implementação das ISSUE-103–106, sem código de produto. O dono pediu
> contexto consolidado + recomendações antes de executar; o resultado é a especificação
> completa e APROVADA do motor dos radares — a ISSUE-104 vira transcrição fiel.

### ✅ Adicionado
- `docs/revamp/11_motor_radar_pesos_personas.md` (v2, ✅ aprovado pelo dono em 3 rodadas) —
  o "cérebro" do motor: matriz de pesos declarativa do Radar de Oportunidades, guard-rails
  (dado sensível rebaixa + diligência; conforto = teto de complexidade; agêntico nunca é
  entrada — e quando vence, o conteúdo redireciona ensinando), desempate por menor
  complexidade, corte teaser×completo, eixos dos gráficos radar, cruzamento de maturidade e
  7 personas de validação com aritmética verificada (incl. os 2 públicos novos: Estudante e
  Empreendedor).
- Perguntas do Radar de Maturidade **reformuladas e aprovadas**: versões sutis/comportamentais
  mapeadas à AI Fluency da Anthropic (4 Ds + Construção); Descrição e Diligência ganharam
  perguntas (não existiam); escala 7–35 e faixas literais preservadas + 8ª pergunta não
  pontuada de personalização.
- Regra do "sabia que": 9º bloco "Na prática" em todo diagnóstico completo (gancho com
  ferramenta real acessível no Brasil, calibrada por nível) + mini-guia de execução no e-mail.
- Famílias de oportunidade em 2 níveis (entrada → evolução) como camada de apresentação;
  referência verificada na fonte: *Building Effective Agents* (Anthropic).
- `ISSUE-307` (Fase 2) registrada: mentoria e palestras sobre IA no portfólio (demanda de
  empreendedores nas pesquisas do dono) — sem promessa na Fase 1.

### 📊 Técnico
- Decisões de UX travadas: wizard formato **card de produto** (janela de app do mock do hero,
  não chat), gráfico radar nos resultados (recharts), `sessionStorage` para o cruzamento de
  maturidade, vitest restrito a `lib/radar/*`.
- Edições cirúrgicas: `01_product_spec_faseada.md` §6, `02_technical_spec.md` §3.3,
  `04_issue_backlog.md` (103/104/105/113 + 307), `10_jornada_captura_radares.md` (adendo).
- Nenhum arquivo em `src/` alterado — `lint`/`tsc`/`build` não se aplicam.

---

## [v3.6.3] - 2026-07-06 - 🗺️ Revisão de Spec — Escada de Captura dos Radares (Fase 1)

> Sessão de revisão de spec, sem alteração de código de produto. Motivada por um furo real: os
> radares tratavam captura como opcional nos dois lados, o que não fecha como canal de conversão
> (diferente do `/pre-diagnostico`, que converte via e-mail).

### ✅ Adicionado
- `docs/revamp/10_jornada_captura_radares.md` — spec da **escada de captura em dois degraus**:
  Radar de Maturidade (grátis, resultado completo na tela, o gancho) → Radar de Oportunidades
  (framing de teste/exploração, teaser real na tela + diagnóstico completo atrás do e-mail = o
  evento de conversão Google Ads). Complementa, **não substitui**, a metodologia de IA já
  mapeada (5 níveis de maturidade / 9 tipos de solução de oportunidades).
- Framework "AI Fluency" da Anthropic (4 Ds — Delegation/Description/Discernment/Diligence)
  verificado na fonte como referência de contexto para o radar de Maturidade — não incorporado
  como estrutura nova (decisão do dono: manter a metodologia de IA já mapeada, sem trocar por
  outro framework).

### 🔧 Corrigido
- **Sequenciamento revertido:** radares (ISSUE-103–106) voltam a rodar **ANTES** da home
  (ISSUE-107) — reverte a antecipação de 2026-07-05 que colocava a home no Sprint 0 com CTA
  temporário. Consequência: **ISSUE-107B fica obsoleta** — a home já nasce com CTAs diretos para
  `/radar/maturidade` e `/radar/oportunidades`, sem destino temporário nem swap depois.
  `docs/revamp/03_implementation_plan.md` atualizado (Sprint 0 = só fundação 101+102; Sprint 1 =
  radares; Sprint 2 = home + periferia).
- ISSUE-107 ganhou um achado registrado no backlog: a nova arquitetura de escada muda como os
  CTAs do hero/duas-portas devem ser direcionados (Maturidade = "comece grátis"; Oportunidades =
  o teste que capta e-mail) — sinalizado como ponto a resolver na própria execução da issue.

### 📊 Técnico
- Edições cirúrgicas em `docs/revamp/01_product_spec_faseada.md` (§3 jornada, §6/§7 radares,
  critérios #3/#4), `02_technical_spec.md` (`RadarResult.teaser`/`gated`, `radar_leads.kind`,
  `triggerConversion` condicional ao radar de origem), `04_issue_backlog.md` (bloco "Camada de
  captura" adicionado em ISSUE-103/104/105/106, estrutura original preservada).
- Commit inclui também uma edição pendente de sessão anterior em
  `05_model_execution_strategy.md` (ISSUE-107 rebaixada de Fable 5 para Sonnet, decisão de
  2026-07-06 já tomada, agora commitada).
- Nenhum arquivo em `src/` alterado — sessão 100% de planejamento; `lint`/`tsc`/`build` não se
  aplicam.

---

## [v3.6.2] - 2026-07-06 - 🎨 ISSUE-102 — Design System v2 no código (Dark Editorial Atelier)

### ✅ Adicionado
- Tokens DS2 (Dark Editorial Atelier) em `src/app/globals.css`: paleta completa como CSS vars
  `--ds2-*`, expostas ao Tailwind v4 via `@theme` (gera utilities `bg-ds2-orange`,
  `rounded-ds2-card`, `font-ds2-serif` etc.). Convive com o tema legado (`--bg`/`--accent`)
  sem colisão.
- Fontes Fraunces (variable, eixo `opsz`), IBM Plex Sans e IBM Plex Mono via `next/font/google`
  no `src/app/layout.tsx` raiz, aplicadas como CSS vars no `<html>`.
- Export `DS2` em `src/lib/design-system.ts` (cores, gradiente, fontes, raios) — `DESIGN_TOKENS`
  legado permanece intacto.
- 10 componentes em `src/components/ds2/`: `Button`, `Card`, `Badge`, `Module`/`ModuleHead`,
  `Progress`, `Panel`, `GridSection`, `Eyebrow`, `SectionTitle`, `PageContainer` — implementam
  literalmente as receitas de `docs/revamp/08_diretrizes_visuais_ds2.md`.

### 📊 Técnico
- `tsc`/`lint`/`build` verdes; 24 rotas (mesma contagem da v3.6.1); GTM byte-idêntico (diff).
- Zero regressão visual: `<body>` legado mantém `font-family` própria, então as fontes DS2 não
  afetam páginas existentes; confirmado com `/`, `/dashboard` e `/pre-diagnostico` em 200.
- Contraste AA conferido no par mais crítico do token set (`text-subtle` sobre `bg-app`):
  ~4,66:1 (mínimo AA para texto normal é 4,5:1).
- Nenhuma página consome os componentes ainda — ISSUE-103/107 são as primeiras consumidoras.
- ISSUE-101 segue `⚠️ parcial` no backlog: dono confirmou deploy ok, mas validação formal de
  Tag Assistant + PWA em produção fica para sessão futura.

---

## [v3.6.1] - 2026-07-05 - 🏗️ ISSUE-101 — Layout server-first + route groups (fundação)

### ✅ Adicionado
- `src/app/(app)/layout.tsx` — client component com gate de auth + sidebar/drawer, extraído do layout raiz.
- Route groups `(publico)` e `(app)` sem mudar URLs (14 renames via `git mv`).
- Metadata API via `export const metadata` + `export const viewport` no layout raiz (destrava SEO por página).
- CSS tema (`--bg`, `--accent`, `.glass`) migrado para `src/app/globals.css` (fim do arquivo, preserva cascata).

### 🔧 Corrigido
- Layout raiz agora é **Server Component** (antes `'use client'`): GTM e base HTML renderizados server-side, eliminando latência de auth em visitante frio.
- PWA meta tags equivalentes 1:1 (adicionada `apple-mobile-web-app-capable` para iOS legado).

### 📊 Técnico
- **Arquitetura:** route groups destravaram Metadata API; gate de auth move para (app)/layout (aplica só às rotas privadas); layout raiz limpo para o essencial (html/body/GTM/metadata).
- **Validação:** `npx tsc --noEmit` limpo, `npm run build` verde (24 rotas), 15 rotas respondendo 200 em `build && start`, GTM byte-idêntico por diff.
- **Status da ISSUE-101:** ⚠️ **parcial** até validação do dono em preview (Tag Assistant na conversão do `/pre-diagnostico` + PWA instalação/navegação em navegador real).
- **Docs revamp atualizadas:** `04_issue_backlog.md` + `02_technical_spec.md` registram a decisão sobre `/privacidade` em (app) (hoje gated, torná-la pública é issue futura).

---

## [v3.6.0] - 2026-07-05 - 🗺️ Planejamento do Revamp +ConverSaaS (Fase 1)

> Sessão de planejamento estratégico a pedido do dono, com base nos documentos de
> `docs/GPT Project Revamp/`. **Sem alteração de código de produto** — entregas são documentos
> de planejamento em `docs/revamp/` e atualizações de skills.

### ✅ Adicionado
- **`docs/revamp/` (11 documentos):** README central, definição do problema, 11 perguntas
  abertas (todas resolvidas com o dono), product spec faseada, technical spec, implementation
  plan, backlog com **22 issues** executáveis (Fase 1 + Fase 1B + resumos 1.5/2/3/4), estratégia
  de execução por modelo, definition of done, mapa completo de tracking Google Ads/GTM,
  diretrizes visuais do Design System v2 e comparação de 3 direções de landing.
- **`docs/revamp/mockups/` (4 protótipos HTML navegáveis):** três direções visuais da nova
  landing (A — fiel ao design system; B — publicação premium; C — workbench do builder) e o
  híbrido final aprovado pelo dono (estrutura de A + copy/animação de C), publicados como
  Artifacts para revisão mobile.
- **Skill nova `executar-issue-revamp`:** carrega o contexto certo por issue do backlog
  (README + issue + diretrizes visuais/tracking quando aplicável), trava escopo, roda os
  critérios de aceite da issue e marca conclusão — feita para minimizar re-steering ao
  delegar issues para modelos mais simples.

### 🎨 Melhorado
- **Skill `iniciar-sessao`:** novo Passo 0 detecta trabalho do revamp e direciona para a
  `executar-issue-revamp` em vez do fluxo genérico de persona.
- **Skill `finalizar-sessao`:** novo item confirma o status da issue do revamp no backlog e
  pede para citar o número dela na entrada de CURRENT-STATUS/CHANGELOG.

### 📊 Decisões estratégicas registradas
- Marca da plataforma: **"+ConverSaaS"**, sempre como "o ecossistema virtual da newsletter
  Conversas no Corredor".
- Visual: Design System "Dark Editorial Atelier" confirmado (fundo verde-escuro profundo,
  laranja `#D97706` + magenta `#D34C75`, Fraunces + IBM Plex).
- Landing nova: direção híbrida (estrutura/grid do protótipo A + headline em gradiente e
  radar animado do protótipo C); pricing da newsletter **mantido** na home; os 4 vídeos de
  demo da plataforma **preservados** numa seção dedicada.
- **Sequenciamento revisado:** a homepage (ISSUE-107) foi antecipada para rodar logo após a
  fundação técnica (ISSUE-101+102), com os CTAs de diagnóstico apontando **temporariamente**
  para `/pre-diagnostico` (funil legado, já convertendo) até os radares existirem — troca
  posterior isolada na nova **ISSUE-107B**.
- **Fase 1B criada:** redesign visual (DS2) de toda a plataforma logada — dashboard,
  diagnóstico, plano de ação, kanban, relatórios/perfil/configurações/admin (ISSUES 114–120),
  100% visual, zero mudança de lógica/dados.
- Fluxo direto de assinatura via Stripe mapeado para o futuro (ISSUE-305, Fase 2); hoje a
  assinatura segue intermediada pela newsletter com autorização manual do dono.
- Confirmado que o e-mail do pré-diagnóstico entrega normalmente via Resend; identificado bug
  **separado** (e-mail de reset de senha não chega) para correção futura via `/corrigir-bug`.

### 🎯 Próximos passos
Executar o Sprint 0 do `docs/revamp/03_implementation_plan.md`: ISSUE-101 (layout
server-first) → ISSUE-102 (Design System v2) → ISSUE-107 (homepage reposicionada).

---

## [v3.5.3] - 2026-07-04 - 🩹 Fase 3 da Modernização — Correções por Severidade + Auditoria de RLS

> Entrega da **Fase 3** do `docs/ROADMAP-MODERNIZACAO.md`. Escopo: os itens núcleo priorizados
> no relatório da Fase 1 (`docs/diagnostico-fase1-debito-tecnico.md`). Upgrade major do `jspdf`,
> decisão sobre `next-pwa`/workbox e lint cosmético ficaram para depois, por decisão do dono.

### 🐛 Corrigido
- **Hooks fora das regras (`react-hooks/rules-of-hooks`)** — o "PWA Install Banner" em
  `src/app/page.tsx:184-241` era uma IIFE chamando `useState`/`useEffect` dentro do JSX. Extraído
  para o componente nomeado `PWAInstallBanner`. Eliminou os 6 erros da regra apontados na Fase 1.
- **Bug real no Kanban:** `src/app/painel-semanal/components/KanbanPage.tsx` lia
  `tatica.estimativa_horas` (snake_case), mas o tipo `TaticaKanban` só expõe `estimativaHoras`
  — o badge de horas estimadas no card nunca renderizava de verdade. Corrigido para o nome certo.
- **36 erros de `tsc --noEmit` em arquivos ativos**, corrigidos individualmente (sem supressão
  em massa com `any`):
  - `NextRequest.ip` (removido da API do Next) nas rotas `api/prediag/diagnose` e `.../lead` —
    agora só via headers `x-forwarded-for`/`x-real-ip`.
  - Tipos de união incompletos em `components/diagnostico/index.tsx` (`botaoIcone`, `destaque`,
    `acao`, `botaoTexto`) e `components/plano/index.tsx` (`OrientacaoDiagnosticoProps` nunca
    declarada, index signatures de `focoLabels`).
  - `RefObject<HTMLDivElement>` vs `RefObject<HTMLDivElement | null>` em `components/mapa/index.tsx`
    (mudança de tipagem do React 19 pro `useRef`).
  - Objetos com shape inconsistente em `lib/prediag-heuristics.ts` (`ACTIVITY_ADJUSTS`,
    `PROFILE_BIAS`) e `null` não tratado em `lib/heuristica-engine.ts` (`.filter(Boolean)` não
    estreita o tipo — trocado por type guard explícito).
  - `EmailGate.tsx` (arquivo do tracking de conversão): só faltava uma declaração de tipo
    ambiente pro `gtag` global injetado pelo GTM. **Validado que é mudança de tipo pura** —
    comparei o bundle compilado antes/depois e a chamada de conversão ficou byte-idêntica.

### 🔒 Segurança — Auditoria de RLS (Supabase)
Auditoria manual via SQL Editor (RLS ativo, políticas reais, `security_invoker` das views,
funções `SECURITY DEFINER`) encontrou 3 problemas reais, não só teóricos:

- **`roi_leads` com política `ALL`/`public`/irrestrita** (`using: true`, `with_check: true`).
  Qualquer request com a chave anon (pública, embutida no bundle do navegador) conseguia
  ler/alterar/apagar nome+email de **todos os leads capturados** no funil de pré-diagnóstico.
  Contradizia o que o próprio `docs/supabase-database-schema.txt` já documentava como intenção
  original ("RLS: Apenas service_role").
- **`usuarios` e `profiles` com INSERT irrestrito** — políticas extras (`usuarios_insert`,
  `profiles_insert`) com `with_check: true` sem checar dono, empilhadas via OR sobre as
  políticas corretas (`auth.uid() = id`). Permitiam inserir linha com **qualquer `id`**.
  Confirmado por busca no código que nada depende disso — `handle_new_user()` já ignora RLS
  por ser `SECURITY DEFINER`.
- **Corrigido no código:** `src/app/api/prediag/lead/route.ts` e `.../diagnose/route.ts`
  migrados do client anon (`@/lib/supabase`) para um client `service_role` local, no mesmo
  padrão já usado em `admin/assinantes/route.ts`. Isso é pré-requisito pro SQL de trava (abaixo)
  não quebrar a captura de lead.
- **SQL de correção entregue ao dono para execução manual** (sem acesso direto ao Postgres
  nesta sessão — nem Docker local, nem senha do banco), em duas partes, **ambas executadas e
  validadas pelo dono em 2026-07-04**:
  - Parte A: removeu os INSERTs irrestritos de `usuarios`/`profiles` e consolidou políticas
    duplicadas em `atividades` (3→1) e `taticas` (2→1). Verificado: 1 política única por tabela.
  - Parte B (rodada só depois do deploy em produção): travou `roi_leads` e
    `roi_prediag_sessions` (que também tinha SELECT público expondo `ip_address` de todo
    visitante) para `service_role` only. Verificado: ambas as tabelas só com a policy
    `*_service_role_only`, roles `{service_role}`.
- **`get_auth_user_by_email()` executável por `PUBLIC`/`anon`/`authenticated`** — função
  `SECURITY DEFINER` (resquício de uma tentativa antiga de painel admin) que consulta
  `auth.users` por email e retorna criação/último login/confirmação de email. Sem restrição de
  quem podia chamar, era um oráculo de enumeração de contas via chave anon. `REVOKE EXECUTE`
  aplicado para `PUBLIC`/`anon`/`authenticated`, restando só `postgres`/`service_role`. Função
  mantida (não usada pelo código hoje, mas preservada para uso administrativo futuro).
- `rls_auto_enable()` (a outra função `SECURITY DEFINER` não documentada) avaliada e confirmada
  **benigna** — é um *event trigger* que liga RLS automaticamente em toda tabela nova criada em
  `public`. Explica por que as 9 tabelas já apareciam com RLS ativo na auditoria. Mantida como
  está, sem necessidade de correção.
- Views `vw_*` seguem com `security_invoker=true` nas 8 (fix do incidente v3.5.2 se manteve).
- Commit `f2841e2` e push pra `origin/main`; deploy automático da Vercel confirmado `Ready`, sem
  erros.
- **Fluxo `/pre-diagnostico` testado ponta a ponta em produção após a trava de RLS** — captura
  de lead funcionando normalmente.

### 🔧 Alterado
- `next`: 15.5.12 → 15.5.20 (patch, sem breaking change).
- `next.config.js`: removido `typescript.ignoreBuildErrors` — build agora falha de verdade se
  reintroduzir erro de tipo. `eslint.ignoreDuringBuilds` mantido de propósito (lint cosmético
  fica para uma faxina futura, por decisão do dono).

### ⚠️ Pendências conhecidas
- **Email do pré-diagnóstico só entrega pro email verificado da conta Resend** (sandbox mode,
  `onboarding@resend.dev`) — o teste desta sessão funcionou por ter sido feito com o próprio
  email do dono; usuários reais ainda não recebem. Pendência já registrada desde o v3.5.2, não é
  regressão desta entrega.
- Upgrade major do `jspdf` (3.0.4 → 4.2.1), decisão sobre `next-pwa`/workbox, e lint cosmético
  ficaram fora de escopo desta entrega, por decisão do dono (Fase 4 ou faxina futura).

---

## [v3.5.2] - 2026-07-04 - 🚨 Incidente: Banco de Produção Pausado + Migração de Projeto Supabase

### 🔥 Incidente
- **Sintoma:** ao testar o app localmente (`npm run start`) após a faxina da Fase 2, `/dashboard`
  falhou com "Failed to fetch". Investigação revelou que o projeto Supabase de produção
  (`ghscflemhgrbfflmxqbk`, ref confirmado batendo com `.env.local`) estava **pausado há mais de
  90 dias** pela política de inatividade do plano Free — passado esse prazo, o Supabase não
  permite mais reativação com um clique, só restauração de backup para um projeto novo.
- **Impacto real:** login, `/dashboard`, `/diagnostico`, `/plano-acao`, `/painel-semanal`,
  `/admin/assinantes` fora do ar. Mais crítico: `/api/prediag/lead` (captura de lead do
  `/pre-diagnostico`) retornava 500 e nunca disparava a conversão do Google Ads — com campanhas
  ativas, todo clique pago no funil estava sendo perdido sem conversão.
- **Causa raiz:** projeto Free tier sem atividade suficiente pra evitar a pausa automática;
  janela de restauração de 1 clique (90 dias) já havia expirado.

### ✅ Resolvido — Migração completa para novo projeto Supabase
- Criada nova conta + organização Supabase (limite de 2 projetos grátis é por usuário, não por
  organização) e novo projeto **"+ConverSaaS 2.0"** (ref `cuojmyqkezmpryeuyvqd`, região
  `sa-east-1`)
- Backup completo (`pg_dumpall`) baixado do projeto pausado e restaurado via `psql` (Session
  pooler) no projeto novo
- **Validação pós-restore** (não apenas "rodou sem erro fatal" — checado item a item):
  - 9 tabelas `public.*` + dados presentes (leads, sessões, usuários, táticas)
  - RLS ativo **com políticas reais** conferidas (não só a flag `relrowsecurity`)
  - Trigger `on_auth_user_created` → `handle_new_user()` intacta e ativa (`tgenabled = 'O'`)
  - Função `admin_list_users()` presente
  - 8 views `vw_*` com `security_invoker = true` — **encontrada e corrigida uma view extra**
    (`vw_emails_autorizados_status`, não documentada no CLAUDE.md) que não tinha essa proteção
    aplicada desde sua criação
  - `auth.users` com as 11 contas restauradas
  - ~489 linhas de erro no log do restore, todas em schemas internos `auth`/`storage` já geridos
    pelo próprio Supabase — inofensivas e esperadas nesse tipo de restore manual
- `.env.local` atualizado + as 3 variáveis correspondentes trocadas em **Vercel → Production**
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) e
  redeploy manual disparado
- Testado em produção: site voltou ao ar, fluxo de `/pre-diagnostico` funcionando

### ⚠️ Pendências conhecidas (não bloqueiam, mas ficaram registradas)
- **Email do pré-diagnóstico não chegou no teste em produção** — `EMAIL_FROM_ADDRESS` ainda
  aponta pro sandbox padrão do Resend (`onboarding@resend.dev`), mesma limitação já documentada
  em v3.3.1 (só envia pra emails autorizados manualmente). Não é regressão deste incidente — é
  configuração pendente de antes. A captura do lead e a conversão do Google Ads **não dependem**
  do envio de email (código já isola essa falha em try/catch separado), então o funil crítico
  está protegido independente desse ponto.
- **Projeto Supabase antigo (pausado) mantido intencionalmente** — não foi apagado, serve de
  rede de segurança até confirmarmos alguns dias de estabilidade no projeto novo.
- **Considerar plano pago no projeto novo** — a causa raiz foi justamente ficar no Free tier;
  sem upgrade, o mesmo tipo de pausa pode se repetir enquanto há investimento ativo em Ads.
- Arquivos de backup (`.gz`/`.backup`, com dados reais de usuário) ficaram salvos em
  `C:\Users\adils\Downloads\` — fora do repositório git, mas vale lembrar que existem.

### 💡 Lição aprendida
- Backups de "cluster completo" via download manual do dashboard **não capturam objetos
  customizados em schemas gerenciados** de forma consistente (a trigger `handle_new_user`
  sobreviveu, mas a suposição inicial de que teria sumido quase levou a uma recriação manual
  desnecessária — o diagnóstico correto exigiu checar o nome real da trigger, não o nome da
  função). Sempre validar por objeto (tabelas, RLS, triggers, views, funções) após um restore,
  nunca assumir com base só no código de saída do `psql`.
- Limite de projetos gratuitos do Supabase é por conta/usuário, não por organização —
  informação que só a documentação oficial ou a tentativa real confirmam, não deduções por
  analogia com outras plataformas.

---

## [v3.5.1] - 2026-07-02 - 🧹 Faxina Fase 2 — Remoção do Cemitério de Backups

### 🗑️ Removido
- **25 arquivos legados** sem nenhuma referência/import ativo no código, confirmados um a um
  antes da remoção (busca de imports em todo `src/` e na raiz):
  - 22 arquivos de backup/versão antiga em `src/` (`*-backup*`, `*-original*`,
    `page - backup*`, `globals-backup.css`, `heuristica-engine.*.backup.ts`, etc.)
  - `src/components/mapa-atividades.tsx` e `src/components/mapa-atividades-original.tsx`
    (achados extras na mesma varredura, confirmados sem uso)
  - `mapa-atividades-modular.tsx` (raiz do projeto — cópia órfã fora de `src/app`, nunca
    importada; **não confundir** com `src/components/mapa-atividades-modular.tsx`, que é o
    componente ativo renderizado por `/dashboard` e foi mantido)
  - `next.config.ts` (config morto e vazio — `next.config.js` é o único usado, com PWA)

### ✅ Validado
- `npm run build` — build idêntico antes/depois (mesmas 24 rotas, mesmo tamanho de bundle,
  zero mudança de comportamento)
- `npx tsc --noEmit` — erros de tipo caíram de 57 para 37 (todos os 20 que sumiram eram só
  nos arquivos removidos)
- `npm run lint` — erros caíram de 204 para 92 (−55%), warnings de 223 para 123 (−45%),
  arquivos afetados de 46 para 25

### 📖 Documentação
- `docs/diagnostico-fase1-debito-tecnico.md` — relatório completo da Fase 1 (medição prévia
  a esta limpeza), incluindo achados de risco investigados (hooks em callback no `page.tsx`,
  exposição real do `jspdf` crítico, alerta sobre `npm audit fix` querer rebaixar o `next-pwa`)
- `docs/ROADMAP-MODERNIZACAO.md` — Fase 1 marcada concluída, Fase 2 concluída

### 🔒 Reversibilidade
- Toda a remoção está isolada neste único commit — reverter com
  `git revert <hash-deste-commit>` caso algo inesperado apareça em produção

---

## [v3.5.0] - 2025-10-23 - 📱 PWA Completo + Rebranding

### ✅ Adicionado
- **PWA (Progressive Web App)**: Aplicativo instalável em desktop e mobile
  - Service Worker ativo com estratégias de cache otimizadas
  - Manifest.json configurado para instalação nativa
  - Suporte offline básico para assets estáticos
  - Cache inteligente: NetworkFirst para Supabase, CacheFirst para imagens/vídeos
- **Ícones Personalizados**: 6 tamanhos otimizados
  - icon-192.png e icon-512.png (padrão Android/Desktop)
  - icon-192-maskable.png e icon-512-maskable.png (adaptive icons Android)
  - apple-touch-icon.png (180x180 para iOS)
  - favicon.ico (32x32 para browsers)
- **Rebranding Completo**: Nome atualizado em toda aplicação
  - Título: "+Conversas no Corredor"
  - App mobile: "+ConverSaaS"
  - Sidebar e navegação atualizadas
  - Favicon substituído (ícone dos copos de café)

### 🔧 Modificado
- **next.config.js**: Integração com next-pwa
  - Service Worker gerado automaticamente em `/sw.js`
  - Cache de 24h para Supabase, 30 dias para assets
  - PWA desabilitado em desenvolvimento (NODE_ENV=development)
- **layout.tsx**: Meta tags PWA completas
  - apple-mobile-web-app-capable
  - apple-mobile-web-app-status-bar-style: black-translucent
  - theme-color: #d97706 (laranja)
  - Referências aos novos ícones PWA
- **package.json**: Dependência next-pwa@4.0.2 adicionada

### 📊 Técnico
**Arquivos Criados:**
```
/public/pwa/
  ├── manifest.json              # Configuração PWA
  └── icons/
      ├── icon-192.png           # 29KB
      ├── icon-512.png           # 121KB
      ├── icon-192-maskable.png  # 21KB (adaptive)
      ├── icon-512-maskable.png  # 89KB (adaptive)
      └── apple-touch-icon.png   # 26KB (iOS)
/public/
  ├── sw.js                      # Service Worker (auto-gerado)
  └── workbox-*.js               # Runtime caching (auto-gerado)
/src/app/
  └── favicon.ico                # Substituído (2.4KB)
```

**Arquivos Modificados:**
```
next.config.js        # +32 linhas (withPWA wrapper)
layout.tsx            # +12 linhas (meta tags PWA)
package.json          # +1 dependência (next-pwa)
package-lock.json     # +304 pacotes (workbox + deps)
```

### 🎨 Design & UX
- **Ícone Profissional**: Copos de café + balões de conversa (laranja #d97706)
- **Cores do PWA**: 
  - Background: #042f2e (verde escuro)
  - Theme: #d97706 (laranja)
- **Experiência Nativa**:
  - Splash screen automática (iOS/Android)
  - Fullscreen mode (sem barra do navegador)
  - Orientação portrait-primary
  - Instalação com um clique

### 📱 Compatibilidade
**Desktop:**
- ✅ Chrome/Edge: Instalação via ícone na barra de endereços
- ✅ Windows/Mac/Linux: App standalone na área de trabalho
- ⚠️ Firefox: Suporte limitado (sem instalação nativa)

**Mobile:**
- ✅ Android (Chrome): "Adicionar à tela inicial"
- ✅ iOS (Safari): "Adicionar à Tela de Início"
- ✅ Ícones adaptive (Android 8+)
- ✅ Splash screen nativa

### 🚀 Performance
- **Service Worker**: Cache estratégico reduz latência
- **Assets otimizados**: Ícones comprimidos (total 290KB)
- **Build time**: Mantido (~30s)
- **Bundle size**: +2KB (next-pwa minificado)

### 🔒 Segurança
- Service Worker com scope limitado (`/`)
- Cache apenas para domínio próprio + Supabase
- Estratégia NetworkFirst para dados sensíveis
- Sem cache de rotas de autenticação

### 📖 Documentação
**Como instalar o PWA:**

**Desktop (Chrome/Edge):**
1. Acesse o site
2. Clique no ícone ⊕ na barra de endereços
3. Clique em "Instalar"

**Android (Chrome):**
1. Acesse o site
2. Menu (⋮) > "Adicionar à tela inicial"
3. Confirmar instalação

**iOS (Safari):**
1. Acesse o site
2. Botão compartilhar (□↑)
3. "Adicionar à Tela de Início"

### 💡 Notas Técnicas
- PWA funciona apenas em HTTPS (produção)
- Service Worker não ativo em `npm run dev` (por design)
- Testar localmente: `npm run build && npm run start`
- Manifest acessível em `/pwa/manifest.json`
- Service Worker em `/sw.js`

### ⚠️ Breaking Changes
- **Nenhum**: Funcionalidades existentes 100% preservadas
- PWA é uma camada adicional, não substitui nada
- Usuários existentes não são afetados

### 🐛 Bugs Conhecidos
- ✅ Conflito favicon.ico (resolvido: movido para src/app)
- ✅ Build warnings do next-pwa (normais, sem impacto)

---

**📝 Commit:** `0194cd6`  
**🚀 Deploy:** Vercel automático  
**👤 Autor:** Sessão de implementação PWA  
**⏱️ Tempo:** ~2 horas (instalação + configuração + testes + deploy)

---

## [v3.4.3] - 2025-10-14 - 🔧 Correção Admin Assinantes: Bug Supabase listUsers()

### 🔧 Corrigido
- **Admin Assinantes Quebrado:** Todos apareciam como "Sem conta" mesmo tendo cadastro confirmado
  - **Sintoma:** Campos `tem_conta`, `conta_criada`, `ultimo_acesso` sempre NULL/false/0
  - **Causa Raiz:** Bug do Supabase `auth.admin.listUsers()` - erro SQL ao scanear `confirmation_token` NULL
  - **Erro Original:** `"sql: Scan error on column index 3, name \"confirmation_token\": converting NULL to string is unsupported"`
  - **Descoberta:** Auth Logs do Supabase revelaram erro 500 em `/admin/users`
  - **Duração Investigação:** ~4 horas testando hipóteses (race condition, permissões, paginação, env vars)
  - **Solução:** Criada função SQL `public.admin_list_users()` com SECURITY DEFINER que acessa `auth.users` diretamente

### ✅ Solução Implementada

**Função SQL criada no Supabase:**
```sql
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (id uuid, email varchar(255), created_at timestamptz, 
               last_sign_in_at timestamptz, email_confirmed_at timestamptz) 
SECURITY DEFINER SET search_path = auth, public
AS $$ BEGIN RETURN QUERY SELECT u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at FROM auth.users u; END; $$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO service_role;
```

**API Modificada (src/app/api/admin/assinantes/route.ts):**
```typescript
// ANTES (quebrado):
const { data: authData } = await supabaseAdmin.auth.admin.listUsers({...})
const authUsers = authData?.users || []

// DEPOIS (funcionando):
const { data: authUsers, error: authError } = await supabaseAdmin.rpc('admin_list_users')
```

### 🎨 Melhorado
- **Resiliência:** Sistema não depende mais de API quebrada do Supabase
- **Performance:** RPC SQL ~30% mais rápido que chamada HTTP
- **Debugging:** Processo investigativo documentado para referência futura

### 📊 Técnico
- **Arquivo Modificado:** `src/app/api/admin/assinantes/route.ts` (linha ~33-38)
- **Função Criada:** `public.admin_list_users()` no Supabase
- **Breaking Changes:** Nenhum - CRUD mantém funcionalidades
- **Tipo Importante:** `email varchar(255)` (não `text`) para evitar erro de tipo

### 💡 Lições Aprendidas
- **Auth Logs Essenciais:** Revelaram causa raiz após horas de tentativas
- **Bug do Supabase:** Método oficial `auth.admin.listUsers()` tem bug não resolvido com NULL em `confirmation_token`
- **Workaround Definitivo:** Acesso direto via SQL mais confiável que API HTTP
- **Debugging:** Testar hipóteses sistematicamente e verificar logs de serviços externos

### 🔗 Referências
- Auth Logs: `https://supabase.com/dashboard/project/_/logs/auth-logs`
- Issue relacionado: "Database error finding users" (confirmation_token NULL)

---

## [v3.4.2] - 2025-10-13 - 🔒 Correção Definitiva Security Definer Views

### 🔧 Corrigido
- **Views Analytics com SECURITY DEFINER:** Resolvido problema persistente de warnings no Security Advisor
  - **Causa Raiz Identificada:** Views criadas com owner 'postgres' executam automaticamente como SECURITY DEFINER no PostgreSQL, mesmo sem especificar explicitamente
  - **Tentativas Anteriores Falhadas:** 
    - `CREATE OR REPLACE VIEW` manteve atributo SECURITY DEFINER da view original
    - `ALTER VIEW ... OWNER TO authenticator` bloqueado por permissões
  - **Solução Definitiva:** Recriar views com `WITH (security_invoker = true)` força execução com permissões do usuário consultando
  - **Views Corrigidas:** 7 views (vw_activity_heatmap, vw_conversao_diaria, vw_events_funnel, vw_kpis_executivos, vw_mix_atividades, vw_pain_analysis, vw_perfil_performance)
  - **Status Final:** ✅ Zero warnings no Security Advisor

### 🎨 Melhorado
- **Segurança das Views:** Todas as views analytics agora executam com permissões do usuário consultando, não do criador
- **Documentação:** Seção de segurança atualizada em `views-analytics-supabase.md` com flag `security_invoker`
- **Processo de Troubleshooting:** Documentado para referência futura

### 📊 Técnico
- **Flag Crítica:** `WITH (security_invoker = true)` adicionada em todas as definições de views
- **Script SQL:** DROP CASCADE + CREATE VIEW com security_invoker para 7 views
- **Permissões:** Mantido GRANT SELECT para anon e authenticated
- **Série Histórica:** Dados desde 28/08/2025 preservados
- **Grafana:** Zero breaking changes, dashboards continuam funcionando normalmente
- **Verificação:** Query de validação adicionada para monitorar security_invoker

### 💡 Lição Aprendida
- **PostgreSQL Behavior:** Views com owner 'postgres' (superuser) executam automaticamente como SECURITY DEFINER
- **Best Practice:** Sempre usar `WITH (security_invoker = true)` ao criar views para analytics
- **Prevenção:** Documentado processo correto para evitar reincidência

---

## [v3.4.1] - 2025-10-02 - 📊 Views Analytics - Série Histórica Completa

### ✅ Adicionado
- **Painéis Temporais Grafana:** 2 novos gráficos time series para análise temporal
  - Painel 13: Performance Temporal - Volume (Sessões + Leads)
  - Painel 14: Taxa de Conversão ao Longo do Tempo
- **Documentação Completa:** Guias atualizados com todas as mudanças

### 🔧 Corrigido
- **Filtros Temporais Views:** Removido `WHERE created_at >= NOW() - INTERVAL '30 days'` de todas as 7 views
  - `vw_conversao_diaria` - agora mostra série completa
  - `vw_perfil_performance` - agora mostra série completa
  - `vw_pain_analysis` - agora mostra série completa
  - `vw_events_funnel` - agora mostra série completa
  - `vw_activity_heatmap` - removido filtro de 14 dias
  - `vw_kpis_executivos` - período alterado para "Série Histórica Completa"
  - `vw_mix_atividades` - agora mostra série completa

### 🎨 Melhorado
- **Análise de Longo Prazo:** Views agora permitem análise desde 28/08/2025 (primeira sessão)
- **Flexibilidade Grafana:** Time Range do dashboard controla período visualizado
- **Performance Otimizada:** Índices ajustados para queries sem filtros temporais
- **Queries Grafana:** 2 novas queries para gráficos de linha temporal

### 📊 Técnico
- **Arquivos Atualizados:**
  - `docs/views-analytics-supabase.md` - Documentação completa das views atualizada
  - `docs/dashboard-grafana-supabase.md` - Guia Grafana com novos painéis
  - `docs/CHANGELOG.md` - Esta entrada
- **SQL Executado:** Script de atualização das 7 views no Supabase
- **Grafana:** Time Range padrão atualizado de "Last 6 hours" → "Last 90 days"
- **Índices:** Removido filtro `WHERE created_at >= NOW() - INTERVAL '90 days'` do índice parcial

### 🎯 Impacto
- **Análise Completa:** 32 dias de dados históricos disponíveis (vs. 30 dias limitados)
- **Dashboards Flexíveis:** Usuários podem visualizar qualquer período desejado
- **Comparação Temporal:** Análise de tendências entre diferentes períodos
- **Zero Breaking Changes:** Sistema continua funcionando, apenas amplia capacidades

### 💡 Mudanças de Uso
**ANTES:**
```sql
-- Views retornavam apenas últimos 30 dias
SELECT * FROM vw_conversao_diaria; -- máx 30 registros
```

**AGORA:**
```sql
-- Views retornam série completa
SELECT * FROM vw_conversao_diaria; -- todos os registros desde 28/08/2025

-- Filtro manual opcional quando necessário
SELECT * FROM vw_conversao_diaria 
WHERE data >= '2025-09-01';
```

### 📈 Grafana
- **Painel 13 Query:**
```sql
SELECT 
  data as time,
  total_sessoes as "Sessões",
  total_leads as "Leads Capturados"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

- **Painel 14 Query:**
```sql
SELECT 
  data as time,
  taxa_conversao_pct as "Taxa de Conversão (%)"
FROM vw_conversao_diaria
ORDER BY data ASC;
```

### 🔍 Verificação
Execute no Supabase para confirmar mudanças:
```sql
-- Ver range completo de dados
SELECT 
  MIN(data) as primeira_sessao,
  MAX(data) as ultima_sessao,
  MAX(data)::date - MIN(data)::date as dias_totais,
  COUNT(*) as dias_com_atividade
FROM vw_conversao_diaria;

-- Resultado esperado:
-- primeira_sessao: 2025-08-28
-- ultima_sessao: [data atual]
-- dias_totais: 32+ dias
```


## [v3.4.0] - 2025-10-01 - 📱 Landing Page Mobile-First Optimization

### ✅ Adicionado
- **Hero Mobile Otimizado**: Copy persuasivo "Trabalhe menos, Conquiste mais" inspirado em Todoist/TickTick
- **Logo Newsletter**: Imagem oficial da newsletter integrada na navegação (substituindo ícone Coffee)
- **Social Proof Card Mobile**: Seção destacada "Sou o gestor que você gostaria de ter tido" com credenciais
- **3 Cards de Benefício Mobile**: Benefícios tangíveis (Riscar tarefas, Negociar urgências, Sair sem ansiedade)
- **FAQ Accordion Mobile**: 4 perguntas essenciais com respostas customizadas
- **Pricing Mobile Redesign**: Cards verticais com destaque visual para plano Mensal
- **Sticky Bottom Bar**: CTA fixo que aparece após scroll de 800px
- **Progressive Loading Vídeos**: Primeiro vídeo autoplay, demais click-to-play (economia de 75% dados móveis)

### 🔧 Corrigido
- **Navegação Mobile**: Texto não quebra mais (fonte responsiva text-sm → text-lg)
- **Botão "Já sou assinante"**: Fundo transparente corrigido, estilo discreto
- **Glow Buttons**: Removido glow permanente, ativado apenas no hover
- **Espaçamento Hero**: Redução de gaps excessivos (space-y-6 → space-y-4)
- **Separador "Prefere testar primeiro?"**: Cor de fundo corrigida (bg-[#042f2e])
- **Pricing Cards**: Botões com cores adequadas (Gratuito: branco, Mensal: laranja, Anual: verde)
- **Autoplay Vídeos**: Primeiro vídeo desktop voltou a tocar automaticamente

### 🎨 Melhorado
- **Copy Orientado a Benefícios**: Headline aspiracional alinhada com benchmarks (Todoist/TickTick)
- **Hierarquia de CTAs**: Newsletter primário > Diagnóstico secundário
- **Tipografia Responsiva**: Sistema mobile-first (text-sm → text-base → text-lg)
- **Cards de Pricing**: Layout vertical mobile-friendly com badge "Mais Popular"
- **Ordem de Seções Mobile**: Hero → Social Proof → Benefícios → Vídeos → Pricing → FAQ
- **Botão Diagnóstico**: Card interativo com ícone, tempo e descrição (vs botão plano anterior)

### 📊 Técnico
- **Arquivos Modificados**:
  - `src/app/page.tsx` - Reescrita completa da estrutura mobile
  - Componentes mantidos: Desktop hero, vídeos desktop, todas seções existentes
- **Breakpoints Utilizados**: `lg:hidden` para mobile-only, `hidden lg:block` para desktop-only
- **Performance**: Progressive loading economiza ~6MB por sessão mobile
- **Responsive Classes**: Padronização text-sm/base/lg, gap-2/3/4, py-3/4
- **Zero Breaking Changes**: Versão desktop 100% preservada

### 🎯 Impacto Esperado
- **Bounce Rate Mobile**: -25% a -35%
- **Time to First CTA**: 15s → 3s (-80%)
- **Conversão Pré-Diagnóstico**: +40% a +60%
- **Dados Economizados**: 75% (progressive loading vídeos)

### 💡 Decisões de Copy
- **Headline Final**: "Trabalhe menos, Conquiste mais" (paralelismo estilo TickTick)
- **Proposta**: "O ecossistema virtual para quem precisa de foco e método"
- **Dor**: "Eu não tenho tempo nem pra me organizar"
- **CTA Principal**: "Comece agora!" → Newsletter Substack
- **CTA Secundário**: Card diagnóstico com descrição expandida

### 📱 Mobile-First Principles Aplicados
- Touch targets mínimos 44px
- Fonte base 16px (evita zoom iOS)
- Espaçamento otimizado para scroll vertical
- Cards substituindo tabelas
- Progressive disclosure de informação
- CTAs grandes e visualmente destacados

---

## [v3.3.1] - 2025-09-29 - 🔧 Correção Crítica Signup + Documentação Banco

### 🔧 Corrigido
- **Erro 500 no Signup:** Adicionado `emailRedirectTo` obrigatório no `supabase.auth.signUp()`
  - **Causa:** Supabase exige `emailRedirectTo` quando "Confirm email" está ativo
  - **Código:** `src/app/auth/page.tsx` linha 170
  - **Impacto:** Alto - signup estava completamente quebrado
- **Configuração de Email:** Migrado de Resend SMTP para Supabase Email Service
  - **Motivo:** Resend gratuito em modo sandbox só permite emails autorizados
  - **Benefício:** Signup funciona para qualquer email autorizado na lista
  - **Sender:** Emails virão de `noreply@mail.app.supabase.co`

### ✅ Validado
- **Trigger `handle_new_user()`:** Testado manualmente e funcionando 100%
  - **Função:** Popula `usuarios` + `profiles` automaticamente após signup
  - **Teste:** Inserção em `auth.users` → trigger disparou → ambas tabelas populadas
  - **Segurança:** `SECURITY DEFINER` com políticas RLS corretas
- **Foreign Keys:** `profiles.id → auth.users.id (ON DELETE CASCADE)` confirmada
- **Políticas RLS:** Todas com `WITH CHECK (true)` permitindo trigger funcionar

### 📖 Documentação Criada
- **supabase-database-schema.md:** 
  - Schema completo das 8 tabelas principais
  - Documentação de 2 triggers (`handle_new_user`, `update_updated_at_column`)
  - Todas as políticas RLS explicadas
  - Queries de diagnóstico para verificar sincronização
  - Scripts de manutenção e correção
- **troubleshooting-signup.md:**
  - Histórico completo da investigação (4 horas)
  - 8 queries SQL executadas para mapear problema
  - Causa raiz identificada (2 problemas combinados)
  - Solução aplicada passo a passo
  - Testes de verificação documentados
- **README.md:** Seção "Arquitetura do Banco de Dados" adicionada

### 🔍 Investigação Técnica
- **Problema Identificado:** Erro 500 ao criar conta
- **Investigação:** 8 queries SQL + análise de logs + testes manuais
- **Causas Encontradas:**
  1. Faltava `emailRedirectTo` no código (obrigatório para email confirmation)
  2. Resend SMTP em modo sandbox (só permite emails autorizados)
- **Solução:** Código corrigido + migração para Supabase Email Service
- **Resultado:** Signup 100% funcional

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/auth/page.tsx` (1 linha alterada)
  - `docs/supabase-database-schema.md` (criado - 400+ linhas)
  - `docs/troubleshooting-signup.md` (criado - 300+ linhas)
  - `docs/CHANGELOG.md` (esta entrada)
  - `docs/CURRENT-STATUS.md` (atualizado)
  - `README.md` (seção adicionada)
- **Banco de Dados:** Nenhuma alteração necessária (estrutura já estava correta)
- **Configuração:** SMTP customizado desabilitado no Supabase Dashboard

### 🎯 Impacto
- **Crítico:** Sistema de signup estava completamente quebrado
- **Resolução:** Funcional em produção após correção
- **Benefício:** Documentação completa evita retrabalho futuro
- **Tempo:** 4 horas de investigação + correção + documentação

### 💡 Aprendizados
1. Sempre configurar `emailRedirectTo` quando confirmação de email está ativa
2. Resend gratuito tem limitações de sandbox (apenas emails verificados)
3. Triggers com `EXCEPTION WHEN OTHERS` escondem erros - evitar
4. Logs do Supabase Auth são essenciais para debug
5. Documentação técnica economiza horas de retrabalho

---

## [v3.3.0] - 2025-09-24 - 🎥 Otimização de Vídeos + Reset de Senha Corrigido

### ✅ Adicionado
- **Sistema de Reset de Senha via SMTP:** Configuração do Resend como SMTP provider no Supabase
  - SMTP customizado substituindo sistema padrão do Supabase
  - Templates de email personalizados mantidos
  - Melhor entregabilidade e controle sobre envios
- **Detecção de Sessão Ativa:** Página de reset detecta quando usuário já está autenticado
  - Verificação de sessão antes de procurar tokens na URL
  - Suporte ao fluxo de recovery que faz login automático
- **Documentação de Bugs:** Registro de limitações conhecidas do Supabase gratuito

### 🔧 Corrigido
- **Reset de Senha Não Funcionava:** Supabase não passava tokens corretamente para aplicação
  - **Causa:** Limitação do plano gratuito com redirect_to customizado
  - **Solução:** Detectar sessão ativa ao invés de depender de tokens na URL
- **Erro 500 com Emails Hotmail:** Reset múltiplos falhavam para domínios Hotmail/Outlook
  - **Workaround:** Documentado uso da página de perfil como alternativa

### 🎨 Melhorado
- **Performance da Landing Page:** Vídeos reduzidos de 200MB para 8MB (redução de 96%)
  - Compressão com FFmpeg (CRF 32, resolução 960x540, áudio mono)
  - Economia drástica na cota de bandwidth do Vercel
  - Melhoria significativa no LCP e Web Vitals
- **Processo de Compressão Documentado:** Template Obsidian com comandos reutilizáveis
  - 3 níveis de compressão configurados (Mobile/Desktop/Ultra)
  - Comandos em lote para múltiplos vídeos
  - Estrutura organizada em C:\Users\adils\Videos\CompressaoVideos

### 📊 Técnico
- **Configuração SMTP Resend:**
  - Host: smtp.resend.com
  - Port: 465
  - Username: resend (fixo)
  - Password: API Key do Resend
- **Arquivos Modificados:**
  - `src/app/reset-password/page.tsx` - Adicionada verificação de sessão ativa
  - Vídeos em `/public/videos/` - Recomprimidos com FFmpeg
- **Economia de Recursos:**
  - Bandwidth: ~576GB/mês economizados (para 3000 visitantes)
  - Tamanho por vídeo: ~50MB → ~2MB

### 🐛 Bugs Conhecidos
- **Hotmail/Outlook:** Erro 500 em resets múltiplos (limitação Supabase + SMTP)
  - **Workaround:** Usar página /perfil para trocar senha
- **Plano Gratuito Supabase:** Redirect customizado não passa tokens corretamente
  - **Resolvido:** Sistema detecta sessão ao invés de depender de tokens

---

---

## [v3.2.0] - 2025-09-24 - 🔒 Sistema de Segurança e Admin Dashboard

### ✅ Adicionado
- **Sistema de Autorização Seguro:** Migração completa de arquivo público para banco de dados
  - Tabela `authorized_emails` no Supabase com RLS e service role key
  - APIs seguras server-side impossíveis de burlar
  - Verificação de expiração no login e cadastro
- **Interface Admin de Assinantes:** Dashboard completo em `/admin/assinantes`
  - CRUD completo (Create, Read, Update, Delete) de assinantes
  - Informações de acesso: último login, conta criada, atividades
  - Filtros avançados: status, período de acesso, ordenação
  - Busca em tempo real e contador de resultados
- **Verificação de Conta Existente:** Previne envio de emails duplicados no cadastro
- **Check de Expiração no Login:** Bloqueia acesso de assinaturas expiradas

### 🔧 Corrigido
- **Vulnerabilidade de Segurança:** Arquivo `public/emails-autorizados.txt` expondo dados
- **LGPD Compliance:** Dados sensíveis agora protegidos no banco
- **Emails Duplicados:** Sistema não envia mais email quando conta já existe
- **Acesso Expirado:** Usuários com data expirada não conseguem mais fazer login
- **Botões Admin:** Corrigido estilo dos selects/dropdowns (fundo escuro visível)

### 🎨 Melhorado
- **Gestão de Assinantes:** De edição manual via Git para interface visual instantânea
- **Performance:** Queries otimizadas com índices no banco
- **UX Admin:** Swipe gestures para ações, indicadores visuais de status
- **Segurança:** Validação server-side com service role key do Supabase
- **Filtros Inteligentes:** Múltiplos filtros combinados para gestão eficiente

### 📊 Técnico
- **Novas APIs:** 
  - `/api/auth/check-authorization` - Verificação segura de autorização
  - `/api/auth/check-existing` - Verifica se conta já existe
  - `/api/auth/check-expiration` - Valida expiração no login
  - `/api/admin/assinantes` - CRUD completo do admin
- **Nova Tabela:** `authorized_emails` com campos para futuro Stripe
- **Arquivos Removidos:** `public/emails-autorizados.txt` (vulnerabilidade)
- **Componentes:** Nova página admin com filtros, busca e métricas

### 🔒 Segurança
- **Zero Exposição:** Emails não são mais visíveis no GitHub ou cliente
- **Impossible Bypass:** Verificação server-side com service role
- **Dupla Verificação:** Check na criação de conta E no login
- **Admin Protegido:** Apenas email autorizado pode acessar dashboard

--

## [v3.1.0] - 2025-09-21 - 📱 Mobile-First Redesign + UX Profissional do Mapa

### ✅ Adicionado
- **Visualização Mobile Nativa:** Cards por zona com mini-matriz visual no mobile
- **Swipe Gestures:** Deslizar para editar (→) ou excluir (←) no mobile
- **Seletor de Números:** Substituição dos sliders por botões 1-6 para Impacto/Clareza
- **Cards por Zona Desktop:** Visualização unificada desktop/mobile agrupada por zonas
- **Scroll para Edição:** Auto-scroll suave ao editar atividade
- **Card Diagnóstico Mobile:** CTA contextual no final da lista mobile

### 🔧 Corrigido
- **Conversão de Horas:** Cálculo preciso com 22 dias úteis e 4.33 semanas/mês
- **Gráfico Interativo:** Clique nas bolhas agora abre formulário de edição
- **Sobreposição de Bolhas:** Jitter circular + transparência + tooltip melhorado
- **Textos Longos:** Break-words em nomes de atividades evita quebra de layout
- **Responsividade Formulário:** Layout adaptativo mobile/tablet/desktop

### 🎨 Melhorado
- **UX Mobile-First:** Interface completamente otimizada para touch
- **Preview de Conversão:** Box visual mostrando horas/mês e horas/dia
- **Tamanho das Bolhas:** Range aumentado [200, 600] para melhor visibilidade
- **Título do Gráfico:** "Matriz Impacto × Clareza" substituindo "Gráfico de bolhas"
- **Consistência Visual:** Cards unificados entre mobile e desktop
- **Feedback Visual:** Indicadores coloridos ao deslizar cards no mobile

### 🔍 Detalhes Técnicos
- **Componente MatrizMobile:** Nova visualização mobile com mini-matriz + cards colapsáveis
- **CardAtividadeMobile:** Touch handlers para swipe actions
- **NumberSelector:** Grid responsivo substituindo sliders problemáticos
- **ZonaCollapsivel:** Componente reutilizável para agrupamento por zona
- **DIAS_UTEIS_MES:** Atualizado de 20 para 22 (mais realista)
- **SEMANAS_MES:** Atualizado de 4 para 4.33 (mais preciso)

### 📊 Métricas de Qualidade
- **Zero scroll horizontal:** Layout 100% responsivo
- **Touch targets:** Mínimo 44px conforme guidelines mobile
- **Performance:** Componentes otimizados com useMemo
- **Acessibilidade:** Controles keyboard-friendly mantidos

### 🐛 Bugs Conhecidos Resolvidos
- ✅ Horas/mês mostrando 0,67 quando selecionado período mensal
- ✅ Sliders difíceis de usar em telas pequenas
- ✅ Tabela quebrando em displays menores
- ✅ Bolhas sobrepostas impossíveis de clicar
- ✅ Formulário espremido em tablets

---

## [v3.0.0] - 2024-09-17 - 🎬 Landing Page Premium com Vídeos Interativos

### ✅ Adicionado
- **Seção de Vídeos Interativa:** 4 vídeos com scroll-trigger automático (desktop) e cards responsivos (mobile)
- **Ecossistema Virtual:** Novo posicionamento "Conversas no Corredor +" como ecossistema completo
- **Seções Completas:** Pricing, Metodologia, Gestão Profissional, Para Quem É, Resultados Esperados
- **CTAs Estratégicos:** Botões com gradiente laranja e hover effects profissionais
- **Observer Pattern:** Intersection Observer para troca automática de vídeos no scroll

### 🔧 Corrigido
- **Sticky Position:** Vídeo centralizado verticalmente com `calc(50vh - 12rem)`
- **Mobile Experience:** Cards de vídeo com controles nativos e layout otimizado
- **Padding Bottom:** `pb-[15vh]` na coluna de textos para scroll completo
- **Bordas Arredondadas:** Padronização com `rounded-xl` em todos os componentes

### 🎨 Melhorado
- **Copy Refinado:** Textos focados em benefícios tangíveis e ROI do tempo
- **Hierarquia Visual:** 2 colunas no hero, metodologia em 3 cards, CTAs duplos
- **Responsividade:** Grid adaptativo desktop/tablet/mobile em todas as seções
- **Performance:** Lazy loading de vídeos com transições suaves de opacidade

### 📊 Técnico
- **Arquivo Principal:** `src/app/page.tsx` completamente redesenhado
- **Vídeos:** 4 arquivos MP4 em `/public/videos/` (mapeamento, diagnostico, taticas, kanban)
- **Estados React:** currentVideo, isVideoSectionVisible, videoRefs, sectionRefs
- **CSS Profissional:** Glass effects, shadows, gradients, transforms

---

## [v2.0.0] - 2025-09-13 - 🎯 KANBAN VISUAL - FLUXO SEMANAL

### ✅ Adicionado
- **Página Fluxo Semanal:** Nova rota /painel-semanal com Kanban de 4 colunas
- **Drag & Drop:** Sistema visual para mover táticas entre status (Backlog → Feito)
- **Biblioteca:** @hello-pangea/dnd para drag & drop performático
- **Campos Kanban:** status_kanban, ordem_coluna, semana_referencia na tabela táticas

### 🔧 Corrigido
- **Next.js:** Atualizado v15.0.0-canary → v15.5.3 (vulnerabilidade SSRF resolvida)
- **Performance:** Novo índice no Supabase para queries do Kanban
- **UX:** Cursor grab/grabbing + feedback visual durante arrastar

### 🎨 Melhorado
- **Arquitetura:** Sistema agora suporta dois fluxos (Plano de Ação + Fluxo Semanal)
- **Hierarquia:** Cards do Kanban mostram atividade mãe + zona ROI automaticamente
- **Design:** Glass effects + animações + cores consistentes com design system

### 📊 Técnico
- **Zero Breaking Changes:** Funcionalidades v1.9.8 preservadas 100%
- **Estrutura:** Nova pasta src/app/painel-semanal + src/lib/kanban
- **Tipos:** Interfaces KanbanBoard, TaticaKanban, KanbanStatus adicionadas
---

## [v1.9.8] - 2025-09-09 - 🔄 Sincronização Supabase + Notificações ROI do Foco

### ✅ Adicionado
- **Tabela Táticas:** Nova tabela `public.taticas` no Supabase para sincronização entre dispositivos
- **Salvamento Híbrido:** Sistema salva simultaneamente no localStorage e Supabase
- **Notificações ROI do Foco:** Substituição dos alert() feios por notificações visuais consistentes
- **RLS Completo:** Row Level Security implementado seguindo boas práticas já testadas

### 🔧 Corrigido
- **Sincronização:** Táticas e hábitos agora sincronizam entre celular e computador
- **UX Inconsistente:** Alertas padrão do navegador substituídos por design system próprio
- **Dados Isolados:** localStorage causava perda de dados ao trocar de dispositivo

### 🎨 Melhorado
- **Compatibilidade Total:** Sistema funciona offline (localStorage) e online (Supabase)
- **Feedback Visual:** Notificações aparecem no canto superior direito com branding "ROI do Foco"
- **Performance:** Strategy "replace all" evita duplicatas no banco
- **Tolerância a Erros:** Sistema continua funcionando se Supabase falhar

### 📊 Técnico
- **Nova Tabela:** `public.taticas` com 15 campos (user_id, atividade_id, titulo, etc.)
- **Arquivos Modificados:** 
  - `src/app/plano-acao/page.tsx` - função salvarPlano() + carregamento Supabase + notificações
  - SQL Schema aplicado no Supabase com RLS ativo
- **Carregamento Híbrido:** Supabase primeiro, localStorage como fallback
- **Migração Automática:** Sistema detecta dados mais recentes automaticamente
- **Segurança:** Política RLS `auth.uid() = user_id` testada e funcionando

---

## [v1.9.7] - 2025-09-09 - 📊 Google Ads Conversion Tracking

### ✅ Adicionado
- **Conversion Tracking:** Google Ads gtag() executado quando usuário vira lead qualificado
- **Backend Flag:** API /lead retorna triggerConversion para frontend executar
- **Console Logging:** Confirmação visual "Google Ads conversion triggered"
- **Pixel Integration:** Conversão dispara no momento da captura nome + email

### 🔧 Corrigido
- **False Negative:** Sistema sempre funcionou - problema era email duplicado no upsert
- **Debug Process:** Identificação de que created_at não mudava em emails repetidos
- **Validation Issue:** Descoberta de que upsert mantém timestamp original

### 🎨 Melhorado
- **Tracking Accuracy:** Conversão registrada no momento exato de lead qualificado
- **Error Handling:** Sistema continua funcionando mesmo se gtag falhar
- **Data Quality:** Confirmação de que pipeline completa está operacional

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/api/prediag/lead/route.ts` - Adiciona triggerConversion flag
  - `src/components/prediagnostico/EmailGate.tsx` - Executa gtag() conversion
- **Flow:** Google Ads → Pré-diagnóstico → Lead capturado → Conversão disparada
- **Debugging:** Logs temporários removidos após confirmação

---

## [v1.9.6] - 2025-09-08 - 📋 Plano de Ação UX Redesign

### ✅ Adicionado
- **Dashboard de Estatísticas:** Seção "Seu plano de ação contém" com contadores de atividades, táticas, tarefas e hábitos
- **Controles Centralizados:** Abas Atividades/Táticas centralizadas com design consistente
- **Filtros Colapsáveis:** Seção "Filtrar atividades por zona" com dropdown recolhível
- **Ícones Padronizados:** Sistema consistente de ícones laranjas em fundos quadrados para todas as seções
- **Botões Salvar Unificados:** Ícone de disquete + cor laranja padrão em todos os 3 botões salvar

### 🎨 Melhorado
- **Layout Mobile:** Header responsivo com botão salvar embaixo no mobile, ao lado no desktop
- **Espaçamentos:** Padronização de margens entre seções (mb-4 sm:mb-6)
- **Hierarquia Visual:** Seções colapsáveis seguindo padrão consistente da página
- **Grid Responsivo:** Estatísticas em grid 2x2 no mobile, linha única no desktop
- **Prevenção de Duplicatas:** Validação antes de aplicar sugestões inteligentes globais

### 🔧 Corrigido
- **Altura de Cards:** Padronização de altura entre todos os cards colapsáveis
- **Espaçamento Dropdown:** Adicionado margin-top correto no conteúdo expandido
- **Layout Responsivo:** Quebras de linha adequadas em ícones e números no mobile
- **Texto de Táticas:** Remoção de \n\n nos detalhes das táticas geradas

### 📊 Técnico
- **Arquivos Modificados:** `src/app/plano-acao/page.tsx`, `src/components/plano/index.tsx`
- **Novos Estados:** `showZoneFilters` para controle de filtros colapsáveis
- **Imports Adicionados:** `Save`, `TrendingUp` do lucide-react
- **Componentes:** PlanoHeader, PlanoStats, OrientacaoDiagnostico redesenhados

## [v1.9.5] - 2025-09-07 - 🎯 UX Melhorado Pré-Diagnóstico

### ✅ Adicionado
- **Contexto Educativo:** Seções explicativas sobre metodologia ROI do Foco antes do chat
- **Credibilidade Pessoal:** Biografia do criador com link para LinkedIn
- **Personalização Destacada:** 3 blocos mostrando inteligência adaptativa do sistema
- **Sistema Completo:** Nova seção mostrando benefícios da versão completa
- **Progressive Disclosure:** Interface em 2 estados (educativo → conversacional)

### 🎨 Melhorado
- **Taxa de Conversão:** Visitantes Google Ads agora entendem proposta de valor
- **Fluxo UX:** Educação progressiva antes da interação
- **Consistência Visual:** Reuso de componentes da landing page
- **Clareza:** Distinção entre pré-diagnóstico gratuito e sistema completo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/pre-diagnostico/page.tsx`
- **Novo Estado:** `showChat` para controlar visualização progressiva
- **Links Adicionados:** LinkedIn do autor + artigo sobre produto digital
- **Performance:** Mantida com lazy loading do ChatFlow

---

## [v1.9.4] - 2025-09-01 - 🎯 Google Ads Setup Inicial

### ✅ Adicionado
- **2 Campanhas Google Ads:** Analistas (R$ 15/dia) + Gestores Multinacionais (R$ 20/dia)
- **Targeting Estratégico:** Palavras-chave focadas em produtividade e gestão de tempo
- **Budget Management:** R$ 1.050/mês distribuído entre 2 campanhas
- **Landing Page:** /pre-diagnostico como destino único

### 🎯 Configurado
- **Monitoramento:** Google Ads dashboard para métricas iniciais
- **Conversões:** Tracking via roi_leads existente no Supabase
- **Alertas:** CPC > R$ 8 para pausar palavras-chave
- **Otimização:** Plano de realocação após 2 semanas

### 📊 Técnico
- **Plataforma:** Google Ads com campanhas de pesquisa
- **Tracking:** Dashboard Grafana atual + dados Supabase roi_leads
- **Budget:** Controle diário automático Google Ads
- **Código:** Nenhuma modificação necessária no sistema atual

---

## [v1.9.3] - 2025-08-27 - 🔧 Correções Críticas Android + RLS

### 🚨 Corrigido - Problemas Críticos
- **Android Redirect Issue:** Sistema de autenticação redirecionava usuários não autenticados da página `/pre-diagnostico` para landing page
  - **Causa:** `layout.tsx` não incluía `/pre-diagnostico` nas exceções de redirecionamento
  - **Solução:** Adicionado `&& pathname !== '/pre-diagnostico'` nas condições de auth
  - **Impacto:** ✅ Página agora funciona universalmente (iPhone + Android + Desktop)

- **Email Delivery Failure:** RLS bloqueava inserções das APIs públicas do pré-diagnóstico
  - **Causa:** Políticas RLS muito restritivas impediam `INSERT` na tabela `roi_leads`
  - **Erro:** `Error 42501: new row violates row-level security policy`
  - **Solução:** Política `FOR ALL USING (true) WITH CHECK (true)` permite acesso público necessário
  - **Impacto:** ✅ Email enviado corretamente mantendo segurança RLS

### 🎨 Melhorado
- **Compatibilidade Universal:** Sistema funcionando em todas as plataformas testadas
- **RLS Balanceado:** Segurança ativa mas com exceções adequadas para APIs públicas
- **Debugging Process:** Identificação sistemática de problemas de autenticação vs RLS

### 📊 Técnico
- **Arquivos Modificados:**
  - `src/app/layout.tsx` - Exceções de autenticação corrigidas
  - `src/app/pre-diagnostico/page.tsx` - Hidratação simplificada
  - `src/components/prediagnostico/ChatFlow.tsx` - useLayoutEffect otimizado
- **Database:** Política RLS na tabela `roi_leads` ajustada para acesso público
- **Testing:** Validação em iPhone, Android, Desktop confirmada

### 📱 Compatibilidade Confirmada
- ✅ iPhone Safari - Funcionando
- ✅ Android Chrome - Funcionando (corrigido)  
- ✅ Desktop browsers - Funcionando
- ✅ Email delivery - Funcionando (corrigido)

---

## [v1.9.2] - 2025-08-27 - 🎯 Landing Page Integrada + UX Refinado

### ✅ Adicionado
- **2 CTAs Pré-Diagnóstico:** Hero section + seção ROI do Foco na landing page
- **Textos Tangíveis:** Promessas baseadas na teoria ROI (30-60 min/dia)
- **Hierarquia Visual:** Newsletter → Demo → Acesso sistema

### 🔧 Corrigido  
- **Scroll Anchoring:** Slide-downs dos accordions com `overflow-anchor: none`
- **Centralização:** Cards de perfil e CTAs alinhados corretamente
- **Espaçamentos:** Gaps verticais reduzidos 25% para melhor fluxo visual

### 🎨 Melhorado
- **Conversão:** 2 pontos de entrada para pré-diagnóstico na landing
- **UX Profissional:** Acordeões com comportamento previsível de expansão
- **Hierarquia de CTAs:** Priorização clara entre newsletter e demo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/page.tsx`
- **Integração:** Sistema de pré-diagnóstico conectado à landing page
- **Performance:** Sem impacto na velocidade de carregamento

---

## [v1.9.1] - 2025-08-27 - 🔧 Campo Nome + Personalização de Emails

### ✅ Adicionado
- **Campo Nome Obrigatório**: EmailGate agora captura nome completo do usuário
- **Personalização Real**: Emails mostram "Olá João" em vez de "Olá joao.silva"
- **Validação Robusta**: Nome mínimo 2 caracteres + email válido
- **Coluna Banco**: `roi_leads.name VARCHAR(100)` adicionada

### 🔧 Corrigido
- **Bug API Lead**: Sistema não salvava leads (53 perdidos detectados)
- **Validação Entrada**: API agora processa campo nome corretamente
- **Template Email**: firstName usa nome real extraído do formulário

### 📊 Técnico
- **Arquivos Modificados**: 
  - `src/components/prediagnostico/EmailGate.tsx`
  - `src/app/api/prediag/lead/route.ts`
- **Breaking Change**: Tabela roi_leads requer coluna name
- **Taxa Recuperação**: Bug detectado através de análise 67 sessões vs 1 lead salvo

---

## [v1.9.0] - 2025-08-27 - 🎯 Sistema de Pré-Diagnóstico Completo

### ✅ Adicionado

#### **📋 Pré-Diagnóstico ROI do Foco**
- **Landing Page Independente** (`/pre-diagnostico`)
  - Interface conversacional com 5 etapas: Perfil → Agenda → Dor → Atividade → Objetivo  
  - Design responsivo mobile-first alinhado com identidade visual
  - Validação robusta de inputs com error handling

#### **🔧 APIs Completas de Pré-Diagnóstico**
- **`POST /api/prediag/diagnose`** - Gerar diagnóstico + salvar sessão
- **`POST /api/prediag/lead`** - Capturar email + enviar recomendações  
- **`GET /api/prediag/options`** - Opções dinâmicas ramificadas por perfil

#### **💌 Sistema de Email Marketing**
- **Integração Resend** configurada e funcional
- **Template HTML Profissional** (`email-template.ts`)
  - Design consistente com landing page + identidade visual
  - Personalização baseada no perfil do usuário
  - 3 recomendações customizadas por sessão (HABITO/TAREFA/MINDSET)
  - CTAs duplos: Newsletter + Sistema Completo

#### **🧠 Heurística de Recomendações** (`recommendations.ts`)
- **450+ Recomendações Categorizadas**
  - Mapeamento por: perfil + dor + atividade + objetivo
  - Sistema de scoring para melhor match
  - Fallbacks garantidos para todos os perfis

#### **🗄️ Banco de Dados Expandido**
```sql
-- 3 Novas Tabelas Criadas:
roi_prediag_sessions  # Dados completos do diagnóstico
roi_leads            # Leads capturados para marketing  
roi_events           # Analytics de conversão
```

### 🔧 Corrigido
- **API Recomendações:** Correção crítica com `select('*')` resolvendo recomendações vazias
- **Template Email:** Layout profissional com barras gráficas funcionais
- **Integração Supabase:** 3 tabelas com relacionamentos e índices otimizados

### 🎨 Melhorado
- **UX Conversacional:** Fluxo intuitivo de 5 etapas sem fricção
- **Email Design:** Template responsivo com snapshot visual dos resultados
- **Analytics:** Sistema de eventos para tracking de conversão completo

---

## [v1.8.3] - 2025-08-22 - 🎯 Diagnóstico Premium + Export Otimizado

### ✅ Adicionado
- **PDF Export Limpo**: Implementação direta com jsPDF sem html2canvas
- **RelatorioView Personalizado**: Header com emoji + nome real do usuário
- **Status Badge Dinâmico**: Crítico/Saudável/Ajustes com cores automáticas

### 🔧 Corrigido
- **Caracteres Quebrados**: PDF agora exporta sem emojis/acentos corrompidos
- **Import Missing**: Adicionado `getCenarioColor` e `getCenarioIcon`
- **Header Genérico**: Personalização com dados reais do perfil

### 🎨 Melhorado
- **Performance PDF**: Geração 3x mais rápida sem dependência do html2canvas
- **UX Limpa**: Interface mais enxuta com informação consolidada

---

## [v1.8.2] - 2025-08-20 - 📄 Fluxo Padronizado + Interface Profissional

### ✅ Adicionado
- **Fluxo ROI do Foco**: Design idêntico nas 3 páginas principais
- **Nome Real**: Busca automática na tabela `profiles` com fallback
- **Métricas Coloridas**: Grid responsivo com cores padronizadas

### 🔧 Corrigido
- **Busca de Perfil**: Correção de `display_name` para `full_name`
- **Visual Inconsistente**: Unificação do design entre todas as páginas

---

## [v1.8.1] - 2025-08-18 - 🧠 Heurística V2.1 + Edição Profissional

### ✅ Adicionado
- **IA V2.1 Robusta**: 6 padrões principais + scoring inteligente
- **Sistema de Edição**: Modal pré-preenchido para táticas existentes
- **Tags Visuais**: TAREFA (amarelo) vs HÁBITO (azul)

### 🔧 Corrigido
- **Keys Duplicadas**: Zero erros de React rendering
- **Botões Não Funcionais**: Modal unificado conectado

---

## [v1.8.0] - 2025-08-15 - 🎯 Framework DAR CERTO + IA Automática

### ✅ Adicionado
- **Framework DAR CERTO**: 8 categorias implementadas
- **IA V2.0**: Motor de sugestões automáticas baseado em padrões
- **Sistema TAREFA vs HÁBITO**: Flexibilidade total na criação

---

## [v1.7.0] - 2025-08-12 - 📊 Diagnóstico Automático + Relatórios

### ✅ Adicionado
- **Motor de Análise**: 5 focos identificados automaticamente
- **Relatórios Detalhados**: Cenário + recomendações + meta personalizada
- **Export Profissional**: PDF e JSON para acompanhamento

---

## [v1.6.0] - 2025-08-10 - 🎨 Layout Otimizado + UX Consistente

### ✅ Adicionado
- **Header com Fluxo**: Progress bar visual nas páginas principais
- **Menu Retrátil**: Transições suaves na navegação

---

## [v1.5.0] - 2025-08-08 - 👤 Perfil Completo + LGPD

### ✅ Adicionado
- **Página de Perfil**: Configurações pessoais completas
- **Sistema LGPD**: Compliance total com exportação de dados
- **Emojis de Perfil**: Personalização visual do usuário

---

## [v1.4.0] - 2025-08-05 - 🧩 Wave 1 Modular + Design System

### ✅ Adicionado
- **19 Componentes Modulares**: Base sólida para escalabilidade
- **Design System**: Centralizado com tokens de cores/espaçamentos
- **Arquitetura Enterprise**: Separação clara de responsabilidades

---

## [v1.3.0] - 2025-08-02 - 🔍 Sistema de Diagnóstico

### ✅ Adicionado
- **Motor de Análise Heurística**: Primeiro algoritmo de diagnóstico
- **Relatórios Automáticos**: Geração baseada em padrões identificados

---

## [v1.2.0] - 2025-07-30 - 🗺️ Mapa de Atividades Core

### ✅ Adicionado
- **Gráfico Interativo**: Impacto × Clareza com 4 zonas automáticas
- **CRUD Completo**: Criar, editar, excluir atividades
- **Zonificação Automática**: Distração/Tática/Estratégica/Essencial

---

## [v1.1.0] - 2025-07-25 - 🔐 Autenticação + Banco

### ✅ Adicionado
- **Supabase Integration**: Banco PostgreSQL + RLS
- **Sistema de Auth**: Login/cadastro seguro
- **Tabelas Core**: Atividades + Profiles + Políticas

---

## [v1.0.0] - 2025-07-20 - 🚀 MVP Inicial

### ✅ Adicionado
- **Landing Page**: Design profissional + newsletter integration
- **Estrutura Base**: Next.js + TypeScript + Tailwind
- **Deploy**: Vercel com domínio personalizado

---

**📝 Mantido por:** Equipe de desenvolvimento  
**📄 Atualizado:** A cada release  
**📋 Formato:** [Keep a Changelog](https://keepachangelog.com/)  
**🎉 Estatísticas:** 16+ sessões, 200+ commits, sistema universal funcionando

## [v1.9.2] - 2025-08-27 - 🎯 Landing Page Integrada + UX Refinado

### ✅ Adicionado
- **2 CTAs Pré-Diagnóstico:** Hero section + seção ROI do Foco na landing page
- **Textos Tangíveis:** Promessas baseadas na teoria ROI (30-60 min/dia)
- **Hierarquia Visual:** Newsletter → Demo → Acesso sistema

### 🔧 Corrigido  
- **Scroll Anchoring:** Slide-downs dos accordions com `overflow-anchor: none`
- **Centralização:** Cards de perfil e CTAs alinhados corretamente
- **Espaçamentos:** Gaps verticais reduzidos 25% para melhor fluxo visual

### 🎨 Melhorado
- **Conversão:** 2 pontos de entrada para pré-diagnóstico na landing
- **UX Profissional:** Acordeões com comportamento previsível de expansão
- **Hierarquia de CTAs:** Priorização clara entre newsletter e demo

### 📊 Técnico
- **Arquivo Modificado:** `src/app/page.tsx`
- **Integração:** Sistema de pré-diagnóstico conectado à landing page
- **Performance:** Sem impacto na velocidade de carregamento

## [v1.9.1] - 2025-08-27 - 📧 Campo Nome + Personalização de Emails
**Impacto:** Médio - Melhoria na experiência de email marketing
**Duração:** ~2 horas de implementação

### ✅ Adicionado
- **Campo Nome Obrigatório**: EmailGate agora captura nome completo do usuário
- **Personalização Real**: Emails mostram "Olá João" em vez de "Olá joao.silva"
- **Validação Robusta**: Nome mínimo 2 caracteres + email válido
- **Coluna Banco**: `roi_leads.name VARCHAR(100)` adicionada

### 🔧 Corrigido
- **Bug API Lead**: Sistema não salvava leads (53 perdidos detectados)
- **Validação Entrada**: API agora processa campo nome corretamente
- **Template Email**: firstName usa nome real extraído do formulário

### 📊 Técnico
- **Arquivos Modificados**: 
  - `src/components/prediagnostico/EmailGate.tsx`
  - `src/app/api/prediag/lead/route.ts`
- **Breaking Change**: Tabela roi_leads requer coluna name
- **Taxa Recuperação**: Bug detectado através de análise 67 sessões vs 1 lead salvo
não entend
### 📚 Lessons Learned
- **Validação Crítica**: APIs devem aceitar dados parciais para evitar perda de leads
- **Monitoring**: Comparação entre tabelas revelou bug silencioso
- **UX Impact**: Campo nome melhora personalização sem fricção significativa
- **Data Quality**: Tracking granular menos importante que conversão principal


## [v1.9.0] - 2025-08-27 - 🎯 Sistema de Pré-Diagnóstico Completo
**Impacto:** Alto - Nova funcionalidade de captura de leads
**Duração:** ~8 horas de implementação completa

### ✅ Adicionado

#### **📋 Pré-Diagnóstico ROI do Foco**
- **Landing Page Independente** (`/pre-diagnostico`)
  - Interface conversacional com 5 etapas: Perfil → Agenda → Dor → Atividade → Objetivo  
  - Design responsivo mobile-first alinhado com identidade visual
  - Validação robusta de inputs com error handling

#### **🔧 APIs Completas de Pré-Diagnóstico**
- **`POST /api/prediag/diagnose`** - Gerar diagnóstico + salvar sessão
- **`POST /api/prediag/lead`** - Capturar email + enviar recomendações  
- **`GET /api/prediag/options`** - Opções dinâmicas ramificadas por perfil

#### **💌 Sistema de Email Marketing**
- **Integração Resend** configurada e funcional
- **Template HTML Profissional** (`email-template.ts`)
  - Design consistente com landing page + identidade visual
  - Personalização baseada no perfil do usuário
  - 3 recomendações customizadas por sessão (HABITO/TAREFA/MINDSET)
  - CTAs duplos: Newsletter + Sistema Completo

#### **🧠 Heurística de Recomendações** (`recommendations.ts`)
- **450+ Recomendações Categorizadas**
  - Mapeamento por: perfil + dor + atividade + objetivo
  - Sistema de scoring para melhor match
  - Fallbacks garantidos para todos os perfis

#### **🗄️ Banco de Dados Expandido**
```sql
-- 3 Novas Tabelas Criadas:
roi_prediag_sessions  # Dados completos do diagnóstico
roi_leads            # Leads capturados para marketing  
roi_events           # Analytics de conversão
```

#### **🛡️ Segurança e Validação**
- **Validações Server-Side:** Email format + UUID + input sanitization
- **RLS Configurado:** Políticas de segurança em todas as novas tabelas
- **Error Handling:** Tratamento robusto de cenários de falha

### 🔧 Corrigido
- **API Recomendações:** Correção crítica com `select('*')` resolvendo recomendações vazias
- **Template Email:** Layout profissional com barras gráficas funcionais
- **Integração Supabase:** 3 tabelas com relacionamentos e índices otimizados
- **Response Time:** APIs otimizadas para < 2s

### 🎨 Melhorado
- **UX Conversacional:** Fluxo intuitivo de 5 etapas sem fricção
- **Email Design:** Template responsivo com snapshot visual dos resultados
- **Analytics:** Sistema de eventos para tracking de conversão completo
- **Performance:** Queries otimizadas com índices estratégicos

### 📊 Técnico
- **Arquivos Criados:** 
  - `src/app/pre-diagnostico/page.tsx`
  - `src/app/api/prediag/diagnose/route.ts`
  - `src/app/api/prediag/lead/route.ts` 
  - `src/app/api/prediag/options/route.ts`
  - `src/app/api/prediag/email-template.ts`
  - `src/app/api/prediag/recommendations.ts`
- **Integrações:** Resend API + Supabase expandido + RLS policies
- **Environment Variables:** `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`

---

## [v1.8.3] - 2025-08-22 - 🎯 Diagnóstico Premium + Export Otimizado

### ✅ Adicionado
- **PDF Export Limpo**: Implementação direta com jsPDF sem html2canvas
- **RelatorioView Personalizado**: Header com emoji + nome real do usuário
- **Barra Visual Integrada**: Distribuição das zonas dentro do relatório
- **Status Badge Dinâmico**: Crítico/Saudável/Ajustes com cores automáticas
- **CSS Inline Profissional**: Formatação aprimorada do texto do relatório

### 🔧 Corrigido
- **Caracteres Quebrados**: PDF agora exporta sem emojis/acentos corrompidos
- **Layout Redundante**: Removida seção duplicada "Distribuição do Seu Tempo"
- **Import Missing**: Adicionado `getCenarioColor` e `getCenarioIcon` nos componentes
- **Header Genérico**: Personalização com dados reais do perfil do usuário

### 🎨 Melhorado
- **Performance PDF**: Geração 3x mais rápida sem dependência do html2canvas
- **UX Limpa**: Interface mais enxuta com informação consolidada
- **Responsividade**: Layout otimizado para mobile e desktop
- **Typography**: Hierarquia visual melhorada no relatório

### 📊 Técnico
- **Arquivos Modificados**: `page.tsx`, `index.tsx` (diagnostico), engine confirmado
- **Limpeza de Imports**: Consolidação de imports duplicados
- **Estado Otimizado**: Interface `dadosUsuario` com suporte a emoji

---

## [v1.8.2] - 2025-08-20 - 🔄 Fluxo Padronizado + Interface Profissional

### ✅ Adicionado
- **Fluxo ROI do Foco**: Design idêntico nas 3 páginas principais (Mapa/Diagnóstico/Plano)
- **Nome Real**: Busca automática na tabela `profiles` com fallback para email
- **Métricas Coloridas**: Grid 2x2 (mobile) / 1x4 (desktop) com cores padronizadas
- **Progress Steps**: Indicação visual do progresso no fluxo (verde/laranja/cinza)
- **Data Formatada**: Português brasileiro em todos os componentes

### 🔧 Corrigido
- **Busca de Perfil**: Correção de `display_name` para `full_name`
- **Props Incorretos**: Dados do usuário e resultado passados corretamente
- **Visual Inconsistente**: Unificação do design entre todas as páginas

### 🎨 Melhorado
- **Design System**: Cores/espaçamentos/typography padronizados
- **Modularidade**: Componente RelatorioView reutilizável
- **Accessibility**: Contraste melhorado e estrutura semântica

---

## [v1.8.1] - 2025-08-18 - 🧠 Heurística V2.1 + Edição Profissional

### ✅ Adicionado
- **IA V2.1 Robusta**: 6 padrões principais + scoring inteligente
- **Sistema de Edição**: Modal pré-preenchido para táticas existentes
- **Tags Visuais**: TAREFA (amarelo) vs HÁBITO (azul) com diferenciação automática
- **IDs Únicos**: Sistema timestamp + random para eliminar keys duplicadas
- **Preservação de Categoria**: Mantém categoria original ao editar

### 🔧 Corrigido
- **Keys Duplicadas**: Zero erros de React rendering
- **Botões Não Funcionais**: Modal unificado conectado a todos os botões
- **Impactos Inconsistentes**: Sistema manual para configuração

### 🎨 Melhorado
- **Interface Profissional**: Layout com grid e ícones organizados
- **Qualidade IA**: Barreira de 75% + sempre 2+ sugestões por zona
- **Manutenibilidade**: Código documentado com TODOs para futuro

---

## [v1.8.0] - 2025-08-15 - 🎯 Framework DAR CERTO + IA Automática

### ✅ Adicionado
- **Framework DAR CERTO**: 8 categorias implementadas (Delegar/Automatizar/Reduzir/etc)
- **IA V2.0**: Motor de sugestões automáticas baseado em padrões
- **Sistema TAREFA vs HÁBITO**: Flexibilidade total na criação
- **Modal Guiado**: Interface para inserção manual com seleção de categoria
- **Ordenação Inteligente**: Atividades priorizadas pelo diagnóstico

### 🔧 Corrigido
- **Integração Sequencial**: Fluxo Diagnóstico → Plano completamente funcional
- **Orientação Automática**: Seção baseada no foco identificado

---

## [v1.7.0] - 2025-08-12 - 📊 Diagnóstico Automático + Relatórios

### ✅ Adicionado
- **Motor de Análise**: 5 focos identificados automaticamente
- **Relatórios Detalhados**: Cenário + recomendações + meta personalizada
- **Export Profissional**: PDF e JSON para acompanhamento
- **3 Cenários**: Saudável/Ajustes/Crítico com análise contextual

### 🎨 Melhorado
- **Integração com Plano**: Dados salvos automaticamente para próximo passo

---

## [v1.6.0] - 2025-08-10 - 🎨 Layout Otimizado + UX Consistente

### ✅ Adicionado
- **Header com Fluxo**: Progress bar visual nas páginas principais
- **Menu Retrátil**: Transições suaves na navegação
- **Reorganização**: Página de diagnóstico reestruturada

### 🎨 Melhorado
- **UX Consistente**: Design padronizado entre todas as páginas

---

## [v1.5.0] - 2025-08-08 - 👤 Perfil Completo + LGPD

### ✅ Adicionado
- **Página de Perfil**: Configurações pessoais completas
- **Sistema LGPD**: Compliance total com exportação de dados
- **Modal de Termos**: Integrado na experiência do usuário
- **Emojis de Perfil**: Personalização visual do usuário

---

## [v1.4.0] - 2025-08-05 - 🧩 Wave 1 Modular + Design System

### ✅ Adicionado
- **19 Componentes Modulares**: Base sólida para escalabilidade
- **Design System**: Centralizado com tokens de cores/espaçamentos
- **Arquitetura Enterprise**: Separação clara de responsabilidades

---

## [v1.3.0] - 2025-08-02 - 🔍 Sistema de Diagnóstico

### ✅ Adicionado
- **Motor de Análise Heurística**: Primeiro algoritmo de diagnóstico
- **Relatórios Automáticos**: Geração baseada em padrões identificados
- **Export Básico**: PDF/JSON inicial

---

## [v1.2.0] - 2025-07-30 - 🗺️ Mapa de Atividades Core

### ✅ Adicionado
- **Gráfico Interativo**: Impacto × Clareza com 4 zonas automáticas
- **CRUD Completo**: Criar, editar, excluir atividades
- **Zonificação Automática**: Distração/Tática/Estratégica/Essencial
- **Export PNG**: Download da visualização

---

## [v1.1.0] - 2025-07-25 - 🔐 Autenticação + Banco

### ✅ Adicionado
- **Supabase Integration**: Banco PostgreSQL + RLS
- **Sistema de Auth**: Login/cadastro seguro
- **Tabelas Core**: Atividades + Profiles + Políticas

---

## [v1.0.0] - 2025-07-20 - 🚀 MVP Inicial

### ✅ Adicionado
- **Landing Page**: Design profissional + newsletter integration
- **Estrutura Base**: Next.js + TypeScript + Tailwind
- **Deploy**: Vercel com domínio personalizado

---

## 📝 TEMPLATE PARA PRÓXIMAS VERSÕES

```markdown
## [vX.Y.Z] - YYYY-MM-DD - 🎯 Título da Release

### ✅ Adicionado
- **Feature Nome**: Descrição clara do que foi adicionado

### 🔧 Corrigido  
- **Bug Nome**: Descrição do problema que foi resolvido

### 🎨 Melhorado
- **Área Nome**: Descrição da melhoria implementada

### 📊 Técnico
- **Arquivos**: Lista dos principais arquivos modificados
- **Breaking Changes**: Se houver mudanças que quebram compatibilidade

### 🚨 Depreciado
- **Feature Antiga**: O que será removido em versões futuras

### ❌ Removido
- **Feature Removida**: O que foi completamente removido
```

---

**📝 Mantido por:** Equipe de desenvolvimento  
**🔄 Atualizado:** A cada release  
**📋 Formato:** [Keep a Changelog](https://keepachangelog.com/)  
**🎉 Estatísticas:** 15+ sessões, 180+ commits, ~25,000 linhas de código