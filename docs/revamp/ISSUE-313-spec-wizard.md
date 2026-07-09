# ISSUE-313 — Spec do Wizard `/lab/novo-projeto` (sessão de spec, 2026-07-09)

> **Status:** rascunho para aprovação do dono. Quando aprovado, este doc é a spec fechada —
> o Sonnet implementa a tela sob ela, sem redecidir texto nem estrutura.
> **Contrato técnico:** `WizardAnswers` v1 (`src/lib/lab/types.ts`) — os ids de campo e de
> opção estão CONGELADOS (são os mesmos do Radar de Oportunidades; matriz de pesos e analytics
> dependem deles). Esta spec decide texto, ordem, microcopy e comportamento.

---

## 1. Decisões da sessão (dono, 2026-07-09)

1. **Enquadramento:** perguntas reenquadradas para o projeto específico que a pessoa acabou de
   descrever — não repetição literal do quiz do radar. Mesmos ids, mesmas opções; muda só o
   enunciado (e apenas onde o enunciado do radar falava da rotina em geral).
2. **Campos opcionais:** os 4 do handoff §8.1.2 entram — `contexto`, `ferramentas`, `urgencia`,
   `impacto_esperado`. Todos puláveis; nenhum bloqueia a submissão.
3. **Continuidade (pedido explícito do dono):** o wizard se comporta como se "já tivesse salvo
   o que a pessoa pré-escolheu":
   - **Rascunho por passo:** cada "Continuar" persiste em `lab_projects` (`status='rascunho'`).
     Quem abandona e volta cai no passo onde parou, com tudo que respondeu pré-selecionado.
   - **Pré-preenchimento do que o sistema já sabe:** `area` vem de `lab_profiles` quando
     existir (ISSUE-317); `conforto` vem do resultado do Radar de Maturidade na sessão quando
     existir. Valor pré-preenchido aparece selecionado e editável — nunca escondido, nunca
     travado.
   - Voltar um passo nunca perde resposta.

## 2. Estrutura — 4 passos

Nome dos passos na UI (barra de progresso): **O problema · A rotina · Pessoas & dados · Ambição**.

| Passo | Campos | Obrigatórios |
|---|---|---|
| 1 — O problema | `titulo`, `problema`, `contexto` | titulo, problema |
| 2 — A rotina | `area`, `entrega`, `perda`, `frequencia` | todos |
| 3 — Pessoas & dados | `publico`, `dado`, `ferramentas` | publico, dado |
| 4 — Ambição | `desejo`, `conforto`, `urgencia`, `impacto_esperado` | desejo, conforto |

Meta herdada da issue: fluxo completo em **<3min no celular** — 8 toques de seleção + 2 campos
de texto obrigatórios; opcionais têm affordance clara de pular.

## 3. Texto das perguntas (a decisão desta spec)

Convenção: **Pergunta** é o enunciado; *apoio* é a microcopy sob o enunciado (1 linha, opcional
na UI mobile se apertar); `placeholder` só em campo de texto. Opções de múltipla escolha:
**reusar os labels do radar literalmente** (`radar/oportunidades.ts` — já revisados na
ISSUE-105); não estão repetidos aqui para não criar segunda fonte da verdade.

### Passo 1 — O problema

**Intro do passo:** "Todo projeto do Lab começa igual: um problema do trabalho real, contado
sem formalidade."

- **`titulo`** (texto curto, obrigatório, máx. 80 chars)
  Pergunta: **"Dê um nome pro projeto"**
  *apoio:* "Simples e reconhecível — é como ele vai aparecer na sua lista."
  `placeholder`: "ex.: Relatório semanal sem sofrimento"

- **`problema`** (textarea, obrigatório)
  Pergunta: **"Qual problema ou tarefa você quer resolver?"**
  *apoio:* "Conte como contaria pra um colega no corredor. O que é, o que incomoda."
  `placeholder`: "ex.: Toda segunda eu perco a manhã juntando números de 3 planilhas pra
  montar o mesmo relatório…"

- **`contexto`** (textarea, opcional)
  Pergunta: **"Quer dar mais contexto?"**
  *apoio:* "O que você já tentou, o que trava, quem se incomoda junto. Ajuda a afinar o plano."

### Passo 2 — A rotina

**Intro do passo:** "Agora o entorno: onde esse trabalho vive na sua semana."

- **`area`** (seleção única, obrigatório — opções `area_*`; pré-preenche do perfil quando existir)
  Pergunta: **"Em qual área você atua?"** *(igual ao radar — é sobre a pessoa, não sobre o projeto)*

- **`entrega`** (seleção única, obrigatório — opções `entrega_*`)
  Pergunta: **"Esse trabalho produz que tipo de entrega?"**
  *(radar: "Qual tipo de entrega você mais produz?" — reenquadrada da rotina pro projeto)*

- **`perda`** (seleção única, obrigatório — opções `perda_*`)
  Pergunta: **"Nessa tarefa, onde você mais perde tempo?"**
  *(radar: "Onde você mais perde tempo?" — ancorada na tarefa descrita)*

- **`frequencia`** (seleção única, obrigatório — opções `freq_*`)
  Pergunta: **"Essa tarefa acontece com que frequência?"** *(igual ao radar — já era ancorada)*

### Passo 3 — Pessoas & dados

**Intro do passo:** "Quem depende disso e o que entra de matéria-prima — é o que separa um
prompt de um sistema."

- **`publico`** (seleção única, obrigatório — opções `pub_*`)
  Pergunta: **"O resultado é usado por quem?"**
  *(radar: "O resultado dessa tarefa é usado por quem?" — encurtada; o contexto já é a tarefa)*

- **`dado`** (seleção única, obrigatório — opções `dado_*`)
  Pergunta: **"Que tipo de dado entra nessa tarefa?"** *(igual ao radar)*
  *apoio (só quando selecionar `dado_sensiveis`):* "Bom saber agora — o plano vai incluir uma
  etapa de diligência antes de qualquer ferramenta externa."

- **`ferramentas`** (texto livre → lista, opcional)
  Pergunta: **"Quais ferramentas você já usa nesse trabalho?"**
  *apoio:* "Excel, Notion, ChatGPT, o sistema da firma — o que for. O plano recomenda caminhos
  que cabem na sua realidade."
  Entrada: campo de texto com vírgula/Enter criando chips (grava `string[]`).

### Passo 4 — Ambição

**Intro do passo:** "Última parte: o que esse projeto precisa mudar — e o quanto você quer ir
além."

- **`desejo`** (seleção única, obrigatório — opções `desejo_*`)
  Pergunta: **"Se esse projeto der certo, o que melhora primeiro?"**
  *(radar: "O que você gostaria que melhorasse?" — reenquadrada pro resultado do projeto)*

- **`conforto`** (seleção única, obrigatório — opções `conf_*`; pré-preenche do Radar de
  Maturidade na sessão quando existir)
  Pergunta: **"Qual seu nível de conforto com ferramentas digitais?"** *(igual ao radar — é
  sobre a pessoa)*
  *apoio:* "Sem julgamento — isso calibra a complexidade do que o plano vai sugerir."

- **`urgencia`** (seleção única, opcional — valores do schema: `baixa` | `media` | `alta`)
  Pergunta: **"Isso é pra quando?"**
  Labels editoriais (valor gravado entre parênteses):
  - "Sem pressa — quero fazer direito" (`baixa`)
  - "Pras próximas semanas" (`media`)
  - "Pra ontem" (`alta`)

- **`impacto_esperado`** (textarea, opcional)
  Pergunta: **"O que muda no seu trabalho se isso sair do papel?"**
  *apoio:* "Uma frase basta. É o que a gente vai olhar depois pra saber se valeu."

### Tela de transição (submissão)

Ao concluir o passo 4: estado de processamento curto (motor é síncrono — a espera é
ergonômica, não técnica) com a frase **"Transformando seu problema em projeto…"**, então
redireciona para `/lab/projeto/[id]`. Proibido spinner genérico sem frase.

## 4. Comportamento (contrato para a implementação)

1. **Persistência:** "Continuar" de cada passo grava `wizard_answers` parcial em
   `lab_projects` (`status='rascunho'`, upsert do mesmo registro). `titulo` espelha em
   `lab_projects.title` desde o passo 1 (decisão já registrada no contrato v1).
2. **Retomada:** ao abrir `/lab/novo-projeto` com rascunho existente, oferecer retomar
   ("Continuar de onde parei") ou começar outro projeto — nunca sobrescrever silenciosamente.
3. **Submissão:** roda o motor da ISSUE-312 (`engine.ts` + `plan-generator.ts`), grava
   `diagnosis` + `plan`, muda `status` para `planejado`, redireciona pro projeto.
4. **Validação:** obrigatórios por passo (ver tabela §2); avançar só com o passo válido;
   opcionais têm ação explícita de pular. Erros na voz da casa, sem tom de sistema
   ("Falta dar um nome pro projeto" — não "Campo obrigatório").
5. **Pré-preenchimento** (§1.3): valor sugerido aparece selecionado + editável. Se a fonte não
   existir (sem perfil, sem radar na sessão), campo nasce vazio — sem chamada extra bloqueante.
6. **Componentes:** reusar o padrão `QuestionCard`/`OptionButton`/`Progress` dos radares +
   receitas do `08_diretrizes_visuais_ds2.md`. Touch ≥44px, fonte base 16px.
7. **API:** rotas `api/lab/projects` (criação/atualização de rascunho, submissão) com sessão
   `@supabase/ssr` — RLS `auth.uid()` já cobre o isolamento (ISSUE-310).
8. **Analytics:** evento de início e de conclusão do wizard ficam na ISSUE-318 (não implementar
   tracking aqui — só não impedir).

## 5. Fora do escopo (tão vinculante quanto o resto)

- Entrevista complementar com IA (Fase 1B, ISSUE-321) — nenhum campo de chat livre.
- Página do projeto (ISSUE-314), hub (315), perfil (317).
- Qualquer mudança em `engine.ts`/`plan-generator.ts` — se a tela pedir mudança no motor,
  parar e reabrir a conversa (provável schema_version 2, nunca editar o v1).
- Tracking GTM (ISSUE-318).

## 6. Critérios de aceite (herdados da issue + doc 13 §8)

- Fluxo completo cria projeto `planejado` e redireciona para `/lab/projeto/[id]`.
- Abandono no meio preserva rascunho; retomada cai no passo certo com respostas marcadas.
- Mobile <3min; touch ≥44px; os 4 passos navegáveis com voltar sem perda.
- `tsc`/lint/build limpos; zero mudança em rotas públicas.
