# ISSUE-316 — Material preparatório pra sessão do Opus (ponte temporária do Fable 5)

> Escrito pelo Sonnet em 2026-07-13, antes da sessão de spec colaborativa. Segue o padrão
> estabelecido nas ISSUE-314/320: grounding técnico + tese estratégica + escopo + threads
> abertas, pra sessão cara começar rica, não em branco. Ver `[[padrao-contexto-preparatorio-fable]]`.
> **Modelo desta sessão: Opus** (Fable 5 volta 2026-07-15, decisão registrada como ponte
> temporária — não mexer em `05_model_execution_strategy.md` nem no campo `Modelo:` do backlog).

---

## 1. Grounding técnico — o que já existe de verdade hoje

### 1.1 A biblioteca ainda não existe em código
- **Zero arquivo** `/lab/biblioteca` — nem página, nem rota de API, nem componente.
- `LabShell.tsx:43` já reserva o item de navegação **"Biblioteca"** com badge "em breve"
  (desativado). `/lab/inicio/page.tsx:112` também anuncia "Biblioteca... chegam em breve".
- A tabela `lab_assets` **já existe em produção** (`docs/revamp/ISSUE-310-sql-lab.md`, rodada
  e verificada em 2026-07-09) — RLS liga, `SELECT` liberado pra `authenticated` só onde
  `published = true`; escrita é exclusiva de `service_role` (seed é SQL/script, não UI).

Schema real da tabela (já em produção, não é proposta):
```
lab_assets: id (uuid pk) · slug (varchar 80, unique) · title · description
  · format (checklist | template | guia | canvas)
  · solution_types (text[], os 9 tipos do motor) · maturity_min (varchar, nullable)
  · content_markdown (text) · premium_only (bool, default false)
  · published (bool, default false) · origin (lab | workshop, default lab)
  · created_at · updated_at
```

### 1.2 A descoberta mais importante desta preparação: o conteúdo já existe, quase todo
A ISSUE-314 (2026-07-11) já escreveu, e o dono já **aprovou**, um corpo de conteúdo que a 316
foi desenhada desde o início para reaproveitar — não é rascunho novo, é transposição:

- **10 guias em prosa, completos, na voz aprovada**, vivendo hoje em
  `src/lib/lab/materiais.ts` (`GUIAS`, linhas 32–123): `prompt-de-quatro-partes`,
  `template-de-campos-fixos`, `fluxo-em-etapas`, `regra-quando-x-faca-y`,
  `painel-das-tres-perguntas`, `descricao-de-uma-pagina`, `tabela-de-dez-registros`,
  `recorte-do-fluxo-principal`, `consulta-a-base-antes-do-agente`,
  `cuidado-com-dados-sensiveis`. Cada um com título + 3 parágrafos, revisado contra o Guia de
  Voz do dono (ver `[[guias-de-voz-adilson]]`).
- Esses 10 slugs são o **`SLUGS_CANONICOS`** exportado por `plan-generator.ts:44` —
  **contrato explícito da 312 com a 316**: "a 316 semeia a biblioteca A PARTIR desta lista —
  é o contrato que garante zero slug quebrado nos planos" (comentário literal no código).
  Ou seja: **estes 10 são obrigatórios**, não uma sugestão — todo plano gerado hoje já
  referencia um subconjunto deles em `plan.materiais_slugs`, e a página do projeto
  (`BlocoCaminhada`) já lê `guiaAncora()`/`guiaPorSlug()` pra mostrar o guia certo dentro da
  fase certa.
- **O que NÃO dá pra semear direto:** os "primeiros prompts" (`TEMPLATE_PROMPT`,
  `materiais.ts:188–262`) são **personalizados por projeto** (`{{clausula}}`, `{{entrega}}`,
  `{{ferramenta}}` resolvidos por `montarPrimeiroPrompt`) — não fazem sentido como
  `content_markdown` estático e genérico de biblioteca. Eles continuam vivendo só dentro da
  página do projeto. A biblioteca expõe os **guias** (conhecimento reusável, sem contexto de
  projeto), não os prompts (artefato do projeto).

### 1.3 Consequência prática direta
Os 10 slugs canônicos já cobrem o piso de "6–10 ativos" pedido pela issue **sem nenhuma
palavra nova a escrever** — o trabalho de conteúdo desta sessão, se houver, é **decidir se
queremos ativos ADICIONAIS** além desses 10 (variedade de formato: hoje todos os 10 são
`format = 'guia'`; nenhum é `checklist`/`template`/`canvas` de verdade), não escrever os 10 do
zero. Isso muda a natureza do "gargalo é conteúdo" registrado no backlog: o gargalo vira
**decisão de escopo/formato**, não produção de texto.

### 1.4 Padrões de UI/visual já estabelecidos que a biblioteca herda
- DS2 (Dark Editorial Atelier) é o único sistema visual válido — tokens em
  `08_diretrizes_visuais_ds2.md`.
- A metáfora "manuscrito" (fonte Caveat, `NotasConsultor`) é **exclusiva da rota do wizard**
  (decisão pergunta 16) e, na página do projeto, sobrevive só como 1–3 anotações de margem
  (pergunta 17, decisão 3: "manuscrito coadjuvante... nunca como estrutura da página"). A
  biblioteca, sendo uma tela de **consulta/repertório** (não a cena do consultor), é candidata
  natural a ficar 100% DS2 limpo, sem Caveat — mas isso é uma leitura minha, não uma decisão
  fechada; vale confirmar na sessão (thread aberta, §5).
- Não existe hoje nenhum componente de "card de biblioteca" ou "leitor de markdown" no
  projeto — a 316 desenha esse padrão do zero (mas dentro do vocabulário visual já existente:
  `Module`/`Panel`/badges do DS2, mesmo padrão dos cards de `/lab/inicio`).

### 1.5 Filtros e navegação — o que o plano técnico já fixou
`13_plano_fase1_lab.md` (linhas 210–223, 364–370) já registrou como escopo assumido:
- Filtros por **tipo de solução** (`solution_types`, os 9 tipos) e por **formato**
  (`checklist`/`template`/`guia`/`canvas`).
- Cada ativo abre numa página/painel de leitura com `content_markdown` renderizado.
- A biblioteca conecta com o plano: os slugs que o plano recomenda (`plan.materiais_slugs`)
  devem existir de verdade na biblioteca — critério de aceite "zero slug quebrado" (já
  garantido pelo ponto 1.2, contanto que os 10 canônicos sejam semeados).
- Mix free/premium sugerido no doc-fonte (não fechado pelo dono ainda, é projeção do plano):
  **"~4 de 10 ativos `premium_only=false`"** — a tabela §7 do `13_plano_fase1_lab.md` usa isso
  como referência de como o paywall vai se comportar na 1C, mas **ninguém decidiu quais 4**
  nem se essa proporção ainda faz sentido agora que os 10 canônicos são o piso real.
- `maturity_min` existe no schema mas **nenhum guia hoje tem opinião sobre fluência mínima**
  — campo nasceu para o futuro, ok ficar `NULL` em todos por ora (não acho que isso precise de
  decisão nesta sessão, mas registro como leitura).

---

## 2. Tese estratégica já registrada — fonte primária, não parafraseada

Do handoff estratégico (`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`, §16,
"Primeiros ativos recomendados para a biblioteca") — **este é o brainstorm ORIGINAL, anterior
à decisão de reaproveitar os guias da 314**, e diverge do que já foi escrito:

> Sugestão de 10 ativos: (1) Checklist dos 4Ds aplicado a projetos de IA; (2) Builder Canvas;
> (3) Template de PRD simples; (4) Guia "do problema ao prompt"; (5) Guia "do prompt ao
> workflow"; (6) Guia "do workflow ao dashboard"; (7) Guia "do app local ao app
> compartilhável"; (8) Checklist de dados e diligência; (9) Template para narrar valor para
> liderança; (10) Lista de casos de uso corporativos por área.

Note a divergência real: esse brainstorm imaginava ativos **conceituais/transversais**
(Builder Canvas, PRD, "narrar valor pra liderança", casos de uso por área) — coisas que HOJE
não existem em lugar nenhum do código. Os 10 guias que de fato já foram escritos (materiais.ts)
são **guias operacionais por formato de solução** (prompt, template, workflow, automação,
dashboard, app...), uma abordagem diferente e já aprovada pelo dono. **Isto é uma thread
aberta genuína** (§5): o handoff original pedia um tipo de ativo, o que foi construído entrega
outro. Os dois não competem (podem coexistir), mas vale nomear a divergência na sessão em vez
de fingir que não existe.

Do `13_plano_fase1_lab.md` (linha 437, checklist de aceite da Fase 1A):
> "6. **Biblioteca mínima:** 6–10 ativos publicados, filtráveis, legíveis no mobile."

Do mesmo doc (linha 283, tabela de premium):
> "Biblioteca | Ativos `premium_only=false` (~4 de 10) | Tudo, incl. materiais do workshop"

Da pergunta 14 (`00b_open_questions.md`, resposta do dono 2026-07-09):
> "Conteúdo dos primeiros ativos da biblioteca: Claude rascunha a partir do `content.ts` dos
> radares + material editorial; **nada publica sem aprovação do dono** (ISSUE-316)."

Do backlog (`04_issue_backlog.md`, entrada da 316):
> "**Modelo:** Sonnet no código (filtro/render é trivial) + Fable 5 rascunha o conteúdo dos
> ativos, dono aprova (decisão pergunta 14) — o gargalo desta issue é conteúdo, não código."

---

## 3. Escopo desta issue — o que a 316 entrega vs. o que fica pra depois

**Entra (1A, esta issue):**
1. Página `/lab/biblioteca` — listagem com filtro por tipo de solução + formato, DS2.
2. Página/painel de leitura de um ativo (`content_markdown` renderizado).
3. Seed dos 10 ativos canônicos (transposição de `GUIAS` pra linhas de `lab_assets`, SQL
   rodado pelo dono, método padrão da casa — sem credencial de banco na sessão).
4. Ativar o item "Biblioteca" no `LabShell` (tirar o badge "em breve").
5. Ligação com o plano: onde a página do projeto já recomenda materiais
   (`plan.materiais_slugs`), oferecer link pra ver aquele mesmo ativo na biblioteca (hoje o
   guia âncora só aparece embutido na fase — não linkado a uma página própria).
6. Decisão de `premium_only` por ativo (mesmo sem paywall ativo, o campo precisa de um valor
   consciente, não um default arbitrário) e decisão sobre `format` de cada um dos 10 (todos
   `guia`, ou alguns viram `checklist`/`template` de fato?).

**NÃO entra (fica para issues futuras, já mapeadas):**
- Ativos NOVOS de conteúdo (Builder Canvas, PRD Kit, checklist 4Ds, casos de uso por área) —
  se a sessão decidir que valem a pena, viram itens além do piso de 10, não bloqueiam o launch
  da 316; podem nascer aqui como extensão ou virar backlog da 326 (biblioteca premium).
- Paywall de verdade (`premium_only` vira gate ativo) — ISSUE-324/326, Fase 1C.
- Export PDF / materiais de workshop (`origin='workshop'`) — ISSUE-326.
- IA de recomendação de materiais — não existe na 1A (regra de match por `solution_types`,
  determinística).

---

## 4. Threads abertas — decisões genuínas para a sessão com o dono

> ⚠️ **SUPERADAS pela §6** (sessão 2026-07-13). As threads abaixo foram o ponto de partida;
> o dono levou a concepção muito além delas (biblioteca vira sistema de progressão
> desbloqueável). Leia a §6 como a concepção de referência atual.

Estas não são perguntas factuais de "onde fica a chave de API" (não há infra nova aqui) — são
decisões de produto/design que fazem sentido resolver **vendo opções**, no espírito que o dono
pediu para esta sessão (trazer opções, visual, ir perguntando):

1. **Piso vs. ambição:** lançar só com os 10 canônicos (zero conteúdo novo, mais rápido) ou
   usar esta sessão para também esboçar 2–4 ativos extras inspirados no handoff §16 (Builder
   Canvas, checklist 4Ds, template de narrar valor, casos de uso por área)? Note que os 10
   canônicos sozinhos já cumprem o critério de aceite "6–10 ativos" — ativos extras são
   ambição, não requisito.
2. **Diversidade de formato:** os 10 guias hoje são todos prosa (`format: 'guia'`). Vale a pena
   reformatar 2–3 deles como `checklist` de verdade (lista de itens marcáveis) pra biblioteca
   não parecer monofônica? Ou isso é over-engineering pra uma v1 e fica pra 326?
3. **Curva free/premium:** o plano técnico projetava "~4 de 10 grátis" como referência de como
   o futuro paywall vai se sentir — mas ninguém decidiu QUAIS. Vale decidir isso agora (ainda
   que sem efeito prático até a 1C) ou marcar todos como `premium_only=false` por ora e
   resolver a curva de verdade só quando o Stripe entrar (324/325)?
4. **Visual da tela:** grid de cards (como o hub `/lab/inicio`) vs. lista mais densa tipo
   índice? A leitura do ativo abre em página própria (`/lab/biblioteca/[slug]`) ou painel/modal
   sobre a listagem? Não há precedente direto no projeto pra esse padrão específico ainda.
5. **Conexão com o plano:** a página do projeto hoje mostra o guia âncora embutido dentro da
   fase certa (sem link pra lugar nenhum). Faz sentido adicionar "ver isso na biblioteca" ali
   dentro (linka pro slug), ou a biblioteca fica propositalmente desconectada da leitura guiada
   da Caminhada (evita competir pela atenção durante a jornada, funciona só como repertório
   solto pra consulta livre)?

---

## 5. Como abrir a sessão com o Opus

Sugestão de prompt de abertura (o dono já indicou que fará as perguntas ele mesmo pela sessão
trocada de modelo, então isto é só o ponto de partida):

> "Vamos fechar a spec da ISSUE-316 (Biblioteca do Lab). Leia
> `docs/revamp/ISSUE-316-contexto-preparatorio.md` — a descoberta principal é que o conteúdo
> obrigatório (10 guias canônicos) já existe e já foi aprovado, então o verdadeiro trabalho
> desta sessão é design da tela + decisão de escopo (ativos extras? formatos variados? curva
> free/premium?), não redigir texto do zero. Me traga opções visuais e de escopo pra cada
> thread aberta do §4, e vá perguntando."

---

## 6. CONCEPÇÃO FECHADA — a biblioteca como jornada de progressão (sessão 2026-07-13, Opus + dono)

> Esta seção **supera** as threads do §4. O dono levou a biblioteca de "prateleira de consulta"
> para **um sistema de progressão desbloqueável pela jornada real** — decisão de produto que abre
> um eixo novo no projeto (gamificação com julgamento, amarrada à métrica-norte), que ainda não
> estava mapeado. Registrada aqui como concepção de referência; a spec de implementação detalhada
> (e o fatiamento da execução) nasce quando a issue for de fato codada.
>
> ⚠️ **REFINADO na mesma sessão (ver §6.8 + a spec de tela `ISSUE-316-spec-tela-trilha.md`):** o
> modelo evoluiu de "dois andares empilhados (Valor no cume)" para **trilha única com ramos de
> valor brotando dos nós concluídos**. Onde as §6.1/6.4/6.5 abaixo falam de "andar de Valor no
> rodapé/cume", leia como **ramos + marco de trajetória** — §6.8 é a versão vigente.

### 6.1 O que a biblioteca É agora — dois eixos revelados pela jornada
Não é uma lista aberta. São dois eixos que a pessoa **destrava avançando** (⚠️ ver §6.8 — não são
mais "andares empilhados"):
- **🔧 Construção** — "como eu tiro do zero". Os 10 guias canônicos (já escritos/aprovados na 314). É a trilha.
- **📈 Valor & Carreira** — "como eu faço isso contar pra mim". Ramos que brotam dos nós concluídos + um marco de trajetória (§6.8).

### 6.2 O modelo de desbloqueio — mapa de calor por adjacência (metáfora Yoshi's Story)
Decisão do dono (Q1): o andar de Construção é uma **trilha visual (hero)** — os tipos de solução
são nós ligados por um caminho, que acendem conforme ela avança (referência: seleção de fase de
jogo; degrada pra trilha vertical no mobile). **Quatro estados**, espelhando `lab_projects.status`:
- **Conquistado** — projeto daquele tipo concluído. Nó aceso, cheio.
- **Em construção** — projeto começado, ainda não concluído.
- **Ao alcance** — o **próximo degrau** na escada. Curadoria pelo motor (`COMPLEXIDADE` +
  `vencedor_bruto`/`linhaEvolucao`, que já existem — reusa, não recria). Brilha como direção.
- **No horizonte** — longe demais (o agente pra quem só fez prompt). Fosco, sem spoiler; entra no
  alcance conforme ela sobe um degrau de cada vez ("o jogo termina em várias jogadas").

Curadoria por adjacência é **decisão fechada**: prompt nunca revela agente. Um degrau por vez.

### 6.3 Anti-manipulação — por que é natural, não gameável (resolve a incerteza do dono na Q2)
**Risco levantado pelo dono:** se o item "ao alcance" mostra a recompensa, a pessoa pode responder
o wizard de forma desonesta pra desbloquear. Nome do risco: **Lei de Goodhart** — quando o
desbloqueio vira alvo, a medida (o wizard) se corrompe.

**Resolução — estrutural, não moderação:** o design remove o incentivo, em vez de policiar.
1. **O wizard nunca desbloqueia nada sozinho.** Classificar só REVELA a posição no mapa + ilumina
   a próxima parada. Responder não dá prêmio.
2. **Não há loot farmável.** O guia de construção que a pessoa precisa **já vive na Caminhada dela**
   (embutido na fase) — a biblioteca não é porteira de ferramenta necessária. Acender o nó no mapa
   não dá utilidade extra pra farmar; é reconhecimento da jornada.
3. **O único prêmio real — o andar de Valor — é gated por conclusão real.** Não dá pra fingir
   barato, e concluir É o comportamento que a métrica-norte quer. Fingir no wizard te dá um plano
   de um projeto que você não vai fazer — sem prêmio.
4. **A isca é DIREÇÃO, não tesouro:** o card "ao alcance" nomeia o próximo passo natural + o "por
   quê" (informacional, do `content.ts`) + a condição honesta ("abre quando você construir de
   verdade"). Bússola, não baú.

Referências de boa prática: progressão gated-por-comportamento (Duolingo: avança concluindo, não
declarando), Yoshi's Story (mundo novo abre limpando a fase, não escolhendo no menu), efeito IKEA
(valor sentido ∝ esforço investido — recompensa que cai de uma resposta é barata; a que cai de
projeto concluído é sentida como conquista).

### 6.4 Andar de Valor & Carreira — conteúdo (Q3: teoria + ferramenta)
Cada um dos 3 guias tem **duas camadas**:
- **Leitura (teoria):** o que é, por que, e a **tese-espinha do dono** — *construir não basta; tudo
  que a gente constrói tem que gerar retorno* (político, ligado à promoção, ao bônus, a virar
  referência). Voz da newsletter; referência a artigos entra depois.
- **Ferramenta (algoritmo preenche):** uma estrutura populada com os **dados reais dela** (o
  `horas_semana`, `publico`, `entrega` que o wizard já captura) — ex.: rascunho do argumento pra
  liderança já com os números dela. É o oposto de um chat genérico.

Os 3 de estreia: **apresentar pra liderança · traduzir o valor em números · virar referência na
tua área.** Registrado como semente — expandir depois (mais guias, mini-vídeo, artigos) em specs
futuras.

### 6.5 O ritual de desbloqueio (Q4: momento cerimonial)
Ao concluir o 1º projeto, o `BlocoResultado` (cerimônia de conclusão que já existe) ganha um beat
celebrativo — **animação leve de confete** (emoji/SVG, dentro da política de animação do Lab:
framer-motion + ícones lucide, zero dep nova, `prefers-reduced-motion` respeitado) — anunciando o
novo capítulo: *"Você concluiu teu projeto. Agora vamos extrair o máximo dele."* UX/animação mais
rica (Lottie/Rive/som) fica pra spec de UX futura.

### 6.6 Emaranhamentos e aberturas — o mapa de crescimento (o dono pediu pra traçar)
- **Deriva de `lab_projects`** — zero tabela nova, zero SQL de estado; unlock = f(projetos dela),
  mesmo padrão do hub.
- **`premium_only` (já no schema)** → 1C: nó que abre construindo **ou** virando premium — mesmo
  mecanismo, sem refactor.
- **Novos andares** no futuro (Escala & Time, Casos por área).
- **Coleções / níveis / selos:** "abriu todos os de construção" = marco; "concluiu 3 projetos" =
  badge de Builder. O horizonte fosco vira **quest log** que cresce junto com a biblioteca.
- **Trilha visual** já é v1 (hero) — há espaço pra enriquecer (nó acendendo com animação, som,
  transições) em specs de UX futuras.
- **Eixo novo que isto abre no projeto:** *progressão com julgamento* — gamificação amarrada à
  métrica-norte (concluir + diversificar tipos), sem hype, sem manipulação. Não estava mapeado.

### 6.7 Impacto no escopo da 316 (honestidade)
Deixou de ser "grid + render markdown". Agora inclui: **trilha visual com 4 estados** + curadoria
de adjacência (reusa o motor) + **andar de Valor com 3 guias novos** (teoria + preenchimento por
dados reais) + **ritual de conclusão**. Continua **sem tabela nova**. É bem mais que o backlog
previa — mas é o que dá alma e diferencial à biblioteca. **Pode valer fatiar a execução** (ex.:
trilha + seed dos 10 primeiro; andar de Valor + ritual em seguida) — o fatiamento fica pra abertura
da execução, não pra agora.

### 6.8 REFINAMENTO — trilha única com ramos de valor (supera o "cume"; versão vigente)

O dono rejeitou o "Valor no cume" com um achado real: a trilha **não fecha linearmente** — mais
projetos acendem mais nós, e nada impede chegar "no fim" com **vãos em branco pra trás**. Um prêmio
único no rodapé/cume daria a sensação errada. Modelo vigente:

- **Uma trilha só (Construção).** O Valor deixa de ser andar empilhado.
- **Ramos de valor brotam de cada nó CONQUISTADO** (conclusão real — reforça a anti-manipulação da
  §6.3: o prêmio nasce onde ela entregou de verdade, não num topo distante). Os vãos viram só
  horizonte fosco, não "falta pra chegar no prêmio".
- **Conteúdo do ramo = HÍBRIDO** (decisão do dono): kit transversal replicado a todos, mas
  **contextualizado com os dados reais daquele projeto** (`horas_semana`/`publico`/`entrega`), **+
  1-2 toques específicos** daquele tipo/jornada. Profundidade sem explodir em 27 guias.
- **Marco de trajetória (capital de carreira)** — "virar referência" não é guia solto, é a **espinha
  teórica do eixo de Valor**. Tese do dono: *você fez a entrega, agora precisa **coletar os
  benefícios** dela* (bateu meta? economizou horas? renome político / chefe sabe que você é bom?
  leva a aumento de salário/escopo/responsabilidade?). **Frente de teoria a plugar:** capital de
  carreira corporativo — gestão de pessoas, evolução de carreira, liderança (boas práticas tipo
  Harvard). Destrava com N conclusões (trajetória, não 1 projeto). ⚠️ Ao escrever, **aterrar em
  fonte real** — não inventar framework nem citar Harvard sem verificar ([[feedback-verificar-plataformas-terceiros]]).

**Decisões de tela (todas fechadas nesta sessão) → spec dedicada `ISSUE-316-spec-tela-trilha.md`:**
trilha em **serpente (cara de jogo)**; **desktop horizontal / mobile vertical**; **4 estados** de nó
(conquistado/em construção/ao alcance/horizonte, tokens DS2); leitura em **página própria
`/lab/biblioteca/[slug]`**; ritual de confete no 1º ramo.

**Deferido pra sessão de conteúdo própria:** escrever o kit de valor + toques específicos + marco de
trajetória (voz da newsletter, aterrado na teoria de carreira). Os 10 guias de Construção já existem.
