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

**🔍 Diagnóstico feito em 2026-07-08 (`/corrigir-bug`, ISSUE-112 bloqueador 2.3):** o código do
fluxo (`(publico)/auth/page.tsx` → `supabase.auth.resetPasswordForEmail` →
`(app)/reset-password/page.tsx` → `supabase.auth.updateUser`) está correto, sem bug — chamada
direta na API do Supabase (`POST /auth/v1/recover`, com o e-mail do dono) devolveu `200 {}` sem
nenhum erro. Isso confirma que o problema não é código: o Supabase aceita o pedido e tenta
mandar o e-mail em background no próprio servidor; se o SMTP estiver mal configurado lá, a
falha é silenciosa — exatamente o sintoma relatado (tela diz "enviado", nada chega).
**Ação pendente, só o dono consegue fazer (painel do Supabase):**
1. **Authentication → Logs** (Auth Logs) do projeto `cuojmyqkezmpryeuyvqd`: filtrar por
   `recover`/`sendEmail` no horário do teste (2026-07-08) e ver se aparece erro de SMTP.
2. **Authentication → Settings → SMTP Settings**: confirmar se existe um provedor de SMTP
   customizado configurado. Se estiver vazio/usando o mailer padrão do Supabase, essa é a causa
   mais provável (o mailer padrão tem limite de envio muito baixo e não é confiável para
   produção) — a correção seria configurar SMTP customizado (dá pra reaproveitar as credenciais
   do Resend, que já funciona pros outros e-mails).
3. **Authentication → URL Configuration → Redirect URLs**: confirmar que
   `https://conversas-no-corredor.vercel.app/reset-password` está na allowlist (se não estiver,
   o link do e-mail — quando/se chegar — falharia ao tentar autenticar).
Sessão de teste real rodada com `adilson.matioli@gmail.com` em 2026-07-08 — conferir se chegou
(inclusive spam).

**✅ Resultado do teste (dono, 2026-07-08):** o e-mail **chegou** (não é spam, correção do relato
anterior) — mas o link de dentro dele leva para **`localhost`** em vez do site em produção.
Esse sintoma tem causa quase certa e é bem conhecida: o Supabase usa a **Site URL** configurada
no projeto como base do link quando o `redirectTo` enviado pelo código não está na allowlist de
**Redirect URLs** — e não erra, só troca silenciosamente pelo padrão. Como o projeto novo
(`cuojmyqkezmpryeuyvqd`, pós-migração v3.5.2) provavelmente herdou a configuração de
desenvolvimento (`http://localhost:3000`) e ninguém atualizou isso pra produção depois da
migração, o link sai apontando pra lá. **Não é bug de código** — `auth/page.tsx` já manda o
`redirectTo` certo (`window.location.origin` + `/reset-password`, ou seja, o domínio de onde a
pessoa está usando o site); o problema é a config do lado do Supabase não aceitar/usar esse
valor.
**Ação pra próxima sessão (painel do Supabase → Authentication → URL Configuration):**
1. **Site URL**: trocar de `http://localhost:3000` (suspeita) para
   `https://conversas-no-corredor.vercel.app`.
2. **Redirect URLs** (allowlist): garantir que
   `https://conversas-no-corredor.vercel.app/reset-password` está na lista (adicionar se não
   estiver). Vale conferir se outras rotas de auth (`/auth`, `/dashboard`) também precisam estar
   lá, dependendo do que mais usa redirect (ex.: confirmação de cadastro).
3. Depois de ajustar, repetir o teste (reset de senha de verdade) pra confirmar que o link novo
   aponta pro domínio certo.
A hipótese de SMTP/spam da rodada anterior fica descartada — o e-mail entrega bem, o problema é
só o link de destino.

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

## Pergunta pendente 8 — ✅ RESPONDIDA NA IMPLEMENTAÇÃO (ISSUE-106/109, 2026-07-07)

**Resposta final:** duplo trilho confirmado (dataLayer/GA4 + Supabase), mas a tabela NÃO é a
`roi_events` reusada como a premissa original sugeria — é `radar_events`, uma tabela nova
(decisão já tomada na ISSUE-106 por incompatibilidade de schema: FK de `roi_events` travada em
`roi_prediag_sessions`, coluna `payload` ≠ `properties`). A ISSUE-109 implementou o helper
`track()` e a rota `POST /api/radar/event` gravando nela. Views `vw_*` para Grafana continuam
para o fim da fase.

**Tema original:** Eventos de analytics — onde persistir (GTM/GA4 vs Supabase `roi_events` vs ambos)
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

## Pergunta pendente 12 — ✅ RESPONDIDA PELO DONO (2026-07-08, ISSUE-108)

**Tema:** Onde persistir o interesse na lista do Lab de quem visita `/lab` direto (sem ter
respondido um radar antes)
**Por que importa:** a ISSUE-108 previa reusar `api/radar/lead` (flag `lab_interest`) ou criar
rota própria. Na implementação, descobri que `api/radar/lead` exige `sessionId` de uma
`radar_sessions` já existente (`kind` só aceita `'maturidade'`/`'oportunidades'`) — inviável
para visita solta à `/lab` sem ter passado por um radar.
**Opções possíveis:**
a) Tabela nova e isolada (`lab_leads`), sem referenciar as tabelas do radar;
b) Relaxar o CHECK de `kind` em `radar_sessions`/`radar_leads` para aceitar `'lab'` e tornar
`session_id` opcional em `radar_leads`, reaproveitando a coluna `lab_interest` que já existe lá.
**Resposta do dono:** opção (a) — tabela nova e isolada. Risco menor: não mexe em schema já
validado em produção pelos radares. SQL em `docs/revamp/ISSUE-108-sql-lab-leads.md`.
**Bloqueia implementação?** Não. **✅ SQL rodado e verificado** (ainda na sessão da ISSUE-108,
08/07: `rowsecurity = true`, zero políticas, formulário do `/lab` testado e aprovado). Essa nota
tinha ficado desatualizada — o relatório de QA da ISSUE-112 e o topo do `CURRENT-STATUS.md`
chegaram a listar isso como "pendente" por engano; reconfirmado ao vivo em 09/07.

---

## Pergunta pendente 13 — ✅ RESPONDIDA PELO DONO (2026-07-09) — supera a pergunta 11

**Tema:** Prioridade do Sprint 4 (ISSUE-114-120, redesign DS2 da plataforma logada) vs. Fase 2
(Lab, ISSUE-301-305)
**Por que importa:** a pergunta 11 (2026-07-05) tinha decidido incluir o Sprint 4 no plano,
sequenciado antes da Fase 2. Ao reabrir o projeto depois da pausa do Supabase (migração
registrada em v3.5.2), o dono percebeu que o site ficou efetivamente inacessível pra qualquer
usuário durante boa parte desse período — não há uso real registrado da plataforma logada atual
(ROI do Foco: mapa, diagnóstico, plano de ação, kanban).
**Resposta do dono:** restylar 6 páginas de um produto sem uso comprovado não é mais prioridade.
A plataforma logada atual vira **legado**: segue no ar, sem quebrar, mas sem novo investimento
de design planejado por ora (o Sprint 4 fica pausado, não cancelado — pode retomar se a
percepção de uso mudar). No lugar dela, o dono quer avançar para uma **nova proposta de valor**
atrás do login — que, ao revisar o backlog, é essencialmente o que a **Fase 2 (Lab)** já
descrevia (ISSUE-301 Wizard, 302 classificação de solução, 303 Builder Canvas, 304 PRD Kit, 305
área premium + Stripe). Decisão: promover a Fase 2 pra logo depois do gate da ISSUE-112 fechar,
sem esperar o Sprint 4 nem o ciclo de growth da Fase 1.5.
**Consequências para o plano:**
- `03_implementation_plan.md` (Sprint 4) e `04_issue_backlog.md` (ISSUE-114 a 120) marcados
  como ⏸️ pausados, com o motivo registrado — não deletados, ficam mapeados pro caso de retomar.
- `04_issue_backlog.md` (Fase 2) marcada como 🔼 promovida — ainda precisa de sessão de
  planejamento dedicada pra detalhar cada issue antes de codar (o resumo atual é só esqueleto).
- Fase 1 (funil público de radares) segue até o fim normalmente — é o motor de aquisição que
  alimenta de leads qualquer coisa que a Fase 2 construir; não foi descontinuada.
**Bloqueia implementação?** Não — decisão registrada, código de 101/102 (fundação/DS2) segue
válido e reaproveitável se o Sprint 4 for retomado no futuro.

---

## Pergunta pendente 14 — ✅ RESPONDIDA PELO DONO (2026-07-09) — decisões de abertura da Fase 1 do Lab

**Tema:** as 5 decisões bloqueantes do plano da Fase 1 do Lab (`13_plano_fase1_lab.md` §10).
**Contexto:** o handoff estratégico (`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`)
redefiniu a Fase 2 como uma Jornada Guiada de Construção única; o plano detalhado virou o doc 13
e levantou 5 decisões antes de codar.
**Respostas do dono (2026-07-09):**
1. **Acesso na 1A:** beta fechado por convite — o dono libera manualmente 10–20 pessoas da
   lista de espera (`lab_leads` → `authorized_emails` com `plan_type='lab_beta'`). Free tier
   real só na 1C (Stripe).
2. **Conteúdo dos primeiros ativos da biblioteca:** Claude rascunha a partir do `content.ts`
   dos radares + material editorial; **nada publica sem aprovação do dono** (ISSUE-316).
3. **Convivência com o legado (ROI do Foco):** link discreto no LabShell **só para assinantes
   antigos**; convidados novos do beta não veem o legado na navegação.
4. **Largada:** Fase 1A do Lab começa **já, em paralelo** às pendências do launch do funil
   (roteiro §4 da ISSUE-112 + performance) — as primeiras issues (310 SQL, 312 motor puro) não
   tocam nada público.
5. **IA da Fase 1B:** usa a **API da OpenAI** (o dono só tem chave OpenAI), com modelo barato —
   supera a suposição original de Claude API no doc 13. Zero IA na 1A de qualquer forma.
- *(Não bloqueante, default assumido: as perguntas do wizard — handoff §8.1.2 — serão revisadas
  junto com o dono na abertura da ISSUE-313, antes de codar a tela.)*
**Consequências:** ISSUE-301–304 marcadas como superseded pela série 310+ no
`04_issue_backlog.md`; ISSUE-305 absorvida pela 325; ISSUE-306 pela 316/326.
**Bloqueia implementação?** Não — tudo decidido; próxima execução é ISSUE-310 + ISSUE-312.

---

## Pergunta pendente 15 — ✅ RESPONDIDA PELO DONO (2026-07-09) — reformulação do wizard do Lab (ISSUE-313 v2)

**Tema:** o dono revisou a spec v1 do wizard (formulário de 4 passos) e **rejeitou**: engessada,
ignorava a maturidade da pessoa, assumia que toda entrada é um problema (nos workshops a maioria
chega com **ideia de ferramenta** — dashboard, organizador, tela de input, consolidador), e
pedia o que a pessoa não sabe responder (impacto). Pediu formato de **conversa convergente com
árvore de decisão**, como consultor — heurística combinada com IA pra reduzir custo de tokens.
**Respostas do dono (2026-07-09, sessão de reformulação):**
1. **Entradas reais:** ideia de ferramenta pronta (mais comum) + dor/tarefa + vontade difusa.
   Ancorar sempre num **benefício claro** (vender internamente) — nunca campo livre de impacto.
2. **Método de referência:** o workshop de vibe code do dono (ideia → persona expert → "grill
   me session" até conhecimento compartilhado → PRD → construir menor que a ambição → testar →
   memória/versão). O wizard v2 é a versão produto desse fluxo.
3. **Resultado:** proposta + 1–2 alternativas vizinhas, escolha assistida (impacta a ISSUE-314:
   diagnóstico vira proposta escolhida, não veredito).
4. **IA na 1A:** "desenhar e decidir vendo" — árvore 100% heurística com 2 pontos de IA
   marcados (leitura do relato + redação do espelho), fallback obrigatório, custo <R$0,01 por
   projeto; a decisão de antecipar a infra (ISSUE-320) fica pra quando o dono vir a spec v2.
**Rodada 2 (mesma data — refinamento da v2 → v2.1):** o dono apontou a fragilidade da
heurística aberta (dicionário de palavras-chave sobre texto livre "parece robusto mas só
funciona pra casos específicos") e deu a experiência-alvo ("ele entendeu minha realidade,
consigo fazer, ganho real, com as ferramentas que tenho acesso, e impressiono meu chefe").
Decisões adicionais:
5. **Texto livre nunca classifica na 1A** — vira cor opcional no fechamento; a IA da 1B
   categoriza esse texto DENTRO do framing da heurística (mesmos ids fechados) — princípio
   "IA sugere, heurística decide, pessoa confirma".
6. **IA só na ISSUE-320** — decisão fechada (slots prontos no código com fallback).
7. **Arsenal/ambiente entra no wizard** (`ambiente[]`): o público SEMPRE tem alguma IA de
   janela ("tem que ter IA", inclusive shadow AI ética/uso pessoal); o plano recomenda só o
   que cabe no arsenal; `amb_shadow` + dado sensível → diligência ativa na hora.
8. **Teto de perguntas delegado ao design** com a referência do onboarding do Foodvisor
   (formato variado + progresso visível > brevidade) → 4 blocos nomeados, ~14 interações.
9. **Desempate condicional aprovado** com transparência ("tá entre dois caminhos").
**Consequências:** spec v2.1 consolidada em `ISSUE-313-spec-wizard.md`; nasce
`wizard_answers.schema_version = 2` (v1 congelado); `decidirOportunidade` intocado +
adaptador v2; `plan-generator` ganha `ambiente?` (extensão aditiva); **auditoria exaustiva de
todas as combinações fechadas vira critério de aceite** (robustez por construção);
`ferramentas` do perfil (317) vira espelho do `ambiente[]`; `urgencia`/`impacto_esperado`
fora da 1A.
**Bloqueia implementação?** Não mais — o dono aprovou a v2.1 na mesma data ("está robusta")
e o motor completo foi implementado e auditado na sequência (700k combinações, 125 testes;
detalhe no CURRENT-STATUS v3.11.5). A UI da 313 depende só da ISSUE-311 (LabShell), próxima
elegível.

## Pergunta pendente 16 — ✅ RESPONDIDA PELO DONO (2026-07-10/11) — UX/UI do wizard e política de animação do Lab

**Contexto:** antes de implementar a UI da 313, o dono pediu uma sessão de design ("que não
seja um formulário — algo se construindo na tela"). Decisões, respondidas via
AskUserQuestion + conversa:

1. **Metáfora protagonista: "Notas do consultor"** — o espelho incremental da spec deixa de
   ser rodapé e vira uma folha de notas MANUSCRITAS que se escreve sozinha enquanto a pessoa
   responde (referência do dono: "diário do Voldemort", escrita da esquerda pra direita).
   Fonte cursiva **Caveat** (Google Fonts via `next/font`, carregada SÓ na rota do wizard —
   layout raiz intocado, trava de tracking). Beat curto de "anotando…" (lápis + pontinhos)
   antes de cada linha = o "background action" que o dono queria.
2. **Layout: split-screen no desktop** (pergunta à esquerda, notas à direita, sticky);
   coluna única no mobile com notas compactas/expansíveis no topo.
3. **Ritmo: ágil e fluido** — transições 0.18–0.28s, beats de ~380ms; nada de "consultor
   deliberado" lento.
4. **Política de animação do Lab (camadas):** camada 1 = framer-motion (já no projeto);
   camada 2 = ícones lucide ANIMADOS no padrão pqoqubbw/icons (MIT) — código copiado pra
   dentro (`IconesAnimados.tsx`), zero dependência nova, zero CDN/host externo; camada 3
   (Lottie/Rive) = **vetada por ora** — se um momento-herói pedir no futuro, a preferência
   do dono é criar assets PRÓPRIOS dentro do repo (e aí avaliar Rive, não Lottie).
   `prefers-reduced-motion` respeitado em tudo.

**Consequências:** UI da 313 implementada nesta sessão sob essas decisões (v3.11.7);
`NotasConsultor`/`IconesAnimados` viram o padrão de "vida" das telas seguintes do Lab
(314/315) — não introduzir outra biblioteca de animação sem reabrir esta pergunta.
**Bloqueia implementação?** Não.

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
| 8 | ✅ RESPONDIDA: analytics em duplo trilho (GTM + Supabase); tabela é `radar_events` (nova), não `roi_events` reusada — schema incompatível, decidido na ISSUE-106, implementado na ISSUE-109 | Não |
| 9 | ✅ RESPONDIDA: home nova MANTÉM a tabela de pricing (decisão do dono) | Não |
| 10 | ✅ RESPONDIDA: funil novo usa o MESMO label de conversão Google Ads do funil atual; separação de labels entra no "plano de melhoria de Google Ads" (Fase 1.5, ISSUE-208) | Não |
| 11 | ⚠️ SUPERADA pela pergunta 13 (2026-07-09): a Fase 1B/Sprint 4 (ISSUES 114–120) foi pausada — ver linha 13. A home preserva o showcase da ferramenta (4 vídeos de demo) na seção "A plataforma em ação", isso continua valendo | Não |
| 12 | ✅ RESPONDIDA (2026-07-08, ISSUE-108): interesse no Lab de visita solta vai para tabela nova e isolada `lab_leads` (não reusa `radar_leads`/`radar_sessions`) | Não |
| 14 | ✅ RESPONDIDA (2026-07-09): Fase 1A do Lab = beta fechado por convite; ativos rascunhados pelo Claude com aprovação do dono; legado visível só p/ assinantes antigos; largada em paralelo ao launch do funil; IA da 1B via OpenAI (modelo barato) | Não |
| 13 | ✅ RESPONDIDA (2026-07-09): Sprint 4 (114-120, restyle da plataforma logada) **pausado** — sem uso real comprovado. Fase 2 (Lab, 301-305) **promovida** pra logo depois do gate da ISSUE-112 fechar | Não |
