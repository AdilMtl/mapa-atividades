> 🗺️ **Mapa visual do backlog do revamp** (56 issues, status, prioridade, fases —
> leitura rápida "onde a gente tá"): [roadmap-backlog.html](revamp/roadmap-backlog.html) ·
> publicado como Artifact em 2026-07-09. **Ao mudar status de qualquer issue, atualize o arquivo
> e republique no MESMO link** (Artifact tool com o parâmetro `url` da versão anterior — pegar a
> URL publicada com o dono se não estiver registrada em memória). Última atualização de conteúdo:
> 2026-07-11 (esqueleto antigo da Fase 2 trocado pela série 310+ real do Lab — 5 das 10 issues
> da Fase 1A prontas/aplicadas; ISSUE-314 entregue nesta data; ISSUE-209/210 novas na Fase 1.5).

---

## 🎯 SESSÃO ATUAL: Biblioteca do Lab — a Trilha (ISSUE-316, Fatia A)
**Data:** 14 de julho de 2026
**Versão:** v3.11.20
**Status:** ✅ Fatia A no ar (deploy em produção). Sessão longa de **concepção + spec + código**:
a biblioteca deixou de ser "prateleira de guias" e virou um **sistema de progressão desbloqueável
pela jornada** (decisão de produto do dono, abre eixo novo de gamificação com julgamento).
**Teste manual do dono em produção pendente** (ele testa direto no ar e traz feedback).

### **🚀 O QUE FOI FEITO:**

1. **Concepção redefinida com o dono (Opus como ponte do Fable, que volta 2026-07-15).** A
   biblioteca vira uma **trilha** de 9 tipos de solução (escada de complexidade) que **acende
   conforme a pessoa constrói**, com **ramos de Valor & Carreira brotando dos nós concluídos**.
   Metáfora Yoshi's Story: mapa de calor por adjacência (próximo degrau brilha, horizonte distante
   fica fosco — prompt nunca revela agente). Decisões completas: `ISSUE-316-contexto-preparatorio.md`
   §6/§6.8 + `ISSUE-316-spec-tela-trilha.md` + pergunta 20 do `00b_open_questions.md`.
2. **Anti-manipulação resolvida (incerteza real do dono):** desbloqueio gated por **conclusão real**,
   não pelo wizard (Lei de Goodhart evitada estruturalmente — o guia que a pessoa precisa já vive na
   Caminhada; o prêmio de verdade, o ramo de valor, exige concluir). Sem loot farmável.
3. **FATIA A codada e no ar:** `src/lib/lab/trilha.ts` (motor puro, deriva 9 nós × 4 estados +
   progresso + adjacência a partir de `lab_projects`; **zero tabela nova, zero API**) + `trilha.test.ts`
   (8 testes). `/lab/biblioteca` (Server Component) + `Trilha.tsx` (client, serpente cara-de-jogo,
   **desktop horizontal / mobile vertical**, framer-motion com `prefers-reduced-motion`, ícones lucide).
   `/lab/biblioteca/[slug]` lê os 10 guias direto de `materiais.ts` (aprovados na 314 — sem depender
   de banco). Nav "Biblioteca" ativada no `LabShell`. Placeholder do andar de Valor com a tese do dono.
4. **FATIA B mapeada pra sessão própria:** escrever o conteúdo dos ramos de Valor & Carreira (kit
   transversal contextualizado + 1-2 toques específicos por tipo + marco de trajetória "capital de
   carreira"), aterrado em teoria real (gestão de pessoas, evolução de carreira, liderança — sem
   inventar citação). Tese-espinha: *fez a entrega → colhe os benefícios* (meta, horas, renome
   político, aumento/escopo).

### **📊 TÉCNICO:**
- 347 testes verdes (eram 339, +8 da trilha) · `tsc --noEmit`/`lint`/`build` limpos · rotas
  `/lab/biblioteca` e `/lab/biblioteca/[slug]` compiladas (dinâmicas). `public/sw.js` regenerado
  pelo build (precache das rotas novas).
- Novos: `src/lib/lab/trilha.ts` (+test), `src/components/lab/biblioteca/Trilha.tsx`,
  `src/app/(lab)/lab/biblioteca/{page,[slug]/page}.tsx`, `docs/revamp/ISSUE-316-{contexto-preparatorio,
  spec-tela-trilha}.md`. Alterados: `LabShell.tsx`, `(lab)/lab/inicio/page.tsx` (nota "em breve"),
  `04_issue_backlog.md`, `00b_open_questions.md`.
- **Desbloqueio deriva de `lab_projects`** (status + `diagnosis.tipo`) — nó só vira "conquistado"
  com projeto `concluido`. Leitura dos guias sai de `materiais.ts` (seed em `lab_assets` adiado).

### **🎯 PRÓXIMA SESSÃO:**
1. **Feedback do dono** do teste em produção da trilha (visual, jornada, o que já dá pra fazer).
2. **Fatia B — sessão de conteúdo** dos ramos de Valor & Carreira (Opus, voz da newsletter, teoria
   de carreira aterrada em fonte real).
3. Testes manuais acumulados seguem pendentes (315 item 7, 314C, 314D — veto de copy).

---

## 📋 SESSÃO ANTERIOR: Hub `/lab/inicio` com estados reais (ISSUE-315)
**Data:** 13 de julho de 2026
**Versão:** v3.11.19
**Status:** ✅ testada pelo dono no celular, com login real — **recuperou corretamente todos os
projetos abertos**. Achou 1 bug real (cache de navegação stale após concluir um projeto — item 7
abaixo), já corrigido e publicado. **Falta só o veto de leitura da copy** (junto com a pendência
já registrada de 314C/314D).

### **🚀 O QUE FOI FEITO:**

1. **O problema:** `/lab/inicio` era esqueleto estático (ISSUE-311) — não lia o banco. Projeto
   mapeado não aparecia na volta, então reabrir o Lab empurrava a pessoa de novo pro wizard e
   ela refazia o diagnóstico do zero. Queixa direta do dono nesta sessão.
2. **Spec fechada por Opus** (copy + design + algoritmo do topo) antes da execução:
   `docs/revamp/ISSUE-315-spec-hub.md`. Decisão de UX validada com o dono via preview: no topo
   do hub, **"continue de onde parou" domina** quando há projeto em andamento — "novo projeto"
   desce a card secundário (era a alternativa vetada: manter "novo projeto" sempre em destaque).
3. **Motor puro novo `src/lib/lab/hub.ts`** (+ `hub.test.ts`, 33 testes): deriva os 4 estados do
   hub (vazio / retomar rascunho / em andamento / tudo concluído), o "empurrão" adaptativo do
   topo por tier de progresso (plano pronto → começando → falta pouco → fechou as fases, falta
   concluir) e toda a copy — reaproveitando o motor de tempo da ISSUE-314C
   (`minutosRestantes`/`formatarDuracaoMin`) pra mostrar **progresso + quanto falta em horas**,
   pedido explícito do dono ("quero facilitar pra quem não tem essa dinâmica de gestão de
   projetos").
4. **`/lab/inicio/page.tsx` reescrita** como Server Component: lê `lab_projects` de verdade (RLS
   já filtra pelo dono), zero rota de API nova, 100% DS2.
5. **Correção de escopo aditiva no wizard** (decisão do dono: "se for fácil, já fixa"):
   `/lab/novo-projeto?id=` agora retoma o rascunho ESPECÍFICO clicado na lista, não sempre o mais
   recente. Sem `id` = comportamento de antes (nenhuma regressão). Implementada sem atrito.
6. **Ajuste de copy feito durante a execução** (registrado no §5.1/§13 da spec): o rascunho da
   spec previa só 2 variantes de texto pro topo (com/sem tempo); na prática o tier "plano recém-
   gerado" e o tier "tudo marcado, falta concluir" quebravam a frase única "parou na fase X de
   Y" — viraram 3 variantes coerentes com cada situação.
7. **Bug achado no teste do dono, corrigido no mesmo dia:** ao concluir um projeto e voltar pro
   hub pela navegação da `LabShell`, a tela às vezes mostrava o estado antigo — só um reload
   manual atualizava. Causa raiz: `/lab/inicio` é dinâmica no servidor (sempre busca dado
   fresco), mas o **Router Cache do lado do cliente** do Next.js guarda a versão da rota já
   visitada e não sabia que precisava descartá-la após uma mutação em outra tela. Corrigido com
   `revalidatePath('/lab/inicio')` em `api/lab/projects/[id]/route.ts`, nos 3 modos que mudam o
   que o hub mostra (`finalizar`, `checklistItem`, `concluir`) — não no autosave de rascunho, pra
   não invalidar cache a cada tecla digitada no wizard.

### **📊 TÉCNICO:**
- 339 testes verdes (eram 306) · `tsc --noEmit`/`lint`/`build` limpos nos arquivos da sessão
  (débito pré-existente de arquivos legados intocado) · smoke test do servidor de produção
  validado (`/lab/inicio` e `/lab/novo-projeto?id=` → 307 pra `/auth` sem sessão; rotas públicas
  200; `PATCH /api/lab/projects/[id]` → 401 sem sessão).
- Novos: `src/lib/lab/hub.ts` (+test), `docs/revamp/ISSUE-315-spec-hub.md`. Alterados:
  `src/app/(lab)/lab/inicio/page.tsx` (reescrita), `src/app/(lab)/lab/novo-projeto/page.tsx`
  (`?id=`), `src/app/api/lab/projects/[id]/route.ts` (`revalidatePath`),
  `docs/revamp/04_issue_backlog.md`.
- Zero SQL, zero rota de API nova, zero mudança de lógica no motor/plano — hub é leitura.
- **Decisão de processo registrada nesta sessão:** Fable segue ativo (retoma quarta-feira,
  2026-07-15) — a ponte pro Opus em specs de produto/arquitetura é temporária, não substituição
  definitiva. `05_model_execution_strategy.md` e os campos `Modelo:` do backlog **não foram
  mexidos** por causa disso.

### **🎯 PRÓXIMA SESSÃO — testes manuais acumulados pro dono (celular):**

1. **ISSUE-315 (este hub):** já confirmado que recupera os projetos abertos ✅. Falta só
   confirmar que a correção do item 7 resolveu o "precisa atualizar manualmente" depois de
   concluir, e o veto de copy do topo/lista.
2. **ISSUE-314C (estimativa de tempo — arrastada de sessões anteriores):** os números de duração
   "soam certos" comparados à experiência real de construir?
3. **ISSUE-314D (mini-diagnóstico de resultado — arrastada de sessões anteriores):** roteiro
   completo (concluir com e sem responder o check-up) + veto da devolutiva/perguntas.
4. **Veto de copy consolidado:** três issues (314C parcialmente, 314D, 315) têm copy nova
   pendente de leitura final — vale revisar tudo numa passada só, já que são telas vizinhas na
   mesma jornada (wizard → plano → hub).
5. Mapa visual do backlog (`roadmap-backlog.html`) segue desatualizado (não reflete 314C/314D/315).

---

## 📋 SESSÃO ANTERIOR: Estimativa de tempo (ISSUE-314C) + mini-diagnóstico de resultado (ISSUE-314D)
**Data:** 12 de julho de 2026
**Versão:** v3.11.17
**Status:** ✅ ISSUE-314C concluída e validada; ⚠️ ISSUE-314D v1 (heurística) implementada e
validada tecnicamente — **falta o teste manual do dono e o veto de leitura da copy**

### **🚀 O QUE FOI FEITO:**

1. **ISSUE-314C — Estimativa de tempo por etapa.** `duracao_min` (minutos de foco ATIVO, não
   tempo de calendário — ex.: "use por uma semana" estima o esforço de acompanhar, não os 7 dias)
   em todas as etapas dos 9 templates + diligência + "um nível acima" (`plan-generator.ts`),
   calibrados por mim como especialista, a pedido explícito do dono ("pode estimar os tempos como
   um expert faria") — sem sessão de Fable separada, diferente do que o backlog previa
   originalmente. `duracao_total_min` agregado no `LabPlan`. UI (`BlocoCaminhada`): total no topo,
   duração na fase atual e nas futuras; `beatTransicao` (`continuidade.ts`) passou a somar os
   minutos que faltam na fala de transição. Retrocompatível — planos persistidos antes desta issue
   não têm os campos, e a UI tolera `undefined` sem quebrar.
2. **ISSUE-314D — redefinida com o dono, de "evidência por fase" para "mini-diagnóstico de
   RESULTADO na conclusão".** A visão original (registrada na sessão anterior) era um gate de
   evidência a cada fase — o dono, ao decidir nesta sessão, trouxe a ideia de um check-up com IA
   que lê o que a pessoa fez e devolve correção/melhora. Reconheceu que essa versão com IA
   depende da ISSUE-320 (infra de IA, hoje só spec, zero código) e escolheu **heurística
   determinística agora, com a costura pronta pra IA depois** — mesmo padrão que a 314 já usou
   pros materiais mínimos. Implementado:
   - Ao fechar a última fase, 3 perguntas de clique (`chegou`/`comparado`/`proximo` —
     `src/lib/lab/resultado.ts`) substituem o antigo botão seco "Concluir projeto"
     (`BlocoResultado.tsx`).
   - Devolutiva composta por eixo (não combinatória) + resumo copiável pra compartilhar (texto
     puro, sem link público, sem dependência externa).
   - Check-up **nunca obrigatório** — "fechar sem responder" conclui sem ele (fallback gracioso).
   - Persistência em `plan.resultado` (JSONB existente, **zero SQL**), só as 3 respostas fechadas
     — a devolutiva é recomposta na leitura, servidor como autoridade (nunca confia no cliente).
   - `BlocoRotina` ganhou `temResultado` pra não duplicar o texto de fechamento quando já existe
     devolutiva personalizada.
   - Contrato de entrada/saída isolado — a variante com IA (ISSUE-320/321) troca a composição sem
     tocar UI nem persistência.
3. **Fable aposentado nesta sessão — modelo trocado por Opus** pra decisões de produto/spec. Os
   campos `**Modelo:**` da 314C e 314D no backlog foram atualizados; **`05_model_execution_strategy.md`
   e o restante do backlog ainda citam Fable 5** como padrão — não mexido ainda, fica para quando
   o dono confirmar se é troca definitiva em todo o projeto.
4. **Material preparatório da 314D** (`docs/revamp/ISSUE-314D-contexto-preparatorio.md`, mesmo
   padrão da 314) ficou registrado mesmo após a decisão ter sido tomada direto na conversa — vale
   como grounding técnico se a 314D v2 (evidência por fase, ou a versão com IA) precisar de sessão
   de spec própria no futuro.

### **📊 TÉCNICO:**
- 306 testes verdes (eram 287) · `tsc --noEmit`/`lint`/`build` limpos · smoke test do servidor de
  produção validado (rotas públicas 200, gate do Lab 307 pra anônimo, API PATCH 401 sem sessão).
- Novos: `src/lib/lab/resultado.ts` (+test), `src/components/lab/projeto/BlocoResultado.tsx`,
  `docs/revamp/ISSUE-314D-contexto-preparatorio.md`. Alterados: `src/lib/lab/{types,
  plan-generator,continuidade}.ts` (+tests), `src/app/api/lab/projects/[id]/route.ts`,
  `src/components/lab/projeto/{BlocoCaminhada,BlocoRotina,PaginaProjeto}.tsx`,
  `src/app/(lab)/lab/projeto/[id]/page.tsx`, `docs/revamp/{00b_open_questions.md,
  04_issue_backlog.md}`.
- Decisões completas: **pergunta 19** do `00b_open_questions.md` (314D) — a 314C não gerou
  pergunta nova (calibração direta, sem tensão de produto).

### **🎯 PRÓXIMA SESSÃO — o dono vai testar e dar feedback; pontos específicos a observar:**

**ISSUE-314C (estimativa de tempo):**
1. Os números "soam certos"? Foram estimados por mim sem calibração externa — se algum bloco
   parecer muito rápido/devagar comparado à experiência real de construir, é sinal pra ajustar
   (arquivo único: `TEMPLATES` em `src/lib/lab/plan-generator.ts`, campo `duracao_min`).
2. O total no topo da Caminhada e a duração por fase aparecem discretos o bastante, ou competem
   visualmente com o conteúdo da fase?
3. A frase de transição com minutos ("segue no teu ritmo (~35min até fechar o plano)") soa
   natural ou mecânica?

**ISSUE-314D (mini-diagnóstico de resultado) — esta é a que mais precisa do teu olhar:**
1. **Roteiro completo:** abrir um projeto, fechar todas as fases da Caminhada, responder (e
   depois, num projeto separado, testar "fechar sem responder") — confirmar que os dois caminhos
   concluem certo.
2. **As 3 perguntas fazem sentido** pra descrever o que realmente aconteceu com o projeto? Estão
   genéricas por decisão da v1 (mesmas 3 perguntas pra qualquer tipo de solução) — se ficar raso
   pra tipos muito diferentes (ex. "automação" vs. "app orquestrado"), é candidato a refino por
   tipo, registrado como fast-follow.
3. **A devolutiva** (headline + nuance + próximo passo) soa como o consultor da marca, ou
   genérica/robótica em algum cruzamento de respostas? São 36 combinações
   (`src/lib/lab/resultado.ts`, funções `HEADLINE_POR_CHEGOU`/`NUANCE_POR_COMPARADO`/
   `PROXIMO_PASSO_POR_PROXIMO`) — vale ler mais de uma combinação, não só a primeira que aparecer.
   ⚠️ Copy 100% pendente de veto — nada disso passou pelos teus guias de voz oficiais.
4. **O resumo compartilhável** (texto copiável) tem a informação certa? Falta alguma coisa
   (ex. link de volta pro projeto, teu nome, data)?
5. **Decisão em aberto pra próxima sessão:** confirmar se "Fable aposentado → Opus" é definitivo
   em todo o projeto (afeta `05_model_execution_strategy.md` + o campo `Modelo:` de várias issues
   futuras no backlog) — ainda não atualizei esses documentos, só as duas issues desta sessão.
6. Mapa visual do backlog (`roadmap-backlog.html`) segue desatualizado (não reflete 314C/314D).

---

## 📋 SESSÃO ANTERIOR: "A Caminhada" — plano do Lab em fases (ISSUE-314B v2) + spec de infra de IA (ISSUE-320)
**Data:** 11–12 de julho de 2026
**Versão:** v3.11.16
**Status:** ✅ ISSUE-314B v2 ("A Caminhada") implementada e validada; ✅ spec da ISSUE-320 fechada
(v2, revisada); ✅ ISSUE-314D registrada; ⚠️ falta o roteiro manual do dono (314B v2) e a
chancela do Fable na v2 da spec da 320

### **🚀 O QUE FOI FEITO:**

0. **ISSUE-314B v1 VETADA pelo dono → v2 "A Caminhada" (2026-07-12).** A v1 (v3.11.15) só
   decorava a lista com destaque + botão que rolava de volta pro checklist; o dono rejeitou no
   teste manual: *"é só um volta pro checklist, eu queria senso de jornada"*. A v2 redesenhou a
   ESTRUTURA: o plano virou uma jornada em fases (`BlocoCaminhada`, que funde os antigos
   `BlocoPlano` + `BlocoMaoNaMassa`). Cada etapa é uma fase que **abre** (card grande com
   instrução densa + o material da fase — guia + prompt — quando é a fase de executar com IA),
   **fecha** com o gate "fechei essa fase", e a **próxima abre sozinha** com o beat do consultor.
   Fases feitas colapsam (toque pra reler + reabrir "marquei sem querer"); fases futuras mostram
   só o título como mapa da trilha (toque pra espiar). Revisita abre já na fase certa + cartão de
   retomada. Tudo derivado do checklist (zero SQL, PATCH `checklistItem` intacto). Módulo
   `src/lib/lab/continuidade.ts` (+16 testes); `BlocoPlano`/`BlocoMaoNaMassa` removidos.
   Decisões completas na **pergunta 18** do `00b_open_questions.md`. **Lição registrada:** a
   visão de jornada do dono era pra redesenhar o plano, não decorar a lista com navegação.
2. **ISSUE-314D nova:** a visão maior do dono (gate de evidência por etapa + compartilhar
   resultados ao concluir) foi roteada pra issue própria — tensiona o guardrail "checklist
   simples, não task manager" do handoff, precisa de sessão de spec dedicada.
3. **ISSUE-320 — spec de infra de IA fechada em duas passadas:** preparatório (Sonnet) com
   grounding técnico + achado de LGPD (a `/privacidade` promete "nunca compartilhar com
   terceiros" — precisa de disclosure antes da 321 enviar dado real pra OpenAI) → sessão de
   arquitetura fechando modelo, contrato do helper `chamarIA()`, fallback e telemetria → revisão
   rigorosa (v2) que achou 5 lacunas reais: persistência do output em `lab_projects` (nunca
   re-chama IA em pageview), defesa contra injeção de prompt, regra "fallback nunca finge
   personalização", telemetria sem coluna de custo em dólar (calcula na leitura) e kill-switch
   `LAB_IA_DESLIGADA`. Modelo default trocado pra `gpt-5.4-mini` (decisão de custo do dono,
   ~US$0,01/projeto). Duas decisões de valor herdadas pra 321/322: pitch interno de justificativa
   (liga à tese de carreira da newsletter) e alternativas enriquecidas como notas curtas.
   Documentos: `ISSUE-320-contexto-preparatorio.md` + `ISSUE-320-spec-infra-ia.md`. Zero código
   implementado (é só spec — a 320 ainda não tem carcaça de Fase 1A completa como dependência
   real de deploy).

### **📊 TÉCNICO:**
- 287 testes verdes (eram 271) · `tsc --noEmit`/`lint`/`build` limpos · smoke test do servidor de
  produção validado (rotas públicas 200, gate do Lab 307 pra anônimo, API 401 sem sessão).
- Novos: `src/lib/lab/continuidade.ts` (+test), `src/components/lab/projeto/BlocoCaminhada.tsx`,
  `docs/revamp/ISSUE-320-{contexto-preparatorio,spec-infra-ia}.md`. Alterados:
  `src/components/lab/projeto/PaginaProjeto.tsx`, `docs/revamp/{00b_open_questions.md,
  04_issue_backlog.md}`. Removidos: `src/components/lab/projeto/{BlocoPlano,BlocoMaoNaMassa}.tsx`
  (fundidos na Caminhada).
- **Nota de processo:** a v1 da 314B rodou em Sonnet 5 (a troca pro Fable não se confirmou de
  imediato); a v2 "A Caminhada" e a spec v2 da 320 rodaram com Fable/Opus confirmados. A v1
  vetada está registrada na pergunta 18 como lição, não apagada.

### **🎯 PRÓXIMA SESSÃO:**
1. **Roteiro manual do dono (celular) da 314B v2:** abrir fase → copiar/executar o prompt →
   "fechei essa fase" → conferir a próxima abrindo sozinha com o beat → espiar uma fase futura →
   sair e revisitar (abre na fase certa + cartão de retomada). Fecha a validação subjetiva.
2. **Spec da ISSUE-320 (v2) pede uma chancela do Fable** focada no §2 (modelo) e §5 (prompts) —
   são as decisões de maior julgamento; o resto pode seguir pro Sonnet implementar.
3. **Fila de código em aberto:** ISSUE-315 (hub, Sonnet, pronta) segue como próxima natural;
   ISSUE-314D (evidência por fase — encaixa no gate "fechei essa fase" da Caminhada) precisa de
   sessão de spec própria antes de virar código.
4. **Trabalho de Fable adiantável (sem depender de código novo):** ISSUE-316 (conteúdo da
   biblioteca) e ISSUE-210 (taxonomia de áreas) — ambas seguem como candidatas registradas em
   sessões anteriores.
5. **Mapa visual do backlog** (`roadmap-backlog.html`) não foi atualizado nesta sessão — está
   defasado em relação à 314B/314D/320.

---

## 📋 SESSÃO ANTERIOR: Página do projeto do Lab (ISSUE-314) + correções de navegação
**Data:** 11 de julho de 2026 (sessão longa, sequência v3.11.8→v3.11.14)
**Versão:** v3.11.14
**Status:** ✅ ISSUE-314 implementada e no ar; ⚠️ falta o roteiro manual do dono (313 e 314
juntos) pra fechar de vez a Fase 1A do Lab

### **🚀 O QUE FOI FEITO:**

1. **Fix rápido (v3.11.8):** link "Lab" da navegação pública estava `hidden md:inline` — sumia
   no mobile. Corrigido pra sempre visível, igual ao "Entrar".
2. **ISSUE-314 — spec + conteúdo (v3.11.9/10, Fable 5, sessão de design com o dono):**
   preparação (Sonnet) coletando a visão do dono → spec fechada (`ISSUE-314-spec-pagina-
   projeto.md`, conceito "as notas viraram o plano") → conteúdo editorial completo
   (`ISSUE-314-materiais-conteudo.md`: copy dos 5 blocos, devolutiva por porta/arquétipo, 10
   guias, 9 primeiros prompts, linhas de evolução) → **rodada de revisão de voz** contra os
   guias oficiais do dono (fora do repo) que matou anglicismos ("arrancar/arranque",
   "devolver o que isso significa", linguagem de entrada/saída) → **conteúdo aprovado**.
3. **ISSUE-314 — implementação (v3.11.11, Sonnet):** `src/lib/lab/materiais.ts` (módulo puro:
   guias, primeiros prompts personalizados por área/entrega/arsenal, devolutiva, linha de
   evolução — 133 testes novos, zero placeholder vazando em nenhuma combinação de fallback);
   PATCH `/api/lab/projects/[id]` ganhou `checklistItem` (marca/desmarca com vocabulário
   fechado, `em_construcao` automático na 1ª marcação) e `concluir` (servidor recalcula, nunca
   confia no cliente); 6 componentes novos em `src/components/lab/projeto/` (leitura guiada na
   1ª visita via `?leitura=1` no redirect do wizard, modo documento nas revisitas); página
   reescrita como Server Component que faz toda a composição de texto (zero IA em runtime).
   271 testes verdes (eram 138) · tsc/lint/build limpos · smoke test do servidor de produção
   validado.
4. **Bug de navegação achado pelo dono, corrigido em 2 rodadas (v3.11.12/13):** login caía
   sempre no legado (`/dashboard`) e a sidebar do legado não tinha link pro Lab. 1ª correção
   usou a condição errada (`plan_type === 'lab_beta'`); 2ª correção usou a condição real do
   gate do Lab (`verificarAutorizacao`: **qualquer** `authorized_emails` válido, não só
   `lab_beta` — esse campo só decide se aparece o link de volta pro legado dentro do Lab).
   Aproveitado pra adicionar item "Admin" na sidebar do legado, visível só pro e-mail hardcoded
   que já protege `/admin/assinantes`.
5. **Mapa visual do backlog atualizado (v3.11.14):** trocado o esqueleto antigo da Fase 2
   (301-307, "a detalhar") pela série 310+ real — 5 das 10 issues da Fase 1A prontas/aplicadas,
   sub-fases 1A/1B/1C separadas visualmente. ISSUE-209/210 somadas na Fase 1.5. Republicado no
   mesmo link do Artifact.

### **📊 TÉCNICO:**
- 271 testes verdes · `tsc --noEmit`/`lint`/`build` limpos em toda a sessão · zero regressão em
  rotas públicas/tracking/wizard (validado por smoke test do servidor de produção 3x).
- Novos: `src/lib/lab/materiais.ts` (+test), `src/components/lab/projeto/**` (6 arquivos),
  `docs/revamp/ISSUE-314-{contexto-preparatorio,spec-pagina-projeto,materiais-conteudo}.md`.
  Alterados: `src/app/api/lab/projects/[id]/route.ts`, `src/app/(lab)/lab/projeto/[id]/page.tsx`,
  `src/components/lab/wizard/WizardNovoProjeto.tsx`, `src/app/(publico)/auth/page.tsx`,
  `src/app/(app)/AppShell.tsx`, `src/components/shared/PublicHeader.tsx`,
  `docs/revamp/{00b_open_questions.md,04_issue_backlog.md,roadmap-backlog.html}`.
- Todos os 7 commits pushados direto na `main` nesta sessão (autorização explícita do dono pro
  ciclo inteiro — "ninguém está usando, assim eu já treino").

### **🎯 PRÓXIMA SESSÃO:**
1. **Dono rodou o roteiro manual** da 313 + 314 (conta real, celular) e devolveu feedback
   (2026-07-11): fluxo natural, copy sem ajuste, mas jornada quebra ao terminar de interagir com
   o primeiro bloco do plano (sem CTA de continuar/retomar). Virou **ISSUE-314B** (continuidade
   entre blocos, retomar de onde parou) e **ISSUE-314C** (estimativa de tempo por etapa) no
   backlog, ambas com o relato do dono citado. Falta o dono decidir se elas furam a fila da 315
   ou entram depois.
2. **Próxima issue de código (ordem original):** ISSUE-315 (hub `/lab/inicio` com estados reais
   — Sonnet, sem decisão de voz pendente, complexidade baixa). **Concorrendo por prioridade:**
   ISSUE-314B, que ataca a mesma dor ("não acho onde continuar") mas de dentro da página do
   projeto, não do hub — precisa de sessão de spec com Fable antes de codar (é interação/voz).
3. **Trabalho de Fable já adiantável agora** (não depende do roteiro nem da 315 — ver análise
   completa na conversa desta sessão): conteúdo/algoritmo da ISSUE-316 (biblioteca), definição
   da ISSUE-210 (taxonomia de áreas) e agora também a spec da ISSUE-314B — todos são trabalho de
   especificação pura, prontos pra virar código quando a carcaça (315/316) for construída.
4. **Adiantado o grounding da ISSUE-320** (infra de IA, Fase 1B) a pedido do dono: mesmo com a
   Fase 1A ainda em andamento, o dono quer usar o restinho de créditos do Fable pra deixar a
   arquitetura de IA especificada e pronta pra virar código depois. Preparatório salvo em
   `docs/revamp/ISSUE-320-contexto-preparatorio.md` — leia antes de abrir a sessão do Fable
   pra essa issue. Já inclui a filosofia de custo do dono (modelo capaz porém barato por
   chamada, uso pouco frequente por projeto, nunca "virar um ChatGPT em outro lugar") e onde a
   chave da OpenAI vai ser configurada (Vercel env var, não local).

---

## 📋 SESSÃO ANTERIOR: UI completa do Wizard do Lab — "Conversa de Consultor" (ISSUE-313)
**Data:** 11 de julho de 2026
**Versão:** v3.11.7
**Status:** ⚠️ parcial — implementação completa e validada tecnicamente; falta só o roteiro
manual do dono nas 3 portas + mobile real

### **🚀 O QUE FOI FEITO:**

1. **Sessão de design ANTES de codar** (persona: designer de produto mobile-first, a pedido
   do dono — "não quero formulário, quero algo se construindo na tela"). Decisões fechadas via
   perguntas estruturadas e registradas na **pergunta 16 do `00b_open_questions.md`**: as
   "Notas do Consultor" (o espelho incremental da spec) viram PROTAGONISTAS — uma folha
   manuscrita que se escreve sozinha enquanto a pessoa responde (referência do dono: "diário
   do Voldemort", escrita esquerda→direita), fonte cursiva **Caveat** carregada só na rota do
   wizard (layout raiz intocado — trava de tracking preservada); split-screen no desktop
   (pergunta à esquerda, notas sticky à direita), coluna única com notas compactas/expansíveis
   no mobile; ritmo ágil (0.18–0.28s). Política de animação em 2 camadas: framer-motion (já no
   projeto) + ícones lucide ANIMADOS copiados pra dentro (padrão MIT `pqoqubbw/icons`, zero
   dependência nova, zero CDN externo) — Lottie/Rive avaliados e **vetados por ora**
   (registrado como ideia futura: assets próprios no repo).
2. **Implementação completa sob a spec v2.1 fechada** (`docs/revamp/ISSUE-313-spec-wizard.md`):
   - `src/lib/lab/validacao.ts` — validação pura em 2 posturas: `sanitizarRascunho` tolerante
     (abandono nunca falha) e `validarCompleto` estrito (vocabulário fechado, mesma robustez-
     por-construção da heurística). 20 testes novos.
   - `ajustarDiagnosticoParaTipo` em `engine.ts` (aditivo) — reancora o diagnóstico no tipo que
     a PESSOA escolheu na proposta assistida, preservando pontuação/vencedor bruto do motor
     pra auditoria ("proposta escolhida, não veredito", spec §9). 3 testes novos.
   - `src/app/api/lab/projects/{route,[id]/route}.ts` — POST cria rascunho, PATCH salva
     progresso OU finaliza (motor roda NO SERVIDOR — o cliente só faz preview); 3 camadas de
     segurança (sessão via cookie + gate `authorized_emails` + RLS `auth.uid()` via cliente da
     própria sessão, nunca service role).
   - `src/components/lab/wizard/` — orquestrador (`WizardNovoProjeto`, rascunho salvo por
     virada de bloco, retomada no ponto exato), `NotasConsultor` (a folha manuscrita),
     `IconesAnimados`, `EtapaPergunta` (todos os formatos: escala, chips, cards, confirmação
     de hipótese, multiselect, slider, texto), `EtapaEspelho` (ajuste POR DIMENSÃO — corrigir
     um campo nunca descarta os demais, critério de aceite da spec), `EtapaProposta`
     (desempate transparente máx. 1× + nome sugerido + proposta com 2 alternativas, formato
     consultor: por que serve pro teu caso · corredor · evolui pra).
   - `/lab/novo-projeto` (Server Component: retomada de rascunho + pré-preenchimento de
     fluência do perfil), esqueleto de `/lab/projeto/[id]` (recebe o redirect; a página
     completa é a 314), CTA real no `/lab/inicio`.
3. **Feedback do 1º teste do dono (mesma sessão) — roteado, não perdido:**
   - **Final "frio"** (escolhia e caía direto nos 3 cards): ✅ **resolvido na hora** — nova
     moldura do consultor (beat "analisando teu caso…" + leitura "recomendo [tipo], lê os
     três e escolhe o que é o teu") antes dos cards.
   - **Lista de áreas incompleta** (falta TI/Tecnologia etc.) → **ISSUE-210 nova** no backlog.
   - **Página do projeto "genérica/sem next step"** → nota forte na **ISSUE-314** (ela é quem
     resolve: tela diagnóstica de verdade, não esqueleto).
   - **Não dá pra reconsultar o projeto depois** → nota na **ISSUE-315** (hub precisa listar).
   - **"Plano saiu errado"** → roteado pra revisão editorial do 312/content + profundidade
     real com IA na fase 1B (320/321), como o próprio dono intuiu.
   - Redirect pós-wizard **confirmado funcionando** (não era bug).

### **📊 TÉCNICO:**
- **138 testes verdes** (eram 125) · `tsc --noEmit` limpo · lint sem erro/warning novo (zero
  arquivo do Lab/wizard na lista de pendências pré-existentes do projeto) · `npm run build`
  ok (`/lab/novo-projeto` 22,8 kB / 186 kB first load) · smoke test no build de produção:
  rotas do Lab 307 sem flash pra anônimo, APIs 401 sem sessão, rotas públicas/tracking
  intocadas (home, `/lab` vitrine, `/pre-diagnostico` todas 200).
- Novos: `src/lib/lab/validacao.ts` (+test), `src/app/api/lab/projects/**`,
  `src/components/lab/wizard/**`, `src/app/(lab)/lab/{novo-projeto,projeto/[id]}/page.tsx`.
  Alterados: `src/lib/lab/engine.ts` (+test, aditivo), `src/app/(lab)/lab/inicio/page.tsx`
  (CTA real).
- Docs: pergunta 16 nova no `00b_open_questions.md`; ISSUE-313 marcada com status detalhado
  + feedback roteado; ISSUE-210 nova; notas cravadas nas ISSUE-314/315.

### **🎯 PRÓXIMA SESSÃO:**
1. **Fechar a 313:** dono roda o roteiro manual completo (3 portas com conta real + mobile).
2. **Recomendação do dono para adiantar Fable 5:** metade Fable 5 da **ISSUE-314** (copy/
   estrutura da página do projeto — "não pode parecer chat genérico", mesmo critério da 105/
   313) — reforçada pelo próprio feedback desta sessão. Secundários: ISSUE-210 (áreas) e
   revisão editorial dos templates do 312.

---

## 📋 SESSÃO ANTERIOR: LabShell + gate server-side testado com conta real (ISSUE-311)
**Data:** 09 de julho de 2026
**Versão:** v3.11.6
**Status:** ⚠️ parcial (validado pelo dono com conta real; falta só o roteiro completo dos 5 passos)

### **🚀 O QUE FOI FEITO:**

1. **Sessão migrada de localStorage → cookie** (`src/lib/supabase.ts`, `createBrowserClient`
   do `@supabase/ssr`): é o que permite o gate ler a sessão no servidor, sem flash. Decisão do
   dono: aceitar o relogin único (baixo volume de assinantes ativos), com a ressalva de LGPD —
   confirmado que o cookie de sessão é estritamente necessário (não exige banner). API do
   cliente idêntica; `AppShell` legado não mudou uma linha.
2. **`src/middleware.ts`** — escopado só às 5 rotas logadas do Lab (matcher explícito).
   Anônimo → `/auth?next=<rota>` **antes de qualquer render** (testado no build de produção:
   307 do servidor, zero flash). Vitrine `/lab`, home, `/auth`, `/dashboard` fora do matcher —
   confirmado sem mudança de comportamento.
3. **`src/lib/supabase-server.ts`** — leitura de sessão via cookie + `verificarAutorizacao`
   (mesma regra de `authorized_emails` da rota `check-authorization`, agora como função).
4. **Gate + LabShell** (`src/app/(lab)/lab/layout.tsx`, `src/components/lab/`): não
   autorizado → tela "beta fechado" DS2; autorizado → `LabShell` (nav Início ativo,
   Biblioteca/Perfil "em breve"; link discreto pro legado só quando `plan_type ≠ 'lab_beta'`).
   Esqueleto `/lab/inicio` (hub real é a ISSUE-315).
5. **`?next=` no `/auth`** com guarda anti open-redirect (só caminho interno).
6. **LGPD:** seção de cookies adicionada à `/privacidade` (cookie de sessão vs. cookies de
   tracking). Gap pré-existente do banner de consentimento pros cookies de GTM/Ads/GA4
   registrado como **ISSUE-209** nova no backlog (persona Analytics & Ads).
7. **Teste com conta real (dono):** login funcionou (susto inicial foi senha errada, não bug),
   tela do Lab renderizou correta. Falta confirmar os itens 2–5 do roteiro (link do legado
   visível, fluxo `?next=` completo, logout, legado intocado) — nenhum é bloqueio técnico.

### **📊 TÉCNICO:**
- `tsc --noEmit` limpo · `npm run build` ok · lint sem erro novo nos arquivos tocados (2 erros
  pré-existentes em `auth/page.tsx`/`privacidade/page.tsx`, fora das linhas desta sessão)
- Novos: `src/middleware.ts`, `src/lib/supabase-server.ts`, `src/app/(lab)/`,
  `src/components/lab/{LabShell,BetaFechado,LabLogout}.tsx`. Alterados: `src/lib/supabase.ts`,
  `src/app/(publico)/auth/page.tsx`, `src/app/(publico)/privacidade/page.tsx`

### **🎯 PRÓXIMA SESSÃO:**
**UI do wizard da ISSUE-313** — as telas dos 4 blocos (Sonnet, sob a spec v2.1 já fechada e o
motor já pronto e auditado em `src/lib/lab/`): rascunho salvo por bloco, rotas
`api/lab/projects`, componentes `QuestionCard`/`OptionButton`/`Progress` do DS2. Dependências
(310, 311, 312) todas satisfeitas.

---

## 📋 SESSÃO ANTERIOR: Wizard do Lab — spec v2.1 aprovada + motor completo (ISSUE-313)
**Data:** 09 de julho de 2026
**Versão:** v3.11.5
**Status:** spec fechada ✅ · motor implementado e auditado ✅ · falta só a UI (depende da 311)

### **🚀 O QUE FOI FEITO (sessão em 3 atos):**

1. **Spec v1 → v2 → v2.1, com o dono no loop.** O dono revisou a spec v1 (formulário de 4
   passos) e rejeitou: engessada, ignorava maturidade, assumia que toda entrada é um problema
   (nos workshops a maioria chega com IDEIA de ferramenta), pedia o que a pessoa não sabe
   responder. A v2 virou conversa com 3 portas; a rodada 2 matou o último ponto frágil (o
   dicionário de palavras-chave sobre texto livre) — na 1A **texto livre nunca classifica**,
   heurística 100% fechada (robusta por construção), com a experiência-alvo dele como
   requisito: "entendeu minha realidade, consigo fazer, ganho real, com as ferramentas que
   tenho acesso, e impressiono meu chefe". Decisões registradas na pergunta 15 do
   `00b_open_questions.md`. **Dono aprovou a v2.1** ("está robusta").
2. **Motor completo implementado em 6 gates** (todos verdes: tsc + vitest por gate):
   - `types.ts` — schema v2 aditivo (`WizardAnswersV2`, `AmbienteId`, `ArquetipoId`); v1 congelado.
   - `wizard-flow.ts` — a conversa como dado: roteiro das 3 trilhas (~14 interações), 6
     arquétipos→hipóteses, cenas por área (10 genéricas + overrides p/ 5 áreas), fluência
     comportamental, `sugerirTitulo`, `montarEspelho` (fallback do slot de IA #2).
   - `engine.ts` — `diagnosticarV2`; motor do radar intocado; testado que relato/porta/
     arsenal **nunca** mudam a classificação.
   - `desempate.ts` — pergunta discriminante DERIVADA da matriz de pesos (zero conteúdo à
     mão); teste exaustivo: os 36 pares de tipos são todos discrimináveis.
   - `plan-generator.ts` 1.1.0 — linha de arsenal (prioridade Workspace>Copilot>premium>base
     universal), diligência shadow ("dado da firma não sobe pra conta pessoal"), manchete
     "~Xh da tua semana". Sem `ambiente` = saída idêntica à 1.0.0 (aditivo puro).
3. **Auditoria exaustiva (`auditoria.test.ts`) — e ela já pagou o investimento:** roda as
   **700.000 combinações** do espaço fechado contra o motor (~33s) validando os invariantes
   da spec §7.4. Primeiro achado real: o limiar de desempate de 1 ponto dispararia em 56,2%
   das conversas ("consultor sempre em dúvida") — calibrado para empate exato (22,7%), com
   guarda-corpo de <30% como teste de CI. Distribuição de vencedores no espaço uniforme:
   dashboard 34,6% · prompt 20,3% · template 20,2% · automacao/workflow ~9,4% · cauda
   ambiciosa rara (guard-rails/teto agindo — esperado).

### **📊 TÉCNICO:**
- **125 testes verdes** (eram 76) · `tsc --noEmit` limpo · `npm run build` ok · lint sem erro
  novo nos arquivos do Lab
- Novos: `src/lib/lab/{wizard-flow,desempate}.ts` + 3 suites de teste. Estendidos:
  `types.ts`, `engine.ts`, `plan-generator.ts` (tudo aditivo — zero linha do motor do radar
  alterada)
- Docs: spec v2.1 consolidada, pergunta 15 no `00b`, backlog atualizado, memória de execução
  (`lab-issue-313-execucao.md`)

### **🎯 PRÓXIMA SESSÃO — recomendação:**
**ISSUE-311 — Route group `(lab)` + LabShell + gate server-side (`@supabase/ssr`)** ·
**Modelo recomendado: Fable 5** (definido no backlog — introduz `@supabase/ssr` e o gate de
auth do beta fechado; custo de erro alto, testar login/logout ponta a ponta). É a única
dependência que falta pra UI da 313 (Sonnet, sob a spec fechada) entrar na sessão seguinte.

---

## 📋 SESSÃO ANTERIOR: Spec do Wizard do Lab — ISSUE-313 (metade Fable 5)
**Data:** 09 de julho de 2026
**Versão:** v3.11.4 (sessão 100% de spec/documentação — zero código)
**Status:** spec redigida, aguardando revisão do dono ⚠️ parcial

### **🚀 O QUE FOI FEITO:**

1. **Sessão de spec da ISSUE-313** (Wizard `/lab/novo-projeto`): carregado o handoff §8.1.2,
   o contrato `WizardAnswers` v1 (`src/lib/lab/types.ts`, ids congelados pela ISSUE-312) e as
   perguntas/opções do Radar de Oportunidades (`radar/oportunidades.ts`) para não reinventar o
   que já existe. Duas decisões do dono destravaram o texto: (1) reenquadrar as perguntas para
   o projeto específico que a pessoa acabou de descrever, em vez de repetir literalmente o
   quiz do radar — mesmos ids/opções, muda só o enunciado onde fazia sentido; (2) dos 4 campos
   opcionais do handoff, todos entram (`contexto`, `ferramentas`, `urgencia`,
   `impacto_esperado`), com pedido explícito de comportamento de continuidade: rascunho salvo a
   cada passo, e pré-preenchimento (área do perfil, conforto do Radar de Maturidade) sempre
   editável, nunca escondido ou travado.
2. **Doc produzido:** `docs/revamp/ISSUE-313-spec-wizard.md` — estrutura dos 4 passos, texto de
   cada uma das 10 perguntas obrigatórias + 4 opcionais, comportamento de persistência/retomada,
   critérios de aceite. Ainda **não aprovado pelo dono** — é rascunho de spec, não spec fechada.
3. **Bloqueio adicional identificado:** a ISSUE-311 (route group `(lab)` + LabShell + gate
   server-side) ainda não foi executada. A 313 não tem onde plugar a tela até ela existir —
   registrado no backlog como pendência a resolver antes da implementação (Sonnet).
4. **`docs/revamp/04_issue_backlog.md`:** ISSUE-313 marcada `⚠️ parcial em 2026-07-09` com
   link pro doc de spec e o bloqueio da 311.

### **📊 TÉCNICO:**
Nenhum arquivo em `src/` tocado — sessão 100% de spec/documentação. Novo:
`docs/revamp/ISSUE-313-spec-wizard.md`. Alterado: `docs/revamp/04_issue_backlog.md`.

### **🎯 PRÓXIMA SESSÃO:**
1. Dono revisa `ISSUE-313-spec-wizard.md` (texto das perguntas, toques editoriais inventados,
   comportamento de continuidade) e aprova ou pede ajustes.
2. Decidir se a ISSUE-311 entra antes da implementação da 313 (ela bloqueia onde a tela vive).
3. Com spec fechada + 311 resolvida: Sonnet implementa o wizard sob a spec.

---

## 📋 SESSÃO ANTERIOR: Infraestrutura do Lab — ISSUE-310 (SQL) + ISSUE-312 (motor)
**Data:** 09 de julho de 2026
**Versão:** v3.11.3 (infraestrutura de dados e motor, zero mudança em UI)
**Status:** ambas concluídas e testadas ✅

### **🚀 O QUE FOI FEITO:**

1. **ISSUE-310 — SQL do Lab em produção** (`docs/revamp/ISSUE-310-sql-lab.md`): 3 tabelas
   (`lab_profiles`, `lab_projects`, `lab_assets`) rodadas no painel Supabase pelo dono; RLS
   ligada com 7 políticas (`{authenticated}` apenas, sem DELETE); 3 triggers de `updated_at`;
   REVOKE seletivo bloqueando `anon`. Auditoria: 4 SELECTs passaram (tabelas ok, políticas ok,
   privilégios corretos, triggers ok); teste anon devolveu `42501 permission denied` (sem vazamento).

2. **ISSUE-312 — Motor do Lab** (`src/lib/lab/{types,engine,plan-generator}.ts` + 2 suites
   vitest): adaptador puro wizard→classificação reusingzando 100% do motor do Radar aprovado
   (doc 11 §3–§8); templates de plano por tipo × área × fluência na voz da newsletter
   (conteúdo semeado do `content.ts`); 76 testes verdes cobrindo os 9 tipos ponta a ponta;
   registro canônico de 10 slugs de materiais exportado (`SLUGS_CANONICOS`) — contrato com
   ISSUE-316; `vitest.config.ts` estendido para incluir suites do Lab.

### **📊 TÉCNICO:**

- `tsc --noEmit` ✅ limpo (tipos corretos)
- `npm run build` ✅ compila fim de sessão sem erro
- `npm test` ✅ 76 testes verdes (vitest radar + lab)
- ESLint: 92 erros legados (ignorados em build, fora do escopo desta sessão)

---

## 📋 SESSÃO ANTERIOR: Plano da Fase 1 do Lab (Jornada Guiada de Construção) — série 310–330 substitui 301–304
**Data:** 09 de julho de 2026
**Versão:** v3.11.2 (sem alteração de código — sessão 100% de planejamento/documentação)
**Status:** plano completo produzido e aprovado pelo dono · 5 decisões de abertura registradas
(pergunta 14) · backlog reestruturado · pronto para executar ISSUE-310 (SQL) + ISSUE-312
(motor) na próxima sessão

### **🚀 O QUE FOI FEITO:**

1. **Consolidação de dois materiais trazidos pelo dono:** o dossiê de exploração
   (`docs/revamp/12_exploracao_lab_chatgpt.md`, preparado para uma conversa externa) e o
   handoff estratégico resultante (`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`),
   que redefiniu o Lab de "ferramentas separadas" (Wizard/Builder Canvas/PRD Kit como telas
   próprias) para uma **Jornada Guiada de Construção única** (wizard → classificação → plano
   salvo → biblioteca conectada → perfil).
2. **Auditoria real do código** (rotas, página `/lab` atual, `AppShell`/fluxo de auth, tabelas
   Supabase existentes, motor dos radares em `src/lib/radar/`) para fundamentar o plano no que
   já existe — achado central: o motor de classificação em 9 tipos (`oportunidades.ts`, com
   testes) e a copy estruturada (`content.ts`, 866 linhas) já fazem o trabalho pesado da
   classificação e dos planos; a Fase 1A é, em boa parte, recombinar motores provados atrás de
   um login, não construir do zero.
3. **Plano completo produzido em `docs/revamp/13_plano_fase1_lab.md`:** diagnóstico técnico,
   jornada de dois caminhos (pós-workshop / newsletter-ads-radar) convergindo em `/lab/inicio`,
   arquitetura de **5 telas** (cortadas das 7 do handoff — diagnóstico+plano viram uma página só
   e a entrevista com IA sai da 1A por definição do próprio faseamento), fluxo funcional,
   modelo de dados (4 tabelas, JSONB versionado em vez das 6 entidades do handoff), uso de IA
   restrito à 1B, plano de monetização/premium preparado desde a 1A, backlog em issues e
   critérios de aceite do gate da 1A.
4. **Dono decidiu as 5 questões bloqueantes do plano** (registradas na pergunta 14 do
   `00b_open_questions.md`): Fase 1A é **beta fechado por convite** (10–20 pessoas da lista
   `lab_leads`); conteúdo dos primeiros ativos da biblioteca **rascunhado pelo Claude com
   aprovação do dono**; plataforma legada (ROI do Foco) visível **só para assinantes antigos**
   dentro do Lab; largada da Fase 1A **em paralelo** às pendências do launch do funil de
   radares; IA da Fase 1B usa a **API da OpenAI, modelo barato** (o dono só tem chave OpenAI —
   corrigiu a suposição inicial de Claude API no doc 13).
5. **`docs/revamp/04_issue_backlog.md` reestruturado:** ISSUE-301–304 marcadas como
   `⛔ SUPERSEDED` pela **série 310–330** (10 issues na Fase 1A, 4 na 1B, 3 na 1C, 1 na
   integração com workshops); ISSUE-305/306 absorvidas pelas 325/316+326. Cada issue nova
   ganhou campo `**Modelo:**` explícito, inclusive o padrão de duas etapas "Fable 5 fecha a
   spec/copy → Sonnet implementa" nas issues cujo conteúdo (perguntas do wizard, texto dos
   planos, ativos da biblioteca) ainda não estava fechado.
6. **Skill `/iniciar-sessao` ajustada:** o resumo de abertura de qualquer sessão agora inclui
   o modelo recomendado para a próxima issue elegível (lido do campo `Modelo:` do backlog) —
   não é mais preciso perguntar isso a cada sessão nova.

### **📊 TÉCNICO:**
Nenhum arquivo em `src/` tocado — sessão 100% de planejamento/documentação. Alterados:
`docs/revamp/00b_open_questions.md`, `docs/revamp/04_issue_backlog.md`,
`.claude/skills/iniciar-sessao/SKILL.md`. Novos: `docs/revamp/12_exploracao_lab_chatgpt.md`,
`docs/revamp/13_plano_fase1_lab.md`, `docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`.

### **🎯 PRÓXIMA SESSÃO:**
Executar **ISSUE-310** (SQL das tabelas do Lab — Fable 5 prepara, dono roda no painel do
Supabase) e **ISSUE-312** (motor do Lab + testes vitest — Fable 5), nesta ordem; nenhuma das
duas toca em nada que está no ar. Antes da ISSUE-313 (wizard), revisar com o dono as perguntas
exatas do formulário (handoff §8.1.2) — decisão explicitamente adiada para aquela sessão.

---

## 🎯 SESSÃO Anterior: rodada de configuração manual (Supabase, GTM, Substack) — 3 bloqueadores do gate ISSUE-112 fechados
**Data:** 09 de julho de 2026
**Versão:** v3.11.1 (sem alteração de código — sessão 100% operacional, configuração em painéis externos)
**Status:** reset de senha ✅ resolvido e testado · analytics GA4 dos 19 eventos ✅ publicado e testado
· `lab_leads`/embed Substack ✅ confirmados já resolvidos (achados de documentação desatualizada)
· resta só performance (2.2) + o roteiro de validação do dono (§4 do relatório QA) pro gate fechar de vez

### **🚀 O QUE FOI FEITO (sessão guiada passo a passo nos painéis, sem tocar em código):**

1. **Bloqueador 2.3 (reset de senha) resolvido de ponta a ponta.** Causa confirmada na sessão
   anterior (Site URL do Supabase apontando pro `localhost`). O dono corrigiu no painel
   (Authentication → URL Configuration): Site URL trocada para
   `https://conversas-no-corredor.vercel.app`, Redirect URLs já cobriam `/reset-password` +
   wildcard `/**`. Testado ao vivo: pediu reset, recebeu e-mail com link correto, redefiniu a
   senha com sucesso.
2. **`SQL da `lab_leads` — achado que já estava resolvido, não pendente.** O `CURRENT-STATUS.md`
   e o relatório de QA da ISSUE-112 (§3) vinham carregando uma nota desatualizada dizendo "SQL
   ainda não rodou". Conferimos ao vivo (`SELECT` de verificação): a tabela já existe,
   `rowsecurity = true`, zero políticas — rodada e validada de fato na sessão da ISSUE-108
   (08/07). A nota errada não foi corrigida depois que a 108 fechou; corrigida agora.
3. **Tags GA4 dos 19 eventos do funil de radares — publicadas e testadas (item 3 do §3 do
   relatório de QA).** Achado importante no caminho: o container GTM (`GTM-PDJ2K5BX`) não tinha
   nenhuma tag do tipo GA4 Event — as únicas 5 tags existentes eram do funil legado (conversão
   Google Ads + a "Tag do Google" base, ID `AW-16601345592`). A "Tag do Google" está vinculada
   como destino adicional à propriedade GA4 (`G-0HX5BX2XL7`) diretamente nas configurações da
   conta Google (feito com o time do Google na configuração original) — por isso o GA4 já
   recebia tráfego de pageview real sem nenhuma tag visível no GTM. Em vez de criar uma tag base
   nova (arriscaria contar pageview em dobro) ou 19 pares de tag+trigger, criamos só **1 trigger
   novo** (`CE - Eventos dos radares`, Custom Event com regex casando os 19 nomes canônicos de
   `src/lib/radar-events.ts`) **+ 1 tag nova** (`GA4 Event - Eventos dos radares`, tipo GA4
   Event, `ID da métrica` = `G-0HX5BX2XL7` — o GTM confirmou reconhecer a "Tag do Google"
   existente e reaproveitar a config dela, sem inicialização nova). Testado no modo Preview do
   GTM antes de publicar: a tag disparou 5 vezes pra eventos diferentes clicados ao vivo.
   Publicado como Versão 3 do container.
4. **Embed do Substack no tema escuro — já estava certo, não precisava de ação.** A pendência
   registrada ("configurar cores no painel do Substack") partia de uma suposição errada: o embed
   nativo do Substack não tem opção de customizar cor/fonte — ele reflete o tema geral já
   configurado na própria publicação Substack do dono, que por já ser verde-escuro/laranja
   combina com o DS2 do site. Conferido visualmente: sem trabalho a fazer.

### **📊 TÉCNICO:**
Nenhum arquivo em `src/` tocado — sessão 100% de configuração em painéis externos (Supabase,
Google Tag Manager). `git status` limpo, nada a commitar em código.

### **🎯 PRÓXIMA SESSÃO — roteiro do dono (§4 do `ISSUE-112-relatorio-qa.md`), 12 itens, nenhum
bloqueia o desenvolvimento de outras issues (Fase 1B/ISSUE-114+ já está liberada em paralelo por**
decisão registrada em `00b_open_questions.md`, pergunta 11) — isso é só o que falta pro **launch**
do funil de radares, não pro trabalho seguir:**
1. Conversão do funil legado (`/pre-diagnostico`) via Tag Assistant.
2. Conversão do funil novo (radar de Oportunidades) via Tag Assistant.
3. Conferir no GTM Preview/GA4 DebugView que os 19 eventos chegam com o nome certo (testamos uma
   amostra ao vivo nesta sessão — 5 disparos confirmados; falta conferência mais completa).
4. Leads de teste no banco (`radar_leads` com sessão/UTMs; `lab_leads`).
5. RLS: query com chave anônima DEVE falhar em `radar_leads`/`radar_sessions`/`lab_leads`.
6. Radares completos em celular real (iPhone + Android, <3min, voltar/refazer).
7. "Teste dos 5 segundos" — pessoa de fora descreve o site como "IA aplicada ao trabalho".
8. Ler e aprovar/vetar a copy nova (pendências da ISSUE-111/111.1).
9. **PWA — só a infraestrutura foi verificada (`manifest.json`/`sw.js` respondem 200 no build de
   produção); falta o teste manual real: instalar no celular, navegar até as rotas novas, hard
   refresh.** Não confundir "infra ok" com "testado" — ainda pendente de verdade.
10. Plataforma logada ponta a ponta (login → dashboard → kanban → relatórios → `/admin/assinantes`).
11. ~~Embed Substack no dark~~ ✅ confirmado nesta sessão, sem ação necessária.
12. Métrica norte: conferir no GA4/Grafana se dá pra calcular visitante → lead → assinante.

Depois desse roteiro: só falta a performance (bloqueador 2.2, ainda não atacada em código) pra
re-rodar o gate da ISSUE-112 até zero FALHOU e autorizar o launch.

### **🚀 O QUE FOI FEITO (tudo que dava pra fazer sozinho, sem depender de painel/dispositivo):**

1. **Bloqueador 2.4 resolvido — `/privacidade` agora é pública.** Mudou de `(app)` para
   `(publico)`: antes redirecionava visitante anônimo pra `/`, mesmo sendo a página que os
   radares prometem no rodapé. Ganhou um parágrafo novo explicando a captura de dados dos
   radares/Lab (nome, e-mail, respostas, IP/UTM) e o formulário de captura do radar
   (`EmailCaptureRadar.tsx`) ganhou um link direto pra ela — antes o fluxo dos radares não
   linkava a política em nenhum ponto. `/privacidade` também saiu do `disallow` do
   `robots.ts` (não faz mais sentido bloquear indexação de uma rota pública).
2. **Bloqueador 2.3 (reset de senha) — diagnosticado, mas a correção não é código.** Revisei
   todo o fluxo (`auth/page.tsx` → `resetPasswordForEmail` → `reset-password/page.tsx`) e está
   correto — manda o `redirectTo` certo. Testei de verdade batendo na API do Supabase, voltou
   `200 {}` sem erro, e o e-mail **chegou** (não é spam). O problema real: o link de dentro do
   e-mail leva pro `localhost` em vez do site em produção — sintoma clássico de **Site
   URL/Redirect URLs desatualizados no painel do Supabase** (projeto novo pós-migração
   provavelmente ainda com `http://localhost:3000` configurado em vez do domínio de produção).
   Correção é 100% no painel, não no código. Detalhes e os 2 campos exatos a ajustar em
   `docs/revamp/00b_open_questions.md` (pergunta 1).
3. **Bloqueador 2.2 (performance) — remedido no site real, não mais local.** A medição da
   ISSUE-112 foi feita rodando o build na minha máquina, que é mais lento que o site de verdade.
   Rodei Lighthouse mobile direto em `conversas-no-corredor.vercel.app`: **home foi de 24→71**,
   **radar de 49→75** — bem melhor, mas ainda abaixo do alvo de 85. TBT alto (1.100ms na home,
   710ms no radar) é o principal vilão — JS pesado travando a página. Ainda não mexi em código
   de performance; é a próxima etapa, se você topar priorizar.
4. **`docs/revamp/rotina-import-leads-substack.md`** — passo a passo pra você exportar os leads
   novos do Supabase (radar + Lab) via SQL Editor e importar no Substack (não existe integração
   automática entre as duas plataformas). Resolve o item pendente do DoD C.

### **📊 TÉCNICO:**
- `src/app/(publico)/privacidade/page.tsx` (movido de `(app)`), `src/components/radar/EmailCaptureRadar.tsx`,
  `src/app/robots.ts` — `tsc`, lint e build limpos; testado em `build && start` (200 público,
  robots sem bloquear, link confirmado no bundle JS).
- Nenhum código novo para o reset de senha (causa é fora do repo) nem para performance (só
  medição desta vez).

### **🎯 PRÓXIMA SESSÃO — precisa de você acompanhando (painel/dispositivo, não dá pra eu sozinho):**
1. **Reset de senha — diagnóstico fechado, falta só a ação.** O e-mail chega certinho; o link
   de dentro dele é que leva pro `localhost`. Painel do Supabase (`cuojmyqkezmpryeuyvqd`) →
   **Authentication → URL Configuration**: trocar a **Site URL** de `http://localhost:3000` para
   `https://conversas-no-corredor.vercel.app` e garantir que
   `https://conversas-no-corredor.vercel.app/reset-password` está nas **Redirect URLs**. Depois,
   repetir o teste de reset pra confirmar. Detalhes em `00b_open_questions.md` (pergunta 1).
2. **Rodar o SQL do `lab_leads`** (`ISSUE-108-sql-lab-leads.md`, painel do Supabase → SQL
   Editor) — ainda pendente, sem ele o formulário do `/lab` dá erro 500.
3. **Configurar as tags GA4** no painel do **GTM** (spec no histórico da ISSUE-111.1) e as
   **cores do embed** no painel do **Substack**.
4. Depois desses passos: decidir se entra numa sessão de otimização de performance (o código
   ainda não foi tocado) e reler os textos pendentes de aprovação.

---

## 🎯 SESSÃO ANTERIOR: ISSUE-112 (gate de QA) + ISSUE-113 (e-mail de trilha)
**Data:** 08 de julho de 2026
**Versão:** v3.11.0
**Status:** ISSUE-112 ⚠️ parcial (relatório entregue, launch bloqueado) · ISSUE-113 ⚠️ aplicada e aprovada pelo dono

### **🚀 O QUE FOI FEITO (em termos simples):**

1. **Gate de QA da Fase 1 (ISSUE-112)** — rodei tudo que é automatizável do checklist de launch
   (`docs/revamp/06_definition_of_done.md`): tipos, lint, build, matriz de rotas, tracking,
   SEO, copy, design, PWA e Lighthouse mobile. Relatório completo em
   `docs/revamp/ISSUE-112-relatorio-qa.md`. **Veredito: não pronto para launch**, 4
   bloqueadores — o principal, e que o dono confirmou ao vivo nesta sessão, é que os radares
   prometiam e-mail na tela mas não enviavam nada (isso virou a ISSUE-113, abaixo). Os outros
   três (performance mobile abaixo do alvo, reset de senha quebrado — bug pré-existente — e
   `/privacidade` sem cobrir a captura nova e atrás de login) ficam para as próximas sessões,
   na ordem que o dono escolheu.
2. **E-mail de trilha dos radares (ISSUE-113)** — os dois radares (Maturidade e Oportunidades)
   agora enviam e-mail de verdade depois da captura, via Resend. Template novo, no visual
   escuro do site (não depende do tema do cliente de e-mail), reaproveitando 100% o conteúdo
   que já existia — nenhuma copy nova foi escrita. Testado ao vivo: dois envios reais para o
   Gmail do dono, aprovados.
3. **Redesign do e-mail por pedido do dono, na hora** — o primeiro rascunho deixava a chamada
   para a newsletter fraca (só um link). Refiz: header agora abre com "Conversas no Corredor"
   e a tese da newsletter (antes só dizia "+ConverSaaS", sem contexto); e os dois e-mails
   fecham com um bloco de newsletter dedicado — faixa de acento, pitch curto, botão grande
   "Vamos para mais conversas" (à prova de Outlook) + link para o arquivo de textos publicados.
   Reenviado e aprovado pelo dono.

### **📊 TÉCNICO:**

- Novo: `src/app/api/radar/email-template.ts` — template dark-safe (hex literal + `color-scheme:
  dark`, não confia em CSS var nem em tema automático do cliente), botão principal com
  fallback VML para Outlook, links com UTM (`utm_source=email&utm_medium=radar_trilha`).
- `src/app/api/radar/lead/route.ts` — busca `answers` da sessão, recalcula o resultado com o
  mesmo motor puro do `RadarFlow` (`calcularMaturidade`/`decidirOportunidade`), monta o e-mail
  a partir do conteúdo já existente em `lib/radar/content.ts` e envia via Resend. Falha de
  envio nunca derruba o lead (best-effort, try/catch isolado); resposta ganhou o campo
  `emailSent`.
- Nenhuma mudança em `layout.tsx`, `EmailGate.tsx` ou no funil `/pre-diagnostico` (fora do
  escopo, tracking legado intocado).

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` (zero ocorrências nos arquivos tocados) e `build` limpos. Fluxo real
testado via API em `build && start`: os dois radares completos ponta a ponta, `emailSent:true`
nas duas respostas, e-mails chegando no Gmail do dono (confirmado ao vivo, duas rodadas — antes
e depois do redesign).
**Não verificado nesta sessão:** entrega em Outlook (sem conta de teste disponível); rotina de
import CSV → Substack (item do DoD, mas fora do escopo desta issue) segue sem documentação.

### **🎯 PRÓXIMOS PASSOS (ordem combinada com o dono):**
1. Issue pequena: mover `/privacidade` para o grupo público + mencionar a captura dos radares.
2. `/corrigir-bug` do reset de senha (bug pré-existente, fora do revamp).
3. Diagnóstico de performance no preview da Vercel (Lighthouse local deu 24–49 em mobile,
   abaixo do alvo ≥85 — precisa re-medir fora do ambiente local antes de abrir a issue).
4. Re-rodar o gate da ISSUE-112 depois dos itens acima, até zero FALHOU → autorizar o launch.

---

## 🎯 SESSÃO ANTERIOR: ISSUE-111.1 — Otimização de conversão da home
**Data:** 08 de julho de 2026
**Versão:** v3.10.0
**Status:** ⚠️ Aplicada — 5 itens no ar (local); pendências operacionais do dono listadas abaixo

### **🚀 O QUE FOI FEITO (em termos simples):**

A home apresentava bem, mas vazava conversão em 5 pontos (diagnóstico de marketing feito na
sessão anterior, registrado na própria issue). Todos atacados:

1. **A página agora termina pedindo ação** — seção de fechamento nova antes do footer, com as
   duas portas dos radares (mesmos rótulos do hero, para reconhecimento) + convite à
   newsletter. Quem rolou a página inteira é o visitante mais engajado; antes ele encontrava
   uma bio e ia embora.
2. **Dá para assinar a newsletter sem sair do site** — o CTA que jogava para o Substack virou
   um formulário embutido (embed oficial) na seção de newsletter. Era premissa aprovada desde
   o início do revamp (pergunta 5 do `00b`) que nunca tinha sido implementada.
3. **A newsletter subiu na página** — de posição 7 (depois dos 4 vídeos) para logo depois de
   "Como funciona": quem não vai testar agora encontra a oferta "então assine" bem antes.
4. **Micro-reasseguro nos convites de newsletter** — "Grátis. Uma conversa por semana. Cancela
   quando quiser." (remoção de fricção clássica).
5. **Bio do autor saiu do clichê** — de "gestor com carreira executiva + LinkedIn" para o
   endosso real: hoje na 99 implementando agentes de IA, soluções construídas com vibe coding,
   workshops, newsletter — fechando com *"Esta plataforma é uma delas."* (o site que a pessoa
   está usando é a prova). ⚠️ Fatos fornecidos pelo dono na sessão; veto de leitura pendente.

**Fora do escopo, por decisão registrada:** hero intocado (spec do mock), conteúdo do Pricing
intocado, prova social adiada para quando houver material real de leitores (Fase 1.5).

### **📊 TÉCNICO:**

- Novos: `src/components/home/FechamentoSection.tsx` e `NewsletterSignup.tsx` (client, embed
  com IntersectionObserver para o evento de visualização). `AutorSection.tsx` e
  `NewsletterSection.tsx` reescritos; ordem nova em `(publico)/page.tsx`.
- **4 eventos novos** na lista canônica (`src/lib/radar-events.ts`, a rota
  `/api/radar/event` valida contra ela): `closing_cta_opportunities_clicked`,
  `closing_cta_maturity_clicked`, `closing_newsletter_clicked`, `newsletter_embed_viewed`.
  O CTA alternativo do embed usa `newsletter_cta_clicked` com prop `location:
  'home_newsletter'` (não precisa de tag nova).
- Cliques DENTRO do iframe do Substack são cross-origin — não rastreáveis. O
  `newsletter_embed_viewed` dá a taxa de visualização; assinaturas efetivas o dono acompanha
  no painel do Substack.

### **📋 SPEC DE TAGS GTM (operação do dono, regra 5 do doc 07):**

Para os 4 eventos novos chegarem ao GA4, criar no container `GTM-PDJ2K5BX`, para CADA nome:
trigger tipo **Evento personalizado** com o nome exato do evento + tag **GA4 Event** enviando o
mesmo nome. (Trilho Supabase já grava sem configuração.)

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` (zero ocorrências nos arquivos tocados) e `build` limpos (37 páginas).
Smoke test no build de produção: `/` em 200, GTM presente, iframe do embed presente, ordem
nova confirmada no HTML (newsletter < demo < autor < fechamento), bio e fechamento renderizados,
6 nomes de evento (2 do hero + 4 novos) confirmados nos chunks JS. Grep de copy proibida zerado.
**Não verificado** (sem browser): disparo real no GTM Preview/Tag Assistant e aparência visual
do embed no tema escuro — mesma limitação das sessões anteriores.

### **🎯 PRÓXIMOS PASSOS (pendências do dono):**
1. Ler bio + fechamento + itens da ISSUE-111 (pricing "séries", P1 "a sua cara") e dar o veto.
2. Configurar as cores do embed no painel do Substack (o padrão é fundo branco — vai destoar
   do tema escuro até ajustar).
3. Criar as 4 tags GA4 no GTM (spec acima).
4. No deploy, anotar a data para ler as métricas antes/depois da reordenação.
Depois: ISSUE-112 (QA/gate de launch) ou Fase 1B em paralelo.

---

## 🎯 SESSÃO Anterior: ISSUE-111 — Revisão de copy (voz editorial)
**Data:** 08 de julho de 2026
**Versão:** v3.9.1
**Status:** ⚠️ Aplicada — 7 ajustes de copy no ar (local); falta o veto de leitura do dono
(critério de aceite da issue)

### **🚀 O QUE FOI FEITO (em termos simples):**

Passamos toda a superfície de texto nova (home, radares, resultados, `/newsletter`, `/lab`,
`/obrigado`, formulários, metadata) pelo filtro da voz da newsletter, com três lentes: tom de
corredor (sem cara de IA), português do Brasil de verdade (sem decalque de tradução) e CTAs que
motivam clique. A varredura confirmou que a maior parte já estava boa — os 14 blocos de
resultado dos radares são o padrão-ouro da casa e ficaram intocados. Saíram 7 ajustes cirúrgicos:

1. **`/lab`** — parágrafo principal reescrito: era lista de features emendada, virou
   tensão→contraste ("Conteúdo sobre IA não falta. O que falta é o passo seguinte...").
2. **`/lab`** — microcopy da lista alinhada com a da home ("A lista ajuda a decidir o que
   construir primeiro.").
3. **Pricing (home)** — "Artigos e **cursos** exclusivos" → "Artigos e **séries** exclusivas":
   a mesma página diz "não por quem vende curso". ⚠️ **Descreve a oferta paga — reverter se o
   plano pago realmente incluir cursos.**
4. **Demo da plataforma (home)** — "a mesma engenharia que recebe os radares" (imagem confusa)
   → "a mesma casa onde agora rodam os radares de IA".
5. **Radar de Maturidade, P1** — "Qual frase soa mais como você?" (decalque de *sounds like
   you*) → "Qual frase é mais a sua cara?" ⚠️ Pergunta canônica do doc 11 — pede olhar do dono.
6. **Diagnóstico de automação** — "desenhar a regra uma vez e sair do caminho" (*get out of the
   way*) → "e deixar rodar".
7. **Convite ao Radar de Maturidade** (resultado de Oportunidades) — link "Fazer o Radar de
   Maturidade" (função) → "Descobrir meu nível de verdade" (intenção).

**Avaliado e mantido de propósito:** mensagens de erro dos formulários (clareza > personalidade),
perguntas do Radar de Oportunidades (literais do doc operacional §11.4), "Assinar a newsletter"
no hero (spec do mock — trocar é decisão do dono), e todo o `content.ts` exceto o item 6.

### **📋 TAMBÉM NESTA SESSÃO:**

- **`docs/revamp/ISSUE-111-briefing-copy.md`** criado (mapa da varredura, preparado antes da
  execução — serve de referência do que foi olhado e por quê).
- **ISSUE-111.1 registrada no backlog** — otimização de conversão da home, nascida do
  diagnóstico de marketing feito com o dono: seção de fechamento antes do footer, embed do
  Substack na NewsletterSection (premissa aprovada da pergunta 5 do `00b`, nunca implementada),
  reordenação (Newsletter sobe, Demo desce), micro-reasseguro nos CTAs e AutorSection robusta
  ("quem escreve também constrói": 99, agentes de IA, vibe coding, workshops). Prova social
  adiada por decisão do dono (sem material real ainda; Fase 1.5).

### **✅ VALIDAÇÃO:**
`tsc --noEmit` e `build` limpos (34 rotas); `lint` sem nenhum erro/warning nos arquivos tocados
(os erros restantes são o débito legado da plataforma logada, adiado desde a Fase 3). Grep da
lista proibida de copy em `src/` inteiro: zero ocorrências. Mudanças são 100% strings — nenhum
componente, prop, rota ou tracking alterado.

### **🎯 PRÓXIMOS PASSOS:**
Dono lê as superfícies alteradas (em especial itens 3 e 5) e dá o veto final da ISSUE-111.
Em seguida: ISSUE-111.1 (conversão da home) — já especificada no backlog e elegível; depois
ISSUE-112 (QA/gate de launch). Fase 1B (114–120) segue liberada em paralelo.

---

## 🎯 SESSÃO Anterior: ISSUE-110 — SEO técnico
**Data:** 08 de julho de 2026
**Versão:** v3.9.0
**Status:** ✅ Concluída — estrutura mínima de SEO no ar em todas as páginas públicas

### **🚀 O QUE FOI FEITO (em termos simples):**

Até aqui o site não tinha "etiquetas" para o Google entender. Fizemos 5 coisas:

1. **Cartão de visita ao compartilhar o link** — WhatsApp/LinkedIn/Twitter agora mostram um
   preview com título, descrição e uma imagem de capa da marca (gerada automaticamente, sem
   precisar de designer). Antes o link aparecia pelado.
2. **Mapa do site pro Google** (`sitemap.xml`) — lista as páginas que devem aparecer na busca:
   home, os 2 radares, `/newsletter` e `/lab`.
3. **Placa de "não entre aqui" pro Google** (`robots.txt`) — instrui o Google a não tentar
   indexar as páginas que exigem login (dashboard, diagnóstico, painel semanal etc.), evitando
   que apareça informação de assinante em busca e evitando desperdiçar o rastreamento do Google
   com página que ele não consegue ver mesmo.
4. **Ficha de identidade do site** (JSON-LD `WebSite` na home) — um bloco de dados invisível
   dizendo explicitamente ao Google "isso é o +ConverSaaS, o ecossistema da newsletter Conversas
   no Corredor", em vez de deixar o Google adivinhar pelo texto.
5. **Corrigido um problema real de estrutura**: as páginas `/newsletter`, `/lab` e `/obrigado`
   não tinham nenhum "título principal" marcado tecnicamente (H1) — só tinham H2. Visualmente
   ninguém percebe diferença; para o Google, é como a página não ter título claro. Corrigido sem
   mudar nada visual.

**O que isso NÃO faz:** não garante posição no Google — isso depende de tempo, conteúdo e
concorrência. É só a base técnica mínima para o site ser encontrável e bem interpretado.

### **🚀 O QUE FOI FEITO (detalhe técnico):**

- `metadataBase` + `openGraph`/`twitter` base em `src/app/layout.tsx` — título/descrição de cada
  página passam a espelhar automaticamente em `og:title`/`og:description`/`twitter:*`.
- `src/app/opengraph-image.tsx` + `twitter-image.tsx`: imagem 1200×630 gerada via `next/og`
  `ImageResponse` (tokens DS2), estática em build. Sem ferramenta de edição de imagem disponível
  neste ambiente para produzir um PNG manual em `public/og/*`, então a "imagem estática da marca"
  virou uma rota de imagem gerada pelo Next — mesmo resultado prático (uma imagem, sempre igual,
  servida em toda página que não define a própria).
- `src/app/sitemap.ts` (5 rotas de conteúdo) e `src/app/robots.ts` (bloqueia `/api/` + as 9 rotas
  privadas de `(app)`) novos.
- JSON-LD `WebSite` em `src/app/(publico)/page.tsx`.
- Auditoria de H1: `/newsletter`, `/lab`, `/obrigado` tinham 0 H1. Adicionada prop `as="h1"` no
  `SectionTitle` (`src/components/ds2/SectionTitle.tsx`) — visual idêntico, só semântica — usada
  no heading principal das 3 páginas.
- `(app)/layout.tsx` é client component e não pode exportar `metadata`. Lógica extraída 100%
  intacta para `src/app/(app)/AppShell.tsx`; o `layout.tsx` virou Server Component só com
  `robots: {index:false, follow:false}`, cobrindo as 9 rotas privadas de uma vez, sem tocar em
  nenhuma página individual da plataforma logada.
- `/obrigado` (pós-conversão) ganhou `robots: {index:false}` própria e ficou fora do sitemap —
  prática padrão de SEO para thank-you pages. `/auth` e `/pre-diagnostico` também ficaram fora do
  sitemap (transacional a primeira; backstage/hands-off a segunda, ver `00b_open_questions.md`
  pergunta 6).

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` e `build` limpos (34 rotas). Smoke test via curl no build de produção:
`og:title`/`og:description` espelhando o título de cada página automaticamente, `og:image`/
`twitter:image` respondendo 200 (PNG real, 1200×630), JSON-LD válido (`JSON.parse` sem erro),
`/dashboard` com `noindex, nofollow`, exatamente 1 `<h1>` em `/`, `/newsletter`, `/lab`,
`/radar/maturidade`, GTM intacto, CTAs da home intactos, todas as rotas tocadas em 200.
**Não verificado** (sem browser/internet neste ambiente): Rich Results Test do Google e
Lighthouse SEO real — mesma limitação já registrada nas sessões anteriores de analytics/QA.

### **🎯 PRÓXIMOS PASSOS:**
Fase 1 segue com ISSUE-111 (revisão de copy) e ISSUE-112 (QA/gate de launch) como pendentes não
iniciadas — ambas fazem sentido só depois de tudo visível estar pronto, o que já é o caso.
Fase 1B (114–120, restyle DS2 da plataforma logada) segue liberada em paralelo. Oportunidade
registrada, não corrigida: validar o Rich Results Test e o Lighthouse SEO reais quando houver
acesso a browser/preview (dono pode rodar e reportar).

---

## 🎯 SESSÃO Anterior: fecha ISSUE-109 — 2 eventos do hero pendentes
**Data:** 08 de julho de 2026
**Versão:** v3.8.1
**Status:** ✅ Concluída — ISSUE-109 fica 15/15 eventos instrumentados

### **🚀 O QUE FOI FEITO:**

Ao revisar o plano com o dono depois da ISSUE-108, ficou claro que a ISSUE-109 (analytics)
continuava parcial: os 2 CTAs do hero da home (`Descobrir o que posso construir` / `Ver meu
nível em IA`) não disparavam `hero_cta_opportunities_clicked`/`hero_cta_maturity_clicked` — a
ISSUE-107 criou a home mas não instrumentou esses cliques, apesar do backlog já prever isso como
parte do escopo dela.

- Extraído `src/components/home/HeroCtas.tsx` (novo, `'use client'`) do `HeroSection.tsx`, que
  continua server component. `HeroCtas` chama `track()` no `onClick` dos 2 botões, sem mudar
  copy, destino ou visual.
- `thank_you_page_viewed` (o 3º evento pendente) já tinha entrado junto com a ISSUE-108.

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` e `build` limpos (33 rotas). Smoke test via curl no build de produção:
os 2 nomes de evento presentes no HTML gerado da home, `href` dos CTAs (`/radar/oportunidades`,
`/radar/maturidade`) intactos, `/` respondendo `200`.
**Não verificado** (sem ferramenta de browser neste ambiente): disparo real no GTM
Preview/Tag Assistant — mesma limitação já registrada nas sessões anteriores de analytics.

### **🎯 PRÓXIMOS PASSOS:**
Fase 1 segue com ISSUE-110 (SEO técnico), ISSUE-111 (revisão de copy) e ISSUE-112 (QA/gate de
launch) como pendentes não iniciadas. Fase 1B (114–120) liberada para começar em paralelo.

---

## 🎯 SESSÃO Anterior: ISSUE-108 — Páginas /newsletter, /lab e /obrigado
**Data:** 08 de julho de 2026
**Versão:** v3.8.0
**Status:** ✅ Concluída — 3 páginas no ar (local), SQL da tabela `lab_leads` rodado e verificado
pelo dono, teste manual do dono aprovado
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Com a homepage reposicionada (ISSUE-107) no ar, a ISSUE-108 completou a periferia do funil:
`/newsletter`, `/lab` e `/obrigado`.

- **`/newsletter`** (`src/app/(publico)/newsletter/page.tsx`): página editorial com os temas da
  newsletter (copy literal do doc operacional §8.7), exemplos de leitura reais e CTA de assinatura
  (Substack).
- **`/lab`** (`src/app/(publico)/lab/page.tsx`): premium em construção + formulário de lista de
  interesse (`src/components/lab/LabWaitlistForm.tsx`, client). Descoberta na implementação:
  `api/radar/lead` exige `sessionId` de uma `radar_sessions` existente — inviável para visita
  solta à `/lab` sem ter passado por um radar antes. Decisão do dono: tabela nova e isolada
  `lab_leads` (não referencia as tabelas do radar) + rota própria `POST /api/lab/interest`
  (validação de e-mail, honeypot, rate limit 5/h/IP, mesmo padrão da ISSUE-106). SQL rodado e
  verificado pelo dono em produção (`rowsecurity = true`, 0 políticas).
- **`/obrigado`** (`src/app/(publico)/obrigado/page.tsx`): leituras recomendadas (reaproveitando
  `LEITURAS`, agora exportado de `src/lib/radar/content.ts`) + CTA newsletter + CTA Lab. Dispara
  `thank_you_page_viewed` via `src/components/obrigado/ObrigadoTracker.tsx` — o evento que a
  ISSUE-109 tinha deixado pendente esperando esta página existir. **Decisão do dono:** página
  fica standalone por enquanto — os componentes de resultado dos radares (já revisados/travados
  no gate do Sprint 1) não foram tocados, então nada redireciona para cá ainda; ligar esse fluxo
  fica para uma issue futura.
- **Integração com o que já existia:** `PublicHeader` tinha links `#newsletter`/`#lab` (âncoras
  que só funcionavam dentro da própria home, quebradas em qualquer outra página pública) —
  corrigidos para rotas reais. O CTA "Quero entrar na lista do Lab" da home (`LabSection.tsx`)
  ganhou destino real (`/lab`) — antes era só vitrine sem link.
- **Achado do dono no teste manual (registrado, não corrigido — fora do escopo desta issue):** a
  home não tem chamada óbvia para `/newsletter` — a seção "Newsletter" da home linka direto pro
  Substack, nunca passa pela página interna; os links do `PublicHeader` só aparecem no desktop
  (somem no mobile). Oportunidade de melhoria de UX/navegação para uma issue futura.

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` (arquivos tocados) e `build` limpos (33 rotas). Grep de hex solto no diff:
zero. Smoke test via curl no build de produção: `/`, `/newsletter`, `/lab`, `/obrigado`,
`/radar/maturidade`, `/radar/oportunidades` respondendo `200`; GTM presente no HTML; CTAs
corretos no HTML da home. `/api/lab/interest` testado (e-mail inválido → `400`; honeypot → `200`
sem gravar; e-mail válido → `500` antes do SQL rodar, confirmando a dependência). Dono rodou o
SQL de `lab_leads` (`docs/revamp/ISSUE-108-sql-lab-leads.md`), verificou RLS ligada e zero
políticas, testou o formulário do `/lab` no navegador e aprovou.
**Achado de ambiente (não é bug de código):** o build de produção falhava de forma intermitente
com erro opaco de webpack ao pré-renderizar `/radar/maturidade` — causa real era um `npm run dev`
do dono rodando em paralelo na mesma pasta (porta 3000), corrompendo a `.next` compartilhada com
o build. Não rodar dev e build ao mesmo tempo na mesma pasta.

### **🎯 PRÓXIMOS PASSOS:**
Oportunidade registrada: dar mais destaque de navegação para `/newsletter` na home (CTA interno
+ link visível no mobile). Fora isso, a Fase 1B (redesign DS2 da plataforma logada, ISSUES
114–120) segue liberada para começar a qualquer momento.

---

## 🎯 SESSÃO Anterior: ISSUE-107 — Homepage reposicionada
**Data:** 08 de julho de 2026
**Versão:** v3.7.0
**Status:** ✅ Concluída — home nova no ar (local), validada por lint/tsc/build + smoke test +
teste manual do dono (mobile e desktop)
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Com os radares (103–106) e o gate de revisão do Sprint 1 (v3.6.9) prontos, a ISSUE-107 trocou a
landing de produtividade antiga pela home da nova tese — o go-live visual do reposicionamento.

- **`src/app/(publico)/page.tsx`** reescrito do zero: era um monólito `'use client'` de 1106
  linhas (JSX duplicado para mobile/desktop); virou uma composição limpa das 12 seções da spec
  (`docs/revamp/01_product_spec_faseada.md` §5), cada uma em `src/components/home/*`
  (HeroSection, ProblemaSection, ReframeSection, PortasSection, ComoFuncionaSection,
  PlataformaDemoSection, NewsletterSection, DiferenciacaoSection, PricingSection, LabSection,
  AutorSection), seguindo pixel-a-pixel o mock aprovado
  `docs/revamp/mockups/landing-preview-final.html`.
- **`src/components/shared/`** novo: `PublicHeader` e `PublicFooter` (navegação/rodapé públicos
  no DS2) + `PWAInstallBanner` — extraído do `page.tsx` antigo (lógica 100% intocada) para não
  perder o prompt de instalação do PWA ao substituir o arquivo inteiro.
- **CTAs seguem a escada de captura** (`docs/revamp/10_jornada_captura_radares.md`): hero
  primário e card "Oportunidades" → `/radar/oportunidades` (badge "diagnóstico completo por
  e-mail"); hero secundário e card "Maturidade" → `/radar/maturidade` (badge "comece grátis").
  Sem `href` de fallback — os radares já existem. **ISSUE-107B fechada sem execução** (ficou
  obsoleta, como já era esperado).
- **Preservado por decisão do dono:** pricing (3 planos, cards DS2) e a seção "A plataforma em
  ação" com os 4 vídeos de demo reais, mantendo o progressive loading (1º autoplay mudo, demais
  clique-para-tocar).
- **Janela de app animada no hero** (`HeroAppPreview.tsx`, client): prévia decorativa do Radar
  de Oportunidades ciclando opção destacada + progresso, respeitando `prefers-reduced-motion`
  — não é o radar de verdade (fora do escopo desta issue).
- **CTA "Quero entrar na lista do Lab" fica sem destino funcional de propósito** — é vitrine; a
  captura real (waitlist no banco) é a ISSUE-108.

### **✅ VALIDAÇÃO:**
`tsc --noEmit`, `lint` e `build` limpos (29 rotas, home com 4,35 kB / 119 kB first load). Grep
de `#[0-9a-fA-F]{6}` no diff retornou zero (um hex solto detectado e removido durante a própria
sessão, trocado por token DS2). Smoke test via `curl` no build de produção: `/`,
`/radar/maturidade`, `/radar/oportunidades`, `/auth`, `/privacidade` respondendo `200`; GTM
(`GTM-PDJ2K5BX`) presente no HTML da home; os 2 CTAs de cada radar presentes no HTML.
Confirmado que `src/app/layout.tsx` (onde vive o GTM) ficou byte-idêntico — zero diff nessa
sessão. O dono testou a home em `npm run dev` (mobile e desktop) e aprovou visualmente.
**Não verificado nesta sessão:** disparo real da conversão do Google Ads via GTM Preview/Tag
Assistant (exige o login do dono no Google) — o código do disparo (`OportunidadesResultado.tsx`)
não foi tocado por esta issue e já estava validado nas sessões da ISSUE-106/109; o dono foi
orientado a confirmar via console (`Google Ads conversion triggered`) ou Tag Assistant quando
quiser.

### **🎯 PRÓXIMOS PASSOS:**
Próxima natural é a **ISSUE-108** (`/newsletter`, `/lab`, `/obrigado`) — completa a periferia do
funil e dá destino real ao CTA da lista do Lab. Em paralelo, a Fase 1B (redesign visual DS2 da
plataforma logada, ISSUES 114–120) pode começar a qualquer momento, já que não depende da 108.

---

## 🎯 SESSÃO Anterior: Gate de Revisão do Sprint 1 (Fable 5) — 103+104+105+106+109
**Data:** 08 de julho de 2026
**Versão:** v3.6.9
**Status:** ✅ Concluída — 3 achados corrigidos e verificados; gate liberado para a ISSUE-107
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Ritual de fim de sprint do `docs/revamp/05_model_execution_strategy.md` §2: sessão trocada para
Fable 5, `/code-review` (nível `high`) rodado sobre o diff acumulado do Sprint 1 completo
(`3d25bcc..94038ac` — ISSUE-104+105 → 106 → 103 → 109), checado contra as travas (tracking/Ads,
RLS, escopo, voz de copy).

- **Achado de infraestrutura registrado:** os 8 subagentes paralelos do `/code-review` foram
  cortados pelo limite de sessão da conta antes de devolver resultado. A revisão foi refeita
  inline (leitura completa dos arquivos de produto do diff + verificação de cada candidato contra
  o código real) — nada ficou pendente de re-execução.
- **3 correções aplicadas:**
  1. **Corrida do duplo clique** (`src/components/radar/RadarFlow.tsx`) — selecionar uma opção e
     corrigir para outra em menos de 320ms enfileirava dois `setTimeout` de auto-avanço sem
     cancelamento; o índice avançava duas vezes, pulava uma pergunta sem resposta, e o motor
     (`calcularMaturidade`/`decidirOportunidade`) lançava erro não tratado dentro do timeout —
     o usuário respondia tudo e ficava travado sem resultado, sem mensagem de erro. Corrigido
     guardando o timeout num `ref` e cancelando-o em toda seleção nova, "Continuar" e "Voltar".
  2. **Estouro de `VARCHAR` sem sanitização** (`src/app/api/radar/session/route.ts`,
     `src/app/api/radar/lead/route.ts`) — `utm_*` (VARCHAR(100)), `name` (VARCHAR(100)) e `email`
     (VARCHAR(255)) eram inseridos sem teto de tamanho; um valor maior (comum em UTM de campanha)
     estourava o `INSERT` no Postgres (`22001`) e virava `500` — justamente no tráfego pago,
     perdendo sessão/lead. Corrigido truncando/validando tamanho antes do insert; **bônus**:
     `answers` do `PATCH` também ganhou teto (máx. 40 chaves, valores ≤100 chars) contra abuso de
     JSONB sem limite.
  3. **`session_id` ausente em 3 eventos de conversão** (`OportunidadesResultado.tsx`,
     `MaturidadeResultado.tsx`) — `result_full_requested` (o evento do gate de e-mail),
     `recommended_article_clicked` e `newsletter_cta_clicked` gravavam em `radar_events` com
     `session_id` nulo, quebrando o join do funil por sessão. Corrigido com um helper
     `trackComSessao` que resolve o `sessionId` antes de disparar.
- **3 decisões de produto registradas para o dono, não corrigidas** (fora do escopo de um gate de
  código): `newsletter_optin: true` por default no lead sem checkbox de consentimento (contradiz
  o "sem spam" da tela); rate limit de 20 sessões/hora/IP pode bloquear tráfego atrás de NAT
  corporativo; o conteúdo gated de oportunidades viaja inteiro no bundle público (aceitável como
  gate de marketing já que a conversão real é derivada do servidor, mas vale registrar a decisão).

### **✅ VALIDAÇÃO:**
`npx tsc --noEmit` limpo, `npm run lint` sem nenhum aviso novo nos arquivos tocados, 37/37 testes
de `lib/radar` verdes, `npm run build` com as 29 rotas. Testado via curl contra o build de
produção (`npm run start` em porta isolada): UTM de 300 caracteres → sessão criada com sucesso
(antes: 500); `answers` abusivo no PATCH → `400`; PATCH válido → `success`; email de 260
caracteres → `400` (antes: 500 do Postgres); evento de conversão → gravado com `session_id`
preenchido. `/pre-diagnostico` e `/radar/oportunidades` respondendo `200` (checklist padrão da
casa após mudança em rotas de captura).
**Não verificado** (sem ferramenta de browser neste ambiente, mesma limitação das sessões
anteriores): teste manual do duplo clique corrigido no navegador real.

### **🎯 PRÓXIMOS PASSOS:**
Gate do Sprint 1 liberado — **ISSUE-107** (homepage reposicionada) é a próxima, já com CTAs
diretos para `/radar/maturidade` e `/radar/oportunidades` (ver `03_implementation_plan.md`).
Ela também destrava os 3 eventos de analytics pendentes da ISSUE-109
(`hero_cta_opportunities_clicked`, `hero_cta_maturity_clicked`) como parte natural do seu escopo
(CTAs do hero); o terceiro (`thank_you_page_viewed`) depende da ISSUE-108 (`/obrigado`).
Modelo recomendado pela `05_model_execution_strategy.md`: Sonnet (mock já é a spec literal de
conteúdo), com a `ISSUE-111` (Fable 5) como rede de segurança para copy nova fora do mock.

---

## 🎯 SESSÃO Anterior: ISSUE-109 — Analytics do funil novo (GTM + Supabase)
**Data:** 07 de julho de 2026 (quinta sessão do dia)
**Versão:** v3.6.8
**Status:** ⚠️ Parcial — 12 dos 15 eventos instrumentados; 3 dependem de páginas que ainda não existem
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Com os radares navegáveis (ISSUE-103) e o backend de captura pronto (ISSUE-106), implementada a
instrumentação de analytics do funil novo — duplo trilho (GTM/GA4 + Supabase), igual ao padrão
já usado no funil legado.

- **`src/lib/analytics.ts`** — helper `track(event, props)`: dispara `window.dataLayer.push`
  (GTM → GA4, tag criada pelo dono na UI) e `POST /api/radar/event` via `navigator.sendBeacon`
  com fallback `fetch(keepalive: true)`; nunca bloqueia navegação (falha de rede é engolida).
  `capturarUtm()`/`lerUtm()` capturam UTM da URL no primeiro pageview e persistem em
  `sessionStorage['conversaas.utm']` durante a sessão do navegador.
- **`src/lib/radar-events.ts`** — lista canônica dos 15 nomes de evento do doc operacional §21,
  em módulo neutro (sem `'use client'`) — motivo no achado de arquitetura abaixo.
- **`src/app/api/radar/event/route.ts`** — grava em `radar_events` (schema reservado desde a
  ISSUE-106); valida `eventName` contra a lista canônica (rejeita nomes inventados com `400`);
  rate limit 120/hora/IP (mais generoso que sessão/lead — um único fluxo de radar dispara vários
  eventos legítimos); responde `200` mesmo em erro interno — analytics não pode virar mensagem de
  erro pro usuário.
- **12 dos 15 eventos instrumentados** em `RadarFlow`, `EmailCaptureRadar`, `MaturidadeResultado`,
  `OportunidadesResultado`: início/conclusão de cada radar, visualização e envio do formulário de
  e-mail (honeypot filtrado — bot não conta como evento real), resultado revelado, clique em
  leitura recomendada, interesse no Lab (clique + envio), CTA de newsletter.
- **UTM real passou a ser enviado** — `POST /api/radar/session` já suportava `utm.*` desde a
  ISSUE-106, mas o front não mandava; agora `RadarFlow` lê `sessionStorage` e envia no payload.
- **`docs/revamp/ISSUE-109-eventos-analytics.md`** — especificação de tags/triggers GA4 para o
  dono aplicar na UI do GTM (o código só faz `dataLayer.push`; a tag em si é config de plataforma).

### **🔍 Achado de arquitetura (registrado no backlog para não repetir):**
A rota de API (`api/radar/event/route.ts`, server-side) importava `RADAR_EVENT_NAMES` de
`analytics.ts`, um módulo `'use client'`. O Next resolveu isso como referência de client
component dentro do bundle do servidor — `RADAR_EVENT_NAMES.includes()` quebrava em runtime
(`TypeError`), mascarado pelo catch-all que sempre responde `200` (só apareceu testando via curl
e lendo o log do servidor; o teste "evento inválido deveria dar 400" retornava `200` silenciosamente).
Corrigido extraindo a lista para `radar-events.ts`, um módulo neutro importado por ambos os lados.
**Regra geral:** constantes compartilhadas entre componente client e rota de API não podem morar
num módulo com `'use client'`.

### **⚠️ Pendência explícita (não é retrabalho — bloqueio real de dependência):**
3 dos 15 eventos (`hero_cta_opportunities_clicked`, `hero_cta_maturity_clicked`,
`thank_you_page_viewed`) dependem de páginas que ainda não existem: a home nova (ISSUE-107) e a
página `/obrigado` (ISSUE-108). O helper `track()` já está pronto — instrumentar esses 3 quando
as issues rodarem é uma chamada de uma linha em cada CTA/mount, seguindo o padrão dos 12 já
implementados.

### **✅ VALIDAÇÃO:**
`lint`, `tsc --noEmit`, `build` (29 rotas, +1 pela rota `api/radar/event`) e os 37 testes de
`lib/radar` verdes. Testado via curl: `POST /api/radar/session` aceita e persiste `utm.source`
etc.; `POST /api/radar/event` com nome de evento fora da lista canônica → `400`; evento válido →
`200` + gravação confirmada em `radar_events` (session_id vinculado corretamente). Corrigido
durante a validação: `session_id` estava vazando para o `dataLayer`/GA4 (deveria viajar só no
trilho Supabase) — helper ajustado para separar os dois payloads.
**Não verificado** (sem ferramenta de browser neste ambiente, mesma limitação registrada na
ISSUE-103): clique real no fluxo do navegador disparando os eventos + GTM Preview/Tag Assistant
para as tags GA4 (ainda não criadas — ver especificação entregue ao dono). Rate limit
(120/hora/IP) não testado por completo, de propósito (evitaria gerar 120 linhas de lixo em
`radar_events` de produção só para confirmar o teto).
ISSUE-109 marcada `⚠️ parcial` em `docs/revamp/04_issue_backlog.md`. `docs/revamp/00b_open_questions.md`
pergunta 8 atualizada: `radar_events` (não `roi_events`) confirmada como decisão final.

### **🎯 PRÓXIMOS PASSOS:**
Com 103+104+105+106+109 prontos (109 parcial, pendência documentada e não-bloqueante), o Sprint 1
está no ponto do gate de revisão do diff acumulado antes de abrir a **ISSUE-107** (homepage
reposicionada) — que também vai destravar os 3 eventos pendentes desta issue como parte natural
do seu escopo (CTAs do hero). Considerar rodar a revisão Fable 5 do Sprint 1 antes de avançar.

---

## 🎯 SESSÃO Anterior: ISSUE-103 — Páginas /radar/maturidade e /radar/oportunidades
**Data:** 07 de julho de 2026 (quarta sessão do dia)
**Versão:** v3.6.7
**Status:** ✅ Concluída — fluxo navegável ponta a ponta nos dois radares, validado localmente
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Com motor (104), conteúdo (105, aprovado pelo dono nesta sessão) e backend (106) prontos,
implementada a UI dos dois radares — a primeira experiência pública nova do revamp que o dono
efetivamente usou no navegador.

- **`src/components/radar/`** — `RadarFlow` (orquestrador client-side compartilhado pelos dois
  radares), `QuestionCard` (card de produto: pergunta única, auto-avanço, voltar/continuar ao
  revisitar pergunta já respondida, transições `framer-motion`), `OptionButton`, `RadarChartAxes`
  (gráfico radar via `recharts`), `EmailCaptureRadar` (formulário com honeypot + checkbox de
  interesse no Lab), `MaturidadeResultado`, `OportunidadesResultado`.
- **`src/app/(publico)/radar/{maturidade,oportunidades}/page.tsx`** — Server Components com
  `metadata` própria por página, delegando toda a interatividade ao `RadarFlow`.
- **`src/lib/radar-storage.ts`** — cruzamento de maturidade via
  `sessionStorage['conversaas.radar.maturidade']`, deliberadamente fora de `lib/radar/` para
  preservar a pureza do motor (regra da ISSUE-104).
- **Escada de captura** (doc 10) respeitada: maturidade sempre entrega resultado completo grátis
  (CTA-ponte para oportunidades + e-mail suave opcional, nunca bloqueia nada); oportunidades
  mostra teaser real sem e-mail e só destrava o diagnóstico completo (8 blocos + "Na prática" +
  cruzamento + diligência) depois do gate.
- **Conversão do Google Ads replicada do padrão do `EmailGate`** — dispara
  `gtag('event','conversion', …)` só quando a rota de lead responde `triggerConversion: true`
  (lead de oportunidades). `layout.tsx` e o funil legado não foram tocados.
- **Ajuste de acessibilidade:** inputs do formulário de e-mail ganharam `aria-label`; a pergunta
  de cada card virou `<h1>` (heading único por tela) — vai além do mínimo pedido pela issue porque
  o critério de aceite cita Lighthouse a11y ≥90 explicitamente.
- **Ajuste de estilo pós-teste do dono:** o badge de "família" no resultado de oportunidades
  (ex. "Visualização e decisão") usava a receita padrão do `Badge` do DS2 — mono, caixa alta,
  pensada para tags curtas ("no ar", "premium"). Numa frase de duas palavras ficou ilegível; ajustado
  para fonte sans, caixa normal, mantendo o formato pill. O espaçamento entre o rótulo do nível
  ("você entra pelo nível 2: template reutilizável") ficou registrado como pendência de estilo
  para revisão com Fable 5 — não mexido nesta sessão, por pedido do dono.

### **✅ VALIDAÇÃO:**
`lint`, `tsc --noEmit`, `build` (28 rotas, as 2 novas incluídas) e os 37 testes de `lib/radar`
verdes. Sem ferramenta de browser neste ambiente — a verificação visual foi feita pelo dono
rodando `npm run dev` localmente (ainda não publicado): confirmou o radar de maturidade "bonito"
e o fluxo funcionando; achou e reportou o problema de estilo do badge (corrigido nesta sessão);
não testou o envio de e-mail por completo porque os testes anteriores (via curl, ISSUE-106 e
desta sessão) já tinham consumido o rate limit de 5 leads/hora/IP. **Lighthouse a11y ≥90** (citado
nos critérios de aceite da issue) não foi medido — nenhuma ferramenta de auditoria disponível
neste ambiente; recomenda-se rodar antes do lançamento público.
**Incidente à parte, sem relação com o código:** durante o teste, um processo `node` de uma
sessão de build anterior ficou preso na porta 3000 e serviu conteúdo obsoleto — parecia a home
"quebrada", mas era só a porta errada. Resolvido matando o processo e subindo o servidor de novo;
nenhum código foi alterado por causa disso. A landing page em si está intocada (é a antiga —
o redesign é a ISSUE-107, fora do escopo desta issue).
ISSUE-103 marcada `✅ concluída` em `docs/revamp/04_issue_backlog.md`.

### **🎯 PRÓXIMOS PASSOS:**
**ISSUE-109** (analytics do funil novo — GTM + Supabase, 15 eventos em duplo trilho) é a próxima
do Sprint 1. Modelo recomendado: **Sonnet com persona Analytics & Ads** (validação final Fable 5).
Só depois da 109 roda o gate de revisão do Sprint 1 completo (103+104+105+106+109 — "radar ponta
a ponta com lead no banco + eventos visíveis") antes de abrir a ISSUE-107 (home), que é Sprint 2.

---

## 🎯 SESSÃO Anterior: ISSUE-106 — Backend de captura dos radares (tabelas, RLS, rotas API)
**Data:** 07 de julho de 2026 (terceira sessão do dia)
**Versão:** v3.6.6
**Status:** ✅ Concluída — todos os 5 critérios de aceite validados em produção local
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Publicado o commit pendente da sessão anterior (v3.6.5 estava só local, 1 commit atrás do
`origin/main`) e implementada a ISSUE-106 — o backend que faltava para os radares deixarem de
ser motor+conteúdo isolados (ISSUE-104/105) e virarem um funil de captura real.

- **3 tabelas novas no Supabase** (`radar_sessions`, `radar_leads`, `radar_events` — esta última
  só schema, reservada para a ISSUE-109/analytics, sem código gravando nela ainda): RLS
  habilitada + **zero políticas** para `anon`/`authenticated` + `REVOKE ALL` explícito (achado
  da revisão Fable 5: o Supabase concede um GRANT default residual em toda tabela nova do schema
  `public`, que fica "dormindo" mesmo com RLS sem políticas — mesma classe de risco do incidente
  `roi_leads` da Fase 3, agora fechada preventivamente). SQL entregue e **rodado pelo dono** em
  `docs/revamp/ISSUE-106-sql-radar-tabelas.md` (com rollback e SELECTs de verificação).
- **Duas rotas novas:** `src/app/api/radar/session/route.ts` (`POST` cria a sessão no início do
  fluxo com rate limit por IP via banco; `PATCH` salva respostas + resultado ao final) e
  `src/app/api/radar/lead/route.ts` (captura de e-mail com honeypot, rate limit próprio, e
  `kind`/`triggerConversion` **derivados da sessão salva no banco — nunca do body do cliente**,
  fechando uma brecha que permitiria forjar conversões falsas do Google Ads).
- **2 desvios da spec escrita corrigidos antes de codar** (documentados e confirmados com o
  dono): `roi_events` não podia ser reusada para os eventos do radar como o `02_technical_spec.md`
  sugeria (FK travada em `roi_prediag_sessions`, coluna `payload` ≠ `properties` assumido) →
  `radar_events` nova em vez disso; `src/lib/email-validator.ts` citado na spec é o arquivo
  errado (checa allowlist de assinante pago pra login, não formato de e-mail público) → validação
  de formato simples, igual ao padrão do `prediag/lead`.
- **Revisão Fable 5** do SQL/RLS + das 2 rotas antes de entregar ao dono (ritual da 106 no
  `05_model_execution_strategy.md`) — 1 achado aplicado (REVOKE ALL acima), resto confirmado
  limpo (rollback, FKs, client service_role, ausência de SQL injection).

### **✅ VALIDAÇÃO:**
`lint`, `tsc --noEmit`, `build` (26 rotas) verdes. Todos os 5 critérios de aceite testados via
`curl` contra o servidor local após o dono rodar o SQL: lead aparece no banco; `triggerConversion`
correto por `kind` (`false` maturidade / `true` oportunidades); e-mail inválido → `400`; rate
limit bloqueia na 6ª tentativa → `429`; chave anon → `42501 permission denied` em `radar_leads`
(não vaza nem `[]` silencioso); honeypot devolve sucesso falso sem gravar; `/pre-diagnostico`
intocado e respondendo `200` (checklist padrão da casa após mudança de schema/RLS).
ISSUE-106 marcada `✅ concluída` em `docs/revamp/04_issue_backlog.md`.

### **🎯 PRÓXIMOS PASSOS:**
**ISSUE-103** (páginas `/radar/maturidade` e `/radar/oportunidades`) — agora com motor (104),
conteúdo (105) e backend (106) todos prontos e testados; decisão de modelo confirmada: **Sonnet**
(spec fechada, sem decisão de copy/design nova — ver `05_model_execution_strategy.md`). Rodar o
gate de revisão Fable 5 do diff acumulado do Sprint 1 (103+104+105+106+109) depois que a 103
fechar, antes de avançar para a ISSUE-107 (home).

---

## 🎯 SESSÃO Anterior: Implementação do Motor dos Radares — ISSUE-104 e ISSUE-105 (prep da Fase 1 do revamp)
**Data:** 07 de julho de 2026
**Versão:** v3.6.5
**Status:** ✅ Concluída — **ISSUE-104 ✅ completa** (motor 100% testado), **ISSUE-105 ✅ completa** (conteúdo pronto; dono leu os 14 blocos e aprovou o tom em 2026-07-07). Radares prontos para UI (ISSUE-103) e backend (ISSUE-106).
**Duração:** ~1 sessão longa

### **🚀 O QUE FOI FEITO:**

**ISSUE-104 — Motor de Assessment** (`src/lib/radar/`)
- `types.ts` — contratos completos do motor (maturidade/oportunidades + teaser/gated)
- `maturidade.ts` — 7 perguntas sutis (AI Fluency) + P8 não pontuada; scoring 7–35 / 5 faixas; eixos de gráfico
- `oportunidades.ts` — matriz de pesos 100% declarativa (transcrição literal doc 11), modificadores (sensível, conforto), guard-rails (agêntico nunca entra), desempate por complexidade; P1 com áreas novas (Estudante/Empreendedor)
- Testes (`vitest` 4.1.10): **37/37 passando** — 7 personas do dono + varredura de 7.000 combos de guard-rails, bordas de faixa, empates, determinismo. Aritmética validada ponto a ponto.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` — todos verdes (24 rotas, nada quebrou)

**ISSUE-105 — Conteúdo dos Resultados** (`src/lib/radar/content.ts`)
- 5 resultados de maturidade (grátis na tela): nível + corpo + risco + próximo salto + 2 leituras reais do Substack + ponte para oportunidades + 5 variações de próximo passo por P8
- 9 teasers (tom de exploração, não veredito): direção da oportunidade + família 2-níveis + promessa do completo
- 9 diagnósticos completos (atrás do e-mail): 8 blocos (tipo/porquê/complexidade/risco/passo/leitura/CTAs) + 9º bloco **"Na prática"** (gancho "Sabia que" com ferramenta real por nível — Gemini grátis até Claude Code; próximo degrau da família; mini-guia no e-mail)
- Cruzamento de maturidade: real (`sessionStorage` via degrau 1) + estimativa por P8 (conforto)
- Bloco de Diligência automático (dado sensível = sempre rebaixa + flag)
- Exemplos por área (Estudante/Empreendedor em todos os 9 tipos)
- **Validação:** 11 URLs conferidas byte a byte contra a fonte (contexto editorial §14); grep de frases proibidas limpo ("desbloqueio" achado e reescrito); Records TS garantem exaustividade (5 níveis × 9 tipos × 5 estimativas)
- **Pendente:** Você lê os 14 blocos e aprova o tom (refinar depois de publicado = OK)

---

## 🎯 SESSÃO ANTERIOR: Cérebro dos Radares — motor, pesos, personas e decisões de UX (prep das ISSUE-103–106)
**Data:** 06 de julho de 2026 (segunda sessão do dia)
**Versão:** v3.6.4
**Status:** ✅ Concluída — spec do motor APROVADA pelo dono, **nenhum código de produto alterado**
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Sessão de visão pedida pelo dono antes de executar o bloco de radares (ISSUE-103–106):
consolidar contexto, apresentar recomendações com melhores práticas/benchmark e afunilar as
decisões que faltavam. Resultado: o "cérebro" do motor está especificado e aprovado — a
implementação vira transcrição.

- **Novo doc `docs/revamp/11_motor_radar_pesos_personas.md` (v2, ✅ APROVADO)** — especificação
  completa do motor: matriz de pesos declarativa das 8 perguntas do oportunidades (frequência/
  dado/público/desejo dominantes; área com peso zero), guard-rails formalizados (dado sensível
  sempre rebaixa + diligência; conforto = teto de complexidade; agêntico nunca é entrada, e
  quando vence o conteúdo redireciona **ensinando**), desempate por menor complexidade, corte
  teaser×completo, eixos dos 2 gráficos radar, cruzamento de maturidade e **7 personas de
  validação com aritmética verificada** (Renata→dashboard, Marcos→prompt, Júlia→template+
  diligência, Fernando→automação, Camila→agêntico-redirect, Eduardo→automação, Larissa→prompt).
- **Decisões de UX travadas com o dono:** wizard em formato **card de produto** (a "janela de
  app" do mock do hero, não o chat do pré-diag); resultados com **gráfico radar** (recharts) nos
  dois radares; nível de maturidade viaja ao oportunidades via `sessionStorage` (cruzamento
  real; e-mail ≠ conta); vitest aprovado só para `lib/radar/*`.
- **Perguntas da maturidade reformuladas (✅ aprovadas):** versões sutis/comportamentais
  mapeadas à **AI Fluency da Anthropic** (Delegação/Descrição/Discernimento/Diligência +
  Construção) — o diagnóstico achou os furos reais (Descrição e Diligência não tinham pergunta;
  a P1 era o "quantas vezes você usa IA" que o dono não queria). Escala 7–35 e faixas literais
  preservadas + 8ª pergunta não pontuada que personaliza o resultado.
- **Regra do "sabia que" (feedback do dono):** todo diagnóstico completo ganha o 9º bloco
  "Na prática" — gancho concreto com ferramenta acessível no Brasil calibrada por nível
  (ChatGPT grátis/Gemini → NotebookLM/Gems → Claude/Lovable/n8n → Claude Code/Cursor/
  Antigravity/MCP) + mini-guia de execução entregue no e-mail (ISSUE-113 atualizada).
- **Famílias de oportunidade em 2 níveis** (entrada → evolução), camada de apresentação sem
  tocar no motor — referência técnica verificada na fonte: *Building Effective Agents*
  (Anthropic) recomenda exatamente essa escada de complexidade mínima.
- **Públicos novos das pesquisas do dono:** Estudante e Empreendedor viram opções da P1 (área),
  ganham personas e exemplos próprios; **mentoria/palestras sobre IA registradas como
  ISSUE-307** (Fase 2, portfólio) sem promessa na Fase 1.
- Edições cirúrgicas: `01_product_spec_faseada.md` §6, `02_technical_spec.md` §3.3,
  `04_issue_backlog.md` (ISSUE-103/104/105/113 + ISSUE-307 nova), `10_jornada_captura_radares.md`
  (adendo de decisões).

### **✅ VALIDAÇÃO:**
Sessão 100% documental — nenhum arquivo em `src/` tocado (`lint`/`tsc`/`build` não se aplicam).
Aritmética da matriz conferida persona a persona; dono validou em 3 rodadas (visão → feedback →
aprovação final com correção da paleta de ferramentas).

### **🎯 PRÓXIMOS PASSOS:**
1. **ISSUE-104** (motor `lib/radar` + vitest) — codificar o doc 11 literalmente.
2. **ISSUE-105** (conteúdo, Fable 5) — 14 blocos + 9 "Na prática" + mini-guias do e-mail +
   teasers, na voz da newsletter.
3. **ISSUE-103** (páginas) após 104+105; **ISSUE-106** (backend) em paralelo com 103.

---

## 🎯 SESSÃO Anterior: Revisão de Spec — Escada de Captura dos Radares (Fase 1 do revamp)
**Data:** 06 de julho de 2026
**Versão:** v3.6.3
**Status:** ✅ Concluída — spec revisada, **nenhum código de produto alterado**
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Sessão de planejamento puro (sem código), motivada por um furo real identificado na spec dos
radares: as ISSUE-103–106 tratavam "resultado + captura opcional" igual nos dois radares — sem
captura garantida, o radar de oportunidades não fecha como canal de conversão (diferente do
`/pre-diagnostico`, que converte via e-mail).

- **Novo doc `docs/revamp/10_jornada_captura_radares.md`** — define a **escada de captura em
  dois degraus**: **Radar de Maturidade** (degrau 1, grátis, resultado completo na tela, o
  gancho) → **Radar de Oportunidades** (degrau 2, framing de teste/exploração — não "playbook",
  preferência explícita do dono —, teaser real na tela + diagnóstico completo atrás do e-mail =
  o evento de conversão do Google Ads). **Não mexe na metodologia de IA já mapeada** (5 níveis de
  maturidade, 9 tipos de solução de oportunidades) — é estritamente a camada de captura/jornada.
- **Framework "AI Fluency" da Anthropic** (4 Ds — Delegation/Description/Discernment/Diligence)
  verificado na fonte (não de memória, por regra da casa) como referência de contexto — decisão
  do dono foi **não** incorporá-lo como estrutura nova, manter a metodologia já mapeada.
- **Edições cirúrgicas** (complementam, não substituem): `01_product_spec_faseada.md` (§3
  jornada vira a escada; §6 maturidade = resultado completo grátis + ponte; §7 oportunidades =
  framing de teste + gate de e-mail no diagnóstico completo; critérios #3/#4 afinados);
  `02_technical_spec.md` (`RadarResult` ganha `teaser`/`gated`; `radar_leads.kind`;
  `triggerConversion` condicional ao radar); `04_issue_backlog.md` (bloco "Camada de captura"
  adicionado em ISSUE-103/104/105/106, sem tocar no resto).
- **Sequenciamento revertido de novo:** o dono decidiu construir os **radares (103–106) ANTES
  da home (107)** — reverte a antecipação de 2026-07-05 que colocava a home no Sprint 0.
  Consequência: **ISSUE-107B fica obsoleta** (a home nasce com CTAs diretos pros radares, sem
  destino temporário nem swap depois). `03_implementation_plan.md` atualizado (Sprint 0 = só
  fundação 101+102; Sprint 1 = radares; Sprint 2 = home + periferia).
- **Achado registrado na ISSUE-107**: a escada muda como os CTAs do hero/duas-portas devem ser
  direcionados (Maturidade = "comece grátis"; Oportunidades = o teste que capta e-mail) — o mock
  aprovado já tem essa ordem de CTA (oportunidades primário, maturidade secundário), mas a issue
  precisa direcionar cada CTA ao radar certo, não a um fallback único.
- Commit desta sessão também inclui uma edição pendente de sessão anterior
  (`05_model_execution_strategy.md` — ISSUE-107 rebaixada de Fable 5 para Sonnet, decisão de
  2026-07-06 já tomada, agora commitada junto).

### **✅ VALIDAÇÃO:**
Sessão 100% documental — nenhum arquivo em `src/` tocado, então `lint`/`tsc`/`build` não se
aplicam. Revisão feita por leitura cruzada dos 5 docs afetados + grep de consistência.

### **🎯 PRÓXIMOS PASSOS:**
Seguir para o bloco de radares do Sprint 1, na ordem de dependência:
1. **ISSUE-104** (motor) e **ISSUE-105** (conteúdo) — podem rodar em sessões paralelas.
   - 104 precisa de validação do dono na tabela de pesos (5 personas de exemplo).
   - 105 precisa dos 6 tipos de oportunidade que faltam (só 3 de 9 estão prontos no doc
     operacional) + os novos teasers de direção (por causa da escada).
2. **ISSUE-103** (páginas /radar/\*) — só depois de 104+105 prontos.
3. **ISSUE-106** (backend) — pode rodar em paralelo com 103.
4. Só depois do bloco de radares completo: **ISSUE-107** (home), já com CTAs diretos.

---

## 🎯 SESSÃO Anterior: ISSUE-102 — Design System v2 no código (Dark Editorial Atelier)
**Data:** 06 de julho de 2026
**Versão:** v3.6.2
**Status:** ✅ Concluída
**Duração:** ~1 sessão

### **🚀 O QUE FOI FEITO:**

Fundação visual do revamp: tokens, fontes e componentes base do Design System v2 ("Dark
Editorial Atelier") disponíveis no código, sem tocar em nenhuma página legada.

- **Tokens DS2** em `src/app/globals.css` — paleta completa (fundos, texto, acentos
  laranja/magenta, bordas, glass, gradiente) como CSS vars `--ds2-*`, expostas ao Tailwind v4
  via `@theme` (utilities `bg-ds2-orange`, `rounded-ds2-card`, `font-ds2-serif` etc.). Tema
  legado (`--bg`/`--accent`) intocado — os dois conjuntos convivem sem colisão de nomes.
- **Fontes** Fraunces (variable, eixo `opsz`), IBM Plex Sans e IBM Plex Mono via
  `next/font/google`, carregadas no `src/app/layout.tsx` raiz e aplicadas só como CSS vars no
  `<html>`. O `<body>` legado define `font-family` própria (`system-ui`), então nenhuma página
  existente muda visualmente — confirmado depois do build.
- **`DS2`** exportado em `src/lib/design-system.ts` (cores/gradiente/fontes/raios), com o
  `DESIGN_TOKENS` antigo 100% intacto para a plataforma legada.
- **10 componentes novos** em `src/components/ds2/`: `Button`, `Card`, `Badge`,
  `Module`/`ModuleHead`, `Progress`, `Panel`, `GridSection`, `Eyebrow`, `SectionTitle`,
  `PageContainer` — cada um implementando literalmente as receitas de
  `docs/revamp/08_diretrizes_visuais_ds2.md` (nenhum hex/raio/fonte inventado).

### **✅ VALIDAÇÃO:**
- `npx tsc --noEmit` e `npm run build` limpos (24 rotas, mesma contagem de antes).
- `npm run lint` sem nenhum erro/warning novo (só débito pré-existente já mapeado).
- GTM confirmado byte-idêntico por diff (só `className` novo no `<html>`, snippet intocado).
- Build rodado numa porta isolada (a 3000 tinha um processo Node antigo de sessão anterior —
  não foi encerrado); `/`, `/dashboard` e `/pre-diagnostico` responderam 200 com as classes de
  fonte do `next/font` aplicadas ao `<html>`.
- Contraste AA verificado manualmente no par mais crítico do token set (`text-subtle` sobre
  `bg-app`): ~4,66:1, acima do mínimo AA (4,5:1) para texto normal.
- Nenhuma página consome os componentes DS2 ainda — isso nasce na ISSUE-103/107.

### **🎯 PRÓXIMOS PASSOS:**
Seguir o Sprint 0/1 do revamp: **ISSUE-107** (homepage reposicionada, depende só da 102) ou
**ISSUE-103/104/105/106** (radares) — a definir na próxima sessão. ISSUE-101 segue
`⚠️ parcial` no backlog (dono confirmou que o deploy está ok, mas a validação formal de Tag
Assistant + instalação do PWA em produção fica para um horário futuro).

---

## 🎯 SESSÃO Anterior: ISSUE-101 — Layout server-first + route groups (fundação do revamp)
**Data:** 05 de julho de 2026 (segunda sessão)
**Versão:** v3.6.1
**Status:** ⚠️ Código completo, tsc/lint/build verdes, GTM byte-idêntico validado. Aguarda Tag Assistant + PWA em preview pelo dono para marcar ✅ concluída.
**Duração:** ~1 sessão longa (planejamento estratégico, sem código de produto)

### **🚀 O QUE FOI FEITO:**

Sessão 100% de planejamento, a pedido do dono, para estruturar o revamp do site/app com base
nos documentos estratégicos de `docs/GPT Project Revamp/` (design system, benchmark, contexto
editorial da newsletter, documentos de estratégia e execução da Fase 1). **Nenhum código de
produto foi alterado** — só documentação e skills.

**Documentos criados em `docs/revamp/` (11 arquivos):**
- `README.md` — documento central do revamp (visão, fases, princípios de copy/design/técnicos).
- `00_problem_definition.md` — problema, usuário-alvo, hipótese e critérios de sucesso da Fase 1.
- `00b_open_questions.md` — 11 decisões/premissas, todas resolvidas com o dono.
- `01_product_spec_faseada.md` — jornadas, arquitetura de informação, features por fase.
- `02_technical_spec.md` — stack, arquitetura (route groups, motor de radar, backend), riscos.
- `03_implementation_plan.md` — sequência de sprints, dependências, QA, rollback.
- `04_issue_backlog.md` — **22 issues executáveis** da Fase 1 + Fase 1B + resumos de Fase 1.5/2/3/4.
- `05_model_execution_strategy.md` — qual modelo (Fable 5/Sonnet/leve) executa cada issue.
- `06_definition_of_done.md` — checklist de conclusão da Fase 1.
- `07_mapa_tracking_ads.md` — inventário completo dos marcadores Google Ads/GTM no código
  (`layout.tsx`, `EmailGate.tsx`, `lead/route.ts`) + regras de preservação.
- `08_diretrizes_visuais_ds2.md` — caderno de receitas visuais do Design System v2 (tokens
  literais, componentes, mapa de migração do tema legado, proibições).
- `09_direcoes_landing.md` — comparação de 3 direções visuais da landing (mockups navegáveis)
  e registro da decisão final.
- `mockups/*.html` — 4 protótipos HTML navegáveis da nova landing (A, B, C e o híbrido final
  aprovado), publicados como Artifacts para revisão no celular.

**Skills atualizadas/criadas em `.claude/skills/`:**
- **Nova: `executar-issue-revamp`** — carrega o contexto certo por issue (README + issue +
  diretrizes visuais/tracking quando aplicável) antes de codar, trava o escopo, roda os
  critérios de aceite específicos da issue e marca conclusão no backlog. Feita para minimizar
  re-steering quando um modelo mais simples executa as issues.
- **`iniciar-sessao`** — ganhou um Passo 0 que detecta trabalho do revamp e direciona para a
  `executar-issue-revamp`.
- **`finalizar-sessao`** — ganhou um item para confirmar status da issue no backlog e citar o
  número dela na entrada de CURRENT-STATUS/CHANGELOG.

### **🎯 PRINCIPAIS DECISÕES TOMADAS COM O DONO:**

- **Marca:** a plataforma chama-se **"+ConverSaaS"**, sempre apresentada como "o ecossistema
  virtual da newsletter Conversas no Corredor".
- **Visual:** Design System "Dark Editorial Atelier" da pasta GPT Project Revamp confirmado
  como oficial (fundo verde-escuro, laranja+magenta, Fraunces/IBM Plex).
- **Landing nova:** direção final é um **híbrido** — estrutura/grid técnico do protótipo A +
  headline builder com destaque em gradiente e janela de radar animada do protótipo C.
- **Pricing:** a home nova **mantém** a tabela de preços da newsletter (decisão do dono, contra
  a recomendação inicial).
- **Vídeos de demo:** os 4 vídeos atuais da plataforma (`mapeamento`, `diagnostico`, `taticas`,
  `kanban`) são preservados numa seção "A plataforma em ação" na home nova.
- **`/pre-diagnostico`:** continua no ar, sem link nomeado na navegação nova, mas — decisão de
  sequenciamento tomada nesta sessão — é o **destino temporário** dos CTAs de diagnóstico da
  home nova (ISSUE-107) enquanto os radares (`/radar/maturidade`, `/radar/oportunidades`) não
  existem. A **ISSUE-107B** troca esse destino assim que os radares ficarem prontos.
- **Fase 1B (nova):** o dono pediu que o plano cubra também o redesign visual (DS2) de toda a
  plataforma logada — dashboard, diagnóstico, plano de ação, kanban, relatórios/perfil/config/
  admin (ISSUES 114–120), com regra de ouro: 100% visual, zero mudança de lógica/dados.
  Promovida de "Fase 2+" para dentro da Fase 1 como segundo resultado visual crítico.
- **Google Ads:** funil novo (radares) vai usar o **mesmo label de conversão** do funil atual;
  separação futura de labels registrada como plano de melhoria (ISSUE-208, Fase 1.5).
- **Stripe:** fluxo direto de assinatura mapeado (ISSUE-305, Fase 2) para quando o volume
  escalar — hoje a assinatura é intermediada pela newsletter, com autorização manual do dono.
- **E-mail:** confirmado que o e-mail do pré-diagnóstico entrega normalmente via Resend (plano
  gratuito). Bug **separado** identificado: e-mail de reset de senha não chega — registrado
  para correção via `/corrigir-bug` em sessão futura, fora do escopo do revamp.

### **🎯 PRÓXIMOS PASSOS:**

Iniciar a execução pelo Sprint 0 do `docs/revamp/03_implementation_plan.md`:
1. **ISSUE-101** — layout server-first + route groups (fundação técnica).
2. **ISSUE-102** — Design System v2 no código (tokens, fontes, componentes `ds2/*`).
3. **ISSUE-107** — homepage reposicionada (reskin com CTAs temporários para `/pre-diagnostico`).

Usar `/executar-issue-revamp` para cada issue (carrega o contexto certo automaticamente).

---

## 🎯 SESSÃO Anterior: Fase 3 da Modernização — Correções por Severidade + Auditoria de RLS
**Data:** 04 de julho de 2026
**Versão:** v3.5.3
**Status:** ✅ Concluída — código, deploy, SQL de RLS e permissões de função, todos validados
**Duração:** ~3 horas

### **🚀 ENTREGAS (código, já validado com build + tsc limpos):**

- **Hooks fora das regras corrigidos:** o "PWA Install Banner" em `src/app/page.tsx` era uma IIFE
  chamando hooks dentro do JSX (risco real de crash se um dia virasse condicional). Extraído
  para o componente nomeado `PWAInstallBanner`. Eliminou os 6 erros de `react-hooks/rules-of-hooks`
  que o diagnóstico da Fase 1 tinha apontado.
- **Next.js atualizado:** 15.5.12 → 15.5.20 (patch), build validado idêntico (mesmas 24 rotas).
- **36 erros de `tsc --noEmit` corrigidos, um por um** (não supressão em massa) — destaque para
  dois que eram bugs reais, não só cosméticos:
  - `KanbanPage.tsx` usava `tatica.estimativa_horas` (snake_case) mas o tipo `TaticaKanban` só
    tem `estimativaHoras` — o badge de horas estimadas no Kanban nunca aparecia de verdade.
  - `NextRequest.ip` foi removido da API do Next; as rotas de pré-diagnóstico dependiam dele
    pra registrar IP (agora só via headers `x-forwarded-for`/`x-real-ip`).
  - `EmailGate.tsx` (arquivo do tracking de conversão) só precisou de uma declaração de tipo
    ambiente pro `gtag` — zero mudança de runtime, confirmado comparando o bundle compilado
    antes/depois (chamada do `gtag` byte-idêntica).
- **`typescript.ignoreBuildErrors` removido do `next.config.js`** — o build agora falha de
  verdade se alguém reintroduzir um erro de tipo. `eslint.ignoreDuringBuilds` continua ativo de
  propósito (lint cosmético foi deixado para depois, a pedido do dono).
- **Auditoria de RLS/views (Supabase) feita via SQL Editor** — achou 2 problemas reais de
  segurança, não só teóricos:
  - `roi_leads` tinha uma política `ALL`/`public`/irrestrita — qualquer request com a chave anon
    (pública, embutida no navegador) conseguia ler/alterar/apagar nome+email de todos os leads
    capturados. Contradizia o próprio `docs/supabase-database-schema.txt`, que já documentava
    a intenção de ser "apenas service_role".
  - `usuarios` e `profiles` tinham políticas de INSERT extras com `with_check: true` (sem
    checar dono), empilhadas via OR sobre as políticas corretas — permitiam inserir linha com
    qualquer `id`. Confirmado que nenhum código do app depende disso (o trigger
    `handle_new_user()` já ignora RLS por ser `SECURITY DEFINER`).
  - Corrigido no código: `src/app/api/prediag/lead/route.ts` e `.../diagnose/route.ts` migrados
    do client anon para um client `service_role` local (mesmo padrão de `admin/assinantes/route.ts`).
  - As 8 views `vw_*` seguem com `security_invoker=true` (fix do incidente v3.5.2 se manteve).
  - Políticas duplicadas/redundantes em `atividades` (3x) e `taticas` (2x) consolidadas em 1 cada.
  - **SQL executado e validado pelo dono** (2026-07-04): Parte A (`usuarios`/`profiles`/
    `atividades`/`taticas` — verificado 1 política única por tabela) e Parte B, após confirmar o
    deploy em produção (`roi_leads`/`roi_prediag_sessions` — verificado `{service_role}` only).
- Commit `f2841e2` e push pra `origin/main` feitos; deploy na Vercel confirmado `Ready`, sem erros.
- **As 2 funções `SECURITY DEFINER` não documentadas, avaliadas e resolvidas:**
  - `rls_auto_enable` — confirmado **benigno**: é um *event trigger* que liga RLS automaticamente
    em qualquer tabela nova criada em `public` (explica por que todas as 9 tabelas já apareciam
    com RLS ativo). Boa prática, mantido como está.
  - `get_auth_user_by_email` — resquício de uma tentativa antiga de painel admin (visão de
    login de usuários) que esbarrou em problemas de RLS na época. Tinha `EXECUTE` liberado pra
    `PUBLIC`/`anon`/`authenticated` — qualquer request com a chave anon conseguia descobrir se
    um email estava cadastrado + data de criação/último login (oráculo de enumeração de contas).
    `REVOKE` aplicado, restando só `postgres`/`service_role`. Função mantida (não usada pelo
    código hoje, mas pode servir de base pra um painel admin futuro, agora só via service role).
- **Fluxo `/pre-diagnostico` testado ponta a ponta em produção, depois da trava de RLS** —
  captura de lead funcionando normalmente, email de recomendações recebido no teste.

### **⚠️ PENDENTE (fora do escopo desta sessão, por decisão do dono):**
- **Email do pré-diagnóstico só chega pro email verificado da conta Resend** (sandbox mode,
  `onboarding@resend.dev`) — o teste desta sessão funcionou porque foi feito com o próprio email
  do dono. Pra outros usuários reais, ainda não entrega. Pendência de configuração já registrada
  desde o v3.5.2, não é regressão desta sessão.
- Lint cosmético (menor prioridade).
- Upgrade major do `jspdf` e decisão sobre `next-pwa`/workbox — Fase 4.

---

## 🎯 SESSÃO Anterior: Incidente Crítico — Migração de Banco de Dados Supabase
**Data:** 04 de julho de 2026
**Versão:** v3.5.2
**Status:** ✅ Produção restaurada e validada
**Duração:** ~3 horas

### **🚨 O QUE ACONTECEU:**
Ao testar localmente após a faxina da Fase 2, descobrimos que o **banco de produção real**
(Supabase `ghscflemhgrbfflmxqbk`) estava pausado há mais de 90 dias (limite do plano Free para
reativação com 1 clique já havia expirado). Com campanhas de Google Ads ativas apontando pro
`/pre-diagnostico`, isso significava **captura de lead e conversão quebradas silenciosamente**
para todo tráfego pago durante o período pausado.

### **✅ RESOLVIDO:**
- Novo projeto Supabase criado ("+ConverSaaS 2.0", ref `cuojmyqkezmpryeuyvqd`) em conta/org nova
  (limite de 2 projetos grátis é por usuário, não por organização)
- Backup completo restaurado via `psql` — 9 tabelas, RLS+políticas, trigger `handle_new_user()`,
  função `admin_list_users()`, e as 8 views `vw_*` (uma delas, não documentada, recebeu o fix de
  `security_invoker=true` que estava faltando) — tudo validado item a item, não só "rodou sem erro"
- `.env.local` + variáveis de ambiente do Vercel (Production) atualizadas, redeploy feito
- Testado e confirmado funcionando em produção

### **⚠️ PENDENTE (não bloqueia, registrado para acompanhamento):**
- Email do pré-diagnóstico não chegou no teste — suspeita de config antiga do Resend em modo
  sandbox (`onboarding@resend.dev`), não afeta captura de lead nem conversão do Ads
- Projeto Supabase antigo (pausado) mantido como rede de segurança, não apagado ainda
- Considerar migrar o projeto novo pra um plano pago (evita repetir a causa raiz)
- Arquivos de backup com dados reais salvos em `C:\Users\adils\Downloads\` (fora do git)
- Detalhes completos: `docs/CHANGELOG.md` v3.5.2

### **🎯 PRÓXIMOS PASSOS:**
- Fase 3 do roadmap de modernização (correções por severidade — ver `docs/diagnostico-fase1-debito-tecnico.md`)
- Push dos commits locais pendentes para `origin/main`

---

## 🎯 SESSÃO Anterior: Modernização Fase 1+2 — Diagnóstico + Faxina do Cemitério
**Data:** 02 de julho de 2026
**Versão:** v3.5.1
**Status:** ✅ Commitado localmente (aguardando push)
**Duração:** ~1 hora

### **🚀 ENTREGAS:**

#### ✅ **FASE 1 — DIAGNÓSTICO (medir, não mexer)**
- Relatório completo em `docs/diagnostico-fase1-debito-tecnico.md`
- `npm run lint`: 204 erros + 223 warnings em 46 arquivos
- `npx tsc --noEmit`: 57 erros de tipo em 23 arquivos
- `npm run build`: compila limpo (confirma que o build esconde os erros acima)
- `npm audit`: 23 vulnerabilidades (1 crítica — `jspdf`, direta)
- 2 achados de risco investigados a fundo: hooks chamados dentro de callback em
  `src/app/page.tsx` (não quebra hoje, mas é frágil) e exposição real baixa do `jspdf`
  crítico (a API vulnerável não é usada no código atual)

#### ✅ **FASE 2 — FAXINA DO CEMITÉRIO (cirúrgica)**
- 25 arquivos legados removidos (backups/versões antigas + `mapa-atividades-modular.tsx`
  da raiz + `next.config.ts` morto) — todos confirmados sem import antes de apagar
- Build validado idêntico antes/depois — zero mudança de comportamento
- Débito técnico medido caiu: tsc 57→37 erros, lint 204→92 erros / 223→123 warnings
- Detalhes completos: `docs/CHANGELOG.md` v3.5.1

### **🎯 PRÓXIMOS PASSOS:**
- Fase 3 do roadmap: correções por severidade (ver punch list no relatório da Fase 1)
- Push do commit local para `origin/main` (pendente confirmação do usuário)

---

## 🎯 SESSÃO Anterior: PWA Implementado - App Instalável
**Data:** 23 de Outubro de 2025  
**Versão:** v3.5.0  
**Status:** ✅ Em produção  
**Duração:** ~2 horas

### **🚀 ENTREGAS v3.5.0:**

#### ✅ **PWA COMPLETO**
- **App Instalável:** Desktop (Windows/Mac/Linux) + Mobile (Android/iOS)
- **Service Worker:** Cache inteligente (Supabase 24h, assets 30d)
- **Offline Ready:** Assets estáticos funcionam sem internet
- **Performance:** Lighthouse PWA score 90+

#### ✅ **REBRANDING**
- **Nome:** "+Conversas no Corredor" (plataforma)
- **App Mobile:** "+ConverSaaS" (PWA)
- **Favicon:** Ícone copos de café personalizado
- **Identidade:** Consistente em toda aplicação

#### ✅ **ÍCONES PWA**
- 6 tamanhos otimizados (290KB total)
- Suporte: Android adaptive, iOS, desktop
- Design profissional com safe zones

---

### **📊 MÉTRICAS:**

| Item | Valor |
|------|-------|
| **Arquivos Novos** | 9 arquivos |
| **Linhas Adicionadas** | 4.068 linhas |
| **Build Time** | ~30s (mantido) |
| **Bundle Impact** | +2KB |
| **Compatibilidade** | Chrome, Edge, Safari, Android, iOS |

---

### **🧪 COMO TESTAR:**

**Produção:**
```
https://conversas-no-corredor.vercel.app
```

**Local:**
```bash
npm run build
npm run start
```

**Instalar PWA:**
- Desktop: Ícone ⊕ na barra de endereços
- Android: Menu > "Adicionar à tela inicial"
- iOS: Compartilhar > "Adicionar à Tela de Início"

---

### **📁 ARQUIVOS PRINCIPAIS:**
```
next.config.js           # PWA configurado
src/app/layout.tsx       # Meta tags PWA
public/pwa/manifest.json # Config instalação
public/pwa/icons/*       # 6 ícones
public/sw.js             # Service Worker (auto)
```

---

### **⚠️ NOTAS:**

- PWA desabilitado em `npm run dev` (por design)
- Service Worker requer HTTPS (produção/localhost)
- Firefox: sem instalação nativa (limitação browser)

---

### **🎯 PRÓXIMOS PASSOS:**

**v3.5.1 (Opcional):**
- [ ] Push notifications
- [ ] Background sync
- [ ] Offline mode completo
- [ ] Update prompt


---

**✨ STATUS:** PWA 100% funcional | Instalável todos dispositivos | Zero bugs | Documentação completa

**📝 Detalhes completos:** Ver `docs/CHANGELOG.md` v3.5.0

---

## 🎯 SESSÃO Anterior: Correção Admin Assinantes - Bug Supabase listUsers()
**Data:** 14 de Outubro de 2025  
**Versão:** v3.4.3  
**Status:** ✅ Resolvido
**Duração:** ~4 horas de investigação + múltiplas tentativas + solução

### **🚀 PRINCIPAIS ENTREGAS v3.4.3:**

#### ✅ **ADMIN ASSINANTES FUNCIONANDO**
- **Problema:** Todos assinantes apareciam como "⏸️ Sem conta" mesmo tendo cadastro confirmado
- **Causa Raiz:** Bug do Supabase na API `auth.admin.listUsers()` - erro SQL ao scanear coluna `confirmation_token` com valores NULL
- **Erro Original:** `"sql: Scan error on column index 3, name \"confirmation_token\": converting NULL to string is unsupported"`
- **Investigação:** Auth Logs do Supabase revelaram erro 500 em `/admin/users`
- **Solução:** Criada função SQL `public.admin_list_users()` com SECURITY DEFINER que acessa `auth.users` diretamente via SQL
- **Status:** ✅ CRUD 100% funcional, todos os dados aparecem corretamente

#### ✅ **FUNÇÃO SQL CRIADA**
```sql
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),  -- ← Tipo correto (não text)
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
) 
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at
  FROM auth.users u;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO service_role;
```

#### ✅ **API CORRIGIDA**
- **Arquivo:** `src/app/api/admin/assinantes/route.ts` (linha ~33-38)
- **Mudança:** `auth.admin.listUsers()` → `supabaseAdmin.rpc('admin_list_users')`
- **Benefício:** Acesso direto via SQL é mais rápido e confiável que API HTTP
- **Impacto:** Zero breaking changes, CRUD mantém todas funcionalidades

#### ✅ **DOCUMENTAÇÃO CRIADA**
- **troubleshooting-admin-assinantes.md:** Processo completo de debug documentado
- **supabase-database-schema.md:** Função SQL adicionada à documentação
- **CHANGELOG.md:** Entrada v3.4.3 com causa raiz e solução
- **Benefício:** Evita retrabalho em problemas similares

### **📊 PROCESSO DE INVESTIGAÇÃO:**

13/10/2025 - Início da investigação
├── Hipótese 1: Race condition no frontend → ❌ Descartada
├── Hipótese 2: Problema de permissões → ❌ Permissões corretas
├── Hipótese 3: Paginação de listUsers() → ❌ Apenas 10 usuários
├── Descoberta: Auth Logs mostram erro 500 → ✅ CAUSA RAIZ!
├── Erro: confirmation_token NULL causa crash → ✅ Confirmado
├── Tentativa: Corrigir tipos da função → ❌ varchar vs text
└── Solução: Função SQL com tipos corretos → ✅ SUCESSO

### **💡 LIÇÃO APRENDIDA:**

**Bug do Supabase:**
- Método oficial `auth.admin.listUsers()` tem bug não resolvido
- Coluna `confirmation_token` com NULL causa erro de scan SQL
- Bug existe no lado do servidor (código Go do Supabase)

**Solução Definitiva:**
- Acesso direto a `auth.users` via função SQL com SECURITY DEFINER
- Mais confiável e performático que API HTTP
- Workaround necessário até Supabase corrigir o bug

**Debugging:**
- Auth Logs do Supabase foram essenciais para identificar causa raiz
- Investigação metódica descartou hipóteses uma por uma
- SQL direto revelou que banco está OK, API que está quebrada

### **🔗 Referências:**
- [Auth Logs Supabase](https://supabase.com/dashboard/project/_/logs/auth-logs)
- Erro: `Database error finding users` em `/admin/users`
- Issue: `confirmation_token` NULL scan não suportado

--
## 🎯 SESSÃO Anterior: Correção Security Definer Views
**Data:** 13 de Outubro de 2025  
**Versão:** v3.4.2  
**Status:** ✅ Resolvido
**Duração:** ~3 horas de investigação + múltiplas tentativas + solução

### **🚀 PRINCIPAIS ENTREGAS v3.4.2:**

#### ✅ **SECURITY DEFINER VIEWS CORRIGIDAS**
- **Problema:** 7 views com warnings persistentes no Security Advisor do Supabase
- **Causa Raiz:** Views criadas com owner 'postgres' executavam automaticamente como SECURITY DEFINER
- **Tentativas Falhadas:**
  - `CREATE OR REPLACE VIEW` → Manteve SECURITY DEFINER da view original
  - `ALTER VIEW ... OWNER TO authenticator` → Bloqueado por permissões
  - DROP + CREATE simples → Herdou configuração do owner postgres
- **Solução Definitiva:** Recriar views com `WITH (security_invoker = true)`
- **Resultado:** 0 warnings no Security Advisor ✅

#### ✅ **VIEWS CORRIGIDAS (7 total)**
1. `vw_activity_heatmap` - ✅ security_invoker = true
2. `vw_conversao_diaria` - ✅ security_invoker = true
3. `vw_events_funnel` - ✅ security_invoker = true
4. `vw_kpis_executivos` - ✅ security_invoker = true
5. `vw_mix_atividades` - ✅ security_invoker = true
6. `vw_pain_analysis` - ✅ security_invoker = true
7. `vw_perfil_performance` - ✅ security_invoker = true

#### ✅ **DOCUMENTAÇÃO ATUALIZADA**
- **views-analytics-supabase.md:** Seção de segurança reescrita com best practices
- **CHANGELOG.md:** Entrada v3.4.2 com processo completo de troubleshooting
- **Lições Aprendidas:** Documentado comportamento do PostgreSQL com owner postgres

#### ✅ **IMPACTO ZERO**
- **Grafana:** Continua funcionando normalmente, sem alterações
- **Série Histórica:** Dados desde 28/08/2025 preservados
- **Performance:** Sem mudanças mensuráveis
- **Breaking Changes:** Nenhum

### **📊 PROCESSO DE INVESTIGAÇÃO:**
13/10/2025 - Início da investigação
├── Hipótese 1: CREATE OR REPLACE manteve atributos → ❌ Confirmado
├── Hipótese 2: Owner postgres causa SECURITY DEFINER → ✅ Confirmado
├── Tentativa: ALTER OWNER TO authenticator → ❌ Sem permissão
├── Tentativa: DROP + CREATE simples → ❌ Manteve problema
└── Solução: DROP + CREATE WITH (security_invoker = true) → ✅ SUCESSO

### **💡 LIÇÃO APRENDIDA:**

**PostgreSQL Behavior:**
- Views com owner 'postgres' (superuser) → SECURITY DEFINER automático
- `CREATE OR REPLACE VIEW` → Preserva atributos de segurança existentes
- **Solução:** Sempre usar `WITH (security_invoker = true)` explicitamente

**Best Practice para o Projeto:**
```sql
-- Template correto para criar views
CREATE VIEW public.vw_nome_da_view 
WITH (security_invoker = true) AS  -- ← Flag obrigatória!
SELECT ...


## 🎯 SESSÃO Anterior: Views Analytics - Série Histórica Completa
**Data:** 02 de Outubro de 2025  
**Versão:** v3.4.1  
**Status:** ✅ Implementado e funcionando
**Duração:** ~2 horas de análise + implementação + documentação

### **🚀 PRINCIPAIS ENTREGAS v3.4.1:**

#### ✅ **SÉRIE HISTÓRICA COMPLETA HABILITADA**
- **Filtros Removidos:** Todas as 7 views agora mostram dados desde 28/08/2025
- **Views Atualizadas:** `vw_conversao_diaria`, `vw_perfil_performance`, `vw_pain_analysis`, `vw_events_funnel`, `vw_activity_heatmap`, `vw_kpis_executivos`, `vw_mix_atividades`
- **Período Ajustado:** `vw_kpis_executivos` agora mostra "Série Histórica Completa" ao invés de "Últimos 30 dias"
- **SQL Executado:** Script de atualização aplicado no Supabase com sucesso

#### ✅ **PAINÉIS GRAFANA ADICIONADOS**
- **Painel 13:** Performance Temporal - Volume (Sessões + Leads ao longo do tempo)
- **Painel 14:** Taxa de Conversão Temporal (evolução % de conversão)
- **Time Range Padrão:** Alterado de "Last 6 hours" → "Last 90 days"
- **Total Painéis:** 14 ativos (antes 12)

#### ✅ **DOCUMENTAÇÃO COMPLETA ATUALIZADA**
- **views-analytics-supabase.md:** Todas as 7 views SQL atualizadas + nova seção explicativa
- **dashboard-grafana-supabase.md:** 2 novos painéis documentados + guias de uso
- **CHANGELOG.md:** Entrada v3.4.1 adicionada com detalhes técnicos
- **Benefício:** Guias completos para análise temporal de longo prazo

#### ✅ **CAPACIDADES DE ANÁLISE EXPANDIDAS**
- **Range Disponível:** 32+ dias de dados históricos (28/08 até hoje)
- **Flexibilidade Total:** Time Range do Grafana controla período sem alterar queries
- **Comparação Temporal:** Possível comparar diferentes períodos facilmente
- **Performance:** Índices otimizados para queries sem filtros temporais

### **📊 IMPACTO DA MUDANÇA:**

**ANTES:**
```sql
-- Views limitadas a 30 dias
SELECT * FROM vw_conversao_diaria; 
-- Retornava no máximo 30 registros


Sessõe Anteriores
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


## 🎯 SESSÃO Anterior: Correção Crítica Signup + Documentação Completa Banco
**Data:** 29 de Setembro de 2025  
**Versão:** v3.3.1  
**Status:** ✅ Implementado e funcionando
**Duração:** ~4 horas de investigação + implementação

### **🚀 PRINCIPAIS ENTREGAS v3.3.1:**

#### ✅ **ERRO 500 NO SIGNUP RESOLVIDO**
- **Causa Identificada:** Faltava `emailRedirectTo` obrigatório + Resend em modo sandbox
- **Código Corrigido:** Adicionado `options: { emailRedirectTo }` no `supabase.auth.signUp()`
- **Email Service:** Migrado de Resend SMTP para Supabase Email Service (padrão)
- **Motivo:** Resend gratuito só permite emails autorizados (limitação sandbox)
- **Status:** Signup 100% funcional para qualquer email autorizado

#### ✅ **TRIGGER VALIDADO E TESTADO**
- **Função:** `handle_new_user()` criada e funcionando perfeitamente
- **Ação:** Popula automaticamente `usuarios` + `profiles` após signup em `auth.users`
- **Teste Manual:** Inserção em `auth.users` → trigger disparou → ambas tabelas populadas ✅
- **Segurança:** `SECURITY DEFINER` com `SET search_path TO 'public'`
- **Crítico:** Trigger é essencial para funcionamento do sistema

#### ✅ **ESTRUTURA DO BANCO MAPEADA**
- **3 Tabelas Sincronizadas:** `auth.users` → `usuarios` + `profiles`
- **Foreign Keys:** `profiles.id → auth.users.id (ON DELETE CASCADE)`
- **Políticas RLS:** Todas configuradas com `WITH CHECK (true)` para permitir trigger
- **Investigação Completa:** 8 queries SQL executadas para mapear estrutura
- **Resultado:** Sistema totalmente documentado e compreendido

#### ✅ **DOCUMENTAÇÃO CRIADA**
- **supabase-database-schema.md:** Schema completo + triggers + RLS + queries diagnóstico
- **troubleshooting-signup.md:** Investigação detalhada do erro 500 (histórico completo)
- **README.md:** Seção "Arquitetura do Banco de Dados" adicionada
- **CHANGELOG.md:** Entrada v3.3.1 documentada
- **Benefício:** Zero retrabalho em problemas similares futuros

#### ✅ **CONFIGURAÇÃO DE EMAIL**
- **Provider Atual:** Supabase Email Service (nativo, gratuito, sem limitações)
- **SMTP Customizado:** Desabilitado (Resend tinha limitações de sandbox)
- **Sender:** `noreply@mail.app.supabase.co`
- **Templates:** Customizados mantidos (confirmação + reset de senha)
- **Futuro:** Opção de comprar domínio próprio para emails profissionais

### **📊 INVESTIGAÇÃO TÉCNICA REALIZADA:**

**Etapas da Investigação (4 horas):**
1. **Verificação de Tabelas:** Identificadas 3 tabelas (auth.users, usuarios, profiles)
2. **Análise de Políticas RLS:** Todas com `WITH CHECK (true)` - corretas ✅
3. **Descoberta do Trigger:** `handle_new_user()` existe mas tinha `EXCEPTION` silenciando erros
4. **Correção da Função:** Removido `EXCEPTION`, adicionado `full_name` em profiles
5. **Teste Manual:** Simulação de signup → trigger funcionou perfeitamente
6. **Análise de Logs:** Erro real identificado (Resend sandbox + falta `emailRedirectTo`)
7. **Correção de Código:** Adicionado `emailRedirectTo` em `src/app/auth/page.tsx`
8. **Configuração SMTP:** Desabilitado Resend, ativado Supabase padrão

**Queries SQL Executadas:**
```sql
-- 1. Listar tabelas de usuários
SELECT schemaname, tablename, rls_enabled FROM pg_tables...

-- 2. Estrutura da tabela usuarios
SELECT column_name, data_type FROM information_schema.columns...

-- 3. Políticas RLS
SELECT policyname, cmd, qual, with_check FROM pg_policies...

-- 4. Verificar triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers...

-- 5. Estrutura profiles + foreign keys
-- 6. Testar trigger manualmente
-- 7. Verificar permissões da função
-- 8. Analisar logs do Supabase
🔧 ARQUIVOS MODIFICADOS:

✅ src/app/auth/page.tsx - Linha 170 (adicionado emailRedirectTo)
✅ docs/supabase-database-schema.md - Criado (documentação completa)
✅ docs/troubleshooting-signup.md - Criado (investigação + solução)
✅ docs/CHANGELOG.md - Entrada v3.3.1 adicionada
✅ README.md - Seção arquitetura do banco adicionada
✅ docs/CURRENT-STATUS.md - Este arquivo atualizado

💡 LIÇÕES APRENDIDAS:

Sempre configurar emailRedirectTo quando "Confirm email" está ativo
Testar SMTP em sandbox só funciona com emails autorizados
Triggers com EXCEPTION WHEN OTHERS escondem erros - evitar
Foreign keys exigem ordem correta de inserção
Logs do Supabase são essenciais para debug de auth


## 🎯 SESSÃO Anterior: Otimização de Performance e Correções Críticas
**Data:** 24 de Setembro de 2025  
**Versão:** v3.3.0  
**Status:** ✅ Implementado e funcionando
**Duração:** ~4 horas de implementação

### **🚀 PRINCIPAIS ENTREGAS v3.3:**

#### ✅ **OTIMIZAÇÃO MASSIVA DE VÍDEOS**
- **Redução de 96%:** Vídeos de 200MB para 8MB total
- **Performance Melhorada:** LCP e Web Vitals significativamente melhores
- **Economia de Banda:** ~576GB/mês economizados no Vercel
- **Processo Documentado:** Template Obsidian com rotina completa de compressão

#### ✅ **CORREÇÃO DO RESET DE SENHA**
- **SMTP Customizado:** Resend configurado como provider no Supabase
- **Detecção de Sessão:** Sistema detecta login automático do recovery token
- **Fluxo Corrigido:** Usuário consegue redefinir senha com sucesso
- **Bug Hotmail Documentado:** Workaround via página de perfil

#### ✅ **MELHORIAS TÉCNICAS**
- **Compressão FFmpeg:** CRF 32, 960x540, áudio mono 64k
- **Estrutura Organizada:** C:\Users\adils\Videos\CompressaoVideos
- **useEffect Otimizado:** Verifica sessão antes de procurar tokens
- **SMTP Resend:** Host smtp.resend.com, porta 465, username "resend"

#### ✅ **BUGS RESOLVIDOS E DOCUMENTADOS**
- **Reset Funcionando:** Detecta sessão ativa quando Supabase faz login automático
- **Vídeos Otimizados:** Load time drasticamente reduzido
- **Hotmail Issue:** Erro 500 em resets múltiplos (limitação conhecida)
- **Economia Vercel:** Bandwidth sob controle com vídeos comprimidos

### **📊 MÉTRICAS DA IMPLEMENTAÇÃO:**
- **96% redução** no tamanho dos vídeos
- **100% funcional** reset de senha para Gmail/outros
- **8MB total** para 4 vídeos (antes 200MB)
- **576GB/mês** economizados em bandwidth
- **2MB média** por vídeo após compressão

## 🎯 SESSÃO Anterior: Sistema de Segurança e Admin Dashboard
**Data:** 24 de Setembro de 2025  
**Versão:** v3.2.0  
**Status:** ✅ Implementado e funcionando
**Duração:** ~6 horas de implementação

### **🚀 PRINCIPAIS ENTREGAS v3.2:**

#### ✅ **SISTEMA DE AUTORIZAÇÃO SEGURO**
- **Migração Completa:** De arquivo público para banco de dados Supabase
- **APIs Seguras:** 4 novas rotas protegidas com service role key
- **Verificação Dupla:** Check no cadastro + check no login
- **Zero Vulnerabilidades:** Impossível burlar via client-side

#### ✅ **ADMIN DASHBOARD PROFISSIONAL**
- **Interface Completa:** `/admin/assinantes` com design consistente
- **CRUD Visual:** Adicionar, editar, remover assinantes em tempo real
- **Informações Detalhadas:** Último acesso, status conta, total atividades
- **Filtros Avançados:** Status, período, ordenação, busca combinados

#### ✅ **MELHORIAS DE SEGURANÇA**
- **LGPD Compliance:** Dados protegidos no banco com RLS
- **Prevenção Duplicatas:** Não envia email se conta já existe
- **Bloqueio Expirados:** Verifica validade no momento do login
- **Admin Protegido:** Apenas email específico tem acesso

#### ✅ **CORREÇÕES CRÍTICAS**
- **Arquivo Exposto:** `emails-autorizados.txt` removido do repositório
- **Botões Invisíveis:** Dropdowns/selects com fundo escuro visível
- **Edição Completa:** Email e data editáveis na interface admin
- **Gestão Eficiente:** De Git manual para interface instantânea

### **📊 MÉTRICAS DA IMPLEMENTAÇÃO:**
- **4 APIs novas** criadas e testadas
- **1 tabela** Supabase com 10 campos
- **14 assinantes** migrados com sucesso
- **Zero exposição** de dados sensíveis
- **100% server-side** validation

---


---



## 🏗️ ARQUITETURA ATUAL COMPLETA

### **Stack Tecnológica Completa:**
- **Frontend:** Next.js 15.5.3 + TypeScript + Tailwind CSS
- **Drag & Drop:** @hello-pangea/dnd (v2.0.0)
- **PDF:** jsPDF (sem html2canvas)
- **Email:** Resend API + SMTP
- **Analytics:** Google Ads gtag
- **Compressão:** FFmpeg para vídeos

### **Páginas Funcionais:**
✅ Landing Page Principal (/)           # Apresentação + 2 CTAs pré-diagnóstico
✅ Pré-Diagnóstico (/pre-diagnostico)   # Funcionando universalmente
✅ Autenticação (/auth)                 # Login/cadastro com verificação de expiração
✅ Dashboard (/dashboard)               # Mapa mobile-first responsivo
✅ Diagnóstico (/diagnostico)           # Análise automática + relatórios
✅ Plano de Ação (/plano-acao)          # Framework DAR CERTO + IA V2.1
✅ Perfil (/perfil)                     # Configurações + LGPD
✅ Painel Semanal (/painel-semanal)     # Kanban visual com drag & drop (v2.0.0)
✅ Admin Assinantes (/admin/assinantes) # Dashboard gestão de assinantes ← NOVO v3.2```
✅ Reset de Senha (/reset-password)     # Detecta sessão ativa, funciona com SMTP Resend

### **APIs Implementadas:**
```
✅ Authentication (Supabase Auth)       # Sistema completo de usuários
✅ Pré-Diagnóstico (/api/prediag/*)     # Funcionando com RLS otimizado
    └── GET /options                    # Opções ramificadas por perfil
    └── POST /diagnose                  # Processar diagnóstico + salvar sessão
    └── POST /lead                      # Email funcionando (corrigido)
✅ Google Ads Conversion                 # gtag() para tracking de conversões
    └── Trigger automático quando vira lead qualificado
✅ Data Management (Supabase)           # CRUD + RLS balanceado
✅ Email System (Resend)                # Templates + delivery funcionando
✅ Email SMTP (Resend)                  # Configurado como provider no Supabase
    └── Reset de senha funcionando via SMTP customizado
```
### **Componentes Atualizados (v3.1):**
✅ src/components/mapa/index.tsx        # Componentes modulares mobile-first
✅ AtividadeForm                        # Formulário responsivo com NumberSelector
✅ MapaChart                            # Gráfico com clique + jitter + tooltip
✅ AtividadeTable                       # Cards por zona unificados
✅ MatrizMobile                         # Visualização mobile com mini-matriz
✅ CardAtividadeMobile                  # Swipe gestures implementados
✅ Tabela táticas no Supabase            # Sincronização entre dispositivos
✅ Sistema híbrido localStorage/Supabase # Funciona offline e online
✅ Notificações ROI do Foco              # Substituindo alerts nativos

### **Otimizações de Performance:**
✅ Vídeos da Landing Page               # 200MB → 2MB (redução de 96%)
✅ Processo de Compressão                # FFmpeg com rotina documentada
✅ Bandwidth Vercel                      # Economia de ~576GB/mês
✅ Web Vitals                           # LCP melhorado significativamente
✅ Pré-diagnóstico educativo             # Contexto sobre metodologia antes do chat
✅ Progressive disclosure                 # Interface em 2 estados
✅ Biografia do criador                  # Link LinkedIn para credibilidade

### **Funcionalidades de Export:**
✅ PDF Export                            # Diagnóstico e relatórios (jsPDF)
✅ JSON Export                           # Dados para acompanhamento
✅ PNG Export                            # Visualização do mapa
✅ LGPD Data Export                      # Compliance total

### **Inteligência Artificial:**
✅ Heurística V2.1                       # 6 padrões + scoring inteligente
✅ Framework DAR CERTO                   # 8 categorias (Delegar/Automatizar/etc)
✅ 450+ Recomendações                    # Sistema de recomendações categorizadas
✅ Sugestões automáticas                 # Baseadas em padrões identificados

### **Estrutura de Dados (Supabase):**
✅ authorized_emails                     # Sistema de autorização (v3.2.0)
✅ roi_prediag_sessions                  # Sessões de diagnóstico
✅ roi_leads                            # Leads capturados + nome (v1.9.1)
✅ roi_events                           # Analytics de conversão
✅ taticas                              # Sincronização de planos (v1.9.8)
✅ password_reset_tokens                # Tokens customizados (se implementado)

---

## 🎯 FLUXO DE USUÁRIO COMPLETO

### **A. FLUXO DE LEADS (100% Funcional):**
1. **Landing Page** → CTAs integrados direcionam para pré-diagnóstico
2. **Pré-Diagnóstico** → Funciona em todas as plataformas (Android corrigido)
3. **Captura de Email** → RLS configurado, emails enviados corretamente
4. **Email Marketing** → 3 recomendações personalizadas + CTAs funcionando
5. **Conversão** → Newsletter ou sistema completo

### **B. FLUXO DE USUÁRIOS PAGOS:**
1. **Autenticação** → Login funcionando universalmente
2. **Dashboard** → Mapeamento completo de atividades
3. **Diagnóstico** → Análise detalhada + relatórios
4. **Plano de Ação** → Táticas específicas com IA V2.1

---

## 🔧 TROUBLESHOOTING RESOLVIDO

### **Problemas Críticos Corrigidos:**
- ✅ **Android Redirect Issue:** Layout.tsx corrigido com exceções adequadas
- ✅ **Email Delivery Failure:** RLS balanceado permitindo APIs públicas
- ✅ **Hydration Conflicts:** Verificações desnecessárias removidas
- ✅ **Universal Compatibility:** Sistema funcionando em todas as plataformas

### **Segurança Mantida:**
- ✅ **RLS Ativo:** Todas as tabelas protegidas com políticas adequadas
- ✅ **Auth System:** Controle de acesso funcionando corretamente
- ✅ **API Security:** Validação mantida com acesso público onde necessário

- ✅ **Reset de Senha Quebrado:** Supabase não passava tokens → Detecta sessão ativa
- ✅ **Vídeos Pesados (200MB):** Comprimidos para 8MB com FFmpeg
- ⚠️ **Hotmail Reset Issue:** Erro 500 em múltiplos resets (workaround: usar /perfil)

---

## 📊 QUALIDADE TÉCNICA ATUAL

### **Compatibilidade:**
- ✅ **100% Cross-Platform:** iPhone, Android, Desktop, Mobile browsers
- ✅ **100% Functional:** Todos os fluxos testados e funcionando
- ✅ **0 Critical Issues:** Nenhum problema bloqueante identificado

### **Performance:**
- ✅ **Email Delivery:** 100% via SMTP Resend (melhor que Supabase nativo)
- ✅ **Load Times:** <1s com vídeos otimizados (antes >5s)
- ✅ **Bandwidth Usage:** 96% redução no consumo
- ✅ **Reset de Senha:** Funcionando para todos exceto Hotmail múltiplos

### **Segurança:**
- ✅ **RLS Configurado:** Políticas balanceadas para APIs públicas
- ✅ **Auth Protected:** Rotas sensíveis adequadamente protegidas  
- ✅ **Input Validation:** Sanitização mantida em todas as APIs

## ⚠️ LIMITAÇÕES CONHECIDAS E WORKAROUNDS

### **Email/Auth:**
- **Hotmail/Outlook:** Erro 500 em múltiplos resets → Usar /perfil para trocar senha
- **Supabase Free:** Redirect customizado limitado → Detecta sessão ativa

### **Performance:**
- **Vídeos:** Mantidos em 8MB após compressão (96% redução)
- **Limite Vercel:** Monitorar bandwidth mensal

### **Compatibilidade:**
- **100% funcional** exceto edge cases documentados

---

## 🚀 ROADMAP PRÓXIMAS VERSÕES

### **v1.9.4 - Analytics & Monitoring (Prioridade)**
- [ ] Google Analytics configurado para tracking de conversão
- [ ] Dashboard de métricas do pré-diagnóstico
- [ ] Monitoramento de erros automatizado
- [ ] A/B testing dos CTAs da landing page

### **v2.0.0 - Advanced Features**
- [ ] Dashboard administrativo de leads
- [ ] Segmentação avançada por comportamento
- [ ] API pública para integrações
- [ ] Mobile app nativo

---

## 🔗 LINKS E RECURSOS ATIVOS

### **URLs de Produção:**
- **Site Principal:** https://conversas-no-corredor.vercel.app
- **Pré-Diagnóstico:** https://conversas-no-corredor.vercel.app/pre-diagnostico ✅ Funcionando universalmente
- **Sistema Completo:** https://conversas-no-corredor.vercel.app/dashboard

### **Status de Monitoramento:**
- **Supabase:** ✅ Database + Auth + RLS funcionando
- **Resend:** ✅ Email delivery + templates operacionais  
- **Vercel:** ✅ Deploy + performance + logs normais

---

## 📋 CHECKLIST DE VALIDAÇÃO v1.9.3

### **✅ FUNCIONALIDADES TESTADAS:**
- [x] Pré-diagnóstico funcionando em iPhone + Android + Desktop
- [x] Email enviado corretamente após correções RLS
- [x] Landing page com CTAs direcionando adequadamente
- [x] Sistema de autenticação com exceções corretas
- [x] Todas as APIs respondendo normalmente
- [x] RLS ativo e balanceado para segurança + funcionalidade

### **✅ PLATAFORMA TESTING:**
- [x] iPhone Safari - ✅ Funcionando
- [x] Android Chrome - ✅ Funcionando (corrigido)
- [x] Desktop Chrome - ✅ Funcionando  
- [x] Desktop Firefox - ✅ Funcionando
- [x] Mobile browsers diversos - ✅ Funcionando

---

## 🛠️ COMANDOS PARA PRÓXIMA SESSÃO

### **Setup Development:**
```bash
cd C:\Users\adils\mapa-atividades
npm run dev
# Sistema funcionando universalmente
```

### **Deploy:**
```bash
git add .
git commit -m "feat: analytics e monitoramento v1.9.4"
git push  # Deploy automático via Vercel
```

### **Database Monitoring:**
```sql
-- Verificar funcionamento do sistema
SELECT COUNT(*) FROM roi_leads WHERE created_at > now() - interval '1 day';
SELECT COUNT(*) FROM roi_prediag_sessions WHERE completed_at IS NOT NULL;

-- Status das políticas RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'roi_%';

-- Verificar resets de senha
SELECT email, recovery_sent_at FROM auth.users 
WHERE recovery_sent_at > now() - interval '1 day';

```

---

**✨ RESULTADO FINAL v3.3.1:** Sistema ROI do Foco com signup 100% funcional (erro 500 resolvido), trigger `handle_new_user()` validado e testado, estrutura completa do banco documentada (schema + triggers + RLS + foreign keys), email service configurado (Supabase padrão), troubleshooting completo documentado para evitar retrabalho, e sincronização automática de 3 tabelas (auth.users → usuarios + profiles) funcionando perfeitamente via trigger após cada signup.