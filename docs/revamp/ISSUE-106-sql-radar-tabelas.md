# ISSUE-106 — SQL para rodar no Supabase (radar_sessions, radar_leads, radar_events)

> **Como usar:** cole o bloco "SQL A EXECUTAR" inteiro no SQL Editor do Supabase (projeto
> +ConverSaaS 2.0, ref `cuojmyqkezmpryeuyvqd`) e rode de uma vez. Depois rode os SELECTs de
> verificação e cole o resultado de volta pra mim conferir. Método igual ao da auditoria de RLS
> da Fase 3 (v3.5.3) — sem credencial de banco circulando na sessão.

## O que isso cria

- `radar_sessions` — uma linha por sessão de radar (maturidade OU oportunidades), criada no
  início do fluxo e atualizada com as respostas quando o usuário termina.
- `radar_leads` — captura de e-mail. Sempre ligada a uma sessão via `session_id`. **Sem
  constraint de e-mail único**, de propósito: a mesma pessoa pode fazer os dois radares
  (maturidade e oportunidades) com o mesmo e-mail, e cada um deve virar uma linha própria —
  diferente do `roi_leads` do funil antigo, que é 1 lead por identidade.
- `radar_events` — schema reservado para a ISSUE-109 (analytics). Criada agora porque a decisão
  de schema é escopo da 106, mas **nenhum código grava nela ainda** — fica vazia até a 109.

Todas as 3 seguem o padrão de segurança da v3.5.3: RLS habilitada, **zero política para
`anon`/`authenticated`** — só o `service_role` (que ignora RLS por padrão no Supabase) consegue
ler/escrever. Isso é testável: uma consulta com a chave `anon` deve retornar vazio/erro de
permissão.

---

## SQL A EXECUTAR

```sql
-- ============================================================
-- ISSUE-106 — Tabelas de captura dos radares (Fase 1 do revamp)
-- ============================================================

-- 1) radar_sessions
CREATE TABLE radar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('maturidade', 'oportunidades')),
  answers JSONB,
  result_key VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_radar_sessions_ip_created ON radar_sessions(ip_address, created_at);

ALTER TABLE radar_sessions ENABLE ROW LEVEL SECURITY;
-- Nenhuma política criada para anon/authenticated de propósito = acesso zero para eles.

-- 2) radar_leads
CREATE TABLE radar_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES radar_sessions(id),
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('maturidade', 'oportunidades')),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  newsletter_optin BOOLEAN NOT NULL DEFAULT true,
  lab_interest BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_radar_leads_email ON radar_leads(email);
CREATE INDEX idx_radar_leads_ip_created ON radar_leads(ip_address, created_at);

ALTER TABLE radar_leads ENABLE ROW LEVEL SECURITY;

-- 3) radar_events (schema reservado — ISSUE-109 grava nela depois)
CREATE TABLE radar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES radar_sessions(id),
  event_name VARCHAR(100) NOT NULL,
  page_url VARCHAR(500),
  payload JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE radar_events ENABLE ROW LEVEL SECURITY;

-- Revoga o privilégio padrão que o Supabase concede a anon/authenticated em toda tabela
-- nova do schema public. Com RLS + zero políticas isso já não vazava nada, mas o privilégio
-- ficava "dormindo" — bastaria uma política futura mal escrita (ou um DISABLE RLS acidental)
-- pra reabrir o mesmo tipo de brecha do incidente roi_leads (v3.5.3). Revisão Fable 5.
REVOKE ALL ON radar_sessions, radar_leads, radar_events FROM anon, authenticated;
```

---

## SELECTs de verificação (rode depois, cole o resultado pra mim)

```sql
-- 1. As 3 tabelas existem com RLS ligada?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('radar_sessions', 'radar_leads', 'radar_events');
-- Esperado: rowsecurity = true nas 3 linhas.

-- 2. Confirma que NÃO existe nenhuma política (acesso público zero)?
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('radar_sessions', 'radar_leads', 'radar_events');
-- Esperado: 0 linhas (nenhuma política = anon/authenticated não acessam nada).
```

---

## Rollback (se algo der errado)

```sql
DROP TABLE IF EXISTS radar_events;
DROP TABLE IF EXISTS radar_leads;
DROP TABLE IF EXISTS radar_sessions;
```

Seguro rodar a qualquer momento antes das rotas de API irem para produção — nenhuma tabela
legada referencia estas 3 (são novas, isoladas).

---

## Teste funcional (depois do SQL + das rotas implementadas)

Com o app rodando (`npm run dev` ou preview na Vercel), teste manual dos critérios de aceite da
ISSUE-106:

1. **Lead de teste aparece no Supabase:**
   ```bash
   curl -X POST http://localhost:3000/api/radar/session \
     -H "Content-Type: application/json" \
     -d '{"kind":"oportunidades"}'
   # copie o "sessionId" da resposta

   curl -X POST http://localhost:3000/api/radar/lead \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"<cole aqui>","name":"Teste Radar","email":"seuemail@teste.com"}'
   # esperado: {"success":true,"leadId":"...","triggerConversion":true}
   ```
   Confira no Table Editor do Supabase: linha nova em `radar_sessions` e `radar_leads`.

2. **SELECT com anon key FALHA** (você faz, no SQL Editor autenticado como `anon` ou via
   `curl` com a chave pública):
   ```bash
   curl "https://cuojmyqkezmpryeuyvqd.supabase.co/rest/v1/radar_leads?select=*" \
     -H "apikey: <SUA_CHAVE_ANON_PUBLICA>"
   # esperado: erro de permissão (403/42501) — com o REVOKE ALL do SQL acima, não deve nem
   # retornar [] silencioso; nunca os dados reais.
   ```

3. **E-mail inválido é rejeitado:** repita o `curl` do lead com `"email":"nao-e-email"` —
   esperado `400`.

4. **Rate limit ativo:** repita o `curl` do lead 6+ vezes seguidas do mesmo IP — a partir da
   6ª, esperado `429`.

5. **Fluxo público não quebrou:** teste `/pre-diagnostico` ponta a ponta (captura de lead +
   e-mail) — nada nesta issue toca nesse funil, mas é o checklist padrão da casa depois de
   qualquer mudança de RLS/schema.
