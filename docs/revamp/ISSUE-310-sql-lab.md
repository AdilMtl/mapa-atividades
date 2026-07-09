# ISSUE-310 — SQL para rodar no Supabase (lab_profiles, lab_projects, lab_assets)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Método igual ao da ISSUE-106 e da
> auditoria de RLS da Fase 3 (v3.5.3) — sem credencial de banco circulando na sessão.
>
> Fonte do modelo de dados: `docs/revamp/13_plano_fase1_lab.md` §5.

## O que isso cria

- `lab_profiles` — Perfil do Builder, 1 linha por usuário (PK = `user_id`). Alimenta a
  personalização e mede os caminhos de chegada (campo `origin`: workshop · radar · direto).
- `lab_projects` — projetos da Jornada Guiada. Diagnóstico e plano ficam em **JSONB
  versionado** (`engine_version` / `generator_version` dentro do JSON) — não são tabelas
  próprias; re-diagnóstico sobrescreve com versão nova (decisão do doc 13 §5).
- `lab_assets` — biblioteca de materiais (conteúdo markdown no banco, sem CMS na Fase 1).
  Já nasce com `premium_only` (paywall só liga na 1C) e `published` (seed entra despublicado).

### Padrão de segurança (diferente da ISSUE-106 — atenção)

As tabelas dos radares são "acesso público zero" (só `service_role`). Aqui **não**: o usuário
logado precisa ler/escrever as próprias linhas direto do app. O padrão então é:

1. `REVOKE ALL` de `anon` e `authenticated` (mata o privilégio padrão do Supabase);
2. `GRANT` de volta **só o necessário**: SELECT/INSERT/UPDATE em `lab_profiles` e
   `lab_projects` para `authenticated`; só SELECT em `lab_assets`. **Sem DELETE em nada**
   (decisão 1A) e **nada para `anon`**;
3. RLS com políticas `auth.uid() = user_id` restringindo as linhas (em `lab_assets`, só
   `published = true`; escrita de assets fica exclusiva do `service_role`, que ignora RLS).

As políticas usam `(SELECT auth.uid())` em vez de `auth.uid()` direto — mesmo resultado, mas o
Postgres avalia 1 vez por query em vez de 1 vez por linha (recomendação oficial do Supabase).

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-310 — Tabelas do Lab (Fase 1A da Jornada Guiada)
-- ============================================================

-- 1) lab_profiles — Perfil do Builder (1:1 com o usuário)
CREATE TABLE lab_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_area VARCHAR(50),            -- mesmos IDs de área do radar (area_vendas…)
  seniority VARCHAR(30),
  ai_fluency_level VARCHAR(20),     -- IDs do radar de maturidade (curioso…referencia)
  main_goal TEXT,
  biggest_bottleneck TEXT,
  tools_used JSONB,
  preferences JSONB,
  origin VARCHAR(20) NOT NULL DEFAULT 'direto'
    CHECK (origin IN ('workshop', 'radar', 'direto')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lab_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_profiles_select_own" ON lab_profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_profiles_insert_own" ON lab_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_profiles_update_own" ON lab_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Reusa a função de trigger que já existe no banco (criada no funil antigo)
CREATE TRIGGER update_lab_profiles_updated_at
  BEFORE UPDATE ON lab_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2) lab_projects — projetos da jornada (diagnóstico/plano em JSONB versionado)
CREATE TABLE lab_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'diagnosticado', 'planejado', 'em_construcao', 'concluido')),
  wizard_answers JSONB,   -- respostas do wizard (schema TS versionado no app)
  diagnosis JSONB,        -- { tipo, familia, complexidade, potencial_ia, potencial_automacao,
                          --   risco, flags, pontuacao, engine_version }
  plan JSONB,             -- { resumo, etapas[], checklist[{id,label,done}], artefato_sugerido,
                          --   materiais_slugs[], generator_version }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listagem do hub /lab/inicio: projetos do usuário, mais recente primeiro
CREATE INDEX idx_lab_projects_user_updated ON lab_projects(user_id, updated_at DESC);

ALTER TABLE lab_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_projects_select_own" ON lab_projects
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_projects_insert_own" ON lab_projects
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "lab_projects_update_own" ON lab_projects
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TRIGGER update_lab_projects_updated_at
  BEFORE UPDATE ON lab_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3) lab_assets — biblioteca (leitura para logados; escrita só service_role)
CREATE TABLE lab_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) UNIQUE NOT NULL,   -- estável: é o que o plano referencia (materiais_slugs)
  title VARCHAR(160) NOT NULL,
  description TEXT,
  format VARCHAR(20) NOT NULL
    CHECK (format IN ('checklist', 'template', 'guia', 'canvas')),
  solution_types TEXT[],              -- match com os 9 tipos do motor de oportunidades
  maturity_min VARCHAR(20),           -- filtro opcional por fluência (NULL = todos)
  content_markdown TEXT,
  premium_only BOOLEAN NOT NULL DEFAULT false,  -- flag desde o dia 1; paywall só na 1C
  published BOOLEAN NOT NULL DEFAULT false,     -- seed entra despublicado até o dono aprovar
  origin VARCHAR(20) NOT NULL DEFAULT 'lab'
    CHECK (origin IN ('lab', 'workshop')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lab_assets ENABLE ROW LEVEL SECURITY;

-- Única tabela do Lab com leitura "aberta" (para logados, só o publicado).
-- Nenhuma política de escrita de propósito: INSERT/UPDATE de assets é só via service_role.
CREATE POLICY "lab_assets_select_published" ON lab_assets
  FOR SELECT TO authenticated
  USING (published = true);

CREATE TRIGGER update_lab_assets_updated_at
  BEFORE UPDATE ON lab_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4) REVOKE seletivo (padrão herdado da ISSUE-106, adaptado a tabelas com acesso de usuário):
-- primeiro revoga TUDO que o Supabase concede por padrão a anon/authenticated...
REVOKE ALL ON lab_profiles, lab_projects, lab_assets FROM anon, authenticated;

-- ...depois devolve SÓ o necessário. Sem DELETE em nada (decisão 1A), zero acesso para anon
-- (as rotas do Lab são todas atrás de login). As políticas RLS acima limitam as linhas.
GRANT SELECT, INSERT, UPDATE ON lab_profiles, lab_projects TO authenticated;
GRANT SELECT ON lab_assets TO authenticated;
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. As 3 tabelas existem com RLS ligada?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('lab_profiles', 'lab_projects', 'lab_assets');
-- Esperado: 3 linhas, rowsecurity = true em todas.

-- 2. Políticas criadas (nome, papel, comando)?
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('lab_profiles', 'lab_projects', 'lab_assets')
ORDER BY tablename, cmd;
-- Esperado: 7 linhas, todas com roles = {authenticated}:
--   lab_assets: 1 (SELECT) · lab_profiles: 3 (SELECT/INSERT/UPDATE) · lab_projects: 3 (idem).
-- NENHUMA linha com {anon} e NENHUMA de DELETE.

-- 3. Privilégios efetivos pós REVOKE/GRANT?
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('lab_profiles', 'lab_projects', 'lab_assets')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;
-- Esperado: authenticated com SELECT/INSERT/UPDATE em lab_profiles e lab_projects,
-- só SELECT em lab_assets. ZERO linhas de anon e ZERO de DELETE.

-- 4. Triggers de updated_at ativos?
SELECT event_object_table, trigger_name
FROM information_schema.triggers
WHERE event_object_table IN ('lab_profiles', 'lab_projects', 'lab_assets');
-- Esperado: 1 trigger update_*_updated_at por tabela (3 linhas).
```

---

## Teste com a chave anon (do seu terminal — deve FALHAR)

```bash
curl "https://cuojmyqkezmpryeuyvqd.supabase.co/rest/v1/lab_projects?select=*" \
  -H "apikey: <SUA_CHAVE_ANON_PUBLICA>"
# esperado: erro de permissão (403/42501) — nunca [] silencioso, nunca dados.
```

O teste de isolamento entre usuários ("logado só vê as próprias linhas", critério de aceite da
issue) precisa de 2 contas navegando no app — entra no roteiro da ISSUE-314 (projeto alheio →
404) e no gate da ISSUE-319, quando existir UI para gerar dados.

---

## Rollback (se algo der errado)

```sql
DROP TABLE IF EXISTS lab_projects;
DROP TABLE IF EXISTS lab_profiles;
DROP TABLE IF EXISTS lab_assets;
-- Triggers e políticas caem junto com as tabelas. A função update_updated_at_column()
-- é compartilhada com o funil antigo — NÃO dropar.
```

Seguro rodar a qualquer momento antes das ISSUES 311+ irem para produção — nenhuma tabela
legada referencia estas 3 (são novas, isoladas; a FK delas aponta para `auth.users`, não o
contrário).

---

## Fora do escopo desta issue (registrado para não perder)

- `lab_project_interviews` — tabela da Fase 1B, entra com a ISSUE-320/321.
- `ALTER TABLE authorized_emails ADD COLUMN plan_type …` — preparação premium citada no doc 13
  §7, mas pertence à rotina de convites da **ISSUE-318** (é lá que `plan_type='lab_beta'`
  passa a ser usado).
- Seed dos ativos da biblioteca — conteúdo é o gargalo da **ISSUE-316** (Claude rascunha, dono
  aprova, entra com `published = false` → `true` na aprovação).
