# Revamp Conversas no Corredor / +ConverSaaS — Documento Central

> Criado em 2026-07-05. **Comece por aqui** se você (pessoa ou modelo) está entrando no revamp.
> Idioma de trabalho: português (Brasil). Regras gerais do repositório: `CLAUDE.md` (raiz).

---

## 1. Visão em um parágrafo

O Conversas no Corredor deixa de ser "newsletter de produtividade com landing page" e passa a
ser **newsletter (motor editorial) + laboratório prático (site/app)** para profissionais
corporativos que querem descobrir onde aplicar IA no trabalho real e aprender a transformar
problemas em soluções digitais — com repertório, julgamento e sem hype. A Fase 1 reposiciona o
site e converte tráfego frio em audiência qualificada para a newsletter por meio de duas
experiências interativas (Radar de Maturidade e Radar de Oportunidades). O premium (Lab) é
promessa visível, não entrega.

## 2. Síntese estratégica (dos 5 documentos-fonte)

- **Tese:** "Produtividade agora também é saber construir sistemas de trabalho melhores com IA."
- **Proposta de valor:** "Descubra onde aplicar IA no seu trabalho — e o que você pode construir com ela."
- **Público prioritário Fase 1:** profissional corporativo frio vindo de busca paga (analista →
  gerente), pragmático, já exposto a IA, sem repertório de construção.
- **Conversão-fim da Fase 1:** assinatura da newsletter (grátis) + lista de interesse do Lab.
- **Diferencial:** método e julgamento (4Ds, Fluência em IA, Artesanato Digital) — nunca
  ferramenta da semana, nunca hype.
- **Prova da Fase 1:** tráfego frio interage com uma ferramenta simples, recebe clareza e aceita
  continuar pela newsletter.

## 3. Fases

| Fase | Objetivo | Status |
|---|---|---|
| **1 (1A) — Reposicionamento + aquisição** | Home nova (com demo da plataforma e pricing), 2 radares, captura de e-mail, newsletter integrada, Lab "em breve", SEO básico, analytics | ← estamos aqui (planejada) |
| **1B — Plataforma logada no DS2** | Redesign visual (lógica intocada) de AppShell, auth, dashboard, diagnóstico, plano de ação, kanban, relatórios/perfil/config/admin — ISSUES 114–120 | logo após (ou em paralelo ao) launch público |
| **1.5 — Instrumentação + refinamento** | A/B de hero/CTAs, welcome emails, segmentação por origem, performance, acessibilidade, migração de campanhas, plano de melhoria Google Ads | depois do launch |
| **2 — Valor de produto** | Wizard "Que solução devo construir?", níveis de solução, Builder Canvas, PRD Kit, área premium inicial, decisão Stripe | após validar aquisição |
| **3 — Ecossistema / Lab** | Trilha Artesanato Digital, biblioteca de casos, playbooks por área, App Readiness Checklist, miniapps, base B2B | futura |
| **4 — Evolução contínua** | Novas features como produto progressivo (issues por domínio) | contínua |

## 4. Escopo da Fase 1 (o que ENTRA)

1. Fundação técnica: root layout server-first + Metadata API (pré-requisito de SEO).
2. Design System v2 no código: Dark Editorial Atelier (tokens, fontes Fraunces/IBM Plex,
   componentes base) — receitas prontas em `08_diretrizes_visuais_ds2.md`.
3. Homepage reposicionada (hero: "Você já usa IA. Agora falta descobrir onde ela realmente
   melhora seu trabalho."), **preservando** a demo da plataforma (4 vídeos) e o pricing.
4. `/radar/maturidade` — 7 perguntas, scoring, 5 níveis (Curioso → Referência).
5. `/radar/oportunidades` — 8 perguntas, árvore de decisão, 9 tipos de solução.
6. Captura de e-mail pós-resultado (valor antes do e-mail, sempre) + backend service_role + RLS.
7. `/newsletter`, `/lab` (lista de interesse), `/obrigado`.
8. SEO básico (metadata por página, sitemap, robots, OG) + eventos de analytics (GTM + Supabase).
9. Copy 100% na voz da newsletter (ver §7). Marca: **"+ConverSaaS"**, sempre como "o
   ecossistema virtual da newsletter Conversas no Corredor". Spec visual da home decidida:
   `mockups/landing-preview-final.html` (híbrido A+C, ver doc 09).
10. **Fase 1B:** redesign visual DS2 de toda a plataforma logada (ISSUES 114–120; lógica
    intocada — regra de ouro no topo da seção Fase 1B do backlog).

## 5. Escopo FORA da Fase 1

Login novo, dashboard de usuário, pagamento/Stripe (fluxo direto mapeado na ISSUE-305, para
depois), comunidade, IA generativa aberta para visitante, gerador de PRD, biblioteca premium,
curso, gamificação, chat com IA — e qualquer mudança de LÓGICA na plataforma logada (o visual
dela muda na Fase 1B; o comportamento não) ou no funil `/pre-diagnostico` (backstage: no ar,
sem links na home nova, reformulação futura).

## 6. Mapa dos documentos

| Documento | O que contém |
|---|---|
| [`00_problem_definition.md`](00_problem_definition.md) | Problema, usuário, hipótese, critérios de sucesso |
| [`00b_open_questions.md`](00b_open_questions.md) | 9 perguntas/conflitos + premissas assumidas (leia antes de decidir qualquer coisa) |
| [`01_product_spec_faseada.md`](01_product_spec_faseada.md) | Jornadas, IA de páginas, features por fase, critérios de aceite |
| [`02_technical_spec.md`](02_technical_spec.md) | Stack detectada, arquitetura, dados, scoring, SEO, riscos técnicos |
| [`03_implementation_plan.md`](03_implementation_plan.md) | Sequência, dependências, QA, rollback |
| [`04_issue_backlog.md`](04_issue_backlog.md) | Issues executáveis por fase (formato padrão) |
| [`05_model_execution_strategy.md`](05_model_execution_strategy.md) | Qual modelo executa o quê, como abrir sessões |
| [`06_definition_of_done.md`](06_definition_of_done.md) | Checklist de conclusão da Fase 1 |
| [`07_mapa_tracking_ads.md`](07_mapa_tracking_ads.md) | Inventário autoritativo dos marcadores Google Ads/GTM + regras de preservação (ler antes de tocar em layout/funil) |
| [`08_diretrizes_visuais_ds2.md`](08_diretrizes_visuais_ds2.md) | Caderno de receitas visuais do DS2 — tokens literais, componentes, mapa de migração do tema legado, proibições (ler antes de QUALQUER issue de UI) |
| [`09_direcoes_landing.md`](09_direcoes_landing.md) | Comparação das 3 direções de landing (A/B/C) + protótipos em `mockups/` — a escolha do dono vira a spec da ISSUE-107 |

**Fontes primárias** (não editar, são insumo): `docs/GPT Project Revamp/`
— `conversas_corredor_fase1_estrategico_v2.md` (estratégia), `conversas_corredor_fase1_execucao_ctas_fluxos_v2_cmo_br.md`
(copy/CTAs/fluxos/perguntas/scoring — **é o playbook operacional**), `benchmark_estrategico_conversas_no_corredor.md`
(mercado/modelos), `contexto_editorial_newsletter_conversas_no_corredor.md` (tom de voz — **obrigatório para qualquer copy**),
`conversaas_design_system_v1_final.md` (visual — **decisão oficial**).

## 7. Princípios de copy (resumo operacional)

- CTAs verbalizam a intenção do usuário ("Quero ver minhas oportunidades"), nunca a função
  ("Cadastre-se", "Saiba mais").
- Proibido: "domine", "revolucione", "desbloqueie", "o futuro chegou", "10x", superlativo de guru.
- Vocabulário proprietário: trabalho real, repertório, julgamento, fluência em IA, 4Ds,
  Artesanato Digital, IA que cabe na empresa, sem hype, construir soluções, ativos digitais.
- Tom: conversa de corredor corporativo — direto, levemente provocativo, brasileiro, com
  exemplos concretos ("dentro da firma", "pega teu café"). Densidade sem jargão.
- Estrutura narrativa herdada da newsletter: tensão → contraste → conceito → exemplo → pergunta.
- Teste do cheiro: se a frase poderia estar em qualquer landing de curso de IA, reescreva.

## 8. Princípios de design (resumo operacional)

- Direção oficial: **Dark Editorial Atelier** (fundo verde-escuro profundo `#0A1412`/`#08110F`,
  painéis `#1B3F39`, texto `#F8F0E6`, laranja `#D97706` herdado + magenta `#D34C75` novo,
  gradiente laranja→magenta como acento).
- Tipografia: **Fraunces** (títulos/tese), **IBM Plex Sans** (interface), **IBM Plex Mono**
  (labels/badges/metadados).
- Grid técnico sutil (34px, linhas a 2,8% de alpha) em hero e áreas de ferramenta — nunca em tudo.
- Sensação: laboratório editorial + app prático. Proibido: robôs, circuitos, cérebros, neon
  ciano/roxo, glassmorphism excessivo, SaaS frio.
- Mobile-first: touch ≥ 44px, fonte base 16px (herdado do projeto — continua valendo).

## 9. Princípios técnicos (resumo operacional)

- Stack preservada: Next.js 15 App Router + React 19 + TS + Tailwind v4 + Supabase + Vercel.
- Fase 1 sem LLM em runtime: formulários, scoring, árvores de decisão, resultados pré-escritos.
- **Tracking intocável:** GTM `GTM-PDJ2K5BX` + conversão `AW-16601345592` (EmailGate). Qualquer
  mudança em `layout.tsx` ou no funil exige validar o disparo antes de commitar.
- Build valida TS mas NÃO lint → rodar `npm run lint` e `npx tsc --noEmit` manualmente.
- Push na `main` = deploy em produção. Trabalhar em branch; push só com confirmação do dono.
- Tabelas novas/alteradas: RLS service_role-only para dados de lead (padrão v3.5.3); views com
  `security_invoker = true`. SQL executado pelo dono via SQL Editor (método da auditoria Fase 3).
- Documentação da casa continua obrigatória: `docs/CURRENT-STATUS.md` + `docs/CHANGELOG.md` a
  cada entrega relevante.

## 10. Como executar issues deste revamp

1. Abra a sessão com `/iniciar-sessao` (carrega contexto e persona).
2. Leia este README + a issue no `04_issue_backlog.md` + os trechos das fontes primárias citados nela.
3. Confira em `00b_open_questions.md` se alguma premissa relevante mudou.
4. Implemente APENAS o escopo da issue (escopo excluído é sagrado).
5. Valide: `npm run lint`, `npx tsc --noEmit`, `npm run build`, fluxo manual da feature e — se
   tocou em layout/funil — o disparo de conversão.
6. Feche com `/finalizar-sessao` (docs + commit; push só com confirmação).
