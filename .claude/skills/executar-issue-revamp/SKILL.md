---
name: executar-issue-revamp
description: Executa uma issue específica do backlog de revamp do +ConverSaaS (docs/revamp/04_issue_backlog.md). Use quando o usuário disser "executa a issue X", "bora fazer a issue-10X", "próxima issue do revamp", "continua o revamp", ou pedir para avançar no plano de reposicionamento/landing/radares. Carrega todo o contexto da issue antes de codar, trava o escopo e roda a validação específica dela — feito para minimizar re-steering.
---

# Executar Issue do Revamp

Este projeto tem um plano de revamp inteiro documentado em `docs/revamp/` (README, definição do
problema, specs, backlog de issues, diretrizes visuais, direção de landing aprovada). Cada issue
já vem com objetivo, contexto, escopo incluído/excluído, arquivos prováveis, dependências,
critérios de aceite e riscos — o trabalho desta skill é **carregar isso de verdade** antes de
codar, não redecidir nada que já foi decidido.

## Passo 1 — Identificar a issue

- Se o usuário deu o número (ex.: "issue-103"), use-o diretamente.
- Se não deu, leia `docs/revamp/04_issue_backlog.md` e `docs/revamp/03_implementation_plan.md`
  para achar a próxima issue elegível: a primeira, em ordem de sprint, cujas **Dependências**
  já estejam marcadas como concluídas. Proponha ao usuário antes de começar.
- Confira `git log` / `docs/CURRENT-STATUS.md` para ver se essa issue já foi iniciada em sessão
  anterior (evita retrabalho ou duplicidade).

## Passo 2 — Carregar o contexto obrigatório (sempre, nesta ordem)

1. `docs/revamp/README.md` — visão geral, princípios de copy/design/técnicos, travas.
2. O texto completo da issue em `docs/revamp/04_issue_backlog.md`.
3. `docs/revamp/00b_open_questions.md` — confira se alguma premissa relevante à issue mudou.
4. Documentos referenciados **pela própria issue** (ela sempre aponta): `01_product_spec_faseada.md`,
   `02_technical_spec.md` e/ou `03_implementation_plan.md` conforme o "Contexto" da issue citar.

## Passo 3 — Carregar contexto condicional (conforme o tipo da issue)

- **Qualquer issue de UI/página/componente:** leia `docs/revamp/08_diretrizes_visuais_ds2.md`
  (receitas visuais — tokens, componentes, proibições) INTEIRO antes de escrever CSS/JSX. Nada
  de hex ou espaçamento inventado.
- **Qualquer issue que toque a home ou seções dela:** leia `docs/revamp/09_direcoes_landing.md`
  e abra `docs/revamp/mockups/landing-preview-final.html` no navegador — é a spec pixel-a-pixel.
- **Qualquer issue que toque `layout.tsx`, o funil de lead ou analytics:** leia
  `docs/revamp/07_mapa_tracking_ads.md` INTEIRO e siga o checklist de validação do fim dele.
  Isso é inegociável — tracking quebrado é a pior regressão possível neste projeto.
- **Issues da Fase 1B (114–120, restyle da plataforma logada):** releia a "regra de ouro" no
  topo da seção Fase 1B do backlog — é 100% visual, zero mudança de lógica/dados/estado.

## Passo 4 — Confirmar escopo antes de codar

Em 2–3 frases, diga ao usuário:
- o que a issue entrega (Objetivo);
- o que fica de fora (Escopo excluído) — isso é tão vinculante quanto o que entra;
- qualquer dependência que pareça não satisfeita ainda (ex.: a issue pede componentes do DS2
  mas a ISSUE-102 não foi implementada) — **pare e avise** em vez de assumir ou recriar.

## Passo 5 — Implementar

- Siga os "Arquivos prováveis" da issue como guia, não como camisa de força.
- Reaproveite o que issues anteriores já criaram (componentes `ds2/*`, `lib/radar/*` etc.) —
  não recrie.
- Copy: sempre na voz da newsletter (ver `README.md` §7) — nunca traduzida de briefing em inglês.
- Design: sempre pelas receitas do `08_diretrizes_visuais_ds2.md` — nunca "parecido".

## Passo 6 — Validar (os critérios são da issue, não genéricos)

```bash
npm run lint
npx tsc --noEmit
npm run build
```
Depois, execute **exatamente** os itens listados em "Critérios de aceite" da issue (fluxo
manual, mobile, Lighthouse, Tag Assistant etc. — cada issue lista os seus). Se a issue tocou
layout/funil, rode também o checklist do `07_mapa_tracking_ads.md`.

## Passo 7 — Fechar a issue

- Marque no `docs/revamp/04_issue_backlog.md`, logo abaixo do cabeçalho da issue, uma linha
  `**Status:** ✅ concluída em AAAA-MM-DD` (ou `⚠️ parcial — <o que falta>` se não fechou tudo).
- Se a sessão revelou uma decisão nova ou mudou uma premissa, atualize
  `docs/revamp/00b_open_questions.md` na hora (não deixe para depois).
- Sugira `/finalizar-sessao` para documentar e commitar.

## Regras

- Nunca expanda o escopo além do "Escopo incluído" sem perguntar — mesmo que pareça óbvio ou
  rápido. Se achar que falta algo, proponha como issue nova, não como extra desta.
- Nunca pule os docs condicionais do Passo 3 quando aplicáveis — eles existem porque decisões
  de design/tracking já foram tomadas e não devem ser redecididas por issue.
- Nunca commite/pushe aqui — isso é papel da `/finalizar-sessao`.
- Se a issue depender de outra ainda não feita, diga isso claramente e pare (não implemente a
  dependência "de brinde" sem alinhar).
