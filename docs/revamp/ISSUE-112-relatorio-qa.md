# ISSUE-112 — Relatório de QA (gate de launch)

> Executado em 2026-07-08 sobre a `main` (commit `1d5f94b`, v3.10.0), build de produção local
> (`npm run build && npm run start`). Checklist-fonte: `06_definition_of_done.md`.
> **Método:** tudo que é automatizável foi executado nesta sessão; o que exige browser real,
> dispositivo móvel, Tag Assistant ou acesso ao Supabase/GTM está no "Roteiro do dono" (§4).
> **Escopo da issue:** relatar, não corrigir — cada vermelho aponta a issue/ação correspondente.

---

## 1. Veredito

**🔴 NÃO PRONTO PARA LAUNCH.** 4 bloqueadores confirmados (§2), sendo 1 já conhecido
(ISSUE-113 ausente) e 1 reportado pelo dono nesta sessão (e-mail prometido que não chega —
mesma causa). Nenhum deles é surpresa estrutural: o código novo passou limpo em tudo que é
estático (tipos, lint, build, tracking, SEO, copy, DS2). Os vermelhos são: entrega de e-mail,
performance mobile, reset de senha (bug pré-existente) e privacidade/LGPD.

## 2. 🔴 Bloqueadores (FALHOU — launch travado até resolver ou dono registrar exceção)

### 2.1 UI promete e-mail que nunca é enviado (DoD C) — **confirma o relato do dono**
A rota `api/radar/lead/route.ts` só grava o lead no banco; não existe nenhum envio de e-mail
no funil dos radares (isso é exatamente a ISSUE-113, nunca executada). Mas a UI promete em
4 superfícies:
- `EmailCaptureRadar.tsx:169` — "Sem conta, sem spam — só o resultado no seu e-mail."
- `MaturidadeResultado.tsx:128` — "Combinado — sua interpretação chega no e-mail."
- `OportunidadesResultado.tsx:242` — "Diagnóstico enviado também para o seu e-mail."
- `/obrigado` (page + meta description) — "Sua trilha está a caminho. Enquanto o e-mail não chega…"

**Ação:** executar a ISSUE-113 (caminho preferido) OU ajustar a copy das 4 superfícies para
prometer só o que entrega (exceção do dono). O critério do DoD aceita as duas saídas.

### 2.2 Performance mobile muito abaixo do alvo (DoD H: perf ≥85)
Lighthouse mobile (localhost, throttling padrão): **home 24**, **radares 49**.
- Home: FCP 6,2s · LCP 7,0s (elemento LCP é um **parágrafo de texto** — a página espera JS/
  hydration para pintar) · TBT 1.570ms · CLS 0,217.
- Maturidade: FCP 1,5s, mas LCP 8,9s (conteúdo principal renderiza client-side) · TBT 1.390ms.

**Ressalva metodológica:** medição em `next start` local; CDN/edge da Vercel melhora rede, mas
não resolve TBT (peso de JS) nem LCP client-side. **Ação:** re-medir no deploy de preview da
Vercel; se confirmar <85 (provável), abrir issue de otimização (candidatos óbvios: hero/
conteúdo above-the-fold renderizado no servidor, reduzir JS inicial, fontes com
`display: swap`, atacar o CLS da home). Otimização de performance já é tema previsto da
Fase 1.5 — a decisão de lançar antes é exceção que o dono pode registrar.

### 2.3 Reset de senha quebrado (DoD I) — pré-existente
Bug conhecido registrado em `00b_open_questions.md` (pergunta 1): o e-mail de reset de senha
não chega (Supabase Auth → SMTP, pós-migração v3.5.2). O DoD exige o fluxo funcionando.
**Ação:** sessão separada com `/corrigir-bug` (como já registrado) OU exceção explícita do dono.

### 2.4 Privacidade não cobre a captura nova — e é inacessível para anônimo (DoD I)
`/privacidade` não menciona radares/captura nova (grep por radar|captura|lead: zero) **e**
está no grupo `(app)` — anônimo é redirecionado. Ou seja: o visitante frio que deixa nome +
e-mail + IP no radar não tem como ler a política de privacidade. Já era decisão pendente
registrada na ISSUE-101 ("tornar pública fica como decisão futura") — a captura nova torna
isso obrigação LGPD, não mais escolha.
**Ação:** issue pequena: mover `/privacidade` para `(publico)` + parágrafo sobre a captura dos
radares/lab + link no formulário de captura.

## 3. 🟡 Atenção (não travam sozinhos, mas precisam de decisão/ação do dono)

1. **SQL da `lab_leads` pendente** — `00b` (pergunta 12, 2026-07-08) diz que o dono ainda não
   rodou `ISSUE-108-sql-lab-leads.md`. Sem ele, o formulário do `/lab` retorna erro 500.
   Rodar o SQL e testar o form.
2. **Viewport bloqueia zoom** (`layout.tsx:77-78` — `maximumScale: 1, userScalable: false`).
   Penaliza a11y (Lighthouse aponta; WCAG 1.4.4). É herança 1:1 do layout antigo (ISSUE-101
   exigia equivalência), então não é regressão — mas é a única coisa entre os radares e a11y
   ~100. Mexe em `layout.tsx` (arquivo crítico) → issue própria com validação de tracking.
3. **Tags GA4 no GTM** — os 19 eventos disparam no código (verificado), mas GA4 só recebe se
   as tags/triggers existirem no container `GTM-PDJ2K5BX`. Spec dos 4 novos está no
   CURRENT-STATUS (ISSUE-111.1); confirmar também os 15 anteriores (ISSUE-109).
4. **Rotina de import CSV → Substack não documentada** (DoD C). Não existe doc com o passo a
   passo para o dono. Escrever junto com a ISSUE-113 (mesmo domínio).
5. **Embed do Substack com fundo branco** no tema escuro — configuração no painel do Substack
   (pendência registrada da ISSUE-111.1).
6. **Best practices 79** nos 3 Lighthouse: cookies de terceiros (GTM/DoubleClick — inerente a
   rodar Ads; exceção aceitável) + CLS da home (entra na issue de performance).
7. **Vetos de leitura pendentes** — ISSUE-111 (itens 3 e 5) e ISSUE-111.1 (bio + fechamento)
   seguem aguardando o dono (também são itens do DoD F).

## 4. Roteiro do dono (itens do DoD que só você consegue validar)

| # | Item (DoD) | Como validar |
|---|---|---|
| 1 | Conversão do funil legado (D) | Tag Assistant no preview: `/pre-diagnostico` completo → conversão `AW-16601345592/0K0dCMm6oo4bELjckew9` dispara + `console.log('Google Ads conversion triggered')` |
| 2 | Conversão do funil novo (D) | Radar de Oportunidades completo + e-mail → mesma conversão dispara no Tag Assistant |
| 3 | 15+4 eventos no GA4 (D) | GTM Preview: cada evento aparece no dataLayer E chega ao GA4 (exige as tags do §3.3) |
| 4 | Leads no banco (C) | Supabase: lead de teste aparece em `radar_leads` com sessão/UTMs; interesse do lab em `lab_leads` (após rodar o SQL) |
| 5 | RLS (C) | Query com anon key em `radar_leads`/`radar_sessions`/`lab_leads` DEVE falhar (método da auditoria Fase 3) |
| 6 | Radares em mobile real (B) | iPhone + Android: completar os 2 radares em <3min, voltar/refazer, viewport 360px |
| 7 | Teste dos 5 segundos (A) | Pessoa que não conhece o projeto descreve "IA aplicada ao trabalho", não "produtividade" |
| 8 | Veto de copy integral (F) | Ler toda a superfície nova (pendências da 111/111.1 incluídas) |
| 9 | PWA (H) | Instalar do build de produção, navegar até as rotas novas, hard refresh sem shell antigo |
| 10 | Plataforma logada (I) | Login → dashboard → mapa → kanban → relatórios; `/admin/assinantes` |
| 11 | Embed Substack no dark (B) | Visual da seção newsletter + configurar cores no painel Substack |
| 12 | Métrica norte (D) | Conferir no GA4/Grafana que dá para calcular visitante → lead → assinante |

## 5. ✅ O que passou (verificado nesta sessão)

**Qualidade técnica (H):** `npx tsc --noEmit` limpo · `npm run lint` sem NENHUMA ocorrência
nos arquivos novos do revamp (os erros restantes são o débito legado documentado desde a
Fase 3, incluindo os arquivos movidos `(publico)/auth` e `(publico)/pre-diagnostico`) ·
`npm run build` verde (37 páginas) · a11y 93–94 (alvo ≥90) ✓.

**Matriz rota×estado (HTTP, anônimo):** 8 públicas + 10 privadas + sitemap/robots/manifest —
todas respondem (gate das privadas é client-side no `AppShell.tsx:27-33`, herdado do
comportamento pré-revamp; redirect visual confirma no roteiro do dono item 10).

**Tracking (D):** blocos GTM idênticos à spec do doc 07 no layout (script + noscript, topo do
body) · GTM presente no HTML de todas as páginas novas · funil legado (EmailGate, ChatFlow,
api/prediag) intocado desde v3.5.3, pré-revamp (git log) · conversão do radar usa o MESMO
label, disparada só após `triggerConversion: true` vindo da sessão no banco (não forjável
pelo cliente) · 19/19 eventos da lista canônica fiados no código · honeypot + rate limit
(5/h/IP) + validação/truncamento de entrada nas rotas de lead.

**SEO (G):** title + description únicos por página pública · og:image e 1 H1 em todas ·
sitemap com as 5 URLs certas (utilitárias fora) · robots bloqueando rotas privadas e apontando
o sitemap · **Lighthouse SEO 100** nas 3 páginas medidas (alvo ≥95).

**Copy (F):** grep da lista proibida em `src/` inteiro: zero (única ocorrência é o comentário
que documenta a regra) · CTAs de intenção verificados nas superfícies novas.

**Design (E):** zero hex solto nas superfícies novas (única exceção: `RadarChartAxes.tsx`, props
SVG do Recharts que exigem literal — valores idênticos aos tokens `--ds2-text-secondary` e
`--ds2-accent-orange`; justificado) · Fraunces + IBM Plex Sans/Mono via `next/font` ✓.

**Preservados por decisão do dono (I-bis):** 4 vídeos com progressive loading (1º autoplay
muted, demais click-to-play) e arquivos presentes em `public/videos/` · pricing (R$) presente ·
"+ConverSaaS" + "ecossistema virtual" no HTML · **zero** link para `/pre-diagnostico` na home,
com a rota respondendo 200 · radares se cruzam (links verificados nos dois resultados).

**PWA (H, parte automatizável):** `/pwa/manifest.json` 200 (nome, ícones, standalone) ·
`sw.js` + workbox 200 no build de produção.

## 6. Recomendações de sequência

1. **ISSUE-113** (e-mail de trilha) — mata o bloqueador 2.1 e o item 4 do §3 (doc do CSV junto).
2. **Issue nova: privacidade pública + captura nova** (bloqueador 2.4 — pequena).
3. **`/corrigir-bug` do reset de senha** (bloqueador 2.3 — fora do revamp, sessão própria).
4. **Re-medir Lighthouse no preview Vercel** → issue de performance com os dados reais (2.2).
5. Dono roda o roteiro do §4 no MESMO preview (uma sessão de validação só).
6. Re-rodar este gate (rápido: só os itens que mudaram) → zero FALHOU → launch.
