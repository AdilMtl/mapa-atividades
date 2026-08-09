# ISSUE-601D — SQL para rodar no Supabase (`marketing_templates`)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Mesmo método da ISSUE-601A.
>
> Fonte do modelo de dados: `docs/marketing/ISSUE-601-spec-painel-funil.md` §6.

## O que isso cria

- `marketing_templates` — pasta de templates versionada (§6.1). RLS ligada, zero política para
  `anon`/`authenticated` — só `service_role`, mesma disciplina da 601A.
- **Trava de banco extra** (não estava no §6.1 literal, mas segue o critério de aceite "só uma
  versão `ativo` por slug"): índice único parcial em `(slug) where status = 'ativo'` — o próprio
  Postgres impede duas versões ativas do mesmo slug ao mesmo tempo, não só a aplicação.
- **Seed dos 6 slugs designados pelos segmentos** (`src/lib/marketing/segmentos.ts`, `SEGMENTOS`):
  - `convite_lab` entra como **v1, `ativo`**, com o assunto/corpo que já é o e-mail real em
    produção hoje (migrado de `src/app/api/admin/lab-beta/email-convite.ts`, só trocando o
    `firstName` condicional por `{{primeiro_nome}}` e o link fixo por `{{link_lab}}` — vocabulário
    fechado do §6.2).
  - Os outros 5 (`convidado_nao_entrou`, `primeiro_projeto`, `retomar_projeto`, `convite_radar`,
    `pedido_de_relato`) entram como **v1, `rascunho`, assunto e corpo vazios** — decisão do dono em
    08/08/2026: a copy real desses é a ISSUE-601E (Opus, com os guias de voz e sua aprovação); esta
    issue só monta a estrutura.
  - `radar_followup` **fica fora** — não é um texto único, é montado dinamicamente a partir de
    `CONTEUDO_MATURIDADE`/`CONTEUDO_OPORTUNIDADES` (14 variações). Decisão do dono em 08/08/2026,
    registrada também no CHANGELOG desta sessão.

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-601D — marketing_templates
-- ============================================================

create table public.marketing_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  versao        int  not null,
  assunto       text not null,
  corpo         text not null,                 -- markdown simples, não HTML
  segmento      text,                          -- segmento designado (§4) — null só p/ radar_followup, que não entra aqui
  status        text not null default 'rascunho'
                check (status in ('rascunho','ativo','arquivado')),
  criado_em     timestamptz not null default now(),
  criado_por    text not null,
  unique (slug, versao)
);

-- Só uma versão ATIVA por slug — reforça o critério de aceite no próprio banco,
-- não só na aplicação (defesa em profundidade, mesmo espírito da 601A).
create unique index marketing_templates_slug_ativo_idx
  on public.marketing_templates (slug)
  where status = 'ativo';

create index marketing_templates_slug_idx
  on public.marketing_templates (slug, versao desc);

alter table public.marketing_templates enable row level security;
revoke all on public.marketing_templates from anon, authenticated;
-- Sem policy para anon/authenticated: dado operacional do dono, acessado só via
-- service_role atrás do gate exigirAdminSessao(). Mesma disciplina da 601A.

-- Seed: convite_lab v1 ATIVO — conteúdo real, migrado de email-convite.ts (ISSUE-318).
insert into public.marketing_templates (slug, versao, assunto, corpo, segmento, status, criado_por)
values (
  'convite_lab',
  1,
  'Teu convite pro Lab chegou',
  $$Oi, {{primeiro_nome}}!

Você entrou na lista do Lab lá no site. Chegou a tua vez.

O Lab é a parte prática do Conversas no Corredor: você conta um problema do teu trabalho numa conversa guiada, como se estivesse falando com um consultor, e sai com um diagnóstico e um plano em fases pra construir uma solução com as ferramentas que você já tem.

Teu acesso já está liberado pra este e-mail. É só criar tua conta aqui:

{{link_lab}}

O beta é fechado de propósito: pouca gente de cada vez, pra eu conseguir acompanhar de perto. Qualquer coisa que travar, parecer esquisita ou te der uma ideia, responde este e-mail direto, que eu leio tudo.

Pega teu café e bora construir.

Adilson$$,
  'lead_sem_convite',
  'ativo',
  'migracao-601D'
);

-- Seed: os outros 5 slugs, v1 RASCUNHO, vazios — aguardando copy da 601E.
insert into public.marketing_templates (slug, versao, assunto, corpo, segmento, status, criado_por)
values
  ('convidado_nao_entrou', 1, '', '', 'convidado_sem_conta', 'rascunho', 'migracao-601D'),
  ('primeiro_projeto',     1, '', '', 'conta_sem_projeto',   'rascunho', 'migracao-601D'),
  ('retomar_projeto',      1, '', '', 'projeto_parado',      'rascunho', 'migracao-601D'),
  ('convite_radar',        1, '', '', 'assinante_sem_radar', 'rascunho', 'migracao-601D'),
  ('pedido_de_relato',     1, '', '', 'concluiu_projeto',    'rascunho', 'migracao-601D');
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. A tabela existe com RLS ligada?
select tablename, rowsecurity from pg_tables where tablename = 'marketing_templates';
-- Esperado: 1 linha, rowsecurity = true.

-- 2. Zero política e zero grant de anon/authenticated?
select tablename, policyname from pg_policies where tablename = 'marketing_templates';
-- Esperado: 0 linhas.

select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_name = 'marketing_templates' and grantee in ('anon', 'authenticated');
-- Esperado: 0 linhas.

-- 3. O índice único parcial de "1 ativo por slug" existe?
select indexname, indexdef from pg_indexes
where tablename = 'marketing_templates' and indexname = 'marketing_templates_slug_ativo_idx';
-- Esperado: 1 linha, indexdef contém "WHERE (status = 'ativo'::text)".

-- 4. Os 6 slugs entraram certo?
select slug, versao, status, segmento, length(assunto) as len_assunto, length(corpo) as len_corpo
from public.marketing_templates order by slug;
-- Esperado: 6 linhas. convite_lab com status=ativo e len_corpo > 0; as outras 5 com
-- status=rascunho e len_assunto=0, len_corpo=0.

-- 5. TESTE DA TRAVA (criterio de aceite 2) — tenta ativar uma segunda versão do MESMO slug
--    enquanto já existe uma ativa. Roda dentro de transação que sempre desfaz.
begin;

insert into public.marketing_templates (slug, versao, assunto, corpo, segmento, status, criado_por)
values ('convite_lab', 2, 'teste', 'teste', 'lead_sem_convite', 'ativo', 'teste-601D');
-- Esperado: ERRO de violação do índice único parcial (duplicate key value violates
-- unique constraint "marketing_templates_slug_ativo_idx"). Se isso aparecer, a trava
-- funcionou — é o resultado CORRETO, não um bug.

rollback;
```

---

## Rollback (se algo der errado)

```sql
drop table if exists public.marketing_templates;
```

Seguro rodar a qualquer momento: tabela nova e isolada (nenhuma FK apontando pra ela).

---

## Fora do escopo desta issue (registrado para não perder)

- `radar_followup` não entra em `marketing_templates` — decisão do dono em 08/08/2026, é
  conteúdo dinâmico (`CONTEUDO_MATURIDADE`/`CONTEUDO_OPORTUNIDADES`), não um texto único.
- A copy real dos 5 templates em rascunho é a **ISSUE-601E** (Opus, guias de voz, dono aprova).
- Ligar o disparo de fato pra ler `marketing_templates.corpo` (hoje `email-convite.ts` continua
  com o conteúdo hardcoded, migrar a leitura é trabalho da **ISSUE-601C**).
