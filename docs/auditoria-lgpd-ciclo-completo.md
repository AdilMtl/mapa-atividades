# Auditoria LGPD — ciclo completo de dado pessoal

> **Natureza deste documento:** levantamento factual de engenharia, não parecer jurídico. Feito
> em 09/08/2026, gatilho: preparação da ISSUE-601C (primeiro disparo em massa planejado da Série
> 600), quando o dono perguntou se o opt-in já estava coberto. A varredura acabou mostrando que a
> pergunta era maior do que a Série 600 — cobre o ciclo inteiro de captura de dado do produto.
> Reportamos o que existe e o que não existe no código; prioridade e decisão são do dono (e,
> quando fizer sentido, de um advogado — não é papel deste documento dizer o que é "obrigatório").

## 🔴 Achado mais urgente: funil legado `/pre-diagnostico` está ativo e envia e-mail sem consentimento

Diferente do que se assumia (que a 601C seria o primeiro disparo real do projeto), **o funil
legado já dispara e-mail em produção, agora**, para qualquer pessoa que acessar
`/pre-diagnostico` — a rota está publicada, sem gate, sem link nenhum na navegação atual (as tags
do GTM que apontavam pra ela foram pausadas na ISSUE-319B), mas continua respondendo se alguém
tiver o link salvo, indexado no Google, ou digitar a URL direto.

Fluxo: `EmailGate.tsx` pede nome + e-mail → `POST /api/prediag/lead` → grava em `roi_leads` →
`resend.emails.send(...)` dispara o e-mail de resultado **imediatamente, sem nenhum checkbox de
consentimento na tela**. Só existe uma frase solta dizendo que dá pra se descadastrar — sem
mecanismo que implemente isso.

Isso é uma decisão diferente da já tomada em 08/08 ("`roi_leads` fica de fora da Série 600") —
aquela decisão foi sobre **não usar** esse público nos novos templates; não foi sobre **desligar**
o funil legado, que continua rodando por conta própria.

## 1. Todo lugar que coleta dado pessoal identificável

| Origem | Tabela | O que grava | Gate/consentimento na tela |
|---|---|---|---|
| Radar (maturidade/oportunidades) | `radar_leads` | nome, e-mail | só checkbox "quero entrar no Lab" (`labInterest`) — nada sobre e-mail de marketing |
| Fila do Lab | `lab_leads` | e-mail, UTMs, IP | nenhum |
| **Pré-diagnóstico (legado, ativo)** | `roi_leads`, `roi_prediag_sessions`, `roi_events` | nome, e-mail, respostas do chat, IP, user-agent | **nenhum** — e ainda dispara e-mail na hora |
| Cadastro de conta | `auth.users`→`usuarios`/`profiles` | nome, e-mail, senha | nenhum checkbox de termos/privacidade no formulário |
| `authorized_emails` | — | e-mail, plano, validade | é convite manual do admin, não autosserviço |
| Feedback (widget) | `feedback` | mensagem, e-mail (opcional), IP, user-agent, rota, UTMs | nenhum |

`roi_events.email_hash` usa `base64(email)` — reversível, não é hash criptográfico de verdade
(nomenclatura enganosa no schema).

## 2. Consentimento explícito, por origem

Em **nenhuma** das seis origens acima existe um checkbox/toggle que a pessoa marque
especificamente para "aceito receber e-mail de marketing/newsletter". O único consentimento real
que existe hoje no produto é o checkbox "quero entrar no Lab" do radar (que é sobre acesso ao
produto, não sobre comunicação).

## 3. Exclusão e acesso aos próprios dados

Existe uma tela (`/perfil`, seção LGPD) com "Baixar meus dados" e "Deletar conta":
- **Baixar dados**: exporta `profiles` + `atividades` em JSON. Não inclui `radar_leads`,
  `roi_leads`, `lab_leads`, `feedback` — se a pessoa tiver dado nessas tabelas com o mesmo e-mail,
  esse dado não aparece no export.
- **Deletar conta**: apaga `profiles` e `atividades` de fato. A conta em `auth.users` **não é
  apagada pelo código** — o próprio comentário no arquivo diz que isso "requer admin API" e, "por
  segurança", só faz logout e mostra um aviso pedindo pra contatar o suporte, prometendo
  processamento em até 48h. **Não existe fila, log ou rota que processe esse pedido** — depende de
  alguém (você) lembrar manualmente.
- **Não encontrado**: qualquer forma de excluir ou exportar dado de quem nunca criou conta (leads
  do radar, do pré-diagnóstico, do Lab, ou feedback anônimo). Não há painel admin de "buscar por
  e-mail e apagar/exportar" nessas tabelas.
- **Não encontrado**: rota de descadastro (`/descadastrar` ou equivalente) — zero arquivos no repo.
- **Não encontrado**: qualquer registro (tabela, log) das solicitações de exclusão/acesso já
  feitas — mesmo que o processo seja manual, não há histórico do que foi pedido e quando.

## 4. Compartilhamento com terceiros

- **Resend** recebe nome+e-mail para enviar os e-mails (prediag e, futuramente, radar/Lab/601).
- **Supabase** hospeda todas as tabelas.
- **GTM/Google Ads/GA4**: conferido todo `dataLayer.push`/`gtag(...)` do repo — em nenhum caso
  nome ou e-mail são enviados, só eventos nomeados e valor de conversão (sem PII). Tracking limpo
  nesse quesito.
- **Não encontrado**: nenhum CRM, webhook, Zapier, Mailchimp, HubSpot, Segment, Mixpanel,
  Amplitude, Intercom, Sentry ou PostHog no código.

## 5. Discrepâncias entre a política de privacidade e o código

- Promete "se você topar" para newsletter/Lab (linha ~172-175) — sem controle de UI
  correspondente (achado original desta sessão).
- Promete "Nunca vendemos ou compartilhamos com terceiros" — consistente com o achado da seção 4.
- Promete exercício de direitos (portabilidade/exclusão) via `/perfil` — na prática, incompleto
  (seção 3 acima).
- Menciona cookies de métricas/anúncios bloqueáveis pelo navegador — **não encontrado** nenhum
  banner ou componente de consentimento de cookies no código.
- Contato do DPO é `privacidade@mapaatividades.com` — domínio da marca antiga ("Mapa de
  Atividades"), incoerente com "+Conversas no Corredor"; não verificado se a caixa ainda existe.
- Promete resposta em até 15 dias úteis — sem mecanismo que registre/rastreie prazo.

## 6. Retenção de dado

**Não encontrado** nenhum mecanismo de expiração/limpeza automática em nenhuma tabela de lead
(`roi_leads`, `radar_leads`, `lab_leads`, `feedback`). `authorized_emails.expires_at` existe, mas é
sobre validade de acesso ao produto, não sobre apagar dado pessoal. Tudo que já foi capturado —
mesmo lead nunca convertido, de qualquer data — permanece indefinidamente.

## O que já está em andamento (não é gap, é trabalho já iniciado)

- `marketing_unsubscribes` já existe (ISSUE-601A) — falta só a rota pública `/descadastrar` que
  grava nela (prevista como pré-requisito da ISSUE-601C, §3.4 da spec).
- A trava de "nenhum e-mail sai sem confirmação explícita do dono" já é critério de aceite fechado
  da 601C.

## Não coberto por nenhuma issue hoje

- Consentimento real (opt-in) na captura — nem no radar, nem no Lab, nem no pré-diagnóstico, nem
  no cadastro de conta.
- O funil `/pre-diagnostico` legado continuar ativo e enviando e-mail sem gate.
- Exclusão/exportação de dado de quem não tem conta (leads soltos).
- Registro/rastreamento de solicitações LGPD.
- Política de retenção/expiração de dado.
- Consistência entre a política de privacidade e o comportamento real do produto.
