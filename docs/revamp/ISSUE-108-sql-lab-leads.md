# ISSUE-108 — SQL para rodar no Supabase (lab_leads)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Método igual ao da ISSUE-106.

## O que isso cria

- `lab_leads` — captura de e-mail de quem quer entrar na lista de interesse do Lab, vindo da
  página `/lab` (visita solta, sem radar). Tabela isolada: **não** referencia `radar_sessions`
  nem `radar_leads` — quem já respondeu um radar e marcou "quero entrar na lista do Lab" continua
  gravado em `radar_leads.lab_interest` (ISSUE-106), sem duplicar aqui.
- Mesmo padrão de segurança da v3.5.3/ISSUE-106: RLS habilitada, **zero política** para
  `anon`/`authenticated` — só o `service_role` (usado pela rota `/api/lab/interest`) lê/escreve.

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-108 — Tabela de interesse no Lab (visita solta, sem radar)
-- ============================================================

CREATE TABLE lab_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lab_leads_email ON lab_leads(email);
CREATE INDEX idx_lab_leads_ip_created ON lab_leads(ip_address, created_at);

ALTER TABLE lab_leads ENABLE ROW LEVEL SECURITY;
-- Nenhuma política criada para anon/authenticated de propósito = acesso zero para eles.

REVOKE ALL ON lab_leads FROM anon, authenticated;
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. A tabela existe com RLS ligada?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'lab_leads';
-- Esperado: rowsecurity = true.

-- 2. Confirma que NÃO existe nenhuma política (acesso público zero)?
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'lab_leads';
-- Esperado: 0 linhas.
```

---

## Rollback (se algo der errado)

```sql
DROP TABLE IF EXISTS lab_leads;
```

Seguro rodar a qualquer momento — tabela nova e isolada, nenhuma outra referencia ela.

---

## Teste funcional (depois do SQL + da rota implementada)

```bash
curl -X POST http://localhost:3000/api/lab/interest \
  -H "Content-Type: application/json" \
  -d '{"email":"seuemail@teste.com"}'
# esperado: {"success":true}
```

Confira no Table Editor do Supabase: linha nova em `lab_leads`.

E-mail inválido → `400`. Repetir 6+ vezes do mesmo IP em menos de 1h → `429` a partir da 6ª.
