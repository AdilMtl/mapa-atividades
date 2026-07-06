# 00b — Perguntas Pendentes

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Regra: pergunta que não bloqueia recebe uma **premissa assumida** e o trabalho segue.
> Pergunta que bloqueia está marcada e precisa de resposta do dono antes da issue correspondente.

---

## Pergunta pendente 1 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Tema:** Entrega de e-mail para leads (Resend)
**Resposta do dono:** o e-mail do pré-diagnóstico **está entregando normalmente via Resend**
(corrigido em sessão recente — a pendência de sandbox registrada na v3.5.2/v3.5.3 está
superada). Estratégia definida: **e-mail transacional só para quem completa o
pré-diagnóstico/radar**; domínio próprio fica adiado até o volume escalar — por enquanto,
seguimos no plano gratuito do Resend. Mapear essa decisão no projeto.
**Consequências para o plano:**
- ISSUE-113 (e-mail de trilha do funil novo) está **destravada** — usa a mesma infra Resend
  que já entrega hoje;
- Nenhuma página promete e-mail fora do contexto pós-radar/pré-diagnóstico;
- Quando o volume escalar, reabrir a decisão de domínio próprio (registrar em Fase 1.5/2).
**🐛 Bug conhecido registrado (fora do escopo do revamp):** o e-mail de **reset de senha**
NÃO está chegando (fluxo Supabase Auth → SMTP). Todos os demais e-mails do Resend saem
corretos. Corrigir em sessão separada com `/corrigir-bug` (provável relação com a config SMTP
do projeto Supabase novo pós-migração v3.5.2). Não misturar com issues do revamp.
**Bloqueia implementação?** Não.

---

## Pergunta pendente 2 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Resposta do dono:** `/diagnostico` fica exatamente como está (funciona bem, vira referência);
os radares novos nascem em páginas próprias. Rotas adotadas: `/radar/maturidade` e
`/radar/oportunidades` (recomendação aceita implicitamente — dono aprovou "criar em outras
páginas").

**Tema original:** Conflito de rota `/diagnostico`
**Por que importa:** o Documento Operacional (§7.1) propõe `/diagnostico` para o Radar de
Maturidade, mas `/diagnostico` já é uma página autenticada do produto ROI do Foco (análise de
foco do assinante). Sobrescrever quebraria a plataforma logada.
**O que encontrei nos documentos/código:** rota ativa em `src/app/diagnostico/page.tsx` (754
linhas, produto real).
**Opções possíveis:**
a) Novas rotas `/radar/maturidade` e `/radar/oportunidades` (namespace limpo, URLs descritivas);
b) `/maturidade` e `/oportunidades` na raiz;
c) Renomear a página legada (arriscado: quebra links/bookmarks de assinantes).
**Recomendação inicial:** opção (a) — namespace `/radar/*` agrupa as duas ferramentas, deixa
espaço para futuras (`/radar/...`), e o slug composto ajuda SEO ("radar de maturidade em IA").
**Bloqueia implementação?** Não — premissa assumida: opção (a). Reverter é barato antes do launch.

---

## Pergunta pendente 3 — ✅ CONFIRMADA PELO DONO (2026-07-05)

**Resposta do dono:** o design system oficial é o da pasta GPT Project Revamp — o visual
ESCURO (Dark Editorial Atelier), incluindo os exemplos do arquivo HTML
(`conversaas_design_system_v1_final.html`) como referência visual concreta. Receitas extraídas
para execução: `08_diretrizes_visuais_ds2.md`.

**Tema original:** Paleta — "creme quente" (benchmark) vs "Dark Editorial Atelier" (Design System v1 final)
**Por que importa:** dois documentos apontam direções opostas de fundo (claro vs escuro).
**O que encontrei nos documentos/código:** o benchmark (§13.4) sugere "creme quente como base";
o `conversaas_design_system_v1_final.md` declara **decisão oficial**: Dark Editorial Atelier,
paleta Orange/Magenta sobre verde-escuro profundo, com status "Design System v1: concluída".
**Opções possíveis:** seguir o DS final; reabrir a decisão.
**Recomendação inicial:** o DS v1 final é cronologicamente posterior e se autodeclara decisão;
o benchmark era exploratório. **Seguir o Dark Editorial Atelier.** Bônus: é evolução natural do
site atual (que já é escuro com laranja) — menor choque para usuários existentes.
**Bloqueia implementação?** Não — conflito registrado e resolvido por precedência documental.

---

## Pergunta pendente 4 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Resposta do dono (CORRIGIDA em 2026-07-05, durante a aprovação dos mocks):** a plataforma
chama-se **"+ConverSaaS"** (confirmando o naming do Design System doc), sempre apresentada
como **"o ecossistema virtual da newsletter Conversas no Corredor"** — submarca visível desde
a home, com apresentação moderna e profissional. A interpretação anterior ("+Conversas") foi
descartada pelo dono ao revisar a prévia final. Coincide com o nome já usado no PWA/manifest.

**Tema original:** Nome público da plataforma — "+ConverSaaS" aparece na Fase 1?
**Por que importa:** o DS define arquitetura de marca (Conversas no Corredor = marca-mãe,
+ConverSaaS = plataforma). A UI atual mistura os dois (navegação usa "+Conversas no Corredor",
PWA usa "+ConverSaaS"). Copy da home nova precisa saber qual nome usar.
**O que encontrei nos documentos/código:** DS v1 §"Arquitetura de marca"; manifest do PWA.
**Opções possíveis:**
a) Home fala "Conversas no Corredor" (marca-mãe) e usa "+ConverSaaS"/"Lab" apenas para a área
de ferramentas;
b) Rebrand completo da plataforma para +ConverSaaS já na Fase 1.
**Recomendação inicial:** opção (a). A Fase 1 vende a tese editorial; o nome da plataforma
ganha protagonismo quando o Lab existir de verdade (Fase 2). Evita explicar dois nomes para
visitante frio.
**Bloqueia implementação?** Não — premissa assumida: opção (a).

---

## Pergunta pendente 5 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Resposta do dono:** integração com a newsletter **não existe hoje** — e está ok assim por
enquanto. A newsletter (Substack) intermedia a assinatura paga; o volume é baixíssimo (meses
sem assinante pago novo); quando alguém paga, o dono autoriza manualmente e envia e-mail
específico. Dono pediu para **mapear um fluxo direto com Stripe** como solução futura —
mapeado em detalhe na **ISSUE-305** (Checkout → webhook → `authorized_emails` → boas-vindas
automáticas). Para a Fase 1 vale a premissa original: lead no nosso banco + CTA/embed do
Substack na tela de resultado + import CSV manual pelo dono.

**Tema original:** Integração real com a newsletter (Substack não tem API pública de subscribe)
**Por que importa:** a Fase 1 promete "captura de e-mail → entra na newsletter". Tecnicamente,
não dá para inscrever alguém no Substack via API a partir do nosso formulário.
**O que encontrei nos documentos/código:** hoje o fluxo é: lead salvo em `roi_leads` → e-mail
com CTA para `substack.com/subscribe` → pessoa se inscreve manualmente. O Substack aceita
import de CSV pelo dono.
**Opções possíveis:**
a) Manter o padrão atual: capturamos o lead no nosso banco, CTA forte para o subscribe do
Substack na tela de resultado + no e-mail; dono importa CSV de leads periodicamente;
b) Embed do formulário do Substack (iframe) na tela de resultado;
c) Trocar de provedor de newsletter (fora de escopo — decisão de negócio grande).
**Recomendação inicial:** (a) + (b) combinados: lead no nosso banco (dado nosso, métricas
nossas) e embed/CTA do Substack imediatamente após o resultado. Documentar a rotina de import
CSV como processo do dono.
**Bloqueia implementação?** Não — premissa assumida: (a)+(b).

---

## Pergunta pendente 6 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Resposta do dono:** o `/pre-diagnostico` fica em **backstage** — a página continua no ar e
funcionando (quem tem o link direto, incluindo campanhas atuais, continua atendido e a
conversão continua disparando), mas a home nova **não linka para ele**: os CTAs vão para os
radares novos. O pré-diagnóstico em si será reformulado depois ("vamos mudar o pré-diagnóstico
e tudo depois") — até lá, NINGUÉM toca no código dele. Redirecionamento de campanhas para os
radares: decisão futura do dono com dados (Fase 1.5, ISSUE-201/208).

**Tema original:** Destino do funil `/pre-diagnostico` e das campanhas de Ads atuais
**Por que importa:** é a fonte de leads e conversão HOJE, com campanha ativa. Qualquer plano
que o remova ou canibalize sem transição controlada arrisca receita/leads.
**O que encontrei nos documentos/código:** documentos do revamp nem mencionam o funil atual —
lacuna real dos docs. Trava do projeto: tracking intocável.
**Opções possíveis:**
a) Coexistência: Fase 1 lança as novas páginas SEM tocar no `/pre-diagnostico`; campanhas
novas (clusters de IA) apontam para as páginas novas; campanhas de produtividade continuam no
funil velho até o novo provar conversão;
b) Cutover imediato de todas as campanhas no launch.
**Recomendação inicial:** (a). Migração de campanha é decisão de mídia guiada por CPL, tomada
na Fase 1.5 com dados. O `/pre-diagnostico` só é aposentado (redirect 308) quando o novo funil
igualar ou superar o CPL.
**Bloqueia implementação?** Não — premissa assumida: (a). A migração em si (Google Ads) é
operação do dono, fora do código.

---

## Pergunta pendente 7

**Tema:** Refactor do root layout (client → server) na Fase 1
**Por que importa:** sem layout server-side não existe Metadata API → SEO por página (title,
description, OG) fica impossível — e SEO básico é entrega obrigatória da Fase 1. Mas o layout
atual carrega o GTM (tracking intocável) e o gate de auth da plataforma.
**O que encontrei nos documentos/código:** `src/app/layout.tsx` é `'use client'`, faz
`supabase.auth.getSession()` em todas as páginas, allowlist de rotas públicas hardcoded, GTM
inline, meta tags manuais no `<head>`.
**Opções possíveis:**
a) Refactor estrutural: layout raiz vira Server Component; auth-gate + navegação viram um
client component (`AppShell`) aplicado só às rotas privadas (route group `(app)`); páginas
públicas ficam em route group `(publico)` sem gate; GTM preservado byte a byte;
b) Mínimo: manter client layout, só adicionar as rotas novas na allowlist (SEO continua ruim);
**Recomendação inicial:** (a), como PRIMEIRA issue técnica da Fase 1, com validação explícita
do disparo de conversão e do PWA antes de qualquer outra página nova. É o alicerce; fazer
depois custaria retrabalho em todas as páginas novas.
**Bloqueia implementação?** Não bloqueia o início, mas é pré-requisito das demais issues de
página. Risco gerenciado com a persona Analytics & Ads no QA.

---

## Pergunta pendente 8

**Tema:** Eventos de analytics — onde persistir (GTM/GA4 vs Supabase `roi_events` vs ambos)
**Por que importa:** os documentos pedem ~15 eventos novos; o projeto já tem dois trilhos
(dataLayer/GTM → GA4, e tabela `roi_events` → views `vw_*` → Grafana).
**O que encontrei nos documentos/código:** funil atual grava `roi_events` via API; Grafana lê
as views. GTM container `GTM-PDJ2K5BX` ativo.
**Opções possíveis:**
a) Duplo trilho, igual ao funil atual: dataLayer push (GA4 via GTM) + INSERT em tabela de
eventos no Supabase (novas views para Grafana);
b) Só GTM/GA4;
c) Só Supabase.
**Recomendação inicial:** (a) — mantém o padrão da casa, preserva o dashboard Grafana como
fonte executiva e o GA4 para mídia. Reusar a tabela `roi_events` com um campo de origem
(`funnel: 'radar'`) em vez de criar tabela nova, para aproveitar views existentes — confirmar
schema na implementação.
**Bloqueia implementação?** Não — premissa assumida: (a).

---

## Pergunta pendente 9 — ✅ RESPONDIDA PELO DONO (2026-07-05)

**Resposta do dono:** **manter o pricing na home nova** (contra a recomendação inicial —
decisão de negócio do dono, registrada). A tabela de preços da newsletter (R$0 / R$15 mensal /
anual) permanece na homepage, adaptada ao Design System novo. A ISSUE-107 incorpora a seção de
pricing no layout novo.

**Tema original:** Preço/monetização exibidos na home nova
**Por que importa:** a home atual mostra pricing (R$0 / R$15 mensal / anual) da newsletter.
A Fase 1 muda a conversão-fim para "assinar newsletter (grátis)" + lista do Lab. Mostrar preço
de premium que ainda não existe contradiz a estratégia ("premium em breve, sem vender").
**O que encontrei nos documentos/código:** benchmark sugere R$15–29/mês futuro via Stripe;
docs da Fase 1 mandam não vender premium agora. Assinantes pagos atuais (via Substack) ganham
acesso à plataforma ROI do Foco pelo `authorized_emails`.
**Opções possíveis:**
a) Home nova sem tabela de pricing; seção Lab "em breve" + lista de interesse; acesso de
assinantes continua pelo login discreto;
b) Manter pricing da newsletter na home nova.
**Recomendação inicial:** (a). O pricing atual é da *newsletter paga* (produto antigo na
narrativa antiga). Na Fase 1 a régua é: frio → newsletter grátis; quente → lista do Lab.
**Bloqueia implementação?** Não — premissa assumida: (a). **Atenção:** é uma decisão de
negócio visível; o dono deve vetar aqui se discordar.

---

## Resumo executivo das premissas assumidas

| # | Premissa (segue valendo salvo veto do dono) | Bloqueio |
|---|---|---|
| 1 | ✅ RESPONDIDA: e-mail entrega via Resend (plano gratuito); só quem completa radar/pré-diag recebe; domínio próprio adiado até escalar; bug do reset de senha registrado à parte | Não |
| 2 | ✅ RESPONDIDA: `/diagnostico` intocado; radares em `/radar/maturidade` e `/radar/oportunidades` | Não |
| 3 | ✅ CONFIRMADA: visual escuro do DS oficial da pasta GPT Project Revamp, com o `.html` como referência; receitas em `08_diretrizes_visuais_ds2.md` | Não |
| 4 | ✅ RESPONDIDA (corrigida): plataforma = **"+ConverSaaS"**, apresentada como "o ecossistema virtual da newsletter Conversas no Corredor", desde a home | Não |
| 5 | ✅ RESPONDIDA: sem integração hoje; assinatura paga manual via Substack; fluxo direto Stripe MAPEADO na ISSUE-305 para o futuro; Fase 1 = lead no banco + CTA/embed Substack + CSV manual | Não |
| 6 | ✅ RESPONDIDA: `/pre-diagnostico` em BACKSTAGE — no ar e funcionando, mas sem nenhum link na home nova; CTAs vão para os radares; reformulação dele fica para depois | Não |
| 7 | Refactor layout server-first é a primeira issue técnica | Não |
| 8 | Analytics em duplo trilho (GTM + Supabase), reusando `roi_events` | Não |
| 9 | ✅ RESPONDIDA: home nova MANTÉM a tabela de pricing (decisão do dono) | Não |
| 10 | ✅ RESPONDIDA: funil novo usa o MESMO label de conversão Google Ads do funil atual; separação de labels entra no "plano de melhoria de Google Ads" (Fase 1.5, ISSUE-208) | Não |
| 11 | ✅ NOVA (decisão do dono 2026-07-05): o plano inclui a **Fase 1B — redesign DS2 da plataforma logada** (ISSUES 114–120) e a home preserva o showcase da ferramenta (4 vídeos de demo) na seção "A plataforma em ação" | Não |
