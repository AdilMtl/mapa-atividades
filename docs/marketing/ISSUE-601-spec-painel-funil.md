# ISSUE-601 — Spec: Painel de Funil e Disparo de Templates

> **Série Marketing Digital 1.0 (600+)** — domínio novo, fora do revamp. Aberta em 2026-08-08
> na sessão de estratégia com o dono (Fable 5, personas de marketing digital, processos
> comerciais e vendas digitais). Nasce de um dado duro: 38 dias de Google Ads, 267 sessões de
> radar, 72 conclusões, 15 leads e **zero projetos no Lab** — a Fase 1A inteira está no ar sem
> ninguém dentro, porque o convite é manual e nunca foi disparado.
>
> **Esta issue não automatiza nada.** Ela dá ao dono a mesa de operação para trabalhar a lista
> à mão, com registro. A automação é a ISSUE-602, e só depois de existir copy que comprovadamente
> converte.

---

## 1. Objetivo

Uma tela no admin onde o dono vê **quem está onde no funil** e **dispara o template certo**,
com registro de tudo que foi enviado — substituindo a decisão manual e a memória.

**Não é um CRM.** É uma fila de trabalho derivada de dado que já existe, mais um log de envios.

## 2. A decisão de arquitetura que sustenta tudo: atributos, não etapas

Um contato **não tem uma fase**. Ele tem um conjunto de atributos derivados, e os segmentos são
consultas sobre eles.

Motivo: as populações se cruzam. Um assinante pago pode nunca ter feito radar; um lead do radar
pode nunca assinar; alguém pode ser as duas coisas. Um modelo de estágio linear é obrigado a
escolher um, e não consegue expressar segmentos legítimos como "assinante que nunca fez o radar".

**Consequência inegociável:** nenhum atributo é editável à mão. Não existe "mover contato de
coluna". No instante em que a manutenção da fase depende de alguém lembrar de atualizar, o painel
apodrece — e esse alguém seria o dono, que já não tem tempo de mandar e-mail.

## 3. Modelo de dados

### 3.1 Tabela nova — `marketing_sends` (único dado novo do projeto)

```sql
create table public.marketing_sends (
  id            uuid primary key default gen_random_uuid(),
  email         text        not null,
  template_slug text        not null,
  enviado_em    timestamptz not null default now(),
  status        text        not null check (status in ('enviado','falhou')),
  erro          text,
  enviado_por   text        not null,          -- e-mail do admin que disparou
  metadata      jsonb                          -- ex.: { radar_kind, result_key }
);

create index marketing_sends_email_template_idx
  on public.marketing_sends (lower(email), template_slug);
create index marketing_sends_enviado_em_idx
  on public.marketing_sends (enviado_em desc);

alter table public.marketing_sends enable row level security;
revoke all on public.marketing_sends from anon, authenticated;
-- Sem policy para anon/authenticated: dado operacional do dono, acessado só via
-- service_role atrás do gate exigirAdminSessao(). Mesma disciplina da ISSUE-310.
```

`enviado_por` existe para o dia em que houver mais de uma pessoa operando — e porque log sem
autor é log pela metade.

### 3.2 View derivada — `vw_marketing_contatos`

Uma linha por e-mail único, com os atributos derivados. **Obrigatório
`WITH (security_invoker = true)`** (regra do projeto para toda view).

Colunas mínimas:

| Grupo | Colunas |
|---|---|
| identidade | `email`, `nome`, `origem_primaria`, `primeiro_contato_em` |
| radar | `fez_radar`, `concluiu_radar`, `radar_kind`, `radar_result`, `radar_em` |
| consentimento | `optin_newsletter`, `marcou_interesse_lab` |
| acesso | `esta_autorizado`, `plan_type`, `autorizado_em`, `expira_em` |
| conta | `tem_conta`, `criou_conta_em`, `ultimo_acesso` |
| Lab | `projetos_count`, `projetos_concluidos`, `ultimo_projeto_em` |
| contato | `envios_count`, `ultimo_envio_em`, `dias_sem_contato` |

Fontes: `radar_leads`, `lab_leads`, `roi_leads` (funil legado — tem contatos parados que hoje
ninguém olha), `authorized_emails`, `admin_list_users()` (RPC — **nunca** `auth.admin.listUsers()`,
bug conhecido do Supabase), `lab_projects`, `marketing_sends`.

Dedupe por `lower(email)`, preferindo o registro que tem nome.

> **Por que view e não cálculo em TypeScript:** a rota `/api/admin/lab-beta` hoje faz 4 consultas
> paralelas e junta em memória. Isso não escala e não é testável em SQL. O projeto já tem 7 views
> `vw_*` para analytics, e essa view também fica disponível no Grafana de graça.

### 3.3 Consentimento — requisito, não detalhe

`radar_leads.newsletter_optin` já existe e **precisa ser respeitado**. Segmentos de marketing
excluem `optin_newsletter = false` por padrão, e a tela mostra a contagem excluída para o dono
saber que ela existe. Todo template de marketing carrega link de descadastro.

Distinção que a spec assume: o e-mail de resultado do radar é **transacional** (a pessoa pediu o
resultado). Convite e sequência são **marketing** e dependem de optin.

## 4. Segmentos — cada um com UM próximo e-mail designado

Essa é a disciplina de processo comercial que faz o painel ser usável num sábado: o dono não
decide o que mandar, ele decide para quem.

| Segmento | Definição | Template designado |
|---|---|---|
| `lead_sem_convite` | fez radar, deu e-mail, `esta_autorizado = false` | `convite_lab` |
| `convidado_sem_conta` | autorizado, `tem_conta = false` | `convidado_nao_entrou` |
| `conta_sem_projeto` | tem conta, `projetos_count = 0` | `primeiro_projeto` |
| `projeto_parado` | projeto aberto, sem atividade há > 14 dias | `retomar_projeto` |
| `assinante_sem_radar` | autorizado como assinante, `fez_radar = false` | `convite_radar` |
| `concluiu_projeto` | `projetos_concluidos >= 1` | `pedido_de_relato` |

Cada card de segmento mostra: **total**, **quantos ainda não receberam o template designado**, e
**quantos estão há mais de 14 dias sem qualquer contato**. Esse terceiro número é o que
transforma lista em fila.

## 5. A tela

Aba **"Funil"** no admin — **absorve a aba "Convites do Lab"** em vez de criar uma quinta. O
painel de convites atual já é um subconjunto disso (fila de gente + disparo de template + status
de conta); duplicar o conceito ao lado seria confuso.

Separada de **Analytics** de propósito: Analytics responde *"como está o funil"* (agregado);
Funil responde *"quem está onde e o que eu mando"* (pessoa).

**Fluxo:**
1. Cards de segmento no topo, com os três números do §4.
2. Toca num segmento → lista de pessoas: nome, e-mail, resultado do radar, dias sem contato,
   últimos templates recebidos.
3. Seleção múltipla → escolhe template → **tela de confirmação** mostrando quantos vão receber,
   quantos foram bloqueados por já terem recebido aquele template, e quantos por falta de optin.
4. Dispara. Resultado por pessoa (enviado/falhou + motivo) fica visível e gravado.

**Mobile-first obrigatório** — o dono opera do celular. Regra já registrada do projeto: tabela
multi-coluna vira lista de cards no celular, nunca scroll horizontal. Touch ≥ 44px.

## 6. Templates — pasta editável com versionamento

> **Mudança de decisão do dono (2026-08-08):** a v1 desta spec colocava "edição de template pela
> UI" no escopo excluído, tratando template como código. O dono decidiu o contrário — quer entrar
> numa pasta, ver, editar e salvar. Registrado, e desenhado com trava para que a decisão não
> custe um texto bom.

**Modelo:** o *layout* (HTML, cabeçalho, rodapé, cores) continua sendo código — o design de e-mail
que já existe e que o dono aprovou ("o system design está perfeito, só ajustaria a copy"). O que
vira dado editável é o **conteúdo**: assunto e corpo.

### 6.1 Tabela `marketing_templates`

```sql
create table public.marketing_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,                 -- 'convite_lab'
  versao        int  not null,                 -- incremental por slug
  assunto       text not null,
  corpo         text not null,                 -- markdown simples, não HTML
  segmento      text,                          -- segmento designado (§4)
  status        text not null default 'rascunho'
                check (status in ('rascunho','ativo','arquivado')),
  criado_em     timestamptz not null default now(),
  criado_por    text not null,
  unique (slug, versao)
);
```

**Salvar nunca sobrescreve.** Editar cria `versao + 1` e a anterior fica intacta e restaurável.
Só uma versão por slug pode estar `ativo`; é a que o disparo usa. `marketing_sends.metadata`
grava a versão que saiu — o mesmo rastro do `prompt_version` da ISSUE-320.

### 6.2 Variáveis

Vocabulário fechado, validado no servidor: `{{primeiro_nome}}`, `{{resultado_radar}}`,
`{{link_lab}}`, `{{link_descadastro}}`. Salvar com variável desconhecida **falha** com a lista do
que é válido — mesma disciplina de vocabulário fechado do §4 da spec da 320.

### 6.3 Travas inegociáveis

- O rodapé de descadastro é **injetado pelo sistema** e não pode ser removido pela edição.
- Corpo é **markdown**, nunca HTML cru — não dá pra quebrar o layout nem injetar script.
- Pré-visualização obrigatória antes de ativar uma versão.
- Template `ativo` não é editável em si: editar sempre cria rascunho novo.

### 6.4 Os seis templates iniciais

Estrutura nesta issue; **copy pendente dos guias de voz do dono** (fora do repositório).

| slug | segmento | nota |
|---|---|---|
| `convite_lab` | `lead_sem_convite` | já existe em código, migra pra tabela |
| `radar_followup` | — (D+3 após lead) | puxa `CONTEUDO_MATURIDADE`/`CONTEUDO_OPORTUNIDADES`, **já escritos e aprovados** — é o mais fácil dos seis |
| `convidado_nao_entrou` | `convidado_sem_conta` | |
| `primeiro_projeto` | `conta_sem_projeto` | |
| `retomar_projeto` | `projeto_parado` | |
| `pedido_de_relato` | `concluiu_projeto` | vira prova social e caso de uso |

⚠️ **Regra de copy fechada nesta sessão:** nenhum template pode assumir que a pessoa tem chefe.
O público "tem de tudo" (palavras do dono) — profissional de empresa e empreendedor. A
articulação de valor é sempre "explicar o valor do que você fez", sem dizer para quem.

## 7. Contrato da API

Gate `exigirAdminSessao()` em toda rota — nunca o header `x-user-email` (forjável; já corrigido
na 318).

- `GET /api/admin/funil` → segmentos com contagens + contatos (filtro por segmento, busca por
  e-mail, paginação).
- `POST /api/admin/funil/disparar` → `{ template_slug, emails[], forcar_reenvio? }`. Valida
  optin, valida duplicidade, envia, grava em `marketing_sends` **inclusive nas falhas**, devolve
  resultado por e-mail.
- A rota atual `/api/admin/lab-beta` continua existindo para convidar/revogar acesso (é ação de
  autorização, não de marketing) — mas **passa a registrar em `marketing_sends`** quando manda o
  e-mail de convite.

⚠️ **Armadilha real, já paga uma vez:** o SDK do Resend **não lança exceção** em erro de envio —
devolve `{ error }` na resposta. O código atual da 318 já trata isso corretamente; o disparo em
lote precisa do mesmo cuidado, com teste provando que falha vira `status = 'falhou'` com motivo.

## 8. Escopo excluído — a trava anti-CRM

Cada item abaixo, sozinho, transforma esta issue num CRM de verdade:

- ❌ Notas manuais, tags, campos customizados
- ❌ Edição manual de segmento/fase
- ❌ Página de detalhe do contato
- ❌ Importação/exportação de lista
- ❌ Automação, cron, sequência disparada por tempo → **ISSUE-602**
- ❌ Integração com Substack (as duas listas seguem separadas)
- ❌ Editor visual de HTML do e-mail (o layout é código; só assunto e corpo são editáveis — §6)
- ❌ Envio sem tela de confirmação
- ❌ Qualquer mudança em `layout.tsx`, no funil público ou no `EmailGate`

## 9. Critérios de aceite

1. Um contato nunca aparece em dois segmentos mutuamente exclusivos por definição.
2. Disparar o mesmo template duas vezes para a mesma pessoa exige confirmação explícita.
3. Falha de envio fica gravada com o motivo — teste provando o comportamento do Resend.
4. Contato sem radar, sem conta ou sem projeto não quebra a tela (todos os campos toleram nulo).
5. `optin_newsletter = false` nunca recebe template de marketing, e o painel mostra a contagem
   excluída.
6. A tela é operável no celular, sem scroll horizontal.
7. `git diff` **zero** em `layout.tsx`, `EmailGate.tsx` e `api/prediag/*` (trava de tracking).
8. `npm run lint` e `npx tsc --noEmit` limpos; testes verdes.

## 10. Riscos

| Risco | Mitigação |
|---|---|
| Explosão de escopo (o CRM) | §8, e revisão do §8 antes de qualquer PR |
| LGPD — marketing sem consentimento | §3.3, critério de aceite 5 |
| Construir para 15 contatos | 80% do painel já existe; o custo é baixo e a lista cresce (267 sessões/38 dias, ads funcionando) |
| Copy fraca em escala | Disparo manual com confirmação; automação só na 602, depois de saber o que converte |

## 11. Duas decisões que ficaram com o dono

1. **O convite pro Lab deveria continuar manual?** Se o lead já fez o radar e já deu o e-mail, o
   convite é o passo natural da escada de valor. Automatizá-lo na captura levaria o Lab de 0 a 15
   usuários sem painel nenhum. O contra é perder o controle de quem entra no beta. **Decisão de
   produto, não técnica.**
2. **O funil legado (`roi_leads`) entra?** Provavelmente há contatos antigos ali que nunca foram
   trabalhados. Entram como segmento próprio, com optin conferido, ou ficam de fora?

## 12. Divisão em issues e modelo recomendado

Esta spec é grande demais para uma sessão. Vira cinco issues, na ordem abaixo. O critério de
modelo é o mesmo já registrado no projeto (`05_model_execution_strategy.md`): **Fable 5 onde a
decisão é de julgamento e o custo do erro é alto; Opus onde é voz de marca e conteúdo; Sonnet
onde a spec já fechou e o trabalho é replicação disciplinada.**

**Ordem:** 601A → 601B → 601D → 601C, com a 601E em paralelo assim que os guias de voz chegarem.
O disparo (601C) vem por último de propósito — é a única parte irreversível, e só faz sentido
ligar quando já existe template pronto para sair.

---

### ISSUE-601A — Dado e derivação · **Sonnet**
*Schema e SQL sob spec fechada; o julgamento (atributos × etapas) já foi feito aqui.*

- **Entrega:** tabela `marketing_sends` (§3.1), view `vw_marketing_contatos` (§3.2), os 6
  segmentos do §4 como consultas nomeadas em `src/lib/marketing/segmentos.ts`, e `GET
  /api/admin/funil` devolvendo contagens + contatos.
- **Escopo excluído:** nenhuma tela; nenhum envio.
- **Critérios de aceite:** (1) contato sem radar, sem conta e sem projeto não quebra a
  derivação — teste com os três nulos; (2) dedupe por `lower(email)` provado com o mesmo e-mail
  em `radar_leads` e `lab_leads`; (3) a view usa `security_invoker = true`; (4)
  `marketing_sends` sem policy para `anon`/`authenticated`; (5) as contagens dos 6 segmentos
  batem com consulta manual num seed de teste.
- **Dep.:** nenhuma.

### ISSUE-601B — Telas de Jornada e Segmentos · **Sonnet** + revisão **Fable 5**
*Layout é replicação do DS2; mas o enquadramento dos números é onde um painel mente sem querer.*

- **Entrega:** as duas primeiras telas do protótipo
  (`docs/marketing/mockups/601-painel-funil.html`) — jornada de 7 etapas com queda percentual e
  detalhe por etapa; cards de segmento com total, "sem o e-mail designado" e "+14 dias sem
  contato". Aba **Funil** substituindo "Convites do Lab".
- **Escopo excluído:** seleção de pessoas, disparo, templates.
- **Critérios de aceite:** (1) toda etapa com zero é visualmente distinta de etapa com número
  baixo — zero é porta fechada, não fraqueza; (2) todo número tem denominador declarado na tela
  (regra "painel de dado se explica sozinho"); (3) sem scroll horizontal no celular; (4) tokens
  DS2 literais, zero hex inventado.
- **Dep.:** 601A.

### ISSUE-601C — Disparo e registro · **Fable 5**
*Única parte irreversível: e-mail errado, e-mail duplicado ou furo de opt-in não têm desfazer.
Mesma régua da 325 (Stripe).*

- **Entrega:** seleção múltipla, tela de confirmação com os três blocos (vão receber / já
  receberam / sem opt-in), `POST /api/admin/funil/disparar`, gravação em `marketing_sends`
  inclusive nas falhas.
- **Escopo excluído:** qualquer automação ou agendamento.
- **Critérios de aceite:** (1) falha do Resend vira `status='falhou'` com motivo — **teste
  provando**, porque o SDK não lança exceção; (2) `optin_newsletter = false` nunca recebe, e não
  existe caminho de forçar; (3) repetir template exige segunda confirmação explícita; (4) envio
  parcial (5 de 12 falham) grava os 12 corretamente; (5) nada sai sem passar pela confirmação.
- **Dep.:** 601A, 601B, 601D.

### ISSUE-601D — Pasta de templates · **Sonnet**
*CRUD sob contrato fechado no §6.*

- **Entrega:** tabela `marketing_templates`, listagem, editor de assunto e corpo,
  versionamento, pré-visualização, validação de variáveis.
- **Escopo excluído:** editor visual de HTML; edição do layout do e-mail.
- **Critérios de aceite:** (1) salvar **nunca** sobrescreve — cria `versao + 1` e a anterior
  segue restaurável, com teste; (2) só uma versão `ativo` por slug; (3) variável fora do
  vocabulário fechado faz o salvamento falhar listando as válidas; (4) o rodapé de descadastro
  não pode ser removido pela edição; (5) corpo é markdown — HTML cru não passa.
- **Dep.:** 601A.

### ISSUE-601E — Copy dos 6 templates · **Opus** (ponte do Fable 5), dono aprova
*Voz de marca em ponto de contato direto. Mesmo padrão da 314 e da 316: modelo rascunha, dono veta.*

- **Entrega:** assunto e corpo dos 6 templates do §6.4.
- **Critérios de aceite:** (1) nenhum texto assume que a pessoa tem chefe; (2) `radar_followup`
  aproveita `CONTEUDO_MATURIDADE`/`CONTEUDO_OPORTUNIDADES`, que já estão aprovados, em vez de
  reescrever; (3) dono lê os 6 e aprova ou veta trecho a trecho.
- **🔴 BLOQUEADA:** depende dos guias de voz do dono (OneDrive, fora do repositório). **Não
  começar sem eles** — é regra registrada do projeto.

## 13. O que fica para depois

- **ISSUE-602** — automação da sequência (gatilho por tempo/evento), depois de existir copy com
  conversão medida. **Modelo:** Fable 5 (decide o gatilho e o teto de envio), Sonnet implementa.
- **ISSUE-603** — o vazamento de 72 conclusões → 15 leads. É problema de **produto** (a tela de
  captura), não de e-mail, e é a maior conversão barata disponível hoje: resolvê-lo dobraria a
  base que este painel trabalha, com a mesma verba de anúncio. **Modelo:** Fable 5 na persona de
  Analytics & Ads — mexe em tela do funil público, exige a trava de tracking.
