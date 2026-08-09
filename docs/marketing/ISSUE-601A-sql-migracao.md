# ISSUE-601A — SQL para rodar no Supabase (marketing_sends, marketing_unsubscribes, vw_marketing_contatos)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Método igual ao da ISSUE-106/108/310 —
> sem credencial de banco circulando na sessão.
>
> Fonte do modelo de dados: `docs/marketing/ISSUE-601-spec-painel-funil.md` §3.

## O que isso cria

- `marketing_sends` — único dado novo de verdade: log de todo e-mail de marketing disparado
  (§3.1). RLS ligada, zero política para `anon`/`authenticated` — só `service_role`.
- `marketing_unsubscribes` — quem clicou em descadastrar (§3.4). Mesma disciplina de acesso.
- `vw_marketing_contatos` — view derivada, **uma linha por e-mail único**, com os atributos que
  alimentam os 6 segmentos do §4 (§3.2). `security_invoker = true` (regra do projeto pra toda
  view nova). Fontes: `radar_leads` + `radar_sessions`, `lab_leads`, `authorized_emails`,
  `admin_list_users()` (RPC — nunca `auth.admin.listUsers()`), `lab_projects`,
  `marketing_sends`, `marketing_unsubscribes`. **`roi_leads` fica de fora** — decisão do dono
  registrada no §4.1 da spec.

### Decisão registrada nesta sessão: optin de contato sem radar

`radar_leads.newsletter_optin` é a única coluna de optin que existe no banco. Contato que só
aparece via `lab_leads` (interesse direto, sem radar) ou só via `authorized_emails` (assinante
manual/legado) não tem nenhum sinal de optin. **Decisão do dono (08/08/2026): default `true`**
— mesma convenção já usada no radar (`newsletterOptin ?? true`). Documentado na view com
comentário SQL; se a política mudar, é um `COALESCE` só.

### Detalhe que não estava na tabela do §4, mas é necessário pra `projeto_parado` funcionar

A view é 1 linha por e-mail, mas um contato pode ter mais de um projeto no Lab. Se eu só
guardasse "última atividade entre TODOS os projetos", um projeto concluído recente esconderia um
projeto antigo parado do mesmo dono. Por isso a view carrega `ultimo_projeto_aberto_em`
(atividade mais recente só entre os projetos **não concluídos**) além de `ultimo_projeto_em`
(entre todos) — é essa primeira coluna que o segmento `projeto_parado` usa.

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-601A — marketing_sends, marketing_unsubscribes, vw_marketing_contatos
-- ============================================================

-- 1) marketing_sends — log de disparo (§3.1)
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

-- 2) marketing_unsubscribes — descadastro (§3.4)
create table public.marketing_unsubscribes (
  email       text primary key,               -- sempre gravado em lower() pela aplicação
  motivo      text,
  origem      text,                            -- template_slug que gerou o clique
  criado_em   timestamptz not null default now()
);

alter table public.marketing_unsubscribes enable row level security;
revoke all on public.marketing_unsubscribes from anon, authenticated;

-- 3) vw_marketing_contatos — 1 linha por e-mail único (§3.2)
create or replace view public.vw_marketing_contatos
with (security_invoker = true) as
with radar_latest as (
  -- Último radar respondido por e-mail (nome, kind, resultado, optin do envio mais recente)
  select distinct on (lower(rl.email))
    lower(rl.email)                as email,
    nullif(rl.name, '')            as nome,
    rl.kind                        as radar_kind,
    rs.result_key                  as radar_result,
    rl.created_at                  as radar_em,
    rl.newsletter_optin            as optin_newsletter_radar,
    (rs.completed_at is not null)  as concluiu_radar
  from public.radar_leads rl
  left join public.radar_sessions rs on rs.id = rl.session_id
  order by lower(rl.email), rl.created_at desc
),
radar_agg as (
  select
    lower(email)                as email,
    min(created_at)             as radar_primeiro_em,
    bool_or(lab_interest)       as marcou_interesse_lab_radar
  from public.radar_leads
  group by lower(email)
),
lab_leads_agg as (
  select
    lower(email)     as email,
    min(created_at)  as lab_leads_primeiro_em
  from public.lab_leads
  group by lower(email)
),
autorizados as (
  select distinct on (lower(email))
    lower(email)      as email,
    plan_type,
    created_at         as autorizado_em,
    expires_at          as expira_em
  from public.authorized_emails
  order by lower(email), created_at desc
),
contas as (
  -- admin_list_users() é SECURITY DEFINER — funciona dentro da view mesmo com
  -- security_invoker=true, porque a função carrega o próprio contexto de segurança.
  select
    lower(email)        as email,
    created_at           as criou_conta_em,
    last_sign_in_at       as ultimo_acesso
  from public.admin_list_users()
  where email is not null
),
projetos_agg as (
  select
    lower(u.email)                                                     as email,
    count(lp.id)                                                       as projetos_count,
    count(lp.id) filter (where lp.status = 'concluido')                as projetos_concluidos,
    max(lp.updated_at)                                                 as ultimo_projeto_em,
    max(lp.updated_at) filter (where lp.status <> 'concluido')         as ultimo_projeto_aberto_em
  from public.lab_projects lp
  join public.admin_list_users() u on u.id = lp.user_id
  group by lower(u.email)
),
envios_agg as (
  -- Só envios com sucesso contam como "contato" — uma falha não alcançou a pessoa.
  select
    lower(email)      as email,
    count(*)           as envios_count,
    max(enviado_em)      as ultimo_envio_em
  from public.marketing_sends
  where status = 'enviado'
  group by lower(email)
),
descadastros as (
  select lower(email) as email from public.marketing_unsubscribes
),
todos_emails as (
  select email from radar_agg
  union
  select email from lab_leads_agg
  union
  select email from autorizados
  union
  select email from contas
  union
  select email from projetos_agg
),
base as (
  select
    te.email,
    rlt.nome,
    rlt.radar_kind,
    rlt.radar_result,
    rlt.radar_em,
    rlt.optin_newsletter_radar,
    coalesce(rlt.concluiu_radar, false)               as concluiu_radar,
    (ra.email is not null)                             as fez_radar,
    ra.radar_primeiro_em,
    coalesce(ra.marcou_interesse_lab_radar, false)     as marcou_interesse_lab_radar,
    (ll.email is not null)                             as marcou_interesse_lab_direto,
    ll.lab_leads_primeiro_em,
    au.plan_type,
    au.autorizado_em,
    au.expira_em,
    (au.email is not null and au.expira_em >= current_date) as esta_autorizado,
    co.criou_conta_em,
    co.ultimo_acesso,
    (co.email is not null)                             as tem_conta,
    coalesce(pa.projetos_count, 0)                     as projetos_count,
    coalesce(pa.projetos_concluidos, 0)                as projetos_concluidos,
    pa.ultimo_projeto_em,
    pa.ultimo_projeto_aberto_em,
    coalesce(ea.envios_count, 0)                       as envios_count,
    ea.ultimo_envio_em,
    (d.email is not null)                              as descadastrado
  from todos_emails te
  left join radar_latest rlt  on rlt.email = te.email
  left join radar_agg ra      on ra.email = te.email
  left join lab_leads_agg ll  on ll.email = te.email
  left join autorizados au    on au.email = te.email
  left join contas co         on co.email = te.email
  left join projetos_agg pa   on pa.email = te.email
  left join envios_agg ea     on ea.email = te.email
  left join descadastros d    on d.email = te.email
)
select
  b.email,
  b.nome,
  origem.origem                                              as origem_primaria,
  origem.em                                                  as primeiro_contato_em,
  b.fez_radar,
  b.concluiu_radar,
  b.radar_kind,
  b.radar_result,
  b.radar_em,
  -- Decisão do dono (08/08/2026): sem coluna de optin na origem → default TRUE.
  coalesce(b.optin_newsletter_radar, true)                   as optin_newsletter,
  (b.marcou_interesse_lab_radar or b.marcou_interesse_lab_direto) as marcou_interesse_lab,
  b.esta_autorizado,
  b.plan_type,
  b.autorizado_em,
  b.expira_em,
  b.tem_conta,
  b.criou_conta_em,
  b.ultimo_acesso,
  b.projetos_count,
  b.projetos_concluidos,
  b.ultimo_projeto_em,
  b.ultimo_projeto_aberto_em,
  b.envios_count,
  b.ultimo_envio_em,
  greatest(b.ultimo_projeto_em, b.ultimo_envio_em, b.radar_em, b.ultimo_acesso)  as ultimo_contato_em,
  case
    when greatest(b.ultimo_projeto_em, b.ultimo_envio_em, b.radar_em, b.ultimo_acesso, b.criou_conta_em, origem.em) is null
      then null
    else extract(
      day from now() - greatest(b.ultimo_projeto_em, b.ultimo_envio_em, b.radar_em, b.ultimo_acesso, b.criou_conta_em, origem.em)
    )::int
  end                                                         as dias_sem_contato,
  b.descadastrado
from base b
cross join lateral (
  select v.origem, v.em
  from (values
    ('radar', b.radar_primeiro_em),
    ('lab_leads', b.lab_leads_primeiro_em),
    ('authorized_emails', b.autorizado_em::timestamptz),
    ('conta', b.criou_conta_em)
  ) as v(origem, em)
  where v.em is not null
  order by v.em asc
  limit 1
) as origem;

-- Defesa extra (mesma cautela da ISSUE-106/108/310): mata qualquer grant default do Supabase
-- na view antes que alguém precise descobrir isso do jeito difícil.
revoke all on public.vw_marketing_contatos from anon, authenticated;
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. As 2 tabelas existem com RLS ligada, e a view existe?
select tablename, rowsecurity from pg_tables
where tablename in ('marketing_sends', 'marketing_unsubscribes');
-- Esperado: 2 linhas, rowsecurity = true nas duas.

select table_name from information_schema.views
where table_name = 'vw_marketing_contatos';
-- Esperado: 1 linha.

-- 2. Zero política e zero grant de anon/authenticated nas tabelas novas e na view?
select tablename, policyname from pg_policies
where tablename in ('marketing_sends', 'marketing_unsubscribes');
-- Esperado: 0 linhas.

select table_name, grantee, privilege_type from information_schema.role_table_grants
where table_name in ('marketing_sends', 'marketing_unsubscribes', 'vw_marketing_contatos')
  and grantee in ('anon', 'authenticated');
-- Esperado: 0 linhas.

-- 3. A view está com security_invoker = true?
select relname, reloptions from pg_class
where relname = 'vw_marketing_contatos';
-- Esperado: reloptions contém "security_invoker=true".

-- 4. Contagem geral — quantos contatos únicos a view enxerga, e quantos de cada segmento cru?
select count(*) as total_contatos from public.vw_marketing_contatos;

select
  count(*) filter (where fez_radar and not esta_autorizado)                                  as lead_sem_convite_bruto,
  count(*) filter (where esta_autorizado and not tem_conta)                                   as convidado_sem_conta,
  count(*) filter (where tem_conta and projetos_count = 0)                                    as conta_sem_projeto,
  count(*) filter (where esta_autorizado and coalesce(plan_type,'') <> 'lab_beta' and not fez_radar) as assinante_sem_radar,
  count(*) filter (where projetos_concluidos >= 1)                                            as concluiu_projeto,
  count(*) filter (where descadastrado)                                                       as descadastrados
from public.vw_marketing_contatos;
-- Estes números eu confiro contra os testes automatizados (npm test) do lado TypeScript.

-- 5. TESTE DE DEDUPE (criterio de aceite 2) — roda dentro de uma transação que sempre
--    desfaz no final, não suja o banco. Simula o MESMO e-mail em radar_leads e lab_leads.
begin;

insert into radar_sessions (id, kind, completed_at)
values ('00000000-0000-0000-0000-000000000601', 'maturidade', now());

insert into radar_leads (session_id, kind, name, email, newsletter_optin, lab_interest)
values ('00000000-0000-0000-0000-000000000601', 'maturidade', 'Teste Dedupe', 'dedupe-601a@teste.dev', true, false);

insert into lab_leads (email)
values ('DEDUPE-601A@teste.dev');  -- mesmo e-mail, caixa diferente de propósito

select email, fez_radar, marcou_interesse_lab, nome
from public.vw_marketing_contatos
where email = 'dedupe-601a@teste.dev';
-- Esperado: 1 LINHA SÓ (não duas), fez_radar = true, marcou_interesse_lab = true
-- (porque veio via lab_leads mesmo sem lab_interest no radar), nome = 'Teste Dedupe'.

rollback;  -- desfaz os inserts de teste — nada fica gravado
```

---

## Rollback (se algo der errado)

```sql
drop view if exists public.vw_marketing_contatos;
drop table if exists public.marketing_unsubscribes;
drop table if exists public.marketing_sends;
```

Seguro rodar a qualquer momento: as duas tabelas são novas e isoladas (nenhuma FK apontando pra
elas), e a view só lê — nenhuma tabela existente é alterada.

---

## Fora do escopo desta issue (registrado para não perder)

- `marketing_templates` (§6) — entra na ISSUE-601D.
- Rota pública `/descadastrar` que grava em `marketing_unsubscribes` — entra na ISSUE-601C
  (mesmo issue que faz o disparo).
- `roi_leads` não entra na view — decisão do dono, §4.1 da spec. Não reabrir sem pedido explícito.
