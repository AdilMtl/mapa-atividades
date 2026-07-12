# ISSUE-320 — Material preparatório pra sessão do Fable 5

> Criado em 2026-07-11 (Sonnet), a pedido do dono: coletar a visão dele + grounding técnico
> ANTES de abrir a sessão de spec/arquitetura com o Fable 5 — para a sessão começar rica, não em
> branco. Mesmo padrão do `ISSUE-314-contexto-preparatorio.md`. Este documento é INPUT da sessão
> do Fable, não é a spec final (a spec final nasce da sessão dele com o dono).
>
> **Leia isto inteiro antes de começar a elaborar a spec.** Depois de fechada com o dono,
> registre o resultado como `ISSUE-320-spec-infra-ia.md` e devolva a implementação pro Sonnet
> (321/322 replicam o padrão que a 320 fixar aqui — ver §5 do `04_issue_backlog.md`).

---

## 1. Grounding técnico — o que já existe de verdade hoje

- **Zero infra de IA no projeto.** Confirmado por busca no código: nenhuma dependência OpenAI no
  `package.json`, nenhuma env var `OPENAI_*` em uso, nenhuma rota `/api/lab/ai/*`. A 320 começa
  de uma folha em branco — não é integração incremental em cima de algo que já existe.
- **Motor do Lab é 100% puro e determinístico até aqui** (`src/lib/lab/engine.ts`,
  `plan-generator.ts`, `wizard-flow.ts`) — sem rede, sem IA, mesma regra do motor do radar.
  A 320 é o primeiro código do projeto inteiro que fala com um provedor de IA externo.
- **Tipos já modelam os campos que a IA vai alimentar** (`src/lib/lab/types.ts`):
  - `WizardAnswersV2.relato` (texto livre, "nas tuas palavras") — já documentado no código como
    "insumo do slot de IA da 1B". É o principal input pra qualquer entrevista/resumo.
  - `LabDiagnosis` e `LabPlan` são hoje 100% determinísticos (motor de regras) — a 1B *enriquece*
    esses objetos, não os substitui. `generator_version`/`engine_version` já existem como campo
    de auditoria — a 320 provavelmente precisa de um equivalente pra rastrear qual chamada de IA
    gerou o quê (nome do modelo, versão do prompt).
- **Padrão de segurança das rotas do Lab** (`src/app/api/lab/projects/[id]/route.ts`, ISSUE-313/
  314): 3 camadas em toda rota — sessão via cookie (`obterUsuarioSessao`), gate
  (`verificarAutorizacao` contra `authorized_emails`), RLS via cliente da própria sessão (nunca
  `service_role`). Qualquer rota nova de IA (320/321) deve seguir o mesmo padrão — é convenção
  já estabelecida, não decisão nova.
- **Sem tabela de telemetria hoje.** O schema SQL do Lab (`ISSUE-310-sql-lab.md`) tem só
  `lab_profiles`, `lab_projects`, `lab_assets` — nenhuma tabela de uso/custo de IA existe. Se a
  320 decidir persistir telemetria, é tabela nova (ou SQL adicional), não uma coluna que já
  espera por isso.
- **Pergunta 14 já fechada** (`00b_open_questions.md`, 2026-07-09): "IA da Fase 1B usa a API da
  OpenAI (o dono só tem chave OpenAI), com modelo barato — supera a suposição original de Claude
  API do doc 13." Não é decisão nova, é ponto de partida.

---

## 2. Tese estratégica já registrada — não é decisão nova, é fonte primária

Documento: `docs/GPT Project Revamp/handoff_conversas_lab_fase1.md` (fonte primária, não editar).

**§12 — Uso da IA** (a seção mais direta pra esta issue):
> "A IA deve ser usada de forma controlada e econômica."

Onde usar IA (handoff): gerar perguntas complementares · resumir o problema do usuário ·
classificar/justificar a classificação · gerar plano inicial · sugerir próximos passos ·
recomendar materiais · gerar artefatos em Markdown.

Onde usar regras simples (continua sendo regra, não IA): limites de acesso · estados do projeto
· tipos de solução · filtros da biblioteca · checklists fixos · progresso de etapas · controle
premium/free.

> Diretriz literal do handoff: **"Não usar IA onde regras simples resolvem. Usar IA apenas onde
> existe ganho claro de personalização, síntese ou orientação."**

**§3 — Entrevista complementar com IA** (o consumidor imediato da 320, é a 321):
> "Depois do wizard inicial, o sistema usa IA para fazer de 3 a 5 perguntas complementares...
> Importante: a IA não deve ficar aberta como chat genérico. Ela deve atuar dentro de um fluxo
> controlado."

**§15 — Fase 1B, critério de sucesso:**
> "A IA melhora o resultado sem transformar a experiência em chat genérico."

Isso é o mesmo guardrail que já apareceu na sessão de prep da 314 (§9 do handoff: nada de chat
aberto, nada que vire gestão de projeto/engajamento artificial) — só que agora aplicado à camada
técnica: a 320 é a peça que torna esse guardrail **impossível de violar por acidente** nas
issues seguintes (321/322), não só uma promessa de copy.

---

## 3. Visão do dono — transcrição organizada da sessão de 2026-07-11

**Sobre a chave da OpenAI:** o dono já sabe como gerar a chave, mas está remoto agora e não vai
configurá-la nesta sessão. Decisão: a chave é configurada como env var **na Vercel** (não em
`.env.local`) — preferência explícita dele por segurança. **Isso não bloqueia a spec nem a
implementação de código** — só significa que a spec precisa deixar instruções claras de setup
(nome da env var, onde configurar) pro dono aplicar depois, e o código precisa assumir que a
var existe em produção sem travar o build/dev se estiver ausente localmente.

**Sobre qual modelo usar e o orçamento:** o dono não tem um teto de custo definido, mas foi
específico sobre a filosofia: quer um modelo que **"pensa o suficiente pra dar uma resposta ok"**
com **custo por chamada baixo** — cogitou um tier barato do GPT-5. Raciocínio dele, importante
preservar: o uso por pessoa é de **baixa frequência** (poucas chamadas por projeto, não é uso
recorrente tipo chat) — "se ela for assinante isso vai ser centavos". Ou seja, o teto certo não é
"o modelo mais barato que existe", é "um modelo capaz o suficiente, dentro de um número de
chamadas por projeto que se mantém baixo por design" (os 3–5 da entrevista, não aberto).

**Guardrail dele, nas próprias palavras:** "não quero algo que seja... uso recorrente, virar um
ChatGPT em outro lugar. Ele não deve desviar o foco." — reforça o §3/§15 do handoff (fluxo
controlado, nunca chat genérico) e conecta com a tese de marca do projeto inteiro (ROI do
Foco: a ferramenta não pode competir por atenção, tem que devolver foco).

> ⚠️ **Nota do Sonnet, a verificar na sessão do Fable:** o dono citou "GPT-5" de memória, sem
> confirmar o nome exato do tier/modelo nem o pricing atual. Meu conhecimento também tem corte de
> treinamento — **não travar um nome de modelo na spec sem checar a documentação oficial de
> pricing da OpenAI no momento da sessão** (ver memória do projeto: nunca afirmar characteristics
> de plataforma terceira por analogia/memória). Isso é literalmente o tipo de decisão que serve
> pra um modelo mais "caro"/capaz como o Fable 5 resolver bem: pesquisar o line-up atual e propor
> o tier certo dentro da filosofia acima.

---

## 4. Escopo desta issue especificamente — o que a 320 entrega vs. o que fica pra depois

A 320 é **infraestrutura**, não feature. Ela não implementa a entrevista complementar em si (isso
é a 321) nem o plano enriquecido (322) — ela constrói o alicerce que as duas vão consumir.

**Dentro do escopo da 320:**
- SDK da OpenAI instalado e configurado (env var, cliente server-only — nunca exposto ao browser).
- Um mecanismo reutilizável de chamada estruturada (schema/formato de saída previsível — não
  texto livre solto) que 321 e 322 possam ambos consumir.
- Fallback gracioso genérico: o que acontece quando a chamada de IA falha, estoura timeout, ou
  a chave não está configurada — mecanismo reaproveitável (321/322 decidem o TEXTO do fallback
  de cada feature, a 320 decide o MECANISMO de detectar e sinalizar a falha).
- Telemetria mínima: registrar tokens/custo por chamada (mesmo que a UI de visualização disso
  seja só da 323 depois) — decidir agora onde isso é persistido evita retrabalho.
- Limite de uso (rate limit) — mecanismo, não a régua exata de free/premium (isso é 1C).

**Fora do escopo (fica pra 321/322/323):**
- A UI e o fluxo da entrevista complementar (321).
- A UI do plano enriquecido + export Markdown (322).
- Dashboard/relatório de custo pro dono (323 — mas os dados que ela vai ler nascem aqui).

---

## 5. Decisões fechadas na sessão de preparação de hoje (2026-07-11, com o dono)

- **Forma da rota — FECHADA:** rota dedicada por feature (321 tem a sua, 322 tem a dela), ambas
  chamando a mesma lib/helper de IA por baixo (`chamarIA()`) — não uma rota genérica multi-modo
  única. Motivo: essa escolha é **invisível pra quem usa o Lab** (não muda nada da experiência
  da pessoa) — é só organização interna do código. Optei pelo padrão mais fácil de auditar (cada
  feature com seu próprio arquivo de rota, contrato de entrada específico), evitando gastar
  decisão do Fable numa escolha de baixo risco/baixo impacto. Se o Fable achar motivo forte pra
  mudar, pode revisitar — mas não precisa nascer como pergunta aberta.
- **Número de chamadas/regeneração na entrevista (321) — dono confirmou deixar em aberto pro
  Fable decidir**, junto com o resto do desenho de UX da entrevista.

---

## 6. LGPD e privacidade — achado importante desta sessão (dono pediu pra registrar)

O dono trouxe um ponto que **muda o escopo da 320**: qualquer dado enviado pra OpenAI é dado
compartilhado com um terceiro/subprocessador, e isso precisa respeitar a LGPD.

**O que verifiquei na documentação oficial da OpenAI (`openai.com`, não fontes de terceiros —
ver alerta do §3 sobre a busca de pricing que *não* confio):**
- Desde março/2023, dados enviados pela API **não são usados pra treinar modelos da OpenAI por
  padrão** (opt-in seria necessário pra isso, e não é o caso aqui).
- A OpenAI pode reter inputs/outputs da API **por até 30 dias** pra prover o serviço e detectar
  abuso, e depois remove — a menos que exigido legalmente reter por mais tempo.
- Existe opção de **Zero Data Retention (ZDR)** pra endpoints elegíveis, se o caso de uso
  qualificar — vale a pena o Fable checar se o endpoint que a 320 vai usar é elegível.

**Conflito real que precisa ser resolvido antes do 321 (que envia dado de verdade, não só a
320):** a página `/privacidade` hoje (`src/app/(publico)/privacidade/page.tsx:174`) diz, na
seção que já cobre dados do Lab: *"Nunca vendemos ou compartilhamos com terceiros."* Isso deixa
de ser verdade no momento em que `wizard_answers.relato` (texto livre da pessoa) começa a ser
enviado pra OpenAI processar — mesmo sem treino e com retenção curta, ainda é compartilhamento
com um terceiro. **Essa frase precisa ser atualizada** (disclosure do subprocessador OpenAI,
nos moldes do que a OpenAI já documenta sobre uso/retenção) antes da 321 ir ao ar — não é
bloqueante pra 320 (que é só infra, sem dado real de usuário ainda), mas é dependência dela.
**Registrar como requisito explícito da spec, não como observação solta.**

**Recomendação técnica pra 320 (meu palpite, o Fable pode refinar):** a telemetria própria do
projeto (`lab_ai_usage` ou equivalente) deveria guardar só metadados (tokens, custo, modelo,
tarefa, timestamp, `fonte: ia|fallback`) — **nunca o conteúdo do prompt/resposta**. O texto de
verdade já vive em `lab_projects` (fonte única); duplicar em uma tabela de telemetria só
aumenta a superfície de dado pessoal armazenado sem necessidade, contra o princípio de
minimização da LGPD.

**Fica como thread aberta pro Fable/dono:** o texto exato da atualização da `/privacidade` é
decisão de copy/jurídica, não técnica — meu papel aqui foi só levantar o conflito e a base
técnica (política real da OpenAI), não escrever o texto novo da página.

---

## 7. Definição de valor da 321/322 — o que efetivamente sai do genérico (fechado nesta sessão, 2026-07-11)

Escopo de PRODUTO das issues 321/322, não da 320 — mas registrado aqui porque informa decisões
de ARQUITETURA da 320 (o helper `chamarIA()` precisa suportar os formatos de saída que essas
ideias exigem, não só o caso mais simples).

**Critério de aceite proposto e confirmado pelo dono ("é exato"):** o plano enriquecido precisa
conseguir citar algo que só existe porque a pessoa respondeu a entrevista — não pode sair
indistinguível do plano genérico da 314. Se não dá pra apontar essa frase no resultado, a
entrevista não entregou valor. Essa é também a régua mais concreta pra 323 (medição da 1B —
"IA melhora sem virar chat").

**Guardrail reforçado pelo dono nesta sessão, nas próprias palavras:** "a plataforma não vai
codificar, não vai fazer nada" — reforça o §9 do handoff (nada de app builder automático). Todo
o valor entregue pela IA aqui é em **conhecimento, orientação e articulação**, nunca em "fazer a
solução pela pessoa". Isso limita o formato de saída esperado: texto consultivo (diagnóstico,
justificativa, plano, prompts prontos), nunca código gerado nem execução de tarefa.

**Duas direções novas trazidas pelo dono — FECHADAS na sessão de arquitetura de 2026-07-11:**

1. **"Ajudar a pessoa a vender isso" → pitch interno de justificativa de valor.** Confirmado
   pelo dono: é um texto que a pessoa pode literalmente usar pra explicar pra outras pessoas
   (chefe/time) por que está fazendo esse projeto — **ancorado na tese de fundo da newsletter**:
   "a proposta sempre foi você ser promovido, receber salário maior — e se você não sabe
   explicar o valor do que fez, como vai ser reconhecida?". Isso não é um nice-to-have de copy,
   é o fio que conecta o Lab à proposta de carreira da marca inteira. **Vira artefato novo do
   plano enriquecido** (não uma expansão do `artefato_sugerido` existente, que é sobre o
   "como construir" — este é sobre "como comunicar o porquê"): um texto curto, pronto pra
   reutilizar, tipo "por que isso importa" / "o que isso resolve pra você e pro time".
2. **"Elevar cada uma das alternativas que surgiram" → notas curtas por alternativa.**
   Confirmado pelo dono (opção recomendada): poucas linhas por alternativa, dentro da mesma
   tela — nunca um plano completo paralelo. Usa `vencedor_bruto` (e as 2 alternativas já
   mostradas na proposta assistida da 313) como base, personalizando com o que a pessoa
   escreveu. Mantém o guardrail "não é task manager" da 314.

**Consequência pra arquitetura da 320:** desenhar o contrato de entrada/saída do `chamarIA()`
pensando em mais de uma "tarefa" desde o início (não só `entrevista` e `plano_enriquecido`
genéricos — possivelmente também `justificativa`/`pitch` e `alternativas_enriquecidas`), em vez
de hardcoded pra um único formato de resposta.

---

## 8. Threads abertas — decisões genuínas pro Fable, não travar antes da sessão

- **Nome exato do modelo/tier da OpenAI** e confirmação de pricing atual (ver nota de alerta
  no §3 acima — pesquisar, não assumir; a busca que eu fiz veio de fontes não confiáveis).
- **Onde persistir telemetria:** tabela nova (`lab_ai_usage` ou similar, só metadados — ver §6)
  vs. campo em `lab_projects`. Tabela nova é mais auditável e alinhada com `engine_version`/
  `generator_version`, mas é decisão de schema — SQL precisa ser gerado com cuidado igual ao da
  ISSUE-310.
- **Estratégia de retry/timeout** — quantas tentativas, timeout de quantos segundos antes de cair
  no fallback.
- **Número exato de chamadas de IA permitidas por projeto** — cinto de segurança técnico contra
  abuso (ex.: N chamadas/projeto/dia), separado da decisão de produto da regeneração (já fechada
  como aberta pro Fable, §5).
- **Como o cliente sabe que uma resposta é fallback vs. IA de verdade** — importa pro 321/322
  não fingirem personalização que não rolou.
- **Atualização da `/privacidade`** (texto de disclosure do subprocessador OpenAI — ver §6).
- **As duas direções de valor do §7** (pitch/"vender" e alternativas enriquecidas) — confirmar
  sentido exato com o dono antes de especificar formato/artefato.

---

## 9. Como abrir a sessão com o Fable

Sugestão de prompt de abertura (segue a receita do `05_model_execution_strategy.md` §3):

> `/iniciar-sessao` — Vamos fechar a spec de arquitetura da **ISSUE-320** (`04_issue_backlog.md`,
> Fase 1B). Leia antes: `docs/revamp/README.md`, a issue completa, a seção 12 do
> `docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`, e **este documento inteiro**
> (`docs/revamp/ISSUE-320-contexto-preparatorio.md` — já tem grounding técnico + a visão do dono
> coletada numa sessão de preparação, não comece do zero, **incluindo o achado de LGPD do §6 —
> a `/privacidade` precisa de disclosure novo antes da 321 ir ao ar — e a definição de valor do
> §7, com duas direções ainda em aberto pra confirmar direto com o dono**). Antes de travar o
> modelo/tier da OpenAI, **verifique o line-up e pricing atuais na documentação oficial** — não
> assuma pelo nome que o dono citou de memória (a busca feita na preparação veio de fontes não
> confiáveis, ver §3). Conduza como sessão de design/arquitetura (perguntas + AskUserQuestion)
> pros pontos do §8, começando pelas duas direções de valor do §7 antes de desenhar o contrato
> técnico. Ao fechar, registre a spec final como `ISSUE-320-spec-infra-ia.md` e passe a
> implementação pro Sonnet.
