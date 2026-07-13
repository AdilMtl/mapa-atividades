# ISSUE-314D — Material preparatório pra sessão do Fable 5

> Criado em 2026-07-12 (Sonnet), mesmo padrão da `ISSUE-314-contexto-preparatorio.md`: grounding
> técnico ANTES de abrir a sessão de spec com o Fable 5. **Este documento é INPUT da sessão do
> Fable, não é a spec final.** A diferença desta vez: a 314 teve uma sessão de design inteira com
> o dono antes da spec; a 314D nasceu de UMA frase dele na sessão da 314B (2026-07-11), registrada
> na pergunta 18 do `00b_open_questions.md` — não existe "visão do dono" extensa pra transcrever
> aqui. A sessão do Fable com o dono PRECISA cobrir esse terreno do zero; este documento só evita
> que ela comece sem saber o que já existe no código.

---

## 1. Grounding técnico — o que já existe de verdade hoje

- **A citação original do dono** (sessão de design da 314B, 2026-07-11): ao marcar uma etapa, a
  pessoa poderia registrar uma evidência do que fez ("um exemplo, mini questionário, alguma coisa
  assim") — um mini-gate entre as fases, "como se fosse um desenvolvimento mesmo". E ao concluir
  o projeto, poder compartilhar o que construiu e os resultados. É só isso que está documentado —
  nenhum detalhe de formato, obrigatoriedade ou destino do compartilhamento foi discutido.
- **O gate que já existe e é o encaixe natural:** `src/components/lab/projeto/BlocoCaminhada.tsx`
  — botão "fechei essa fase" (`onFecharFase`, linha ~196) fecha a etapa atual e a próxima abre
  sozinha. Hoje ele só marca `done: true` no checklist via PATCH. Qualquer gate de evidência
  pendura AQUI — antes de `onFecharFase` chamar `onToggle`, não em tela separada.
- **A API hoje** (`src/app/api/lab/projects/[id]/route.ts`): PATCH tem 4 modos mutuamente
  exclusivos (`rascunho`, `finalizar`, `checklistItem`, `concluir`). O modo `checklistItem`
  (linha ~165) só aceita `{id, done}` — vocabulário fechado, valida contra os ids que já existem
  no `plan.checklist`. Um campo de evidência precisaria entrar nesse mesmo modo (ou um modo novo)
  com a mesma disciplina: nunca aceitar payload arbitrário do cliente.
- **Onde a evidência moraria:** `lab_projects.plan` é JSONB (`docs/revamp/ISSUE-310-sql-lab.md`).
  `LabChecklistItem` (`src/lib/lab/types.ts`) hoje é só `{id, label, done}`. Duas rotas possíveis,
  sem decisão tomada:
  1. Estender `LabChecklistItem` com um campo opcional (`evidencia?: string` ou similar) — sem
     SQL novo, mesmo padrão JSONB versionado que o projeto já usa.
  2. Tabela própria (`lab_project_evidence` ou similar) — mais estruturado, permite tipos de
     evidência mais ricos (anexo, link) no futuro, mas é SQL novo (roteiro da ISSUE-310: dono
     roda no painel, sem credencial de banco circulando na sessão).
  A escolha depende de quão rico o Fable/dono quer que a evidência seja — texto curto cabe no
  JSONB; qualquer coisa com upload de arquivo empurra pra tabela própria + Storage do Supabase
  (que o projeto ainda não usa em lugar nenhum).
- **"Compartilhar ao concluir" já tem uma pista de sinergia registrada:** a issue cita a
  **ISSUE-322** (export Markdown do plano enriquecido por IA, Fase 1B) como possível base —
  "avaliar ordem". A 322 ainda não foi implementada (depende da 320/321, infra de IA, cuja spec
  fechou nesta mesma sessão em `ISSUE-320-spec-infra-ia.md`, mas sem código ainda). Se
  "compartilhar" virar prioridade antes da 322, a 314D precisa de export próprio, não emprestado.
- **Dependência declarada no backlog:** `**Dep.:** 314B` — já satisfeita (314B concluída em
  2026-07-12, v3.11.16). Nada bloqueia tecnicamente o início desta issue.

---

## 2. Tese estratégica já registrada — não é decisão nova, é fonte primária

Mesmo guardrail que fechou a 314 (`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md` §9):
**nada de task manager completo, calendário, Kanban complexo, colaboração em equipe,
notificações.** A tensão específica desta issue, já nomeada no backlog (`04_issue_backlog.md`,
ISSUE-314D): **evidência OBRIGATÓRIA vira burocracia e bate direto nesse guardrail** — cada "fechei
essa fase" viraria um formulário a preencher, na contramão de tudo que a 314B acabou de resolver
("segue no teu ritmo", gate de 1 clique). A spec precisa decidir **onde a evidência é convite (o
dono pode adicionar se quiser, o gate não trava sem ela) e onde é gate de verdade** (se é que em
algum ponto faz sentido travar).

**Sinergia citada no backlog, ainda não avaliada:** "Fase 2 de acompanhamento" (check-up
periódico pós-conclusão, mencionada pelo dono na sessão da 314 e explicitamente adiada — ver
`ISSUE-314-contexto-preparatorio.md` §3/§4). A 314D pode ser o início natural dela ou pode ser
independente — **pergunta em aberto pro Fable levar ao dono**, não decisão já tomada.

---

## 3. A tensão central — o que a spec precisa resolver

Não há visão do dono suficiente pra responder isso sem uma sessão de verdade. As perguntas que a
sessão do Fable precisa cobrir, na ordem que fazem sentido:

1. **Evidência é obrigatória, opcional, ou depende da fase?** Ex.: opcional em todas, ou
   obrigatória só na última etapa (mais perto do "resultado real")?
2. **Que formato de evidência?** Texto livre curto (cabe no JSONB, zero SQL novo) é o caminho de
   menor atrito; qualquer coisa com anexo/imagem exige tabela + Storage novos — vale o custo pra
   Fase 1A, ou fica pra depois?
3. **"Mini questionário" (palavra do próprio dono) — o que ele quis dizer?** Pode ser 1-2
   perguntas fechadas por tipo de solução (ex.: "funcionou de primeira?" sim/não), mais barato de
   construir e mais fácil de agregar depois (Fase 2) do que texto livre.
4. **Compartilhar ao concluir — pra onde?** Dentro da própria plataforma (ex.: um card bonito na
   página do projeto), export (Markdown/PDF, sinergia com a 322), ou link público
   (implica RLS/URL pública nova — peso técnico maior)? Rede social é hipótese razoável dado o
   público-alvo (LinkedIn corporativo), mas não foi mencionado pelo dono — não presumir.
5. **Isso é o início da "Fase 2 de acompanhamento" ou uma feature isolada?** Se for o início,
   vale desenhar pensando em reaproveitar (evidência por etapa → base pro check-up futuro). Se
   for isolada, mais simples de cortar pequeno agora.

---

## 4. Como abrir a sessão com o Fable

Sugestão de prompt de abertura (mesma receita da 314, `05_model_execution_strategy.md` §3):

> `/iniciar-sessao` — Vamos fechar a spec da **ISSUE-314D** (`04_issue_backlog.md`). Leia antes:
> `docs/revamp/README.md`, a issue completa, e **este documento inteiro**
> (`docs/revamp/ISSUE-314D-contexto-preparatorio.md`). Diferente da 314: aqui só existe UMA frase
> do dono registrada, não uma visão completa — conduza como sessão de design de verdade (perguntas
> + AskUserQuestion), cobrindo as 5 perguntas da seção 3 antes de propor qualquer estrutura. Ao
> fechar, registre a spec final (novo `ISSUE-314D-spec-*.md` ou entrada em `00b_open_questions.md`)
> e passe a implementação pro Sonnet.
