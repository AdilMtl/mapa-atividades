# ISSUE-316 — Spec da tela: A Trilha (biblioteca do Lab)

> Fechada em 2026-07-13 (Opus + dono), sessão de design colaborativa. A **concepção** (por que a
> biblioteca é um sistema de progressão, anti-manipulação, dois eixos) está em
> `ISSUE-316-contexto-preparatorio.md` §6 + pergunta 20 do `00b_open_questions.md`. **Este doc é a
> spec visual/estrutural da tela** — pronta pra virar código.
>
> **Deferido de propósito (NÃO é escopo desta spec):** escrever o conteúdo dos guias de Valor &
> Carreira (kit + toques específicos + marco de trajetória). É uma sessão de conteúdo própria
> (Opus + aprovação do dono, voz da newsletter, aterrada na teoria de carreira — §5). Aqui a tela
> só deixa os slots prontos.

---

## 1. O que esta tela É

A biblioteca **não é uma prateleira** — é o **registro visível da jornada de construção da
pessoa**. Uma trilha que acende conforme ela constrói, com **ramos de valor** brotando onde ela
entregou. Diferencial de um chat: método + julgamento + a camada de transformar o que se constrói
em retorno de carreira.

Rota: `/lab/biblioteca` (nav do `LabShell` — tirar o badge "em breve"). Server Component que lê
`lab_projects` (RLS filtra pelo dono), deriva o estado num motor puro novo (`src/lib/lab/trilha.ts`
ou similar) e renderiza — **mesmo padrão do hub (`/lab/inicio`), zero tabela nova, zero rota de API**.

---

## 2. Anatomia da página

**Desktop — o mapa inteiro num relance:**
```
┌─ /lab/biblioteca ──────────────────────────────────────────┐
│  TEU REPERTÓRIO DE CONSTRUÇÃO             (eyebrow mono)     │
│  O mapa do que você sabe construir        (H1 Fraunces)     │
│  cada projeto teu acende um pedaço desta trilha  (lead)     │
│                                                             │
│  🔧 CONSTRUÇÃO                     progresso  2/9 ▓▓░░░░░░   │
│  ✓──────✓──────◑──────✧····◦····◦····◦····◦····◦            │
│  prompt  tmpl   wflow  [aut] ...                            │
│  │       │                                                  │
│  └▸valor └▸valor       ← ramos brotam dos nós CONQUISTADOS  │
└─────────────────────────────────────────────────────────────┘
```

**Mobile — a subida (rola vertical, "escalando"); ramo = desvio lateral:**
```
┌ /lab/biblioteca ┐
│ eyebrow·H1·lead │
│ 🔧 CONSTRUÇÃO   │
│ progresso 2/9   │
│      ◦   horizonte (fosco)
│      ┊          │
│      ✧   ao alcance (brilha)
│      ┊          │
│      ◑   em construção
│      ┊          │
│      ✓──▸ valor  conquistado → ramo
│      ┊          │
│      ✓──▸ valor  conquistado → ramo
└─────────────────┘
```

Estilo: DS2 (`08_diretrizes_visuais_ds2.md`). `PageContainer` → `Eyebrow` → H1 Fraunces (mesmo
padrão do hub) → lead `text-secondary`. A região da trilha é "área de laboratório" → **grid técnico
permitido** (§1 do DS2). Label de progresso em mono (`2/9`), barra = `Progress` (gradiente).

---

## 3. A trilha de Construção

- **9 nós = os 9 tipos de solução**, ordenados pela **escada de complexidade** (`COMPLEXIDADE` de
  `radar/oportunidades.ts`): prompt → template → workflow → automação → dashboard → app_offline →
  app_tabela → orquestrado → agentico.
- **Forma: serpente (cara de jogo)** — decisão do dono (Q1). Nós redondos ligados por um caminho
  que serpenteia. É o momento-herói da tela, mas dentro do DS2 (sem neon/circuito/sci-fi — proibições §6).
- **Responsivo (decisão do dono):** **desktop = varredura horizontal** (os 9 nós num relance — ela
  vê o tamanho da jornada); **mobile = coluna vertical serpenteada** (rola "escalando"). Vira no
  breakpoint 900px.
- **Ícones dos nós = lucide-react** por tipo (nunca emoji — regra DS2).
- **4 estados** (tokens DS2, decididos pelo Sonnet — derivam de `lab_projects.status`):

| Estado | Quando | Visual |
|---|---|---|
| **Conquistado** | projeto daquele tipo `concluido` | nó preenchido `accent-orange` + `Check` (lucide). Brota ramo de valor (§4). |
| **Em construção** | projeto começado, não concluído | anel `accent-orange` parcial (estilo `Progress` circular). |
| **Ao alcance** | próximo degrau (curado pelo motor) | brilho `accent-amber-soft` + `Lock` pequeno; clicável → promessa + condição ("construa um X pra abrir"). |
| **No horizonte** | longe demais | `text-subtle` fosco, sem brilho, sem cadeado em destaque. Entra no alcance conforme ela sobe. |

- **Curadoria de adjacência (decisão fechada):** só o **próximo degrau** (1, no máximo 2) fica "ao
  alcance"; o resto é horizonte. Reusa `COMPLEXIDADE` + `vencedor_bruto`/`linhaEvolucao` (já
  existem — não recria inteligência). Prompt **nunca** revela agente. Um degrau por vez.
- **Clique:** nó conquistado ou ao alcance → abre o guia (página própria, §6). Nó no horizonte não
  abre conteúdo — no máximo um teaser mínimo de direção ("isso abre quando você construir de verdade").

---

## 4. Os ramos de Valor & Carreira

- **Brotam de cada nó CONQUISTADO** (conclusão real — é o que sustenta a anti-manipulação: o prêmio
  só vem de entregar de verdade, §6.3 do preparatório).
- **Visual:** um nó-filho ligado ao nó conquistado. Desktop = sai pra baixo do nó; mobile = desvio
  lateral. Discreto, mas presente — "fruto" da fase.
- **Conteúdo — modelo HÍBRIDO (decisão do dono):**
  - **Kit transversal**, replicado a todos os ramos, **contextualizado com os dados reais daquele
    projeto** (`horas_semana`, `publico`, `entrega` que o wizard já captura) — ex.: no ramo do
    workflow, os números do workflow; no do prompt, os do prompt. O oposto de um chat genérico.
  - **+ 1-2 toques específicos** daquele tipo/jornada (a camada que varia por ramo — profundidade
    sem explodir em 27 guias).
- **Primeiro ramo a brotar = momento cerimonial** (Q4): confete leve (emoji/SVG, política de
  animação do Lab — framer-motion + lucide, zero dep, `prefers-reduced-motion`), no `BlocoResultado`
  da conclusão: *"Você concluiu teu projeto. Agora vamos extrair o máximo dele."*
- **Ler um ramo** = página própria também (§6).

---

## 5. O marco de trajetória (capital de carreira) — espinha teórica do eixo de Valor

Reenquadramento do dono: **"virar referência" não é um guia solto — é a tese do andar inteiro.**

**Tese-espinha:** *você fez a entrega — agora precisa **coletar os benefícios** dela.* Construir não
basta; capturar o retorno é parte do trabalho. Os retornos a colher (pontos do dono, registrados
literalmente pra embasar o conteúdo):
- Isso **bateu/afetou tua meta**?
- **Economizou horas** do teu trabalho?
- Te deu **renome político / reconhecimento** — as pessoas te conhecem, teu chefe sabe que você é bom?
- Pode levar a **aumento de salário, de responsabilidade, de escopo**?

**Frente de teoria a plugar** (pedido do dono): capital de carreira corporativo — **gestão de
pessoas, evolução de carreira, liderança** (boas práticas tipo Harvard). É a base séria que
diferencia isso de "dica de vender pro chefe".
> ⚠️ **Ao escrever o conteúdo:** aterrar em **fonte real** — não inventar frameworks nem atribuir
> citações a Harvard sem verificar (ver `[[feedback-verificar-plataformas-terceiros]]`). A frente
> teórica é direção de pesquisa, não citação pronta.

**Encaixe na tela:** este marco **destrava com N conclusões** (trajetória, não um projeto único) —
reconhece o acúmulo. Onde exatamente ele aparece (um nó especial no fim da trilha? um painel que
surge acima da trilha depois de N conclusões?) e o conteúdo detalhado ficam pra **sessão de
conteúdo** (§8).

---

## 6. Leitura de um ativo

- **Página própria** `/lab/biblioteca/[slug]` (decisão do dono) — vale pros guias de construção e
  pros ramos de valor. Volta com ←. Melhor pra texto longo no mobile; o plano do projeto
  (`plan.materiais_slugs`) consegue **deep-linkar** direto pro slug do guia.
- Renderiza `content_markdown` de `lab_assets` (guias de construção) / conteúdo do ramo (valor).
- DS2 de leitura: `Panel`/`Card`, tipografia de corpo (Plex Sans), sem grid técnico em área de
  leitura longa (proibição §6 do DS2).

---

## 7. Técnico

- **Server Component** lê `lab_projects` (RLS); motor puro novo deriva o view-model da trilha
  (estados dos 9 nós + ramos + progresso) a partir de `status` + `plan.materiais_slugs` +
  `COMPLEXIDADE`/`vencedor_bruto`. Testável, mesmo padrão de `hub.ts`.
- **Zero tabela nova, zero SQL de estado** — desbloqueio = f(projetos dela).
- **Seed dos 10 guias de Construção** em `lab_assets` (transposição do `GUIAS` de `materiais.ts` →
  linhas `published=true`; SQL rodado pelo dono no painel, método da casa). Contrato "zero slug
  quebrado" garantido pelos `SLUGS_CANONICOS`.
- **Animação:** framer-motion + `IconesAnimados` (lucide) já no projeto; `prefers-reduced-motion`
  respeitado; sem dependência nova, sem CDN.
- **Ativar** o item "Biblioteca" no `LabShell`.

---

## 8. O que fica pra depois (deferido — registrado, não perdido)

1. **Sessão de conteúdo dos guias de Valor & Carreira** (Opus + aprovação do dono): o kit
   transversal + os 1-2 toques específicos por tipo + o marco de trajetória, aterrados na teoria de
   carreira do §5. É o gargalo de conteúdo desta issue — destrava antes de codar os ramos.
2. **Fatiamento da execução** (proposta): **fatia A** = trilha de Construção + 4 estados + seed dos
   10 + leitura + ativar nav (tudo já especificado, conteúdo pronto); **fatia B** = ramos de valor +
   ritual + marco de trajetória (depende da sessão de conteúdo). A trilha entrega valor sozinha
   mesmo antes dos ramos.
3. **Enriquecimento de animação** da trilha (nó acendendo, transições, som) — spec de UX futura.
