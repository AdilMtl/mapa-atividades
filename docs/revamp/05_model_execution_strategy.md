# 05 — Estratégia de Execução por Modelos

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Contexto: dono é solo founder usando Claude Code; custo de sessão importa. A regra geral é
> **modelo forte onde errar é caro; modelo médio onde a spec já decidiu; modelo leve onde o
> risco é trivial.**

---

## 1. Papéis por classe de modelo

### Fable 5 / modelo mais forte — "arquiteto e guardião"

Usar quando o custo do erro é alto ou o critério é subjetivo e central à marca:

- decisões de arquitetura e refactors de risco (**ISSUE-101** — layout/GTM);
- a voz da marca nos momentos de pico de atenção (**ISSUE-105** resultados, **ISSUE-111**
  revisão de copy);
- revisão da tabela de pesos do radar de oportunidades (o "cérebro" — dentro da 104);
- QA final cético e gate de launch (**ISSUE-112**);
- revisão de SQL/RLS antes de ir ao dono (dentro da 106);
- decisões de fase (fechar Fase 1, priorizar 1.5) e revisão de fim de sprint.

### Sonnet / modelo intermediário forte — "engenheira de implementação"

Usar quando a spec já decidiu o quê e o como está documentado:

- DS2 em código (**ISSUE-102**), páginas de radar (**103**), motor (**104**), backend de
  captura (**106**), analytics (**109**), SEO (**110**), e-mail (**113**);
- **homepage (ISSUE-107)** — rebaixada de Fable 5 (decisão do dono, 2026-07-06): o mock
  `mockups/landing-preview-final.html` já é a spec de conteúdo aprovada (não um rascunho a
  preencher), então o trabalho que resta é engenharia (converter HTML/CSS em componentes DS2,
  plugar vídeos reais, preservar CTAs/tracking) — o caso ideal de "spec já decidiu o quê". A
  **ISSUE-111** (Fable 5) continua sendo a rede de segurança para qualquer copy nova que a
  implementação precisar escrever fora do que já está literal no mock (alt text, meta
  description, microcopy de estado vazio);
- **Fase 1B inteira (114–120)** — os restyles são o caso ideal de execução por modelo mais
  simples: a regra de ouro (visual-only), o mapa de conversão de tokens (`08` §5) e as receitas
  (`08` §3) eliminam as decisões. A **114 define o padrão** e recebe review do Fable 5; da 115
  em diante é replicação disciplinada;
- Fase 1.5 quase inteira (201–206);
- correções de bugs achados no QA.

### Modelo leve — "acabamento"

- páginas periféricas com copy pronta (**ISSUE-108**, **204**);
- ajustes de microcopy pós-revisão, variações de CTA para A/B;
- atualização de docs (CURRENT-STATUS/CHANGELOG) quando a sessão principal já descreveu o quê;
- pequenos fixes visuais de baixo risco apontados em review.

Regra prática de rebaixamento/promoção: se uma issue "leve" começar a exigir decisão de
produto, PARE e suba a issue para a classe acima em vez de deixar o modelo leve decidir.

## 2. Fable 5 como reviewer (ritual de fim de sprint)

Ao fim de cada sprint do `03_implementation_plan.md`:

1. Sessão curta com Fable 5 revisando o diff acumulado do sprint (`/code-review` no branch);
2. Checagem contra as travas: tracking, RLS, escopo excluído, voz de copy;
3. Veredito: segue / corrige antes de avançar. Registrado no CURRENT-STATUS.

Sprints e seus gates:
- Sprint 0 (101+102) → gate: conversão validada + zero regressão visual legada;
- Sprint 1 (103–106+109) → gate: radar ponta a ponta com lead no banco + eventos visíveis;
- Sprint 2 (107+108+110+113) → gate: teste dos 5 segundos + SEO auditado;
- Sprint 3 (111+112) → gate: DoD completo → autorização de launch pelo dono;
- Sprint 4 / Fase 1B (114→120) → gate por página: screenshots antes/depois + fluxo manual da
  tela intacto; review Fable 5 obrigatório na 114 (padrão) e na 116 (dashboard, tela-coração).

## 3. Como abrir sessões por issue (receita)

1. **Uma issue por sessão.** Sessões curtas e focadas batem sessões épicas.
2. Prompt de abertura sugerido:
   > `/iniciar-sessao` — Vamos executar a **ISSUE-1XX** do `docs/revamp/04_issue_backlog.md`.
   > Leia antes: `docs/revamp/README.md`, a issue completa e [trechos citados na issue].
   > Escopo excluído é vinculante. Ao final: lint + tsc + build + validação da issue,
   > depois `/finalizar-sessao` sem push (aguarda minha confirmação).
3. Branch `revamp/issue-1xx-slug`; preview da Vercel para validar; merge só após critérios de
   aceite; push na `main` = deploy (confirmação explícita sempre).
4. Issues paralelizáveis em sessões separadas: 104/105/106 (arquivos disjuntos). Não
   paralelizar duas issues que tocam `globals.css` ou `layout.tsx`.
5. Se a sessão descobrir algo que muda uma premissa: atualizar `00b_open_questions.md` na
   mesma sessão (é o contrato entre sessões).

## 4. Divisão humano × modelo (o que só o dono faz)

| Tarefa | Por quê |
|---|---|
| Executar SQL no Supabase (SQL Editor) | Método da casa (sem credencial de DB no agente) — validado na Fase 3 |
| Editar container GTM / campanhas Google Ads | Acesso e responsabilidade de mídia são do dono |
| Reabrir decisão de domínio próprio quando leads escalarem | Decisão de custo (adiada em 2026-07-05) |
| Autorização manual de assinantes pagos (Substack → authorized_emails) | Fluxo atual de pagamento/acesso |
| Veto final de copy ("cheiro de IA") | Voz é do autor |
| Autorizar push na `main` / launch | Regra da casa |
| Import CSV de leads no Substack | Operação recorrente documentada |

## 5. Nota sobre custo

O desenho acima concentra Fable 5 em ~4 issues (101, 105, 111, 112) + revisões pontuais.
O grosso do volume de código (102–104, 106–110, 113) roda em Sonnet com specs fechadas —
é onde este pacote de documentos paga o próprio custo: quanto melhor a spec, mais barato o
modelo que executa. **ISSUE-107** entrou nesse grupo em 2026-07-06 assim que o mock virou a
spec literal de conteúdo (ver §1).
