# ISSUE-318D — SQL para rodar no Supabase (feedback)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Método igual ao das ISSUE-106/108/310.

## O que isso cria

- `feedback` — uma linha por feedback registrado pelo widget (`POST /api/feedback`), venha de
  visitante anônimo ou de quem está logado. Guarda o texto livre da pessoa **mais o contexto
  automático** (rota, viewport, device, versão do deploy, UTM), que é o que transforma a nota em
  issue quase escrita.
- Campos de triagem (`status`, `notas_admin`, `issue_ref`) existem desde já, mas **a rota pública
  nunca os escreve** — quem mexe neles é o painel de admin da ISSUE-318E.

**Segurança (não é preferência de estilo):** a tabela recebe texto livre de qualquer visitante da
internet e guarda `user_id` + IP. É a mesma classe de dado do incidente `roi_leads` (v3.5.3), então
segue o padrão travado da casa: RLS ligada, **zero políticas**, `REVOKE ALL` para `anon` e
`authenticated`. Todo acesso passa por rota com client `service_role`.

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-318D — Captura de feedback (widget público + logado)
-- ============================================================

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Identidade: só a sessão validada no servidor escreve aqui (nunca o body).
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255),

  -- Vocabulário fechado, validado na rota antes do INSERT.
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('bug','melhoria','ideia','confuso','elogio')),
  severidade VARCHAR(20) CHECK (severidade IN ('trava','incomoda','cosmetico')),

  mensagem TEXT NOT NULL,
  rota VARCHAR(500),
  contexto JSONB,

  -- Triagem: inalcançável pela rota pública (ISSUE-318E escreve).
  status VARCHAR(20) NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','triado','em_execucao','resolvido','descartado')),
  notas_admin TEXT,
  issue_ref VARCHAR(50),

  ip_address INET
);

CREATE INDEX idx_feedback_status_created ON feedback(status, created_at DESC);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_ip_created ON feedback(ip_address, created_at);

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- Nenhuma política criada de propósito = acesso zero para anon/authenticated.

REVOKE ALL ON feedback FROM anon, authenticated;
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. A tabela existe com RLS ligada?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'feedback';
-- Esperado: 1 linha, rowsecurity = true.

-- 2. Confirma que NÃO existe nenhuma política (acesso público zero)?
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'feedback';
-- Esperado: 0 linhas.

-- 3. Os grants sumiram mesmo pra anon/authenticated?
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'feedback' AND grantee IN ('anon','authenticated');
-- Esperado: 0 linhas.

-- 4. O trigger de updated_at entrou?
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'feedback';
-- Esperado: update_feedback_updated_at / UPDATE.
```

---

## Verificação com a chave `anon` (critério de aceite 6)

No SQL Editor não dá pra simular a chave `anon`. Do terminal, com a `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

```bash
curl "https://cuojmyqkezmpryeuyvqd.supabase.co/rest/v1/feedback?select=id" \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
# esperado: erro 42501 / "permission denied for table feedback"
```

---

## Rollback (se algo der errado)

```sql
DROP TABLE IF EXISTS feedback;
```

Seguro rodar a qualquer momento — tabela nova e isolada; a FK aponta pra `auth.users`, não o
contrário, então nada mais depende dela. A função `update_updated_at_column()` é compartilhada e
**não** deve ser dropada.

---

## Teste funcional (depois do SQL + do deploy da rota)

```bash
# 1. Envio anônimo válido
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"tipo":"bug","severidade":"trava","mensagem":"teste de captura","rota":"/lab"}'
# esperado: {"success":true} e 1 linha nova com user_id NULL

# 2. Tentativa de forjar identidade e status pelo body (deve ser IGNORADA)
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"tipo":"ideia","mensagem":"tentando forjar","user_id":"00000000-0000-0000-0000-000000000000","status":"resolvido","issue_ref":"ISSUE-999"}'
# esperado: {"success":true}; a linha grava user_id NULL, status 'novo', issue_ref NULL

# 3. Honeypot preenchido (bot)
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"tipo":"bug","mensagem":"sou um bot","website":"http://spam.com"}'
# esperado: {"success":true} e NENHUMA linha nova

# 4. Validação
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" -d '{"tipo":"outro","mensagem":"oi"}'
# esperado: 400
```

Rate limit: a partir do 6º envio do mesmo IP dentro de 1 hora → `429`.
