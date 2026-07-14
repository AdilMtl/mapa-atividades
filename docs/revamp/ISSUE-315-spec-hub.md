# ISSUE-315 — Hub `/lab/inicio` com estados reais · SPEC (copy + design + execução)

> **Modelo desta spec:** Opus (copy, voz, design visual/estrutural). **Execução:** Sonnet.
> **Status:** ✅ implementada em 2026-07-13 (v3.11.18) — ver §5.1/§13 pelas correções de copy
> feitas durante a execução (subtexto/CTA passaram a ter 3 variantes por tier, não 2).
> **Depende de:** 311 (shell/gate) ✅ · 313 (wizard) ✅ · 314/314B/314C/314D (página do projeto + motor de continuidade) ✅.
>
> ⚠️ **TODA a copy abaixo está PENDENTE DE VETO DO DONO** (norma da casa pra copy nova de
> produto). Foi escrita pelo Guia de Voz oficial (checklist §8) e respeita os vetos já dados
> (ver memória `guias-de-voz-adilson`), mas ainda não passou pela leitura final do Adil.

---

## 1. O problema que resolve (queixa do dono, 2026-07-13)

Hoje `/lab/inicio` é **esqueleto estático** — não lê o banco. Projeto mapeado não aparece, então
reabrir o Lab joga a pessoa de volta pro "novo projeto" e ela **refaz o diagnóstico do zero**.
Esta issue faz o hub **listar os projetos reais** e devolver a pessoa ao que estava fazendo — com
um empurrão claro pra concluir (progresso + quanto tempo falta), pensado pra quem **não tem
dinâmica de gestão de projetos**. Objetivo do dono: tornar simples, navegável, intuitivo, e
mostrar o valor.

## 2. Escopo

**ENTRA:**
1. Topo personalizado ("continue de onde parou") em destaque — nome + objetivo + progresso +
   tempo que falta + CTA pra voltar ao projeto.
2. Card "novo projeto" rebaixado a secundário quando já há projeto.
3. Lista "Teus projetos" — todos, com status + progresso, cada um clicável.
4. Estado vazio caprichado (primeiro acesso = convite à proposta).
5. Os 4 estados renderizam: vazio / rascunho no topo / em andamento / tudo concluído.
6. **Correção do roteamento do wizard** (`?id=`) — ver §7. In-scope por decisão do dono
   ("se for fácil de arrumar, a gente já fixa").

**FICA DE FORA (tão vinculante quanto o que entra):**
- Biblioteca real → ISSUE-316. Continua "em breve" (já está assim na `LabShell`).
- Perfil real → ISSUE-317.
- Eventos de analytics `lab_*` → ISSUE-318.
- **Zero SQL. Zero mudança na lógica do motor/plano.** Hub é leitura; wizard ganha só um
  parâmetro opcional aditivo (§7).

## 3. Dados (como o Server Component lê)

A página **já é Server Component**. Consulta `lab_projects` com o cliente da sessão — **RLS já
limita ao dono** (mesmo padrão de `novo-projeto/page.tsx`). **Sem rota de API nova.**

```ts
const { data: projetos } = await supabase
  .from('lab_projects')
  .select('id, title, status, plan, updated_at')
  .order('updated_at', { ascending: false })
```

Cada linha vira um view-model via **motor puro novo `src/lib/lab/hub.ts`** (+ testes vitest,
regra da casa: motor puro testável, UI só renderiza). Reaproveita de `continuidade.ts`:
`etapaAtual()` (fase X de Y), `minutosRestantes()` (tempo que falta), `formatarDuracaoMin()`.

### View-model por projeto

```ts
export interface ProjetoResumo {
  id: string
  titulo: string
  status: 'rascunho' | 'planejado' | 'em_construcao' | 'concluido' | string
  feitas: number          // etapas marcadas (0 se rascunho/sem plano)
  total: number           // total de etapas (0 se rascunho/sem plano)
  faseAtual: number | null // 1-based; null = concluído ou sem plano
  minutosRestantes: number | null // null = plano pré-314C (sem estimativa) ou concluído
  href: string            // ver §6
  emAndamento: boolean    // rascunho | planejado | em_construcao
}
```

## 4. Os 4 estados (algoritmo do topo)

Algoritmo simples, pedido do dono. Puro, em `hub.ts`, testado:

```
emAndamento = projetos.filter(p => p.emAndamento)   // já vêm ordenados por updated_at desc
destaque    = emAndamento[0] ?? null

se projetos vazio            → estado 'vazio'
senão se destaque == null    → estado 'tudo_concluido'   (só há concluídos)
senão se destaque rascunho   → estado 'retomar_rascunho'
senão                        → estado 'em_andamento'     (progresso + tempo)
```

### 4.1 Headline do topo por progresso (tier — o "empurrão" adaptativo)

Só no estado `em_andamento`. `ratio = feitas / total`. O nome é opcional (§8): sem nome, cai o
`, {Nome}`.

| Situação | Headline |
|---|---|
| `planejado` (0 feitas) | **"Teu plano tá pronto{, Nome} — agora é tirar do papel."** |
| `em_construcao`, ratio < 0.5 | **"Você já começou{, Nome}. Bora seguir de onde parou."** |
| `em_construcao`, 0.5 ≤ ratio < 1 | **"Falta pouco pra fechar{, Nome}."** |
| `em_construcao`, ratio = 1 (tudo feito, falta concluir) | **"Você fechou todas as fases{, Nome} — falta só concluir."** |

## 5. Copy deck (§5.1 é o que REALMENTE saiu do código — ajustada durante a execução;
## ver nota abaixo. Tudo pendente de veto do dono.)

> Sem negrito embutido em string: nenhum lugar do projeto faz parser de `**markdown**` dentro de
> texto dinâmico (confirmado em `BlocoDevolutiva`/`BlocoResultado`) — o título do projeto vai
> entre aspas retas (`"{título}"`), texto plano, sem `<strong>`. `{Nome}` = primeiro nome (§8) ou
> vazio (sufixo `, {Nome}`). `~{tempo}` = `formatarDuracaoMin(...)`; some quando não há estimativa.

### 5.1 Topo — estado `em_andamento` (destaque, card com acento laranja)

**Nota de implementação:** o rascunho original desta spec previa só 2 variantes de
subtexto/CTA (com/sem tempo). Na execução ficou claro que o tier `planejado` (0 feitas —
`etapaAtual` aponta pra fase 1, mas ninguém "parou" ali de verdade) e o tier `fechou_fases`
(tudo marcado — não há mais "fase atual", `faseAtual` vira `null`) quebravam a frase única
"parou na fase X de Y". Virou **3 variantes por tier**, mantendo a intenção original:

- **Eyebrow (mono):** `CONTINUE DE ONDE PAROU`
- **Headline (Fraunces):** conforme tier §4.1.
- **Subtexto (Plex Sans, secondary) — por tier:**
  - `planejado`: `O "{título}" tem {total} fases prontas pra sair do papel. Começa quando quiser — o primeiro passo já tá te esperando.`
  - `comecando`/`quase` (em progresso real — `faseAtual` não é null), com tempo: `O "{título}" parou na fase {X} de {Y}. Retoma de onde você deixou — daqui a ~{tempo} de foco ele sai do plano e vira coisa que você usa no trabalho.`
  - `comecando`/`quase`, sem tempo (plano pré-314C): `O "{título}" parou na fase {X} de {Y}. Retoma de onde você deixou e segue construindo.`
  - `fechou_fases`: `Você já fechou todas as {total} fases do "{título}". Falta só o último passo: concluir e ver o resultado.`
- **Meta (mono, sobre a barra) — mesma fórmula em qualquer tier:**
  - Com tempo: `{feitas} de {total} fases feitas · faltam ~{tempo}`
  - Sem tempo (inclui `fechou_fases`, onde não sobra pendente pra somar): `{feitas} de {total} fases feitas`
- **Barra:** `Progress` (value = `ratio * 100`).
- **CTA primário — por tier:**
  - `planejado`: `Começar a construir →`
  - `comecando`/`quase`: `Voltar pro projeto →`
  - `fechou_fases`: `Concluir o projeto →` (abre a página do projeto, onde mora o check-up da 314D)

### 5.2 Topo — estado `retomar_rascunho`

- **Eyebrow (mono):** `VOCÊ COMEÇOU E PAROU`
- **Headline (Fraunces):** `Teu diagnóstico ficou pela metade{, Nome}.`
- **Subtexto:** `Você começou a mapear o "{título}" e parou antes de eu fechar o diagnóstico. O Lab guardou tudo — é só voltar de onde você deixou.`
- **CTA primário:** `Terminar o diagnóstico →`  (→ `/lab/novo-projeto?id={id}`, §7)
- Sem barra de progresso (rascunho ainda não tem plano).

### 5.3 Card "novo projeto" — secundário (estados `em_andamento` / `retomar_rascunho` **apenas**)

> Correção de implementação: `tudo_concluido` **não** usa esta versão secundária — usa a versão
> em destaque do §5.5/§5.6 (`GridSection` + CTA primário), porque nesse estado não há topo
> "continue de onde parou" competindo por atenção. Sem isso a página ficaria sem hero nenhum.

- **Label (mono):** `NOVO PROJETO`
- **Título (Plex Sans 600):** `Pegar outro problema`
- **Linha:** `Outra dor do teu trabalho que dá pra transformar em projeto? Começa aqui.`
- **CTA secundário:** `Começar um novo projeto →`

### 5.4 Lista "Teus projetos"

- **Título de seção:** label mono uppercase discreto (`text-xs text-ds2-text-muted`), não o
  `SectionTitle`/Fraunces 42px — esse é reservado para títulos de página/landing, e aqui a lista
  é uma seção secundária dentro do hub, não a peça principal.
- Cada linha (clicável, ≥44px): `{título}` + badge de status + meta:

| Status | Badge | Meta da linha |
|---|---|---|
| `rascunho` | `em rascunho` | `diagnóstico pela metade · retomar` |
| `planejado` | `plano pronto` | com tempo: `{total} fases · ~{tempoTotal} de foco` · sem: `{total} fases` |
| `em_construcao` | `construindo` | com tempo: `{feitas}/{total} fases · faltam ~{tempo}` · sem: `{feitas}/{total} fases` |
| `concluido` | `concluído` | `concluído` (sem meta extra) |

> `~{tempoTotal}` no `planejado` = `formatarDuracaoMin(plan.duracao_total_min)` quando existir.

### 5.5 Estado `vazio` (primeiro acesso)

- **Eyebrow (mono):** `TEU LABORATÓRIO DE CONSTRUÇÃO`
- **H1 (Fraunces):** `Bem-vindo ao Lab{, Nome}.`
- **Corpo (café):** `Aqui um problema chato do teu trabalho — daquele que volta toda semana e come teu tempo — vira um projeto com plano de construção. Do jeito que a gente faz nos workshops: começa menor que a ambição, prova que funciona e só depois amplia.`
- **Card "novo projeto" em destaque** (grid técnico, `GridSection` como hoje):
  - Label (mono): `MÓDULO 01 / PRIMEIRO PROJETO`
  - Título: `Transformar um problema em projeto`
  - Linha: `Você conta o problema, o Lab lê, você confirma — e sai com um diagnóstico e um plano de construção. Leva uns 3 minutos.`
  - CTA primário: `Quero começar meu primeiro projeto`
- **Rodapé leve (o que vem depois — mono/subtle):** `Biblioteca e Perfil chegam em breve — por ora, o caminho começa pelo teu primeiro projeto.`

### 5.6 Estado `tudo_concluido`

- **H1 (Fraunces):** `De volta{, Nome}.`
- **Linha:** `Você já fechou {N} projeto{s} aqui. Quando quiser pegar o próximo problema, é só começar.`
  - (`{s}` = plural: 1 → "projeto", N>1 → "projetos".)
- **Card "novo projeto" em destaque** (mesmo do §5.3, mas com CTA primário `Começar um novo projeto →`).
- **Lista "Teus projetos"** abaixo (só concluídos).

## 6. Roteamento por status (`href`)

| Status | Leva para |
|---|---|
| `rascunho` | `/lab/novo-projeto?id={id}` (§7 — retoma ESTE rascunho) |
| `planejado` / `em_construcao` / `concluido` | `/lab/projeto/{id}` |
| `diagnosticado` (existe no CHECK, mas o fluxo atual pula) | `/lab/projeto/{id}` (defensivo) |

## 7. Correção do roteamento do wizard (`?id=`) — IN-SCOPE

**Hoje:** `/lab/novo-projeto` sempre retoma **o rascunho mais recente** — se houver 2+ rascunhos,
clicar num rascunho antigo abriria o mais novo. Decisão do dono: fixar agora (é fácil e aditivo).

**Mudança (aditiva, retrocompatível):**
- `src/app/(lab)/lab/novo-projeto/page.tsx`: aceitar `searchParams: { id?: string }`.
  - Se `id` presente: buscar ESSE projeto (`.eq('id', id).eq('status','rascunho').maybeSingle()`
    — RLS garante dono). Se achar, usar como `rascunhoInicial`.
  - Se ausente **ou** não encontrado: comportamento atual (rascunho mais recente).
- Hub linka rascunhos com `?id={id}`.
- **Sem `id` = comportamento de hoje** → nenhuma regressão no fluxo existente do wizard.

> Se na implementação isso revelar qualquer atrito inesperado no wizard, **PARE e registre como
> fast-follow** em vez de forçar — o valor central da 315 (listar + retomar pelo topo) não
> depende disso; o hero sempre resolve pro mais recente corretamente.

## 8. Nome da pessoa (`primeiroNome`)

Helper gracioso (o hub funciona **com ou sem** nome):
1. `user.user_metadata?.full_name | name | nome` → primeiro token.
2. senão, parte local do e-mail antes do `@`, primeiro token por `.`/`_`, capitalizado.
3. Se o resultado tiver < 2 letras ou não parecer nome, **retorna `null`** → templates caem
   pro sem-nome (some o `, {Nome}`).

> Fonte real de nome vem de verdade com a ISSUE-317 (Perfil). Aqui é best-effort; registrar como
> nota, não bloquear.

## 9. Design / estrutura visual (DS2 — doc 08)

Mobile-first, alvos ≥44px, **zero hex solto** (só classes/vars DS2). Container = `PageContainer`
(já vem do `LabShell`).

- **Topo `em_andamento`:** `Card` grande com acento laranja — mesma receita do card da fase atual
  da Caminhada: `border-ds2-orange/35 bg-[rgba(217,119,6,0.05)]`. Dentro, na ordem: eyebrow mono
  (`text-ds2-amber-soft`, uppercase, tracking .13em) → headline Fraunces (`font-ds2-serif text-2xl
  md:text-3xl`) → subtexto (`text-ds2-text-secondary`) → meta mono (`text-ds2-text-muted`) →
  `Progress` → `Button` primário. Título do projeto em `<strong className="text-ds2-text-primary">`.
- **Topo `retomar_rascunho`:** mesmo card laranja, sem `Progress`, CTA "Terminar o diagnóstico".
- **Card "novo projeto" secundário:** `Card` padrão (sem grid técnico), enxuto: label mono →
  título Plex Sans 600 → linha → `Button variant="secondary"`.
- **Card "novo projeto" no vazio/tudo_concluido:** `GridSection` (grid técnico) + `Button`
  primário — o convite protagonista (como o esqueleto de hoje).
- **Lista "Teus projetos":** `SectionTitle` + `<ul>` de linhas. Cada linha é um `Link` que
  envolve um `Card` (ou row com `border-ds2-border-subtle`, `rounded-[14px]`, `hover:bg-white/[0.06]`,
  `min-h-11`): à esquerda título (Plex Sans 600) + `Badge` de status; à direita meta mono +
  chevron `lucide-react`. `flex`, quebra pra 1 coluna no mobile.
- **Barra de progresso na lista (opcional, se não poluir):** uma `Progress` fininha por linha
  em construção. Se ficar ruidoso no mobile, ficar só com a meta textual — decisão de quem
  implementa, dentro das receitas do doc 08.
- **Proibições (doc 08 §6):** nada de emoji como ícone (usar `lucide-react`), branco puro em
  texto, laranja como cor de texto longo, mais de 1 CTA primário por seção (o topo tem o único
  primário; "novo projeto" secundário fica `variant="secondary"` nos estados com topo).

## 10. Plano de execução (passo a passo — para o Sonnet)

1. **`src/lib/lab/hub.ts` (novo, puro) + `hub.test.ts`:**
   - `resumirProjeto(row): ProjetoResumo` — deriva feitas/total/faseAtual/minutosRestantes/href/
     emAndamento a partir de `status` + `plan` (reusa `etapaAtual`/`minutosRestantes` de
     `continuidade.ts`). Tolera `plan` null (rascunho) e plano pré-314C (`minutosRestantes` null).
   - `estadoHub(projetos): 'vazio' | 'tudo_concluido' | 'retomar_rascunho' | 'em_andamento'` +
     `destaque` (o primeiro `emAndamento`).
   - `headlineTopo(destaque, nome): string` — os 4 tiers do §4.1 (+ variante rascunho, ou tratar
     rascunho na UI).
   - `primeiroNome(user): string | null` (§8).
   - Testes: os 4 estados; os 4 tiers; plano pré-314C (sem tempo); nome ausente; rascunho.
2. **`src/app/(lab)/lab/inicio/page.tsx` (reescrever):** vira Server Component com fetch (§3),
   deriva view-models e `estadoHub`, e renderiza os 4 estados. Mantém 100% DS2. Sem `'use client'`
   (é tudo link/estático — nenhuma interação que precise de cliente).
3. **`src/app/(lab)/lab/novo-projeto/page.tsx`:** aplicar a correção `?id=` (§7).
4. **Copy:** transcrever o §5 **exatamente** (pendente de veto — não improvisar).
5. **Validação (§11).**

> Se algum bloco de UI crescer, extrair componentes de apresentação para
> `src/components/lab/inicio/` (ex.: `TopoContinuar`, `LinhaProjeto`) — servem só render, sem
> estado. Opcional; a página pode nascer inline se ficar legível.

## 11. Validação (feita em 2026-07-13)

```
npm run lint      → limpo nos arquivos tocados (0 erros/warnings); débito pré-existente intocado
npx tsc --noEmit  → limpo
npm run build     → limpo (/lab/inicio: 166 B, dinâmico)
```
- `hub.test.ts`: **33 testes verdes** (339 no total do projeto, eram 306).
- **Smoke test do servidor de produção** (`npm run start`, sem sessão real):
  `/lab/inicio` → 307 pra `/auth?next=%2Flab%2Finicio` · `/lab/novo-projeto?id=` → 307 pra `/auth`
  · `/lab` (público) → 200 · `/` → 200 · `PATCH /api/lab/projects/[id]` sem sessão → 401.
- **⚠️ Ainda NÃO feito (depende de login real):** o roteiro manual dos 4 estados com conta
  autenticada (vazio → rascunho → em_andamento com progresso/tempo → tudo_concluido) e a
  verificação de RLS com 2 contas. **Fica para o dono testar** — mesmo padrão da 314C/314D.
- Não tocou `layout.tsx`, funil `/pre-diagnostico` nem `EmailGate` → checklist de tracking/Ads
  não se aplicou.

## 12. Fast-follows / notas registradas

- Fonte real de nome → ISSUE-317 (Perfil). Hoje é best-effort (§8).
- Barra de progresso por linha na lista: **não incluída** — ficou só a meta textual (`metaLinha`),
  mais legível no mobile sem barra dupla competindo com a do topo.
- Correção `?id=` do wizard (§7): implementada **sem atrito** — não virou fast-follow.
- **Copy inteira pendente de veto do dono** (§ topo) — incluindo o ajuste de 2→3 variantes do
  §5.1 feito durante a execução, que também não passou pela leitura do Adil ainda.
- **Roteiro manual do dono (com login real) ainda pendente** — ver §11.
