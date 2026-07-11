# ISSUE-314 — Material preparatório pra sessão do Fable 5

> Criado em 2026-07-11 (Sonnet), a pedido do dono: coletar a visão dele + grounding técnico
> ANTES de abrir a sessão de spec/copy com o Fable 5 — para a sessão começar rica, não em
> branco. Este documento é INPUT da sessão do Fable, não é a spec final (a spec final nasce da
> sessão dele com o dono, no mesmo padrão do `ISSUE-313-spec-wizard.md`).
>
> **Leia isto inteiro antes de começar a elaborar a spec.** Depois de fechada com o dono,
> registre o resultado como nova entrada em `00b_open_questions.md` (padrão da pergunta 16) e,
> se o volume justificar, um `ISSUE-314-spec-*.md` próprio.

---

## 1. Grounding técnico — o que já existe de verdade hoje

- **Esqueleto atual:** `src/app/(lab)/lab/projeto/[id]/page.tsx` — Server Component, busca
  `lab_projects` por `id` via RLS (projeto de outra pessoa → `notFound()`, já funcionando).
  Renderiza: título + badge de status, resumo do plano (rótulo "01/RESUMO DO PLANO"), lista
  numerada de etapas (rótulo "02/ETAPAS"), uma linha de classificação (tipo/família/
  complexidade). **É este esqueleto que o dono sentiu como "frio/genérico/determinístico,
  sem e-depois"** no teste de 2026-07-11.
- **Dados disponíveis** (`src/lib/lab/types.ts`):
  - `LabDiagnosis`: tipo, família, complexidade (1–5 + label), indicadores editoriais
    (potencial_ia, potencial_automacao, risco — baixo/médio/alto), pontuação por tipo,
    vencedor_bruto (o "pode evoluir para"), estimativa_maturidade.
  - `LabPlan`: resumo (string composta), `etapas[]` (4–7, cada uma `{id, titulo, descricao}`),
    `checklist[]` (espelho das etapas, `{id, label, done: boolean}` — **hoje nada muda esse
    `done`, é a 314 quem precisa fazer isso funcionar**), `artefato_sugerido` (string
    descritiva, ex. "Prompt de quatro partes salvo e testado na tarefa real"),
    `materiais_slugs[]` (aponta pra `lab_assets`, tabela que **ainda não existe** — ISSUE-316
    não começou), `generator_version`.
  - `wizard_answers` (schema v2, `WizardAnswersV2` em `types.ts`): tudo que a pessoa respondeu
    no wizard — inclui `relato` (texto livre, cor), `arquetipo`, `ambiente[]` (arsenal),
    `horas_semana`, `hipoteses_confirmadas[]`, `desempate` (registro do desempate, se houve),
    `escolha_tipo`. **Fonte principal pra personalização/"toque humano" — ver §5.**
  - Status do projeto: `rascunho → diagnosticado → planejado → em_construcao → concluido`.
    Nada avança esse campo automaticamente hoje — em aberto (ver §6, decisão delegada ao Fable).
- **Templates de plano** (`src/lib/lab/plan-generator.ts`): 9 templates determinísticos (um por
  `SolutionTypeId`), cada um com resumo + 5 etapas + artefato, na voz da newsletter (método,
  nunca promessa de app pronto). Personalização já existente: linha de fluência (real ou
  estimada), linha de arsenal (`ambiente[]`), etapa extra de diligência (dado sensível),
  etapa extra "um nível acima" (fluência alta). **`SLUGS_POR_TIPO` já é o registro canônico
  dos slugs de material por tipo — é o esqueleto que a 316 (e o conteúdo mínimo desta sessão)
  vai preencher.**
- **Dependências satisfeitas:** ISSUE-312 (motor/plano) e ISSUE-313 (wizard) — ambas entregues.
  ISSUE-315 (hub que lista projetos) e ISSUE-316 (biblioteca completa) **não existem ainda** —
  a 314 não pode depender delas.

---

## 2. Tese estratégica já registrada — não é decisão nova, é fonte primária

Documento: `docs/GPT Project Revamp/handoff_conversas_lab_fase1.md` (fonte primária do projeto,
não editar). Duas seções resolvem diretamente a pergunta que o dono trouxe nesta sessão
("o que ela extrai de valor ali, diferente de um ChatGPT?"):

**§5 — Diferença entre o Lab e um chat genérico.** O Lab não compete em inteligência geral;
diferencia-se por ser **opinionado** (caminho desenhado com método), **contextual** (parte do
perfil/rotina/problema real), **estruturado** (output vira plano/classificação/etapas/
materiais/próximos passos), **salvo** (projeto registrado, retomável), **conectado à
metodologia da marca** (ROI do Foco, 4Ds, Radar, níveis de solução, Artesanato Digital) e
**prático** (ajudar a construir, não só refletir).

**§9 — O que NÃO fazer na Fase 1** (guardrail direto pra preocupação do dono de "a pessoa sair
da plataforma"): nada de task manager completo, calendário, Kanban complexo, colaboração em
equipe, notificações, app builder automático, geração ilimitada de IA, curso completo gravado,
integrações externas (Notion/Trello/Slack/Calendar). **Isso já resolve a tensão**: a resposta
pra "manter a pessoa engajada" não pode ser construir gestão de projeto — tem que ser o
checklist simples que o `LabPlan` já modela, bem executado.

**Ligação com a home/landing:** a tese de marca (`docs/revamp/README.md` §2) é "produtividade
agora também é saber construir sistemas de trabalho melhores com IA"; a promessa da home é
"descubra onde aplicar IA no seu trabalho — e o que você pode construir com ela". A 314 é onde
essa promessa vira concreto: não é só "aqui está seu diagnóstico", é "aqui está como isso entra
solidamente na sua rotina de trabalho" — frase do próprio dono nesta sessão, ver §4.

---

## 3. Visão do dono — transcrição organizada da sessão de 2026-07-11

**Reação-alvo ao chegar na tela:** "Pô, legal, nem tava imaginando isso, mas como eu faço agora
pra colocar em prática?" — o valor é desmistificar a implementação, principalmente pra questões
mais complexas: quebrar em etapas, tirar a pessoa do "e agora?".

**Preocupação central:** "começar" o projeto pode levar a pessoa a sair da plataforma (ex.: o
plano manda "abra o ChatGPT e monte o prompt" e ela nunca mais volta). O dono quer formas de
manter a pessoa dentro — mas ele mesmo reconhece, ao ouvir o guardrail do §9, que a resposta não
é um gerenciador de tarefas completo.

**Prompts prontos como parte da entrega:** o dono quer que o Fable também atue como autor de
prompts de implementação prontos pra copiar — não só descrever o artefato (`artefato_sugerido`
hoje é só texto descritivo), mas entregar o prompt de verdade, adaptado ao tipo de solução.
Visão dele: nesta rodada isso é determinístico (Fable escreve, heurística decide qual mostrar);
uma rodada futura conecta IA real (API OpenAI, já decidido na pergunta 14 do `00b`) pra leitura
dinâmica — **isso é a ISSUE-320/321, fora do escopo desta spec**.

**Vibe Coding (curso próprio do dono):** workshop de 2h que ensina alguém sem experiência a
montar um app local usando só uma IA de janela (ex. AI Studio/Gemini). É um ativo real que
existe fora da plataforma. O dono imagina o Lab, no futuro, tanto ensinando quanto dando
workspace pra pessoa evoluir de nível — mas **decidiu nesta sessão que isso fica de fora da
314** (ver §4, decisão 6): sem construir o curso agora, só deixar a porta aberta pra referenciar
depois.

**Biblioteca (316) vs. conteúdo do curso — pergunta que ele fez direto pra mim:** minha
recomendação, aceita por ele: são coisas diferentes. A biblioteca (316, ou a versão mínima desta
sessão) é conteúdo tático genérico por tipo de material (guias de ofício curtos — "prompt de
quatro partes", "template de campos fixos" etc., já esqueletados em `SLUGS_POR_TIPO`). O curso
de Vibe Coding é um ativo maior, próprio, citado como referência futura — não confundir os dois,
não tentar encaixar o curso dentro da 314.

**Ciclo de vida:** projeto concluído fica salvo e vira um item retomável — mas a *listagem*
disso (hub) é a ISSUE-315, não a 314. O dono trouxe a ideia de uma "Fase 2 de acompanhamento"
(check-up periódico: "ajustei tal coisa", "acho que precisa melhorar isso", realimentando o
motor/diagnóstico) — **ele mesmo decidiu que isso NÃO entra nesta spec**: "acho que isso não
fica pra essa spec, fica pra outra, que a gente precisa definir mais pra frente e recomendar o
modelo". Registrar como issue nova/TBD, provavelmente também merecendo sessão de spec com
Fable (é decisão de produto, não implementação mecânica).

**Tom e ritmo — decisão forte, reaproveitando o padrão da 313:** igual ao `NotasConsultor` do
wizard (pergunta 16 do `00b`), a leitura do diagnóstico+plano deve ser **em blocos
sequenciais** — a pessoa lê um bloco, clica "avançar", o próximo se escreve, como se o
consultor estivesse falando com ela em tempo real. Motivo explícito do dono: as pessoas tendem
a acelerar/pular quando tudo aparece de uma vez (cards populados simultaneamente); o ritmo
pautado força leitura de fato. **Não é um dump estático da tela atual — é uma experiência
guiada, não um relatório.**

**Pedido explícito ao Fable (o mais importante pra não perder):** "o algoritmo tá robusto, mas
a gente precisa colocar outros elementos que dão esse toque mais humano, e o Fable precisa ter
ciência disso na hora de elaborar a spec." Isso é uma instrução de postura, não só de conteúdo:
o Fable deve ativamente procurar onde a entrega soa mecânica/genérica — mesmo em pontos que
ninguém pediu explicitamente pra revisar — e propor como reduzir essa sensação.

**Pedido explícito sobre os materiais mínimos:** extrair o máximo possível da **newsletter** e
das **respostas do wizard** (não só do tipo de solução genérico) pra dar tom conversacional/
consultor aos materiais — sempre amarrado ao mote da home: "colocar IA na sua rotina de
trabalho, de forma sólida". Palavras do dono: "essa vai ser muito da minha missão em vários
níveis dessa plataforma."

---

## 4. Decisões fechadas nesta sessão (confirmar com o dono se o Fable achar motivo pra reabrir; não são achismo meu)

1. **Materiais mínimos embutidos no plano AGORA** (guias curtos + prompts prontos por tipo de
   solução, autorados pelo Fable), sem esperar a ISSUE-316 completa (página/biblioteca de
   verdade). `SLUGS_POR_TIPO` já é o esqueleto de onde isso pendura.
2. **Checklist = marcar feito por etapa, simples.** Não é task manager, não é Kanban — guardrail
   direto do §9 do handoff. Resolve a preocupação de "sair da plataforma" dentro do limite já
   registrado do projeto.
3. **Leitura em blocos sequenciais** — extensão do `NotasConsultor`/ritmo do wizard pra dentro
   da página de resultado. Não é o layout atual (cards estáticos, rótulos "01/02").
4. **Fase 2 (acompanhamento/feedback/realimentar o motor) fica FORA desta spec.** Vira issue
   nova, TBD, provavelmente também com sessão de spec dedicada.
5. **Sem CTA de monetização/premium/curso na 314**, nem leve. Fase 1 = "premium é promessa
   visível, não entrega" (`docs/revamp/README.md` §1) — decisão do dono nesta sessão,
   reforçando a regra já registrada.
6. **Curso de Vibe Coding: zero conteúdo real agora.** Pode existir um *gancho estrutural*
   discreto no código/copy pra referenciar no futuro (ex.: um campo/slot vazio, não uma seção
   visível) — mas nada visível ao usuário nesta issue.
7. **Gatilho de mudança de status** (`em_construcao` etc.) **fica em aberto, delegado ao
   Fable** — decidir a melhor forma (automático por ação vs. botão explícito) dentro do limite
   já fechado (checklist simples).

---

## 5. Threads abertas — o dono quer liberdade real do Fable aqui, não quer amarrar demais

- **Como sinalizar "isso vai entrar na sua rotina de forma sólida"** — não é só entregar o plano
  e parar; como fechar a página com uma ideia de consolidação de hábito/rotina, sem prometer a
  Fase 2 que ainda não existe.
- **Onde a entrega hoje soa mecânica e como dar toque humano sem inventar dado que não existe.**
  Alavancas reais já disponíveis em `WizardAnswersV2` pra personalização/callback: `relato`
  (texto livre da pessoa), `arquetipo`, `ambiente[]`, `horas_semana`,
  `hipoteses_confirmadas[]`, `desempate` (se houve). Ex. de direção (não prescritiva): a página
  pode ecoar algo que a pessoa disse no wizard, em vez de só apresentar o resultado genérico do
  tipo.
- **Quanto puxar da newsletter pros materiais mínimos.** Verificar se `src/lib/radar/content.ts`
  (`CONTEUDO_OPORTUNIDADES`, já usado pelo `plan-generator.ts` para `exemploPorArea` e
  `naPratica.umNivelAcima`) já tem algum mapeamento reaproveitável, ou se precisa de curadoria
  nova a partir de posts reais da newsletter.
- **Como enquadrar o "e depois" no fechamento da página** sem prometer nada da Fase 2 ainda não
  decidida.
- **Vencedor bruto / alternativa que quase venceu** (`diagnosis.vencedor_bruto`): dado já existe
  no diagnóstico, mas não foi decidido se aparece na 314 como nota de transparência (o dono não
  confirmou isso nesta sessão — ficou claro que a frase dele era sobre outra coisa, não sobre
  isso; então é uma pergunta genuinamente em aberto, não uma decisão adiada).

---

## 6. Como abrir a sessão com o Fable

Sugestão de prompt de abertura (segue a receita do `05_model_execution_strategy.md` §3):

> `/iniciar-sessao` — Vamos fechar a spec/copy da **ISSUE-314** (`04_issue_backlog.md`).
> Leia antes: `docs/revamp/README.md`, a issue completa, e **este documento inteiro**
> (`docs/revamp/ISSUE-314-contexto-preparatorio.md` — já tem grounding técnico + a visão do
> dono coletada numa sessão de preparação, não comece do zero). Conduza como sessão de design
> (perguntas + AskUserQuestion), no mesmo espírito da pergunta 16 do `00b_open_questions.md`.
> Ao fechar, registre a spec final e passe a implementação pro Sonnet.
