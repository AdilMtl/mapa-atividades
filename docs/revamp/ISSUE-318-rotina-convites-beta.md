# ISSUE-318 — Rotina de convites do beta do Lab (operação do dono)

> **O que é:** como convidar alguém pro beta fechado do Lab — da lista de espera até a pessoa
> logada em `/lab/inicio`.
>
> **⚡ ATUALIZAÇÃO (2026-07-29, mesma sessão):** o dono vetou a rotina por SQL manual e pediu
> um painel. **O caminho oficial agora é `/admin/lab-beta`** (só o login do admin acessa —
> gate server-side por sessão): fila unificada (`lab_leads` + `radar_leads.lab_interest`),
> botão **Convidar** (libera `authorized_emails` com `plan_type='lab_beta'` E envia o e-mail
> de convite via Resend na hora), status de cada convidado (conta criada, último acesso) e
> **Revogar**. O template do e-mail vive no código
> (`src/app/api/admin/lab-beta/email-convite.ts`) — mesma copy aprovada abaixo.
>
> O SQL deste doc segue válido como **plano B** (Resend fora do ar, Vercel com problema) e
> como documentação do que o painel faz por baixo.
>
> **Critério de aceite da issue:** rotina testada com 1 convite real —
> `adilson.matioli1@gmail.com` (decisão do dono; o principal já tem acesso e não provaria
> nada). Com o painel: digitar o e-mail no campo "convidar por e-mail", Convidar, abrir o
> e-mail no celular, criar a conta, cair em `/lab/inicio`.

---

## Passo 0 — ✅ RESOLVIDO (2026-07-29): a coluna `plan_type` EXISTE

O dono rodou o SELECT de verificação e a coluna está lá (`character varying`, nullable), junto
com `stripe_subscription_id` e `updated_at` que o schema doc também não registrava — tudo
registrado em `docs/supabase-database-schema.txt` nesta data. A contradição com o
`ISSUE-310-sql-lab.md` (que adiava o ALTER pra cá) está encerrada: a coluna já existia em
produção. **Nenhum ALTER necessário — rotina começa direto no Passo 1.**

---

## Passo 1 — Escolher quem convidar (a lista de espera mora em DOIS lugares)

```sql
-- A fila completa de interesse no Lab, mais antigo primeiro:
-- lab_leads = visita direta à página /lab (ISSUE-108)
-- radar_leads.lab_interest = marcou "quero entrar na lista do Lab" no radar (ISSUE-106)
SELECT email, 'pagina_lab' AS origem, created_at
FROM lab_leads
UNION ALL
SELECT email, 'radar' AS origem, created_at
FROM radar_leads
WHERE lab_interest = true
ORDER BY created_at ASC;
```

Anote o e-mail escolhido. Antes de liberar, confira se a pessoa JÁ tem acesso (assinante
antigo, por exemplo — nesse caso não mexa na linha dela, ela já entra no Lab):

```sql
SELECT email, expires_at, plan_type, notes
FROM authorized_emails
WHERE email = 'EMAIL_DO_CONVIDADO';
-- 0 linhas = pode seguir pro Passo 2.
-- 1 linha  = a pessoa já tem acesso; NÃO rode o INSERT (sobrescrever plan_type de
--            assinante antigo mudaria a navegação dele — o link pro legado some).
```

## Passo 2 — Liberar o acesso

```sql
-- Troque o e-mail e, se quiser, a validade (sugestão: fim do ano — beta não é vitalício;
-- dá pra estender depois com um UPDATE).
INSERT INTO authorized_emails (email, expires_at, plan_type, notes)
VALUES (
  'EMAIL_DO_CONVIDADO',
  '2026-12-31',
  'lab_beta',
  'convite beta Lab — leva 1 (2026-07)'
);
```

O campo `notes` é teu registro de qual leva foi — facilita auditar depois.

## Passo 3 — Enviar o convite

**Canal recomendado pra este momento: teu e-mail pessoal**, não um disparo automatizado.
São 10–20 pessoas; o convite pessoal é parte da experiência do beta ("acompanhar de perto") e
responde na mesma thread. O plano original citava Resend, mas Resend é a infra transacional
das rotas (radar/pré-diag) — não existe código de envio de convite, e criar rota pra isso foi
explicitamente descartado na abertura da issue (decisão "doc puro"). Se as levas crescerem,
a automação vira issue própria (a 325/Stripe já prevê boas-vindas automáticas).

**Template (ajusta o nome, o resto tá na voz):**

> **Assunto:** Teu convite pro Lab chegou
>
> Oi, [NOME]!
>
> Você entrou na lista do Lab lá no site — chegou a tua vez.
>
> O Lab é a parte prática do Conversas no Corredor: você conta um problema do teu trabalho
> numa conversa guiada (não é chat) e sai com um diagnóstico e um plano em fases pra
> construir uma solução com as ferramentas que você já tem.
>
> Teu acesso já tá liberado pra este e-mail. É só criar tua conta aqui:
> https://conversas-no-corredor.vercel.app/auth?next=/lab/inicio
>
> O beta é fechado de propósito: pouca gente de cada vez, pra eu conseguir acompanhar de
> perto. Qualquer coisa que travar, parecer esquisita ou te der uma ideia — responde este
> e-mail direto, que eu leio tudo.
>
> Pega teu café e bora construir.
>
> Adilson

⚠️ O acesso vale pro e-mail que você liberou no Passo 2 — se a pessoa quiser usar outro,
atualize a linha em `authorized_emails` antes de ela criar a conta.

## Passo 4 — Conferir que entrou

Quando a pessoa criar a conta (ou te responder), confirme:

```sql
-- A conta nasceu?
SELECT u.email, u.created_at
FROM auth.users u
WHERE u.email = 'EMAIL_DO_CONVIDADO';
```

E o funil dela aparece nos eventos (`lab_project_started` em diante):

```sql
SELECT event_name, payload, created_at
FROM radar_events
WHERE event_name LIKE 'lab_%'
ORDER BY created_at DESC
LIMIT 20;
```

## Passo 5 — Se precisar revogar

```sql
-- Encerra o acesso sem apagar o histórico (o gate compara expires_at com hoje):
UPDATE authorized_emails
SET expires_at = CURRENT_DATE - 1
WHERE email = 'EMAIL_DO_CONVIDADO' AND plan_type = 'lab_beta';
```

---

## O teste desta issue (1 convite real)

Executar a rotina inteira com **`adilson.matioli1@gmail.com`** como convidado:

1. Passo 0 (conferir/criar `plan_type`) → colar o resultado do SELECT na sessão.
2. Passo 2 (INSERT) — esse e-mail não está em `lab_leads`, e tudo bem: o teste é da rotina de
   liberação+entrada, não da fila.
3. Passo 3: mandar o e-mail de convite do teu principal pro `1` (testa o template de verdade).
4. Abrir o link do e-mail **no celular**, criar a conta com o `1`, cair em `/lab/inicio`.
5. Conferir no Passo 4 que a conta nasceu e que `lab_project_started` aparece se você abrir
   o wizard.

Qualquer degrau que falhar é buraco do doc — me traz que eu corrijo antes de fechar a issue.
