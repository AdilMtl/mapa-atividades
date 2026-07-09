# Rotina — Importar leads dos radares/Lab para o Substack

> Resolve o item da ISSUE-112 (DoD C): "Rotina de import CSV → Substack documentada para o
> dono". Não existe integração automática entre o Supabase e o Substack — isso é um passo
> manual, feito por você, periodicamente (sugestão: 1x por semana ou antes de cada edição).

## Por que existe

Os radares e o Lab capturam e-mail direto no nosso banco (`radar_leads`, `lab_leads`), não no
Substack. Quem só passou pelo radar/Lab não é assinante da newsletter automaticamente — pra
virar assinante de verdade (e receber as próximas edições), o e-mail precisa entrar na lista do
Substack. Isso é feito por importação manual de CSV, porque o Substack não oferece API pública
de escrita para isso.

## Passo 1 — Exportar do Supabase

No **SQL Editor** do projeto (`cuojmyqkezmpryeuyvqd`), rode as duas consultas abaixo (ajuste a
data para a do seu último export — na primeira vez, use a data de lançamento da ISSUE-113,
2026-07-08).

**A) Leads dos radares que aceitaram newsletter:**
```sql
select name as "First Name", email as "Email"
from radar_leads
where newsletter_optin = true
  and created_at > '2026-07-08'
order by created_at;
```

**B) Interessados no Lab (via `/lab`, sem passar pelo radar):**
```sql
select email as "Email"
from lab_leads
where created_at > '2026-07-08'
order by created_at;
```

Depois de rodar cada consulta, clique no botão de **download** (seta para baixo) acima da
tabela de resultado e salve como CSV. Você vai ter 2 arquivos.

> Anote a data de hoje em algum lugar (bloco de notas, o que for) — é o valor que você vai usar
> no `created_at >` da próxima vez, pra não reimportar quem já foi importado.

## Passo 2 — Importar no Substack

1. No painel do Substack, vá em **Subscribers** → **Add subscribers** → **Add subscribers by
   upload**.
2. Envie o CSV (aceita `.csv`, `.xlsx` ou `.ods`). A única coluna obrigatória é **Email**;
   **First Name** é opcional e já vem pronta no arquivo (A).
3. O Substack vai perguntar se quer notificar os novos assinantes (e-mail de boas-vindas).
   Avalie: quem veio do radar já recebeu o e-mail de resultado nosso — mandar um "boas-vindas"
   do Substack em cima pode ser redundante ou pode ser um bom reforço, critério seu.
4. Confirme a importação. Repita para o segundo arquivo (B).

## Observações

- As duas listas (A e B) são segmentos diferentes por natureza (quem fez o radar vs. quem só
  quer entrar no Lab) — decida se faz sentido tratá-los igual na newsletter ou se prefere manter
  alguma distinção manual do seu lado (o Substack no plano atual não tem segmentação nativa
  robusta).
- Não há deduplicação automática entre os dois arquivos nem contra assinantes que já existem no
  Substack — o próprio Substack ignora e-mails repetidos na importação, então não há risco de
  duplicar assinante.
- Fonte: [Central de Ajuda do Substack — importar lista de outra plataforma](https://support.substack.com/hc/en-us/articles/360037829931-How-do-I-import-my-mailing-list-from-another-platform-such-as-Mailchimp-Ghost-or-Beehiiv).
