# ISSUE-318D/E — Spec: captura de feedback + painel de triagem

> **Criado em** 2026-07-29 · sessão de spec (Opus, persona Analytics & Ads / produto)
> **Origem:** pedido do dono — "queria ter uma continuidade disso de analytics, uma página de
> insight e feedbacks que eu vou estar usando, navegando. Eu registro um feedback estruturado que
> pode depois ser acessado pelo repositório ou no Supabase, e a gente vai executando e melhorando
> essa lista, em paralelo com o plano original de desenvolvimento."
> **Status:** spec fechada, execução não iniciada.
> **Companheira:** `ISSUE-318A-spec-analytics-admin.md` (o painel de Analytics; esta é a aba
> seguinte da mesma área de admin).

---

## 1. O problema real que isso resolve

O dono testa em produção, no celular, constantemente — o roteiro manual de teste é dele por
princípio (é o que valida UI de verdade). Hoje o achado desse teste vira: mensagem solta, nota
mental, ou um parágrafo colado numa sessão comigo. Consequência observável no próprio histórico do
projeto: feedbacks importantes viraram issue só porque alguém lembrou de anotar
(o feedback do 1º teste do wizard virou ISSUE-210 e alimentou a 314 — mas por sorte de registro,
não por processo).

**O que falta não é um formulário. É contexto automático + um lugar único de onde a lista sai
executável.** Uma nota que diz "a tela tá estranha" é inútil. Uma entrada que diz "bug · trava ·
`/lab/projeto/[id]` · iPhone 390×844 · v3.11.26 · 30/07 14:22 · 'o botão de concluir não aparece
quando o checklist tá cheio'" é uma issue quase escrita.

---

## 2. Decisões travadas com o dono (2026-07-29)

| # | Decisão | Escolha |
|---|---|---|
| 1 | Onde captura | **Supabase.** Não é opção: app no Vercel tem filesystem read-only, não pode escrever no repo. |
| 2 | Ponte até a execução | **Export markdown → repo.** O painel gera markdown, o texto entra em `docs/revamp/feedback-inbox.md` e é lido nativamente na sessão. Zero credencial nova, uma fonte de verdade. |
| 3 | Quem pode dar feedback | **Todo mundo** (não só admin), com marcação clara na UI. O sistema registra **quem** registrou e o log de contexto. |
| 4 | GitHub Issues | **Não.** Avaliado e descartado: exigiria PAT no env da Vercel, `gh` instalado na máquina (não está) e partiria o backlog em dois lugares. |

### 2.1 Por que não GitHub Issues (registro da alternativa descartada)
A opção era tentadora: o app abriria issue automaticamente e eu leria/fecharia com `gh issue list`
sem nenhum copy-paste. Descartada porque (a) `gh` não está instalado nem no bash nem no
PowerShell da máquina do dono — verificado; (b) exigiria um PAT com escopo de repo vivendo no env
da Vercel, credencial nova numa superfície que hoje não tem nenhuma; (c) o backlog deste projeto é
`04_issue_backlog.md`, e ter metade do trabalho no markdown e metade no GitHub é pior que o
copy-paste que se quis evitar. **Se um dia o projeto migrar pra GitHub Issues** (caminho já
previsto na ISSUE-501), esta decisão se reabre naturalmente.

---

## 3. Decisão de produto: feedback público, e onde ele NÃO aparece

O dono pediu o botão "em todo lugar... para todo mundo". Implementar assim, **com duas exceções
que eu decidi e ele pode vetar em uma linha:**

**Onde o FAB aparece:** plataforma logada (`(app)` e `(lab)`) e páginas públicas (home,
`/radar/*` na tela de resultado, `/newsletter`, `/lab`, `/obrigado`, `/privacidade`).

**Onde ele NÃO aparece, e por quê:**

1. **No meio do fluxo de pergunta dos radares** (`/radar/maturidade` e `/radar/oportunidades`
   enquanto o card de pergunta está ativo) e **no gate de e-mail**. Motivo de conversão, não de
   engenharia: o funil dos radares é o evento de conversão do Google Ads, e um botão flutuante
   competindo com o CTA primário em tela de celular é exatamente o tipo de atrito que derruba
   taxa. O FAB reaparece na **tela de resultado**, onde a pessoa já converteu e de fato tem o que
   comentar.
2. **`/pre-diagnostico` e `/auth`.** O primeiro é o funil legado, que ninguém deve tocar (regra da
   casa) e que o dono vai aposentar. O segundo é transacional — quem está tentando entrar não quer
   dar feedback, quer entrar.

**Como isso é implementado:** uma única lista de supressão por rota dentro do próprio componente
(`usePathname()`), coberta por teste. Ligar o FAB numa rota suprimida é remover uma string.
A decisão é reversível de propósito.

> Registro honesto: essa é a minha recomendação de CRO, não um pedido do dono. Ele autorizou
> "todo lugar"; eu estou protegendo os dois metros quadrados onde o dinheiro do Ads vira lead. Se
> ele quiser em todas as rotas, é uma linha.

---

## 4. Modelo de dados

### 4.1 Tabela `feedback` (SQL para o dono rodar — entregue como doc, padrão da casa)

```
id            UUID PK default gen_random_uuid()
created_at    TIMESTAMPTZ default now()
updated_at    TIMESTAMPTZ default now()          -- trigger update_updated_at_column()
user_id       UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL
email         VARCHAR(255) NULL                   -- opcional; só se a pessoa quiser resposta
tipo          VARCHAR(20)  NOT NULL CHECK (tipo IN ('bug','melhoria','ideia','confuso','elogio'))
severidade    VARCHAR(20)  NULL CHECK (severidade IN ('trava','incomoda','cosmetico'))
mensagem      TEXT NOT NULL                       -- validado ≤ 2000 chars na rota
rota          VARCHAR(500) NULL                   -- capturado automaticamente
contexto      JSONB NULL                          -- ver §4.2
status        VARCHAR(20)  NOT NULL DEFAULT 'novo'
              CHECK (status IN ('novo','triado','em_execucao','resolvido','descartado'))
notas_admin   TEXT NULL                           -- a triagem do dono
issue_ref     VARCHAR(50) NULL                    -- 'ISSUE-321' quando virar trabalho
ip_address    INET NULL
```

**Segurança — herda a disciplina da ISSUE-106/310 sem exceção:**
```sql
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- Zero políticas de propósito: nem anon nem authenticated leem ou escrevem direto.
REVOKE ALL ON feedback FROM anon, authenticated;
```
Todo acesso passa por rota com client `service_role` local. **Isto é obrigatório e não é
preferência de estilo:** a tabela recebe texto livre de qualquer visitante da internet e guarda
`user_id` + IP. Uma política mal escrita aqui é a mesma classe de incidente do `roi_leads`
(v3.5.3) com dado pessoal dentro. Índices: `(status, created_at DESC)` e `(created_at DESC)`.

### 4.2 O que vai em `contexto` (o valor da feature)

Capturado pelo cliente e **validado/completado no servidor**:

| Campo | Origem | Por quê |
|---|---|---|
| `viewport` | `window.innerWidth × innerHeight` | reproduz bug de layout mobile |
| `user_agent` | header no servidor (não do body) | device/browser real |
| `app_version` | `VERCEL_GIT_COMMIT_SHA` (7 chars) com fallback pra versão do `package.json` | **em qual deploy o bug existia** — sem isso, "não reproduz" fica sem explicação |
| `utm` | `lerUtm()` | de onde a pessoa veio |
| `rota_anterior` | `document.referrer` interno | o caminho até o problema |
| `logado` | derivado da sessão no servidor | distingue beta user de visitante |

**Regra:** `user_id` e `logado` vêm **exclusivamente da sessão validada no servidor**, nunca do
body. É literalmente a falha corrigida na ISSUE-318 (o `x-user-email` forjável) — não repetir.

---

## 5. Rotas

### 5.1 `POST /api/feedback` — pública

Padrão de proteção idêntico ao `api/lab/interest` (ISSUE-108) e `api/radar/lead` (ISSUE-106):

- **Honeypot**: campo isca → responde **sucesso falso** sem gravar (não ensina o bot).
- **Rate limit por IP**: 5/hora via contagem na própria tabela (mesmo mecanismo das outras rotas).
- **Validação estrita**: `tipo` de vocabulário fechado; `mensagem` obrigatória, 3–2000 chars;
  `severidade` só aceita valor quando `tipo = 'bug'`; `email` passa pelo `email-validator.ts` se
  vier; `rota` truncada a 500; `contexto` com teto de tamanho (JSONB sem teto é vetor de inchaço —
  mesma lição do `answers` no `api/radar/session`).
- **`status` sempre `'novo'`** no INSERT — o cliente não escolhe status, nem `notas_admin`, nem
  `issue_ref`. Campos de triagem são inalcançáveis pela rota pública.
- Falha de gravação **não** quebra a UI: o widget agradece e segue (o feedback não é transacional).

### 5.2 `GET` / `PATCH /api/admin/feedback` — admin

- Gate `exigirAdminSessao()` (sessão do cookie, `lib/admin.ts`).
- `GET`: lista com filtro por `status` e `tipo`, paginada, ordenada por `created_at DESC`.
- `GET ?formato=markdown`: devolve o inbox pronto pra colar (§6.2).
- `PATCH`: só `status`, `notas_admin` e `issue_ref`. **Nunca** edita `mensagem`, `contexto` ou
  `user_id` — o registro original é imutável por design (é evidência, não rascunho).
- Sem `DELETE`: descartar é `status = 'descartado'`. Histórico não se apaga.

---

## 6. Telas

### 6.1 O widget (público)

- **FAB** discreto, canto inferior, acima do safe-area do iOS, touch ≥ 44px, `z-index` abaixo de
  modais existentes. Não cobre CTA (verificar na tela de resultado do radar, que é densa).
- Abre um painel curto: **tipo** (5 chips) → **severidade** (só se bug) → **mensagem** →
  **e-mail opcional** ("se quiser resposta"). Nada mais. Todo campo extra derruba taxa de envio.
- Estado de sucesso curto e humano, com o que acontece depois.
- **Anônimo pode enviar.** Logado não digita identificação nenhuma (vem da sessão).
- **Acessibilidade:** foco preso no painel aberto, `Esc` fecha, `aria-label` no FAB.

> ⚠️ **Copy pendente.** A label do FAB e os textos do formulário são superfície de marca e
> **não estão escritos nesta spec de propósito**. A sessão de execução escreve a copy **depois de
> ler os guias de voz oficiais do dono** (fora do repo) ou submete ao veto dele. Vetos já
> conhecidos e válidos aqui: sem travessão de aparte (lido como "cara de IA"), sem
> meta-referência, português com artigos.

### 6.2 O painel de triagem (admin)

Aba **Feedback** na área de admin (junto de Assinantes · Convites · Analytics). Mobile-first, DS2.

- **Fila por status**, default mostrando `novo` primeiro. Contadores por tipo no topo.
- **Card por feedback**: tipo + severidade, rota, quando, quem (e-mail se logado/informado ou
  "anônimo"), device/viewport/versão em mono discreto, e a mensagem em destaque.
- **Ações inline**: mudar status, escrever nota de triagem, preencher `issue_ref`.
- **Botão "copiar como markdown"** — o item ou a fila inteira.

**Formato do export (contrato — a execução não improvisa):**

```markdown
### FB-0042 · bug/trava · `/lab/projeto/[id]`
**Quando:** 2026-07-30 14:22 · **Quem:** logado (beta) · **Onde:** iPhone · 390×844 · `a1b2c3d`

> o botão de concluir não aparece quando o checklist está todo marcado

**Triagem:** parece o cache stale da v3.11.19 · **Ref:** —
```

Esse formato é deliberado: cabe numa issue quase sem edição, e é o que faz o ciclo
"testo → registro → a gente executa" fechar sem retrabalho de transcrição.

### 6.3 O ciclo de trabalho que isso cria

1. Dono navega e registra (celular, no momento do achado — não depois).
2. Em sessão, ele triagem no painel e clica **copiar markdown**.
3. O texto entra em `docs/revamp/feedback-inbox.md`, commitado.
4. Eu leio nativamente, transformo o que merece em ISSUE no `04_issue_backlog.md`, e preencho o
   `issue_ref` de volta no painel.
5. Item resolvido → `status = 'resolvido'`.

**Isto é o "em paralelo com o plano original" que o dono pediu:** o inbox é a fila reativa
(achados de uso real) e o `04_issue_backlog.md` segue sendo a fila planejada. O `issue_ref` é a
costura entre as duas — e é o que impede o inbox de virar um segundo backlog concorrente.

---

## 7. Fatiamento em duas issues

**ISSUE-318D — Captura** (SQL + rota pública + widget)
Entrega o widget no ar coletando. Sem painel: a leitura, nesta fatia, é SQL manual.
**Isso é intencional** — começar a coletar antes de ter a tela de triagem significa que a 318E
nasce com dado real dentro, em vez de tela vazia. Vale mesmo sendo valor parcial.

**ISSUE-318E — Triagem + export** (painel admin + markdown + aba na casca)
Fecha o ciclo. Depende da 318D e da casca de navegação admin da 318B.

---

## 8. Critérios de aceite

### 318D
1. Visitante **anônimo** envia feedback e a linha aparece no banco com `user_id NULL`,
   `rota` e `contexto` preenchidos (dono confere por SELECT).
2. Usuário **logado** envia e o `user_id` vem da sessão do servidor — verificado tentando
   **forjar `user_id` no body via `curl`**: o valor do body é ignorado.
3. Honeypot preenchido → resposta de sucesso e **nenhuma** linha gravada.
4. Rate limit bloqueia na 6ª tentativa da mesma hora (429).
5. `mensagem` vazia ou > 2000 chars → 400. `tipo` fora do vocabulário → 400.
6. Chave `anon` no `feedback` → `42501 permission denied` (dono verifica, como na 106/310).
7. FAB **não aparece** em `/pre-diagnostico`, `/auth`, nem no fluxo de pergunta dos radares e no
   gate de e-mail; **aparece** no resto (§3).
8. 🚨 **Trava de tracking:** `git diff --stat` mostra **zero** alteração em `src/app/layout.tsx`,
   `EmailGate.tsx`, `api/prediag/*` e nos módulos de evento. O FAB entra nas páginas públicas por
   um **`src/app/(publico)/layout.tsx` novo** (o grupo não tem layout hoje — verificado), nunca
   pelo layout raiz.
9. 🚨 **Conversão revalidada** antes de commitar: a issue injeta componente em página pública, o
   que aciona a trava do `CLAUDE.md`. Dono valida o disparo no Tag Assistant.
10. Mobile real: FAB não cobre CTA em nenhuma das telas onde aparece; teclado do iOS não esconde
    o campo de mensagem.
11. `tsc` limpo · lint dos tocados zerado · build verde · testes da lista de supressão de rota.

### 318E
1. `/admin/feedback` só renderiza para a sessão do dono; anônimo → `/auth`, comum → `/dashboard`.
2. `GET`/`PATCH /api/admin/feedback` sem sessão de admin → 401/403 (testado por `curl`).
3. `PATCH` não consegue alterar `mensagem`, `contexto` nem `user_id` (tentativa é rejeitada ou
   ignorada, e há teste provando).
4. Export markdown bate **exatamente** o formato do §6.2 (teste de snapshot).
5. Fila utilizável no celular: coluna única, sem scroll lateral, ações com touch ≥ 44px.
6. `tsc`/lint/build verdes + testes do formatador de markdown.

---

## 9. Riscos

| Risco | Mitigação |
|---|---|
| **Spam/abuso** num endpoint público de texto livre | honeypot + rate limit por IP + teto de tamanho + vocabulário fechado; se escalar, avaliar captcha (não agora, é atrito) |
| **PII em texto livre** — alguém escreve dado sensível na mensagem | tabela travada (RLS + REVOKE + service_role); `mensagem` nunca sai em resposta pública; a `/privacidade` precisa de uma linha declarando a coleta de feedback |
| **FAB derrubando conversão** | supressão nas rotas de maior intenção (§3) + revalidação de conversão no aceite |
| **Inbox virar segundo backlog concorrente** | `issue_ref` costura no `04_issue_backlog.md`, que segue sendo a fonte de verdade do que é executado |
| **Widget em página pública quebrar SSR/hidratação** | componente client isolado, montado em layout novo do grupo `(publico)`, sem tocar o layout raiz |

---

## 10. Fora de escopo

- Responder o feedback por e-mail (Resend) — avaliar depois; hoje o e-mail é só para contato manual.
- Notificação (push/e-mail) ao dono quando chega feedback novo.
- Votação/priorização por usuários (isso é roadmap público, decisão de produto bem maior).
- Anexo de screenshot — é o pedido óbvio da próxima rodada, mas exige Supabase Storage, política
  de bucket e limite de tamanho. Registrar como fast-follow se o dono sentir falta.
- Integração com GitHub Issues (§2.1).
