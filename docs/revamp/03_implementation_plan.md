# 03 — Implementation Plan (Fase 1)

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Issues referenciadas: `04_issue_backlog.md`. Uma issue = uma sessão de trabalho, em regra.

---

## 1. Princípios de execução

1. **Alicerce antes de fachada:** layout/DS antes de páginas; motor antes de radares.
2. **Produção nunca fica quebrada:** cada merge na `main` é deployável; features novas nascem
   em rotas novas (invisíveis até serem linkadas na home — a home nova é a ÚLTIMA peça visível).
3. **Tracking é sagrado:** toda issue que toca `layout.tsx` ou fluxo de lead termina com
   validação de disparo (GTM preview / Tag Assistant) ANTES do merge.
4. **Branch por issue** (`revamp/issue-1xx-slug`), preview da Vercel para validar, push na
   `main` só com confirmação do dono.
5. **Docs da casa:** CURRENT-STATUS + CHANGELOG a cada sessão (regra existente do projeto).

## 2. Sequência e dependências

```text
Sprint 0 — Fundação + go-live visual da home (⚠️ sequenciamento revisado, dono, 2026-07-05)
  ISSUE-101 layout server-first + route groups      ← desbloqueia SEO e páginas públicas
  ISSUE-102 Design System v2 (tokens+fontes+ds2/)   ← desbloqueia toda UI nova
  ISSUE-107 homepage nova                            ← depende SÓ de 102 agora; CTAs de
                                                        diagnóstico apontam TEMPORARIAMENTE
                                                        para /pre-diagnostico (funil legado);
                                                        preserva "Já sou assinante" → /auth
                                                        (é o "fase zero" pedido pelo dono:
                                                        reskin visual já com o funil que hoje
                                                        converte, sem esperar os radares)

Sprint 1 — Experiência interativa (rotas novas, ainda não linkadas na home)
  ISSUE-104 motor de assessment (lib/radar)          ← depende de 102
  ISSUE-105 conteúdo dos resultados (14 blocos)      ← paralelo a 104
  ISSUE-103 páginas /radar/* com RadarFlow           ← depende de 104+105
  ISSUE-106 backend captura (SQL→dono, rotas API)    ← paralelo, depende só de 101
  ISSUE-109 analytics (helper + eventos)             ← depende de 103
  ISSUE-107B retargeting dos CTAs p/ os radares      ← depende de 103+104+105+107; troca o
                                                        destino temporário pelo definitivo

Sprint 2 — Periferia e mensagem
  ISSUE-108 páginas /newsletter, /lab, /obrigado     ← depende de 102
  ISSUE-110 SEO (metadata, sitemap, robots, OG)      ← depende de 101, fecha com 107
  ISSUE-113 e-mail de trilha                         ← infra Resend já funciona (00b, resp. 1)

Sprint 3 — Endurecimento e lançamento público
  ISSUE-111 revisão de copy integral (voz editorial) ← depende de tudo visível
  ISSUE-112 QA integral + validação de conversão     ← gate de launch
  [dono: campanhas novas de Ads apontando p/ rotas novas — fora do código]

Sprint 4 — FASE 1B: redesign DS2 da plataforma logada (2º resultado visual crítico)
  ISSUE-114 AppShell (sidebar/nav)                   ← define o padrão; review Fable 5
  ISSUE-115 /auth                                    ← porta de entrada do assinante
  ISSUE-116 /dashboard (mapa)                        ← tela-coração; sessão dedicada
  ISSUE-117 /diagnostico   · ISSUE-118 /plano-acao   ← sessões separadas (arquivos grandes)
  ISSUE-119 /painel-semanal (kanban)                 ← testar drag em touch real
  ISSUE-120 /relatorios + /perfil + /configuracoes + /admin
```

O Sprint 4 pode começar em paralelo aos Sprints 1/2/3 em sessões separadas (arquivos disjuntos
das issues públicas), desde que 101+102+114 estejam mergeadas — 114 primeiro sempre, porque
define o padrão que 115–120 replicam. O launch público completo (Sprint 3) NÃO espera o
Sprint 4: aquisição nova não depende do restyle logado; mas o dono definiu os dois como
resultados visuais críticos, então o Sprint 4 vem logo depois (ou em paralelo), antes de
qualquer item da Fase 1.5.

Regra de paralelismo: 104/105/106 podem rodar em sessões separadas simultâneas (não tocam nos
mesmos arquivos). 101 e 102 são sequenciais entre si? Não estritamente — 102 mexe em
`globals.css`/`lib`, 101 em `app/` — mas recomendo 101 primeiro para 102 já aplicar fontes no
layout server.

## 3. O que implementar primeiro e por quê

**ISSUE-101 é a primeira** porque: (a) toda página nova nasceria bloqueada pelo gate atual;
(b) sem ela não há Metadata API e o SEO da Fase 1 morre; (c) é a mudança mais arriscada
(layout + GTM) — melhor fazê-la isolada, com QA dedicado, do que embutida numa issue de página.

**A homepage foi ANTECIPADA para o Sprint 0** (decisão do dono, 2026-07-05 — revisão da
sequência original, que a colocava por último). Antes: "a homepage é a peça mais visível, então
espera os radares ficarem prontos para linkar tudo de uma vez". Agora: o dono prefere ver o
reposicionamento visual no ar o quanto antes, mesmo que por baixo dos panos o botão de
diagnóstico ainda leve ao `/pre-diagnostico` de sempre. Isso é seguro porque o funil por trás
não muda nada (mesmo `EmailGate`, mesma conversão) — só a casca visual troca. Quando os radares
ficarem prontos (fim do Sprint 1), a **ISSUE-107B** faz o swap dos `href` — pequeno, mecânico,
sem tocar em visual.

## 4. O que deixar para depois (Fase 1.5+), explicitamente

- Testes A/B (hero B/C/D, CTAs, captura) — precisa de tráfego e baseline primeiro.
- Sequência de 4 e-mails de nutrição (doc operacional §15) — priorizar depois do baseline.
- Domínio próprio + revisão de deliverability — reabrir quando o volume de leads escalar
  (decisão do dono, 2026-07-05).
- Landing âncoras por cluster de campanha (§17) — depois do message match básico provar.
- `/comece-aqui` e `/sobre` — desejáveis, não bloqueiam a prova da Fase 1.
- Redirect/aposentadoria do `/pre-diagnostico` — a página segue no ar (sem link nomeado na
  navegação, sem virar destino permanente depois que a ISSUE-107B rodar); reformulação e
  migração de campanhas só depois, com dados.
- Reformulação do conteúdo/fluxo do pré-diagnóstico em si — fase futura (decisão do dono).
- Lint cosmético e upgrade jspdf/next-pwa — dívidas pré-existentes, fora do revamp.

(Nota: a migração VISUAL da plataforma logada, antes listada como "Fase 2+", foi PROMOVIDA
para a Fase 1B por decisão do dono em 2026-07-05 — ver Sprint 4.)

## 5. Plano de validação (por tipo de entrega)

| Entrega | Validação |
|---|---|
| Refactor layout (101) | Matriz rota × estado (anônimo/logado) em preview; GTM preview com conversão de teste no funil ATUAL; PWA build+start; Lighthouse antes/depois |
| DS2 (102) | Página-vitrine interna temporária (`/radar/maturidade` serve de cobaia); contraste AA nos pares de cor |
| Motor (104/105) | Tabela de casos: cada combinação-limite de respostas → resultado esperado (revisão pelo modelo forte + dono) |
| Radares (103) | Fluxo completo mobile real (iPhone + Android), voltar/refazer, resultado correto |
| Captura (106) | Lead aparece em `radar_leads` (dono confere no Supabase); RLS verificada com anon key (deve falhar); rate limit |
| Analytics (109) | Cada evento visível no GTM preview E na tabela do Supabase; UTMs propagadas |
| Home (107) | Teste dos 5 segundos com pessoa real; message match com anúncios rascunhados; CTAs de diagnóstico levam ao `/pre-diagnostico` e disparam a conversão de sempre |
| Home — retarget (107B) | Clicar nos CTAs de diagnóstico leva aos radares; grep por `/pre-diagnostico` em `components/home/` retorna zero |
| SEO (110) | Rich Results Test, sitemap acessível, robots correto, titles únicos |
| QA final (112) | Roteiro integral + conversão do funil atual re-validada + Lighthouse ≥ alvos |

## 6. Plano de QA (gate de launch — resumo da ISSUE-112)

1. `npm run lint` + `npx tsc --noEmit` + `npm run build` verdes.
2. Roteiro manual: 2 radares completos × 2 dispositivos × com/sem e-mail.
3. Funil legado `/pre-diagnostico` completo com e-mail do dono (conversão dispara).
4. Login de assinante → dashboard → kanban (plataforma intacta).
5. PWA: build+start, instalação, navegação para rotas novas.
6. Tag Assistant: conversão + 15 eventos novos.
7. Leitura de copy integral pelo dono (veto de tom).

## 7. Plano de rollback

- **Antes do merge:** tudo vive em branch + preview da Vercel — rollback = não mergear.
- **Pós-deploy:** Vercel *Instant Rollback* para o deployment anterior (1 clique) OU
  `git revert` do merge commit + push (regra da casa: commits pequenos e isolados por issue
  tornam o revert cirúrgico — mesmo método da Fase 2 da modernização).
- **Banco:** tabelas novas são aditivas (nenhum ALTER em tabela existente na Fase 1) → rollback
  de código nunca quebra o banco. SQLs têm seção "reverter" ao serem entregues ao dono.
- **Home:** a home antiga fica no histórico git; um revert do commit da ISSUE-107 restaura o
  funil antigo integralmente (EmailGate/preDiag intocados por design).
- **Campanhas:** como a migração de Ads é manual e posterior, reverter código não estraga mídia.

## 8. Como evitar quebrar o site atual (checklist permanente por PR)

- [ ] Nenhum arquivo de `api/prediag/*`, `EmailGate.tsx`, `ChatFlow.tsx` alterado (a menos que
      a issue diga explicitamente).
- [ ] Snippet GTM byte-idêntico (diff visual no PR).
- [ ] Rotas legadas respondem 200 no preview (lista no roteiro de QA).
- [ ] `tsc --noEmit` limpo (build já falha, mas rodar antes economiza ciclo).
- [ ] Sem segredo em código/doc; `.env.local` intocado no git.
- [ ] CURRENT-STATUS/CHANGELOG atualizados na sessão que fecha a issue.

## 9. Compatibilidade com o design system

- Páginas novas: exclusivamente tokens DS2 (CSS vars + `components/ds2/`). Proibido hex solto.
- Páginas legadas: continuam no DESIGN_TOKENS v1 — nenhuma migração na Fase 1 (evita regressão
  visual em produto pago).
- Ponto de contato único: `globals.css` define os dois conjuntos de variáveis sem colisão de
  nomes (`--ds2-*` prefixo se necessário).
- O `.html` de referência (`conversaas_design_system_v1_final.html`) é protótipo visual — vale
  como referência de aparência, não como código a copiar.
