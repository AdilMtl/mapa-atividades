# 04 — Issue Backlog

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Numeração: 1xx = Fase 1 · 2xx = Fase 1.5 · 3xx = Fase 2 · 4xx = Fase 3 · 5xx = Fase 4.
> Regra: uma issue por sessão; escopo excluído é tão vinculante quanto o incluído.
> Antes de executar qualquer issue: ler `README.md` do revamp + a issue inteira + checar
> `00b_open_questions.md`.

---

## FASE 1 — Essencial para o revamp

## ISSUE-101 — Layout server-first + route groups (fundação)

**Status:** ⚠️ parcial em 2026-07-05 — código completo e validado localmente (tsc/lint/build
verdes, GTM byte-idêntico confirmado por diff, 15 rotas respondendo 200 em `build && start`,
meta PWA equivalente 1:1 no HTML renderizado); falta a validação do dono em preview: conversão
do funil legado no Tag Assistant + instalação/navegação do PWA em navegador real.
**Nota de implementação:** `/privacidade` foi para o grupo `(app)` (não `(publico)` como o
rascunho da árvore em `02_technical_spec.md` §3.1 sugeria) — hoje ela está fora da allowlist
(anônimo é redirecionado) e na sidebar de logado; o critério "matriz rota×estado idêntica"
prevalece. Tornar a política de privacidade pública fica como decisão futura (nova issue).

**Fase:** 1
**Tipo:** Frontend / Arquitetura
**Prioridade:** Alta
**Complexidade:** Alta
**Modelo recomendado:** Fable 5
**Objetivo:** destravar Metadata API e páginas públicas novas sem gate de auth, preservando
tracking, PWA e plataforma logada byte a byte no comportamento.
**Contexto:** `src/app/layout.tsx` é client component com gate de auth + allowlist hardcoded +
GTM + meta manuais (ver `02_technical_spec.md` §2–3.1). **Ler `07_mapa_tracking_ads.md` antes
de começar** — inventário dos marcadores e checklist de validação obrigatório.
**Escopo incluído:** layout raiz vira Server Component (html, GTM idêntico, metadata base,
next/font, globals); route groups `(publico)` e `(app)` sem mudar URLs; gate+sidebar atuais
extraídos para `(app)/layout.tsx` client; PWA meta → metadata/viewport exports.
**Escopo excluído:** qualquer mudança visual; qualquer página nova; mexer em EmailGate/prediag.
**Arquivos prováveis:** `src/app/layout.tsx`, `src/app/(app)/layout.tsx` (novo), moves de
`page.tsx` entre grupos, `src/app/globals.css` (só import de fonte se necessário).
**Dependências:** nenhuma.
**Critérios de aceite:** matriz rota×estado idêntica ao comportamento atual; conversão do funil
legado dispara em preview (Tag Assistant); PWA instala e navega (`build && start`);
`tsc`/`lint`/`build` verdes; nenhuma URL mudou.
**Riscos:** quebrar conversão (mitigar com diff byte a byte do GTM); SW cacheado servindo shell
antigo (testar hard refresh); fluxo reset-password.
**Notas para implementação:** mover arquivos com `git mv` para preservar histórico; PR com
screenshot do Tag Assistant.

## ISSUE-102 — Design System v2 no código (Dark Editorial Atelier)

**Status:** ✅ concluída em 2026-07-06 — tokens DS2 em `globals.css` (+ `@theme` Tailwind v4),
fontes Fraunces/IBM Plex via `next/font/google` no layout raiz, export `DS2` em
`design-system.ts` (sem tocar `DESIGN_TOKENS`), 10 componentes em `src/components/ds2/`
(Button, Card, Badge, Module/ModuleHead, Progress, Panel, GridSection, Eyebrow, SectionTitle,
PageContainer). `tsc`/`lint`/`build` verdes, 24 rotas, GTM byte-idêntico (diff), spot-check
`/`, `/dashboard`, `/pre-diagnostico` em 200 com fontes DS2 aplicadas só ao `<html>` (body
legado mantém `font-family` própria — zero regressão visual). Contraste AA verificado nos
pares texto/fundo do token set contra `--ds2-bg-app` (pior caso, `text-subtle`, ~4,66:1).
Ainda não há página consumidora (nasce na ISSUE-103/107).

**Fase:** 1
**Tipo:** UI / Frontend
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet (revisão final: Fable 5)
**Objetivo:** tokens, fontes e componentes base do DS v1 final disponíveis para as páginas novas.
**Contexto:** `conversaas_design_system_v1_final.md` é a decisão oficial (paleta, tipografia,
componentes); coexistência com DESIGN_TOKENS v1 do legado (ver `02` §3.2 e `03` §9).
**Escopo incluído:** CSS vars + `@theme` Tailwind v4 em `globals.css` (valores literais do DS);
next/font (Fraunces, IBM Plex Sans, IBM Plex Mono); `src/components/ds2/` (Button, Card,
Badge, Module, Progress, GridBackground, SectionTitle); `DS2` em `design-system.ts` sem tocar
no export antigo.
**Escopo excluído:** migrar qualquer página legada; tocar `components/ui/*`.
**Arquivos prováveis:** `src/app/globals.css`, `src/lib/design-system.ts`,
`src/components/ds2/*` (novos), `src/app/layout.tsx` (classes de fonte).
**Dependências:** ISSUE-101 (fontes no server layout).
**Critérios de aceite:** componentes renderizam conforme specs CSS do DS doc; contraste AA nos
pares texto/fundo usados; zero regressão visual nas páginas legadas (spot check dashboard e
pre-diagnostico); build verde.
**Riscos:** colisão de variáveis CSS com o tema legado (prefixar se preciso); fontes mudando
layout legado (aplicar só via classes DS2).
**Notas para implementação:** copiar valores hex/rgba literalmente do doc — não "melhorar".

## ISSUE-103 — Páginas /radar/maturidade e /radar/oportunidades

**Status:** ✅ concluída em 2026-07-07 — `RadarFlow` compartilhado (`src/components/radar/`) +
páginas `src/app/(publico)/radar/{maturidade,oportunidades}/page.tsx` (Server Components com
metadata própria, delegando a UI interativa ao client component). Card de produto (Module/Eyebrow/
Progress do DS2) com pergunta única, auto-avanço (framer-motion), voltar e "continuar" ao revisitar
pergunta já respondida. Gráfico radar via `recharts` (7 eixos na maturidade, 6 no teaser de
oportunidades). Escada de captura implementada: maturidade sempre mostra resultado completo (CTA
ponte + e-mail suave opcional); oportunidades mostra teaser sem e-mail e destrava o diagnóstico
completo (8 blocos + Na prática + cruzamento + diligência) só após o gate. Cruzamento de maturidade
via `sessionStorage['conversaas.radar.maturidade']` (helper fora de `lib/radar/`, que permanece
puro) + CTA cruzado nos dois sentidos. Conversão Google Ads replicada do padrão do `EmailGate`
(`gtag('event','conversion', …)` só quando `triggerConversion: true` na resposta do lead de
oportunidades) — `layout.tsx`/GTM intocados.
**Validação:** `lint`/`tsc --noEmit`/`build` (28 rotas) e os 37 testes de `lib/radar` verdes;
`npm run build && npm run start` com as duas rotas retornando 200 e a pergunta 1 de cada radar
presente no HTML; fluxo real de sessão testado via curl (`POST`/`PATCH /api/radar/session`
funcionando ponta a ponta; `POST /api/radar/lead` validado — bloqueado pelo rate limit residual
dos testes da ISSUE-106 no mesmo IP, confirmando que a validação de payload passou antes do 429).
⚠️ **Não verificado** (sem ferramenta de browser neste ambiente): fluxo clicado de ponta a ponta
no navegador e o Lighthouse a11y ≥90 citado nos critérios de aceite — recomenda-se conferência
manual do dono antes de considerar 100% fechado.
**Fase:** 1
**Tipo:** Frontend / UX
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet
**Objetivo:** as duas experiências interativas navegáveis ponta a ponta (pergunta → resultado →
captura), mobile-first.
**Contexto:** especificação funcional em `01_product_spec_faseada.md` §6–7; UX: uma pergunta
por tela, progresso, voltar.
**Escopo incluído:** `RadarFlow.tsx` compartilhado; páginas nos dois slugs com metadata própria;
integração com `lib/radar` (motor) e com as rotas de API (session no início, lead na captura);
CTA cruzado entre radares; estado de "resultado sem e-mail" digno.
**Jornada de captura (escada, ver [10_jornada_captura_radares.md](10_jornada_captura_radares.md)):**
o `RadarFlow` tem **dois estados finais parametrizáveis por radar** — **maturidade** termina em
resultado **completo aberto** (sem gate) + CTA-ponte obrigatório para o oportunidades;
**oportunidades** termina em **teaser aberto** (direção da oportunidade) + **gate de e-mail** →
diagnóstico completo na tela. O gate **não** bloqueia ver o teaser. Maturidade tem captura de
e-mail apenas suave/opcional.
**Decisões de UX (dono, 2026-07-06 — ver [11_motor_radar_pesos_personas.md](11_motor_radar_pesos_personas.md) §1):**
formato = **card de produto** ("janela de app" do mock do hero: pergunta em card DS2, opções
grandes, contador N/8, progresso, auto-avanço, voltar, transições framer-motion) — **não** o
formato chat do `/pre-diagnostico`; resultado com **gráfico radar** (recharts): maturidade =
radar de 7 eixos + escada de 5 níveis; oportunidades = radar dos eixos do trabalho + família
(teaser). Nível de maturidade viaja ao oportunidades via `sessionStorage` (só navegador,
e-mail ≠ conta) para calibrar o cruzamento.
**Escopo excluído:** lógica de scoring (ISSUE-104); textos de resultado (ISSUE-105); backend
(ISSUE-106); linkar na home (ISSUE-107).
**Arquivos prováveis:** `src/app/(publico)/radar/*/page.tsx`, `src/components/radar/*`.
**Dependências:** 102, 104, 105; integração final com 106.
**Critérios de aceite:** fluxo completo em <3min no mobile; touch ≥44px; voltar funciona;
progresso correto; **maturidade mostra resultado completo sem e-mail; oportunidades mostra a
direção sem e-mail e destrava o diagnóstico completo com o e-mail** (nunca resultado vazio atrás
do gate); Lighthouse a11y ≥90.
**Riscos:** virar "quiz raso" visualmente — usar Module/Card do DS2 com densidade de produto.
**Notas para implementação:** perguntas renderizadas a partir dos dados do motor (nada
hardcoded em JSX).

## ISSUE-104 — Motor de assessment (lib/radar)

**Status:** ✅ concluída em 2026-07-07 — `src/lib/radar/{types,maturidade,oportunidades}.ts` +
vitest (37 testes: 7 personas do doc 11 + varredura de guard-rails + bordas/empates/determinismo);
`lint`/`tsc`/`build` verdes.
**Fase:** 1
**Tipo:** Frontend (lógica) / Dados
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet (tabela de pesos revisada por Fable 5)
**Objetivo:** scoring da maturidade (7–35 → 5 níveis) e árvore de decisão de oportunidades
(8 respostas → 1 de 9 tipos) como funções puras auditáveis.
**Contexto:** faixas e perguntas literais no doc operacional §10.5–10.6 e §11.4; eixos de
decisão propostos em `02_technical_spec.md` §6.
**Escopo incluído:** `src/lib/radar/{types,maturidade,oportunidades}.ts`; tabela de pesos
documentada em comentário; casos-limite mapeados (tabela resposta→resultado esperado);
(opcional, decidir aqui) vitest APENAS para estas funções.
**Camada de captura (ver [10](10_jornada_captura_radares.md)):** o resultado de **oportunidades**
expõe **dois recortes** — `teaser` (direção/forma da oportunidade, mostrado grátis na tela) e
`completo` (o diagnóstico dos 8 blocos, atrás do e-mail). Definir no tipo de retorno o que é
teaser vs completo; **decisão de produto** sobre onde cortar (mostrar o suficiente para provar
valor, reter o suficiente para dar vontade) — revisar com o modelo forte.
**Cérebro do motor (2026-07-06):** tabela de pesos, modificadores, guard-rails, corte
teaser×completo, eixos dos gráficos radar, cruzamento de maturidade e perguntas revisadas da
maturidade especificados em [11_motor_radar_pesos_personas.md](11_motor_radar_pesos_personas.md)
— **✅ APROVADO pelo dono em 2026-07-06 (7 personas validadas)**; codificar a matriz exatamente
como está lá (qualquer desvio volta ao doc primeiro). **vitest aprovado** (dono, 2026-07-06),
escopo travado: só `lib/radar/*` (7 personas + casos-limite).
**Escopo excluído:** UI; textos longos de resultado (105).
**Arquivos prováveis:** `src/lib/radar/*` (novos); `package.json` se vitest entrar.
**Dependências:** nenhuma dura (types combinados com 103/105).
**Critérios de aceite:** todos os casos da tabela de validação passam; dados sensíveis SEMPRE
rebaixam recomendação e marcam flag de diligência; agêntico nunca é recomendação de entrada;
determinístico (mesmas respostas → mesmo resultado).
**Riscos:** pesos mal calibrados recomendando app para tudo — validar com o dono usando 5
personas de exemplo antes de fechar.
**Notas para implementação:** manter os IDs de pergunta/opção estáveis (analytics dependerá deles).

## ISSUE-105 — Conteúdo dos resultados (14 blocos pré-escritos)

**Status:** ✅ concluída em 2026-07-07 — `src/lib/radar/content.ts` completo (5 maturidade + 9
teasers + 9 diagnósticos com 8 blocos + "Na prática" + cruzamento + famílias + bloco diligência;
URLs conferidas byte a byte com a fonte; zero frase da lista proibida). Dono leu os 14 blocos e
aprovou o tom.
**Fase:** 1
**Tipo:** Copy / Conteúdo
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Fable 5 (é a voz da marca no momento de maior atenção do usuário)
**Objetivo:** 5 resultados de maturidade + 9 de oportunidade, completos (headline, corpo,
complexidade, risco, primeiro passo, leituras, CTAs), na voz editorial.
**Contexto:** modelos prontos no doc operacional §10.7 (5 níveis) e §11.7–11.9 (3 de 9 tipos);
faltam 6 tipos; mapa de leituras em `01` §8; tom no doc de contexto editorial §7/§12.
**Escopo incluído:** `src/lib/radar/content.ts` com os 14 blocos; leituras com URLs reais do
Substack; microestimativa de maturidade cruzada nos resultados de oportunidade.
**Camada de captura (ver [10](10_jornada_captura_radares.md)):** os 5 textos de **maturidade** são
**conteúdo grátis** (mostrados inteiros na tela); os 9 de **oportunidade** compõem o **diagnóstico
completo** (atrás do e-mail + no e-mail). Escrever também os **teasers de direção** do oportunidades
no tom de **exploração/descoberta** ("seu trabalho aponta para...", não "aqui está seu plano").
**Ferramentas tangíveis + provocação de maturidade (dono, 2026-07-06):** cada resultado de
oportunidade cita 1–2 ferramentas reais acessíveis no Brasil calibradas por nível (paleta em
[11](11_motor_radar_pesos_personas.md) §8.2: ChatGPT grátis/Gemini → NotebookLM/Gems →
Claude/Lovable/n8n/Looker Studio → Claude Code/Cursor/Antigravity/MCP) e inclui o bloco de
provocação "no seu nível, comece assim / um nível acima, isso vira X" — a evolução de
maturidade como argumento de ganho (alimenta CTA newsletter/trilha/Lab).
**Regra do "sabia que" (dono, 2026-07-06, rodada 2 — ver [11](11_motor_radar_pesos_personas.md)
§8.1):** todo diagnóstico completo termina com o **9º bloco "Na prática"** — gancho concreto
("sabia que você consegue montar um dashboard no Gemini conectado às suas planilhas?") + "no
seu nível, comece assim" + "um nível acima, isso vira" (nível 2 da família, doc 11 §3.1); o
**mini-guia de execução** (passo a passo + prompts prontos) é entregue pelo e-mail (ISSUE-113).
Resultados de maturidade seguem os textos do doc §10.7; as **perguntas** da maturidade usam as
versões sutis do doc 11 §2.2 (mapeadas à AI Fluency — ✅ aprovadas pelo dono, 2026-07-06). Escrever
exemplos por área incluindo os 2 públicos novos: **Estudante** e **Empreendedor** (doc 11 §9.6–9.7).
**Escopo excluído:** e-mail (113); UI.
**Arquivos prováveis:** `src/lib/radar/content.ts` (novo).
**Dependências:** types da 104.
**Critérios de aceite:** dono lê os 14 e aprova o tom; zero frase da lista proibida; cada
resultado tem os 8 blocos do doc §11.6; URLs verificadas.
**Riscos:** soar GPT — escrever a partir dos textos da newsletter, não do zero.
**Notas para implementação:** os 3 exemplos do doc entram quase literais; os 6 novos seguem a
mesma estrutura.

## ISSUE-106 — Backend de captura (tabelas, RLS, rotas API)

**Status:** ✅ concluída em 2026-07-07 — código completo: `src/app/api/radar/{session,lead}/route.ts`
(POST cria sessão + PATCH salva respostas/resultado; POST de lead com honeypot, rate limit por
IP via banco, `kind`/`triggerConversion` derivados da sessão no servidor — nunca do body do
cliente). SQL das 3 tabelas (`radar_sessions`, `radar_leads`, `radar_events` — esta última só
schema, reservada para a ISSUE-109) com RLS + `REVOKE ALL` de anon/authenticated + rollback em
`docs/revamp/ISSUE-106-sql-radar-tabelas.md`, revisado pelo Fable 5 (1 achado aplicado: REVOKE
ALL contra privilégio default residual do Supabase — mesma classe do incidente `roi_leads` da
Fase 3). `lint`/`tsc`/`build` verdes. **Todos os 5 critérios de aceite validados nesta sessão**
(dono rodou o SQL — RLS `true` nas 3 tabelas, 0 políticas; eu testei via `curl` local: sessão +
lead criados no banco, `triggerConversion` correto por `kind` (false/maturidade,
true/oportunidades), e-mail inválido → 400, honeypot → sucesso falso sem gravar, rate limit
bloqueou na 6ª tentativa → 429, chave anon → `42501 permission denied` em `radar_leads`,
`/pre-diagnostico` intocado e respondendo 200).
**Fase:** 1
**Tipo:** Backend / Dados / Segurança
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet (SQL revisado por Fable 5; execução pelo dono)
**Objetivo:** persistir sessões de radar e leads com segurança padrão v3.5.3.
**Contexto:** `02_technical_spec.md` §3.4; padrão service_role de `api/prediag/lead`.
**Escopo incluído:** SQL de `radar_sessions` + `radar_leads` (+ decisão reuso `roi_events` vs
`radar_events` após conferir schema) com RLS service_role-only e seção de rollback, entregue ao
dono; rotas `api/radar/session` e `api/radar/lead` (validação, rate limit por IP, honeypot);
contrato `triggerConversion` na resposta do lead.
**Camada de captura (ver [10](10_jornada_captura_radares.md)):** distinguir o `kind` do lead —
**oportunidades** dispara a conversão Google Ads (`triggerConversion: true`) e o e-mail entrega o
diagnóstico completo; **maturidade** é captura suave/opcional (registra lead, sem conversão
principal). Guardar qual radar originou o lead em `radar_leads.kind`.
**Escopo excluído:** envio de e-mail (113); views de analytics (109/fim da fase).
**Arquivos prováveis:** `src/app/api/radar/*/route.ts` (novos), SQL em doc para o dono.
**Dependências:** 101 (grupos de rota não afetam API, mas padrão de projeto).
**Critérios de aceite:** lead de teste aparece no Supabase; SELECT com anon key FALHA (dono
verifica); e-mail inválido rejeitado; rate limit ativo; fluxo público não quebrou.
**Riscos:** RLS aberta (histórico do projeto!) — trava desde a criação, nunca "ajustar depois".
**Notas para implementação:** service_role client local no route handler (nunca importar de
`lib/supabase`); mudança em RLS = testar fluxo público ponta a ponta (regra da casa).

## ISSUE-107 — Homepage reposicionada

**Status:** ✅ concluída em 2026-07-08 — home nova em `(publico)/page.tsx` + `components/home/*` +
`components/shared/{PublicHeader,PublicFooter,PWAInstallBanner}`; CTAs diretos para
`/radar/oportunidades` (primário/card) e `/radar/maturidade` (secundário/card) conforme a
escada da ISSUE-107B/doc 10; pricing e os 4 vídeos de demo preservados (progressive loading);
zero hex fora do DS2 no diff; `lint`/`tsc`/`build` limpos; smoke test via `curl` no build de
produção confirmou `/`, `/radar/maturidade`, `/radar/oportunidades`, `/auth`, `/privacidade`
respondendo 200, GTM presente e os 2 CTAs de cada radar no HTML. CTA "Quero entrar na lista do
Lab" fica sem destino funcional de propósito — é vitrine, a captura real é a ISSUE-108. **ISSUE-
107B confirmada obsoleta** (CTAs já nasceram diretos, nada para trocar depois).

**Fase:** 1
**Tipo:** Frontend / UX / Copy
**Prioridade:** Alta
**Complexidade:** Alta
**Modelo recomendado:** Sonnet (rebaixado de Fable 5 em 2026-07-06 — decisão do dono: o mock
`mockups/landing-preview-final.html` já é a spec de conteúdo aprovada, então o trabalho que
resta é engenharia de conversão HTML/CSS→componentes DS2, não copywriting novo; a ISSUE-111
[Fable 5] continua sendo a rede de segurança para qualquer texto que não esteja literal no mock)
**Objetivo:** substituir a landing de produtividade pela home da nova tese, preservando o
showcase da plataforma (vídeos) e a conversão que já funciona hoje — é o go-live visual do
reposicionamento, **desacoplado** da entrega dos radares (que ainda não existem). **Guarda-
corpo do dono:** NÃO é "apagar tudo e recomeçar" — é reposicionar a mensagem mantendo o que
demonstra valor do produto (vídeos de demo, pricing, funil que converte).
**Contexto:** copy base no doc operacional §8; estrutura em `01` §5 (12 seções); hero A
definido; **pricing FICA** (decisão do dono, `00b` p.9) redesenhado no DS2; marca
"+ConverSaaS" apresentada como "o ecossistema virtual da newsletter Conversas no Corredor"
(`00b` p.4); receitas visuais em `08_diretrizes_visuais_ds2.md` (seguir literalmente).
**DIREÇÃO VISUAL — ✅ DECIDIDA (2026-07-05):** híbrido A+C, consolidado em
`docs/revamp/mockups/landing-preview-final.html` — **essa é a spec pixel-a-pixel desta
issue** (detalhes da decisão em `09_direcoes_landing.md`). Pontos inegociáveis do dono:
grid técnico do hero mantido; headline com "construir com IA" em gradiente laranja→magenta;
janela de app animada do radar no hero; marca **"+ConverSaaS"** com o tagline "o ecossistema
virtual da newsletter Conversas no Corredor". Implementar em React/Next convertendo o mock em
componentes DS2 (mesmos tokens), com os vídeos reais no lugar dos placeholders.

**⚠️ SEQUENCIAMENTO REVISADO (dono, 2026-07-06) — radares ANTES da home, CTAs diretos:**
decisão de sequenciamento anterior (2026-07-05, abaixo, tachada) previa lançar a home antes dos
radares existirem, com CTA temporário para `/pre-diagnostico`. **Revertida em 2026-07-06:** o
dono optou por construir os radares primeiro (103–106) e só depois "plugar tudo junto" na home.
Consequência prática: quando a ISSUE-107 for executada, `/radar/maturidade` e
`/radar/oportunidades` **já existem** — os CTAs do hero e das duas portas apontam **direto**
para os radares desde o primeiro commit, sem `href` temporário e sem constante de fallback. A
**ISSUE-107B fica OBSOLETA** nesse cenário (nada para "trocar depois" — nasce já certo); manter
o registro dela só como plano B, caso a ordem mude de novo antes da execução.

**🆕 ACHADO — nova arquitetura de captura em escada (dono, 2026-07-06):** os radares deixaram de
ser "resultado + captura opcional" idênticos entre si. Ver
[10_jornada_captura_radares.md](10_jornada_captura_radares.md) para a spec completa. Resumo que
a ISSUE-107 precisa refletir nos CTAs:
- **Maturidade = degrau 1, o gancho grátis** — resultado completo na tela, sem gate. É o "comece
  por aqui" da jornada.
- **Oportunidades = degrau 2, o teste que captura** — teaser grátis na tela, diagnóstico
  completo atrás do e-mail; é o evento de conversão do Ads.
- **Ponto em aberto para a execução desta issue:** o mock aprovado
  (`mockups/landing-preview-final.html`) tem o CTA primário do hero como *"Quero ver minhas
  oportunidades"* (direto ao degrau 2) e o secundário como *"Descobrir meu nível"* (degrau 1).
  Isso ainda funciona bem como copy (a promessa mais forte primeiro), mas a ISSUE-107 deve
  **direcionar cada CTA ao radar certo** (não a um fallback único) e garantir que a seção
  "Duas portas" comunique a escada (ex.: badge "comece grátis" no card Maturidade, "teste
  completo" no card Oportunidades) em vez de tratá-las como alternativas equivalentes.

<details><summary>Decisão de sequenciamento original (2026-07-05) — superada, mantida como histórico</summary>

~~os radares ainda não existem (dependem das ISSUES 103–106). Em vez de esperar, a home nova é
lançada AGORA com os CTAs de diagnóstico apontando temporariamente para `/pre-diagnostico`
(funil legado). Quando os radares ficarem prontos, a ISSUE-107B troca esses `href` para os
radares.~~

</details>

**Escopo incluído:**
- `(publico)/page.tsx` novo com CADA seção como componente nomeado em `components/home/*`
  (HeroSection, ProblemaSection, ReframeSection, PortasSection, ComoFuncionaSection,
  **PlataformaDemoSection**, NewsletterSection, DiferenciacaoSection, PricingSection,
  LabSection, AutorSection) + PublicHeader/PublicFooter;
- **Seção "A plataforma em ação" (PlataformaDemoSection):** reutiliza os 4 vídeos existentes
  (`/videos/mapeamento.mp4`, `/videos/diagnostico.mp4`, `/videos/taticas.mp4`,
  `/videos/kanban.mp4` — já comprimidos, ~2,3MB total). Layout: 4 cards `Module` do DS2, cada
  um com label mono (ex.: `01 / MAPA DE ATIVIDADES`), título, 1 frase de benefício e o vídeo.
  Manter o padrão de progressive loading da home atual (primeiro vídeo autoplay muted +
  playsInline, demais click-to-play) — economiza dados móveis. Narrativa da seção: "isso é o
  que assinantes já usam hoje — e é só o começo do ecossistema";
- **CTAs do hero e das duas portas apontam DIRETO para os radares** (`/radar/oportunidades` no
  CTA primário do hero e no card "Oportunidades"; `/radar/maturidade` no CTA secundário do hero
  e no card "Maturidade") — sem `href` de fallback, já que os radares existem quando esta issue
  roda (ver achado de sequenciamento acima). Card "Maturidade" sinaliza "comece grátis"; card
  "Oportunidades" sinaliza que o diagnóstico completo chega por e-mail;
- **header/footer preservam "Já sou assinante" → `/auth`** (login direto na plataforma —
  mesmo comportamento do site atual, ver `src/app/page.tsx` linhas ~357–364 e ~420–422 como
  referência do padrão existente a replicar visualmente no DS2);
- CTA "Assinar a newsletter" aponta para o Substack subscribe (como hoje);
- metadata da home; responsivo 360→1440.
**Escopo excluído:** A/B (Fase 1.5); gravar/editar vídeos novos; qualquer alteração no fluxo
legado de auth; alterar a página `/pre-diagnostico` em si; construir os radares (103–106).
**Arquivos prováveis:** `src/app/(publico)/page.tsx`, `src/components/home/*`,
`src/components/shared/PublicHeader.tsx`/`PublicFooter.tsx`.
**Dependências:** ⚠️ atualizado 2026-07-06 — **102 (DS2) + 103/104/105/106 (radares)**, nessa
ordem: a home agora roda DEPOIS dos radares (sequenciamento revisado acima), não mais logo após
a fundação. `03_implementation_plan.md` precisa refletir essa troca de ordem.
**Critérios de aceite:** teste dos 5 segundos com pessoa real; todos os CTAs navegam de fato
(hero/portas → `/radar/oportunidades` e `/radar/maturidade` conforme o achado de escada acima;
login → `/auth`; newsletter → Substack); os 4 vídeos carregam com progressive loading; zero hex
fora do DS2 (grep `#[0-9a-fA-F]{6}` limpo no diff); pricing presente e legível; Lighthouse
mobile ≥85/90/95 (perf/a11y/SEO); home antiga recuperável por revert único; conversão do lead de
oportunidades (Google Ads) dispara normalmente ao chegar pelos CTAs da home.
**Riscos:** derrubar conversão do tráfego de produtividade — seção de reframe obrigatória e
proeminente + demo da plataforma dá prova concreta; monitorar CPL na primeira quinzena.
Confusão futura se o `href` temporário ficar espalhado pelo código — por isso a constante
centralizada acima.
**Notas para implementação:** commit isolado; nada de `page-backup.tsx` no working tree (o git
é o backup); comparar visualmente com `docs/revamp/mockups/landing-preview-final.html` aberto
no navegador (não com o `.html` do design system genérico — este já é a versão de conteúdo real).

## ISSUE-107B — Retargeting dos CTAs da home para os radares

**Status:** ✅ fechada sem execução em 2026-07-08 — a ISSUE-107 rodou com os radares já
prontos e os CTAs nasceram diretos para `/radar/maturidade` e `/radar/oportunidades` desde o
primeiro commit; não havia `href` temporário para trocar.

> ⚠️ **OBSOLETA sob o sequenciamento atual (dono, 2026-07-06):** com radares (103–106) construídos
> ANTES da home (107), os CTAs já nascem apontando direto para `/radar/*` — não há destino
> temporário para trocar depois. Mantida no backlog só como plano B (caso a ordem de execução
> mude de novo antes de 107 rodar); se 107 for concluída com CTAs diretos, **fechar esta issue
> sem executar**, registrando o motivo no CHANGELOG.

**Fase:** 1
**Tipo:** Frontend
**Prioridade:** Média (executar assim que 103 estiver pronta — não antes)
**Complexidade:** Baixa
**Modelo recomendado:** Sonnet (ou modelo leve — é um swap mecânico)
**Objetivo:** trocar o destino temporário dos CTAs de diagnóstico da home (`/pre-diagnostico`)
pelos radares de verdade, agora que existem.
**Contexto:** ver a "Decisão de sequenciamento" registrada na ISSUE-107. Essa issue existe
para não deixar esquecido o swap — sem ela, a home ficaria apontando para o funil legado para
sempre.
**Escopo incluído:** trocar `RADAR_FALLBACK_HREF` (ou os `href` equivalentes) do CTA principal
do hero e dos dois cards de "porta" para `/radar/oportunidades` e `/radar/maturidade`
respectivamente; revisar a microcopy da seção "Como funciona" (ISSUE-107) para garantir que
descreve o comportamento real dos radares (progresso, resultado na hora, captura opcional) e
não mais uma referência genérica; conferir se o CTA cruzado entre os dois radares (definido na
ISSUE-103) está coerente com a jornada descrita na home.
**Escopo excluído:** qualquer mudança visual (isso já foi decidido e implementado na 107);
mudar o `/pre-diagnostico` em si (ele continua existindo e funcionando para quem tiver o link).
**Arquivos prováveis:** os mesmos `components/home/*` da ISSUE-107.
**Dependências:** 103 (radares navegáveis), 104, 105 (motor e conteúdo prontos), ISSUE-107 já
mergeada.
**Critérios de aceite:** clicar nos CTAs de diagnóstico da home leva aos radares (não mais ao
`/pre-diagnostico`); jornada completa testada ponta a ponta (home → radar → resultado →
captura → newsletter); `/pre-diagnostico` continua acessível por quem tiver o link direto
(campanhas antigas), só não é mais o destino dos CTAs novos.
**Riscos:** esquecer algum `href` hardcoded fora da constante centralizada — grep por
`/pre-diagnostico` no diretório `components/home/` antes de fechar, deve retornar zero.

## ISSUE-108 — Páginas /newsletter, /lab e /obrigado

**Status:** ✅ concluída em 2026-07-08 — 3 páginas novas em `src/app/(publico)/{newsletter,lab,
obrigado}/page.tsx`, todas com `PublicHeader`/`PublicFooter` e metadata própria.
- **`/lab`:** `api/radar/lead` exige `sessionId` de uma `radar_sessions` existente (kind só
  aceita 'maturidade'/'oportunidades') — inviável para visita solta sem radar prévio. Decisão do
  dono: tabela nova e isolada `lab_leads` (não referencia as tabelas do radar) + rota própria
  `POST /api/lab/interest` (validação de e-mail, honeypot, rate limit 5/h/IP — mesmo padrão da
  106). SQL para o dono rodar: `docs/revamp/ISSUE-108-sql-lab-leads.md` (ainda **não executado no
  banco** — rota funcional mas grava vai falhar com 500 até a tabela existir). Quem já respondeu
  um radar e marcou "quero entrar no Lab" continua indo para `radar_leads.lab_interest`
  (ISSUE-106), sem duplicar aqui. Formulário em `src/components/lab/LabWaitlistForm.tsx`
  (client), captura UTM via `capturarUtm()`/`lerUtm()` do padrão existente.
- **`/obrigado`:** dispara `thank_you_page_viewed` (o evento que a ISSUE-109 deixou pendente
  justamente esperando esta página existir) via `src/components/obrigado/ObrigadoTracker.tsx`.
  **Decisão do dono:** página fica standalone por enquanto — `OportunidadesResultado.tsx` e
  `MaturidadeResultado.tsx` (arquivos do funil já revisados/travados no gate do Sprint 1) não
  foram tocados, então nada redireciona para cá ainda. Ligar esse fluxo fica para uma issue
  futura pequena. Leituras recomendadas reaproveitam `LEITURAS` (exportado de
  `src/lib/radar/content.ts` para reuso fora do radar — mesmas URLs verificadas, sem reinventar
  link) + CTA newsletter + CTA Lab.
- **`/newsletter`:** copy literal do doc §8.7 (temas + CTA subscribe) + exemplos de leitura
  (reaproveitando `LEITURAS`).
- **Integração com páginas já existentes:** `PublicHeader` tinha links `#newsletter`/`#lab`
  (âncoras que só funcionavam dentro da própria home — quebrados em qualquer outra página
  pública); corrigidos para `Link` de rota real (`/newsletter`, `/lab`). O CTA "Quero entrar na
  lista do Lab" da home (`LabSection.tsx`) recebeu destino real (`/lab`) — antes era só vitrine
  sem link, como o próprio comentário no código já antecipava para esta issue.
- **Validação:** `tsc --noEmit`, `lint` (só nos arquivos tocados) e `build` limpos (33 rotas).
  Grep de hex solto no diff: zero. Smoke test via curl no build de produção: `/`, `/newsletter`,
  `/lab`, `/obrigado`, `/radar/maturidade`, `/radar/oportunidades` respondendo `200`; GTM
  presente no HTML; `/api/lab/interest` testado (e-mail inválido → `400`; honeypot → `200` sem
  gravar; e-mail válido → `500` esperado, tabela ainda não existe no banco).
- **Achado de ambiente (não é bug de código):** o build de produção falhava de forma
  intermitente com erro opaco de webpack (`Cannot read properties of undefined (reading
  'call')`) ao pré-renderizar `/radar/maturidade` — reproduzido até em `main` limpo via `git
  stash`. Causa real: um `npm run dev` do dono rodando em paralelo na mesma pasta do projeto
  (porta 3000), escrevendo na mesma `.next` que o build também escreve — corrompia o
  `webpack-runtime.js` no meio da geração. Resolvido encerrando o processo antes de buildar.
  Registrado aqui para não perder tempo "debugando" isso de novo: **não rodar `npm run dev` e
  `npm run build` ao mesmo tempo na mesma pasta.**
- **Pendências para o dono:** ✅ SQL de `lab_leads` rodado e verificado em 2026-07-08
  (`rowsecurity = true`, 0 políticas) — dono testou `/lab` no navegador e aprovou.
- **Achado do dono no teste manual (registrado, não corrigido — fora do escopo desta issue):**
  a home não tem chamada óbvia para `/newsletter`. A seção "Newsletter" da home linka direto
  pro Substack (externo), nunca passa pela página `/newsletter` interna; os links
  "Newsletter"/"Lab" do `PublicHeader` só aparecem no desktop (`hidden md:inline` — somem no
  mobile, que é a prioridade do projeto). O `/lab` está OK (CTA da `LabSection` já leva lá).
  Oportunidade de melhoria para uma issue futura de UX/navegação — não é regressão desta issue.

**Fase:** 1
**Tipo:** Frontend / Copy
**Prioridade:** Média
**Complexidade:** Baixa
**Modelo recomendado:** Sonnet (ou modelo leve com a spec em mãos)
**Objetivo:** completar a periferia do funil: destino editorial, lista de interesse do Lab e
pós-captura.
**Contexto:** doc operacional §8.7/§8.9/§14; premissa 5 (embed/CTA Substack).
**Escopo incluído:** 3 páginas com metadata própria; `/lab` grava interesse via
`api/radar/lead` (flag `lab_interest`) ou rota própria mínima; `/obrigado` com leituras e CTA
Lab.
**Escopo excluído:** `/comece-aqui` e `/sobre` (Fase 1.5); sequência de e-mails.
**Arquivos prováveis:** `src/app/(publico)/{newsletter,lab,obrigado}/page.tsx`.
**Dependências:** 102; 106 (para a lista do Lab).
**Critérios de aceite:** interesse no Lab persiste no banco; links de leitura corretos; mobile ok.
**Riscos:** baixo.
**Notas para implementação:** copy literal do doc operacional onde existir.

## ISSUE-109 — Analytics do funil novo (GTM + Supabase)

**Status:** ✅ concluída em 2026-07-08 — helper `src/lib/analytics.ts` (`track()` duplo trilho:
`dataLayer.push` + `POST /api/radar/event` via `sendBeacon`/fetch keepalive) e captura/propagação
de UTM (`capturarUtm`/`lerUtm`, sessionStorage) implementados; **15 dos 15 eventos do doc
operacional §21 instrumentados**. Os últimos 3 (`hero_cta_opportunities_clicked`,
`hero_cta_maturity_clicked`, `thank_you_page_viewed`) dependiam de páginas que só existiram
depois (home = ISSUE-107, `/obrigado` = ISSUE-108): `thank_you_page_viewed` entrou junto com a
própria ISSUE-108; os 2 CTAs do hero ficaram esquecidos na ISSUE-107 (que não os instrumentou
apesar de ter criado a home) e foram fechados numa sessão de acompanhamento em 2026-07-08 —
`src/components/home/HeroCtas.tsx` (novo, client, extraído do `HeroSection.tsx` que era server
component) chama `track()` no `onClick` dos 2 CTAs do hero. `tsc`/`lint`/`build` limpos (33
rotas); smoke test via curl confirmou os 2 nomes de evento no HTML gerado e os `href` dos CTAs
intactos.
**Achado de arquitetura:** os 15 nomes de evento foram extraídos para `src/lib/radar-events.ts`
(módulo sem `'use client'`) em vez de ficarem só em `analytics.ts`. Motivo: a rota de API
(`api/radar/event/route.ts`, server-side) importava a constante de um módulo `'use client'` e o
Next resolvia isso como referência de client component no bundle do servidor — `.includes()`
quebrava em runtime (`TypeError`, mascarado pelo catch-all que sempre responde `200`, achado só
testando via curl). Registrado aqui para não repetir o padrão em issues futuras: constantes
compartilhadas entre client e rota de API não podem morar num módulo `'use client'`.
UTM real testado (`POST /api/radar/session` aceita e persiste `utm.source` etc., antes só o
schema suportava mas o front não enviava). `lint`/`tsc --noEmit`/`build` (29 rotas, +1 pela rota
`api/radar/event`) e os 37 testes de `lib/radar` verdes. Validado via curl: evento com nome fora
da lista → `400`; evento válido → `200` + gravação em `radar_events`; rate limit
(120/hora/IP) não testado por completo (evitar gerar 120 linhas de lixo no banco de produção).
**Não verificado** (sem ferramenta de browser neste ambiente, mesma limitação da ISSUE-103):
disparo real dos eventos clicando no fluxo do navegador + Tag Assistant/GTM Preview para as tags
GA4 (ainda não criadas — é o dono que cria na UI do GTM, ver especificação entregue). Documento
de especificação de eventos/tags para o dono: `ISSUE-109-eventos-analytics.md`.
**Fase:** 1
**Tipo:** Analytics
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet com persona Analytics & Ads (validação final Fable 5)
**Objetivo:** os 15 eventos do doc operacional §21 fluindo em duplo trilho (dataLayer + tabela),
com UTMs.
**Contexto:** `02` §3.7; premissa 8; conversão legada INTOCÁVEL; label de conversão DECIDIDO:
funil novo usa o mesmo label atual (`07_mapa_tracking_ads.md` §3.3).
**Escopo incluído:** `src/lib/analytics.ts`; instrumentação de home/radares/captura/lab;
captura e propagação de UTM; rota de evento (ou extensão da session); documentação dos eventos
em `docs/`.
**Escopo excluído:** dashboards Grafana/views (SQL entregue no fim da fase, com o dono);
qualquer edição no container GTM (é feita pelo dono na UI do GTM — fornecer especificação de
tags/triggers).
**Arquivos prováveis:** `src/lib/analytics.ts` (novo), componentes de 103/107/108.
**Dependências:** 103; 106.
**Critérios de aceite:** cada evento aparece no GTM preview E no Supabase com propriedades;
conversão legada re-validada; nomes de evento exatamente os do doc §21.
**Riscos:** nomear eventos "quase igual" e quebrar análise futura — copiar strings literais.
**Notas para implementação:** sendBeacon com fallback fetch; nunca bloquear navegação por
analytics.

## ISSUE-110 — SEO técnico

**Status:** ✅ concluída em 2026-07-08 — `metadataBase` + `openGraph`/`twitter` base no layout
raiz; `src/app/opengraph-image.tsx` + `twitter-image.tsx` (via `next/og` `ImageResponse`, tokens
DS2, estáticos em build — não há ferramenta de edição de imagem neste ambiente para gerar um PNG
manual em `public/og/*`, então a imagem-fonte única virou rota de imagem gerada, mesmo resultado
prático); `sitemap.ts` (5 rotas públicas de conteúdo) e `robots.ts` (bloqueia `/api/` + todas as
rotas de `(app)`) novos; JSON-LD `WebSite` na home; auditoria de H1 achou 0 H1 em
`/newsletter`, `/lab` e `/obrigado` (só H2 via `SectionTitle`) — corrigido com prop `as="h1"`
nova no `SectionTitle` (visual idêntico, só semântica), usada no heading principal das 3
páginas. `(app)/layout.tsx` (client) não podia exportar `metadata`; lógica extraída 100% intacta
para `(app)/AppShell.tsx` e o `layout.tsx` virou Server Component só com
`robots: {index:false, follow:false}` — cobre as 9 rotas privadas de uma vez. `/obrigado` (pós-
conversão) ganhou `robots: {index:false}` própria e ficou fora do sitemap, por ser prática
padrão de SEO para thank-you pages. `/auth` e `/pre-diagnostico` ficaram fora do sitemap por
decisão (auth é transacional; pre-diagnostico é backstage — ninguém toca no código dele, ver
`00b_open_questions.md` pergunta 6). `tsc`/`lint`/`build` limpos (34 rotas); smoke test via curl
no build de produção confirmou: og:title/description espelhando o título de cada página
automaticamente, `og:image`/`twitter:image` respondendo 200 (PNG real, 1200×630), JSON-LD válido
(`JSON.parse` sem erro), `/dashboard` com `noindex, nofollow`, exatamente 1 `<h1>` em `/`,
`/newsletter`, `/lab`, `/radar/maturidade`, GTM intacto, CTAs da home intactos, todas as rotas
tocadas em 200.
**Não verificado** (sem browser/internet neste ambiente): Rich Results Test do Google e
Lighthouse SEO real — mesma limitação já registrada nas sessões anteriores.

**Fase:** 1
**Tipo:** SEO
**Prioridade:** Média
**Complexidade:** Baixa
**Modelo recomendado:** Sonnet
**Objetivo:** estrutura mínima de SEO em todas as páginas públicas novas.
**Contexto:** doc operacional §16 (titles, descriptions, H1/H2, clusters); `02` §3.6.
**Escopo incluído:** metadata por página (strings do doc §16), metadataBase, OG/Twitter com
imagem estática, `sitemap.ts`, `robots.ts`, JSON-LD WebSite, auditoria de H1 único.
**Escopo excluído:** conteúdo/blog para clusters (Fase 1.5+); canonical de domínio próprio
(pendência 1).
**Arquivos prováveis:** `src/app/sitemap.ts`, `src/app/robots.ts`, metadata nas páginas de
103/107/108, `public/og/*`.
**Dependências:** 101; páginas existentes (fecha junto com 107).
**Critérios de aceite:** titles/descriptions únicos; sitemap válido; robots bloqueia `(app)` e
`/api`; Rich Results Test sem erro; Lighthouse SEO ≥95.
**Riscos:** baixo.
**Notas para implementação:** rotas privadas ganham `robots: { index: false }` na metadata.

## ISSUE-111 — Revisão integral de copy (voz editorial)

**Status:** ⚠️ aplicada em 2026-07-08 — 7 ajustes in place (mapa da varredura em
`ISSUE-111-briefing-copy.md`); falta o veto final do dono (critério de aceite: ler sem
"cheiro de IA"; atenção ao item do Pricing "cursos"→"séries", que descreve a oferta paga).

**Fase:** 1
**Tipo:** Copy
**Prioridade:** Alta
**Complexidade:** Baixa (esforço), Alta (critério)
**Modelo recomendado:** Fable 5 + veto final do dono
**Objetivo:** passar toda superfície de texto nova pelo filtro da voz da newsletter.
**Contexto:** doc de contexto editorial §7 (tom), §12 (fórmulas); lista proibida no README §7.
**Escopo incluído:** varredura de home, radares, resultados, periferia, microcopy, mensagens de
erro, metadata; ajustes in place; relatório curto do que mudou.
**Escopo excluído:** mudanças de estrutura/UX.
**Arquivos prováveis:** os das issues 103/105/107/108/110.
**Dependências:** tudo visível pronto.
**Critérios de aceite:** dono lê e não "sente cheiro de IA"; zero termo proibido (grep pela
lista); CTAs todos no padrão de intenção.
**Riscos:** homogeneizar demais e perder o punch — preservar frases de tensão.

## ISSUE-111.1 — Otimização de conversão da home (navegação, fechamento e autor)

**Status:** ⚠️ aplicada em 2026-07-08 — 5 itens do escopo no ar (local). Pendências do dono:
(1) veto de leitura da bio e do fechamento; (2) configurar cores do embed no painel do
Substack; (3) criar as 4 tags GA4 novas no GTM (spec no CURRENT-STATUS); (4) anotar a data do
deploy para leitura antes/depois das métricas.

**Fase:** 1
**Tipo:** UI / Copy / Conversão
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Fable 5 + veto final do dono
**Objetivo:** transformar a home de "página que apresenta" em "página que converte", atacando os
vazamentos mapeados no diagnóstico de 2026-07-08 (sessão da ISSUE-111), a serviço dos 2 objetivos
estratégicos do dono, nesta ordem de valor por visitante: (1) iniciar um radar (lead no NOSSO
banco, segmentado por resultado — alimenta a trilha dedicada da ISSUE-113); (2) assinar a
newsletter (nutrição + efeito de rede de recomendações do Substack). Regra de ouro: nenhuma
mudança pode otimizar o clique direto pro Substack ao custo de um início de radar.

**Contexto:** diagnóstico completo na conversa de 2026-07-08 (resumo abaixo); voz da newsletter
(`README.md` §7 + contexto editorial §7/§12); receitas visuais em `08_diretrizes_visuais_ds2.md`;
premissa do embed Substack já aprovada em `00b_open_questions.md` pergunta 5 (opção a+b) e nunca
implementada; eventos de analytics seguem o padrão `track()` da ISSUE-109.

**Vazamentos diagnosticados (base do escopo):**
1. A página termina em bio + footer — o visitante mais engajado (rolou tudo) não recebe nenhum
   pedido de ação no fim.
2. Todo CTA de newsletter joga para fora do site (Substack em outra aba, passo extra, não medido).
3. Depois da PortasSection (seção 4 de 11), não existe mais nenhum caminho para os radares.
4. AutorSection rasa ("gestor com carreira executiva" + LinkedIn) — afirmação sem evidência,
   clichê de bio; o endosso real do autor é o que ele constrói.
5. NewsletterSection funda demais (posição 7, depois dos 4 vídeos da demo).

**Escopo incluído:**
1. **Seção de fechamento** (componente novo, ex.: `FechamentoSection`) antes do `PublicFooter`:
   reprise compacta das duas portas (CTAs idênticos em destino aos da PortasSection) + CTA de
   newsletter. Eventos novos de clique para distinguir do hero/portas (ex.:
   `closing_cta_opportunities_clicked`, `closing_cta_maturity_clicked`,
   `closing_newsletter_clicked`).
2. **Embed do Substack** na NewsletterSection (iframe `conversasnocorredor.substack.com/embed`),
   mantendo o CTA atual como fallback/alternativa visível. Evento de visualização/interação.
   Nota: as cores do embed se configuram no painel do Substack (operação do dono) — o código só
   garante container/responsividade no DS2.
3. **Reordenação das seções:** NewsletterSection sobe para logo após ComoFuncionaSection;
   PlataformaDemoSection desce uma posição. Ordem-alvo: Hero → Problema → Reframe → Portas →
   ComoFunciona → Newsletter → Demo → Diferenciação → Pricing → Lab → Autor → Fechamento.
4. **Micro-reasseguro** sob os CTAs de newsletter (NewsletterSection e fechamento): "Grátis. Uma
   conversa por semana. Cancela quando quiser." (ou variação na voz — decisão do executor).
5. **AutorSection robusta** — reescrever saindo do clichê de bio, com credenciais CONCRETAS
   fornecidas pelo dono (validar os fatos exatos com ele antes de publicar): gestor na 99
   implementando agentes de IA no trabalho real; constrói soluções com vibe coding — inclusive
   esta plataforma; workshops sobre IA; autor da newsletter. Ângulo editorial: "quem escreve
   também constrói" — a prova é o ativo que o visitante está usando agora. Formato pode usar a
   estética DS2 (ex.: ficha em mono) mantendo humano, sem tom de guru. LinkedIn permanece.

**Escopo excluído:**
- **Hero intocado** — spec pixel-a-pixel do mock aprovado, pontos inegociáveis do dono.
- **Pricing permanece** como está (decisão registrada, `00b` p.9) — só desce/sobe se a
  reordenação do item 3 exigir, sem mudar conteúdo.
- **Prova social (depoimentos/números)** — ADIADA por decisão do dono (2026-07-08): hoje só há
  comentários de amigos/trabalho, e depoimento fraco é pior que nenhum nesta marca. Registrar
  como issue futura (Fase 1.5, junto do A/B da ISSUE-201) quando houver material real de
  leitores. Não inventar, não usar placeholder.
- Nenhuma mudança nas páginas de radar, nos fluxos ou no funil `/pre-diagnostico`.
- Nenhuma mudança em `layout.tsx`/GTM.

**Arquivos prováveis:** `src/app/(publico)/page.tsx` (ordem das seções),
`src/components/home/NewsletterSection.tsx`, `AutorSection.tsx`, novo
`FechamentoSection.tsx`, `src/lib/analytics.ts` (nomes de evento novos, se tipados).
**Dependências:** ISSUE-111 aplicada (✅). Fatos da bio confirmados pelo dono na sessão.
**Critérios de aceite:** `lint` + `tsc --noEmit` + `build` limpos; smoke test confirmando que os
eventos do hero (ISSUE-109) continuam no HTML e os novos disparam; embed carregando com fallback
funcional; CTAs todos no padrão de intenção e zero termo proibido (grep); mobile: touch ≥44px,
sem overflow; dono aprova a bio (fatos e tom) e a nova ordem; anotar a data do deploy no
CURRENT-STATUS para leitura antes/depois das métricas (a home instrumentada é a linha de base).
**Riscos:** iframe do Substack destoar do tema escuro (mitigação: config no painel do Substack +
container DS2); página ainda mais longa (mitigado pela reordenação e pelo fechamento);
reordenar seções muda o contexto das métricas em curso — por isso a anotação de data é critério
de aceite.

## ISSUE-112 — QA integral + validação de conversão (gate de launch)

**Status:** ⚠️ parcial em 2026-07-09 — 3 dos 4 bloqueadores originais resolvidos: e-mail de
trilha (ISSUE-113, 08/07), `/privacidade` pública (08/07), reset de senha corrigido e testado
(09/07, Site URL do Supabase). Resta **só a performance** (2.2, mobile 24/49 vs alvo ≥85 — ainda
não atacada em código). Itens de atenção do §3 também fechados nesta sessão: SQL da `lab_leads`
(já estava rodado, nota desatualizada corrigida), tags GA4 dos 19 eventos (publicadas e
testadas), embed Substack no dark (já estava certo). Falta: roteiro do dono (Tag Assistant,
mobile real, Supabase/RLS, veto de copy, PWA — §4 do relatório) e re-execução do gate após os
fixes, até zero FALHOU. Detalhes: `docs/CURRENT-STATUS.md` (sessão de 09/07).

**Fase:** 1
**Tipo:** Testes
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Fable 5 (postura de reviewer cético)
**Objetivo:** executar o gate do `03_implementation_plan.md` §6 e autorizar o go-live.
**Contexto:** roteiros em `03` §5–6; DoD em `06_definition_of_done.md`.
**Escopo incluído:** roteiro completo; matriz rota×estado; tracking legado+novo; PWA; mobile
real; Lighthouse; relatório de pendências com severidade.
**Escopo excluído:** corrigir o que achar (abre issues/fixes separados, salvo trivial).
**Dependências:** todas as anteriores.
**Critérios de aceite:** checklist do DoD 100% respondido (ok ou exceção justificada pelo dono).
**Riscos:** pressa de lançar por cima de item vermelho — o gate existe para isso.

## ISSUE-113 — E-mail de trilha

**Status:** ⚠️ aplicada em 2026-07-08 — template novo (`src/app/api/radar/email-template.ts`,
DS2 dark-safe, cores em hex literal + `color-scheme: dark`) e envio via Resend na rota
`api/radar/lead` (flag `emailSent` na resposta; falha não impede salvar o lead). Reaproveita
100% do conteúdo já escrito na ISSUE-105 (`lib/radar/content.ts`) — o bloco "Na prática" da
oportunidade É o mini-guia prometido na tela; nenhuma copy nova foi criada. Links do e-mail
carregam UTM (`utm_source=email&utm_medium=radar_trilha&utm_campaign={maturidade|oportunidades}`).
Testado ponta a ponta nesta sessão: os dois radares completos via API real, ambos retornaram
`emailSent:true`, e-mails de teste enviados para o Gmail do dono. **Ajuste pós-veto do dono:**
o e-mail de maturidade só levava para o Radar de Oportunidades — faltava convite à newsletter
(conversão-fim da Fase 1). Adicionado link secundário "Quero receber as próximas conversas"
(mesmo destino/UTM do CTA de oportunidades); reenviado e confirmado. **Pendente (dono):** confirmar
visualmente a chegada/aparência no Gmail (inclusive app mobile) e, se tiver acesso, no Outlook —
critério de aceite da issue exige os dois clientes. Rotina de import CSV → Substack (item
separado do DoD, não desta issue) segue não documentada.
**Fase:** 1
**Tipo:** Backend / Copy
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet
**Objetivo:** enviar o resultado completo + trilha por e-mail após captura no funil novo.
**Contexto:** template atual em `api/prediag/email-template.ts` como base técnica; conteúdo =
e-mail 1 do doc operacional §15.1. Infra Resend JÁ ENTREGA (confirmado pelo dono em
2026-07-05, plano gratuito); política: só quem completa radar/pré-diagnóstico recebe e-mail.
**Escopo incluído:** template novo (DS2, dark-safe para clients de e-mail); envio na rota de
lead com flag `emailSent`; fallback silencioso se envio falhar (lead nunca se perde — resultado
completo permanece na tela). **+ Mini-guia de execução (dono, 2026-07-06):** o e-mail de
oportunidades entrega, além do diagnóstico, o "manualzinho" do bloco Na prática (passo a passo
+ prompts prontos + como subir de nível na família) — conteúdo escrito na ISSUE-105
(`lib/radar/content.ts`), o template só renderiza.
**Escopo excluído:** sequência de nutrição (e-mails 2–4 → Fase 1.5); qualquer alteração no
e-mail do funil legado; NÃO tocar no bug do reset de senha (bug separado, `/corrigir-bug`).
**Arquivos prováveis:** `src/app/api/radar/email-template.ts` (novo), `api/radar/lead/route.ts`.
**Dependências:** 106.
**Critérios de aceite:** e-mail chega em Gmail/Outlook reais; links com UTM; render ok em
mobile; falha de envio não impede salvar lead.
**Riscos:** deliverability do plano gratuito quando escalar — monitorar; decisão de domínio
próprio reabre quando o volume justificar (registrado no 00b).

---

## FASE 1B — Redesign da plataforma logada (DS2 nas ferramentas)

> **Origem:** decisão do dono (2026-07-05) — o plano cobre também o redesign das
> funcionalidades dentro do login, como segundo resultado visual crítico (o primeiro é a home).
> **Regra de ouro de TODAS as issues 114–120 (colar no início de cada sessão):**
> O restyle é 100% VISUAL. Proibido alterar lógica, estado, dados, rotas de API, props,
> integrações Supabase/localStorage ou textos funcionais. Se estilizar "exigir" refatorar
> lógica, PARE e registre no relatório da sessão. As cores das zonas ROI
> (`#22c55e`/`#3b82f6`/`#eab308`/`#ef4444`) são semântica de dados — NÃO mudam.
> Mapa de conversão de tokens: `08_diretrizes_visuais_ds2.md` §5. Proibições: §6.
> Critério universal: screenshots antes/depois por tela + funcionalidade idêntica comprovada
> pelo fluxo manual descrito em cada issue + `tsc`/`lint`/`build` verdes.

## Sprint 4 (ISSUE-114 a 120) — ⏸️ PAUSADA em 2026-07-09 (decisão do dono)

Plataforma logada atual sem uso real comprovado (site ficou efetivamente inacessível durante a
pausa do Supabase — ninguém acessava). Restyle deixou de ser prioridade; páginas seguem no ar
como **legado** (mantidas funcionando, sem novo investimento de design). Prioridade do dono
agora é avançar direto para a Fase 2 (Lab, ISSUE-301-305) assim que o gate da ISSUE-112 fechar.
Detalhes: `00b_open_questions.md` pergunta 13, `03_implementation_plan.md` Sprint 4. As issues
abaixo ficam mapeadas (não deletadas) para o caso de o restyle voltar a fazer sentido depois.

## ISSUE-114 — AppShell DS2 (navegação do app logado)

**Fase:** 1B — ⏸️ pausada
**Tipo:** UI / Frontend
**Prioridade:** Alta
**Complexidade:** Média
**Modelo recomendado:** Sonnet (review Fable 5 — esta issue define o padrão das demais)
**Objetivo:** sidebar desktop + header/drawer mobile do app logado no DS2, mantendo navegação
e auth idênticos.
**Contexto:** o shell atual (sidebar `glass`, logo mono laranja, itens com `accent-bg`) vive no
layout do grupo `(app)` após a ISSUE-101. Fundo vira `--ds2-bg-app`, superfícies viram
`--ds2-surface-glass` com `--ds2-border-subtle`, item ativo vira pill com `--ds2-accent-orange`
(texto `#1E1005`), logo "+Conversas" em Plex Mono 700, e-mail do usuário em `--ds2-text-muted`.
**Escopo incluído:** só o shell — sidebar, header mobile, drawer, botão sair, estados
ativo/hover, loading screen inicial (spinner na paleta nova).
**Escopo excluído:** conteúdo de qualquer página; lógica de auth/redirect (intocada).
**Arquivos prováveis:** `src/app/(app)/layout.tsx`.
**Dependências:** 101, 102.
**Critérios de aceite:** navegação completa pelas 8 rotas funciona; logout funciona; drawer
mobile abre/fecha; item ativo visível; touch ≥44px; screenshots antes/depois.
**Riscos:** quebrar o gate de auth ao mexer no arquivo — o `useEffect` de auth não é tocado.

## ISSUE-115 — Restyle /auth (login/cadastro)

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Alta
**Complexidade:** Baixa
**Modelo recomendado:** Sonnet
**Objetivo:** a porta de entrada do assinante no DS2 — primeira impressão pós-newsletter.
**Contexto:** `src/app/auth/page.tsx` (457 linhas): tabs login/cadastro, validação de e-mail
autorizado, links para o Substack. Container central vira `Panel` (radius 28px) sobre fundo
`--ds2-bg-app` + gradiente de ambiente; título em Fraunces; inputs com `--ds2-border-medium`
e focus laranja; botão primário pill; mensagens de erro/aviso mantêm semântica (vermelho) com
superfícies DS2.
**Escopo incluído:** estilo de todos os estados visuais (login, cadastro, erro de autorização,
aviso "apenas assinantes", loading).
**Escopo excluído:** QUALQUER mudança em `supabase.auth.*`, `emailRedirectTo`, validações,
rotas de verificação — o fluxo de signup já quebrou em produção no passado (v3.3.1);
só CSS/classes/estrutura JSX de apresentação.
**Arquivos prováveis:** `src/app/(app... ou publico)/auth/page.tsx` (grupo conforme 101).
**Dependências:** 102, 114.
**Critérios de aceite:** login real do dono funciona; cadastro com e-mail NÃO autorizado mostra
o aviso correto; reset link visível; screenshots antes/depois.
**Riscos:** tocar sem querer na lógica de auth — diff deve mostrar só apresentação.

## ISSUE-116 — Restyle /dashboard (Mapa de Atividades)

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Alta
**Complexidade:** Alta
**Modelo recomendado:** Sonnet (sessão dedicada; é a tela-coração do produto)
**Objetivo:** o mapa Impacto × Clareza no DS2 — a tela que aparece no vídeo de demo da home.
**Contexto:** `src/app/dashboard/page.tsx` + `src/components/mapa/index.tsx` (1075 linhas) +
`src/components/mapa-atividades-modular.tsx` (688 linhas, ATIVO — importado pelo dashboard).
Elementos: formulário de atividade (sliders 1–6), gráfico scatter (recharts), tabela/cards por
zona, matriz mobile com swipe. Conversão: containers viram Card/Panel DS2; títulos de seção em
Fraunces; labels de zona em mono; tooltips e eixos do recharts com `--ds2-text-muted`;
**pontos/badges de zona MANTÊM os hex das zonas ROI**.
**Escopo incluído:** todas as superfícies visuais das 3 visualizações (form, gráfico, lista) +
estados vazios + notificações.
**Escopo excluído:** cálculo de zonas, persistência Supabase/localStorage, jitter do gráfico,
gestos de swipe (lógica), exports.
**Arquivos prováveis:** os 3 acima.
**Dependências:** 114 (padrão definido).
**Critérios de aceite:** fluxo manual — criar, editar, mover e excluir atividade; gráfico
clicável; swipe mobile; export PNG ainda gera imagem legível (fundo escuro novo);
screenshots antes/depois de cada visualização.
**Riscos:** export PNG/relatórios que capturam DOM podem ficar ilegíveis com fundo novo —
testar export explicitamente.

## ISSUE-117 — Restyle /diagnostico (análise de foco)

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Média
**Complexidade:** Média
**Modelo recomendado:** Sonnet
**Objetivo:** página de diagnóstico do assinante no DS2 (a rota fica intocada em URL e lógica —
decisão do dono: "funciona bem, vira referência").
**Contexto:** `src/app/diagnostico/page.tsx` (754 linhas) + `src/components/diagnostico/index.tsx`
(841 linhas): cards de resultado, gráficos de mix, CTA para plano de ação, export PDF (jsPDF).
**Escopo incluído:** superfícies, tipografia, cards de insight (usar Card/card-featured),
barras/medidores com `--ds2-gradient-primary` onde forem progresso (nunca onde forem zona ROI).
**Escopo excluído:** `diagnostico-engine.ts` (motor), geração de PDF (conteúdo), fluxos.
**Dependências:** 114.
**Critérios de aceite:** diagnóstico gera com dados reais; PDF exporta legível; CTA para
/plano-acao funciona; screenshots antes/depois.
**Riscos:** PDF herda estilos da tela — validar contraste no arquivo gerado.

## ISSUE-118 — Restyle /plano-acao (Framework DAR CERTO)

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Média
**Complexidade:** Alta
**Modelo recomendado:** Sonnet (sessão dedicada; arquivos grandes)
**Contexto:** `src/app/plano-acao/page.tsx` (1622 linhas) + `src/components/plano/index.tsx`
(1791 linhas — maior arquivo do projeto): táticas por categoria (8 categorias DAR CERTO),
sugestões da heurística V2.1, edição inline. Categorias ganham badges mono; cards de tática
viram Module; sugestões IA viram card-featured.
**Escopo incluído:** superfícies e tipografia de toda a página + modais.
**Escopo excluído:** `heuristica-engine.ts`, ordenação, persistência, sincronização com Kanban.
**Dependências:** 114.
**Critérios de aceite:** criar/editar/excluir tática; aceitar sugestão da heurística;
sincronização aparece no Kanban; screenshots antes/depois.
**Riscos:** tamanho do arquivo → fazer por regiões e commitar em passos pequenos na mesma issue.

## ISSUE-119 — Restyle /painel-semanal (Kanban)

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Média
**Complexidade:** Média
**Modelo recomendado:** Sonnet
**Contexto:** `src/app/painel-semanal/**` + `KanbanPage.tsx` (1200 linhas), drag & drop com
@dnd-kit. Colunas viram Panel; cards de tática viram Card com badge mono de categoria e o
badge de horas (`estimativaHoras` — corrigido na v3.5.3); estados de arrasto mantêm affordance
(sombra/escala leve permitida aqui).
**Escopo incluído:** colunas, cards, header da semana, estados vazios, indicadores de sync.
**Escopo excluído:** lógica de DnD, `lib/kanban/database.ts`, sincronização
localStorage↔Supabase.
**Dependências:** 114.
**Critérios de aceite:** arrastar entre colunas persiste após reload; badge de horas visível;
mobile drag funciona; screenshots antes/depois.
**Riscos:** CSS de drag do @dnd-kit sensível a transform/overflow — testar em touch real.

## ISSUE-120 — Restyle /relatorios + /perfil + /configuracoes + /admin/assinantes

**Fase:** 1B
**Tipo:** UI
**Prioridade:** Baixa
**Complexidade:** Média (volume, não dificuldade)
**Modelo recomendado:** Sonnet (ou leve, com o padrão das issues anteriores consolidado)
**Contexto:** 4 páginas de suporte (259–710 linhas cada). Mesma conversão mecânica do §5 do
doc 08. `/admin/assinantes` inclui tabela CRUD — usar Table existente com superfícies DS2;
dropdowns/selects PRECISAM manter fundo escuro legível (bug histórico v3.2.0).
**Escopo excluído:** APIs de admin, exports LGPD (lógica), CRUD.
**Dependências:** 114.
**Critérios de aceite:** CRUD de assinante funciona (dono testa); export LGPD gera; selects
legíveis; screenshots antes/depois.

---

## FASE 1.5 — Otimização pós-lançamento

## ISSUE-201 — Baseline + relatório de funil (2 semanas de dados)
**Tipo:** Analytics · **Prioridade:** Alta · **Complexidade:** Baixa · **Modelo:** Sonnet + dono
Consolidar CPL, conversão por etapa e por cluster (novo vs `/pre-diagnostico`); decidir
migração de campanhas. Critério: decisão documentada com números.

## ISSUE-202 — Testes A/B de hero e CTA
**Tipo:** Frontend/Analytics · **Prioridade:** Alta · **Complexidade:** Média · **Modelo:** Sonnet
Variantes B/C/D do doc §8.2 e testes 1–4 do §22; mecanismo simples (split por cookie +
dimensão no evento). Sem lib paga.

## ISSUE-203 — Sequência de e-mails 2–4 (nutrição)
**Tipo:** Backend/Copy · **Prioridade:** Média · **Complexidade:** Média · **Modelo:** Sonnet
Depende de 113. Conteúdo literal do doc §15.2–15.4. Agendamento: decidir entre cron Vercel e
disparo manual documentado.

## ISSUE-204 — /comece-aqui e /sobre
**Tipo:** Frontend/Copy · **Prioridade:** Média · **Complexidade:** Baixa · **Modelo:** leve
Trilha de entrada (doc estratégico §7; contexto editorial §10.1) + manifesto/credibilidade.

## ISSUE-205 — Acessibilidade e performance
**Tipo:** UI/Testes · **Prioridade:** Média · **Complexidade:** Média · **Modelo:** Sonnet
WCAG AA nos fluxos novos; performance budget; imagens OG/hero otimizadas; revisar impacto das
3 famílias de fonte.

## ISSUE-206 — Landing âncoras por cluster de campanha
**Tipo:** Frontend/SEO · **Prioridade:** Baixa · **Complexidade:** Média · **Modelo:** Sonnet
Variações de entrada por intenção (doc §17); só depois da 201 provar onde vale.

## ISSUE-207 — Aposentadoria do /pre-diagnostico (se e quando 201 mandar)
**Tipo:** Frontend/Analytics · **Prioridade:** Baixa · **Complexidade:** Média · **Modelo:** Fable 5
Redirect 308 + preservação de histórico de dados + comunicação. NUNCA antes da paridade de CPL.

## ISSUE-208 — Plano de melhoria de Google Ads
**Tipo:** Analytics/Estratégia · **Prioridade:** Média · **Complexidade:** Baixa · **Modelo:** Fable 5 + dono
Consolidar o plano de evolução de mídia registrado na decisão de 2026-07-05: (a) avaliar
separação de labels de conversão por funil (hoje unificado no
`AW-16601345592/0K0dCMm6oo4bELjckew9` por decisão do dono); (b) campanhas por cluster de
intenção (doc operacional §17); (c) valores de conversão diferenciados por qualidade de lead;
(d) revisão de Quality Score/message match pós-reposicionamento. Entregável: documento de
plano + especificação de mudanças para o dono aplicar no Google Ads/GTM.

## ISSUE-209 — Banner de consentimento de cookies (LGPD) para os cookies de tracking
**Tipo:** Compliance/Analytics · **Prioridade:** Média · **Complexidade:** Média
**Modelo:** Fable 5 (persona Analytics & Ads — banner mal feito derruba a conversão que paga
as contas; avaliar Google Consent Mode v2 antes de qualquer bloqueio de tag)
Registrada em 2026-07-09 (surgiu na ISSUE-311): o site dispara cookies de tracking/marketing
(GTM `GTM-PDJ2K5BX`, GA4, Google Ads) **sem banner de consentimento** — gap pré-existente de
LGPD. O cookie de sessão do login NÃO exige consentimento (estritamente necessário; a
/privacidade já documenta ambos desde a 311). Escopo: banner/gestor de consentimento +
Google Consent Mode v2 + teste de que a conversão Ads continua medindo (trava do CLAUDE.md).
**Dep.:** nenhuma técnica; decidir timing com o dono (toca o funil que converte).

## ISSUE-210 — Revisão da taxonomia de ÁREAS de atuação (`op_area`)
**Tipo:** Conteúdo/Taxonomia · **Prioridade:** Média · **Complexidade:** Baixa
**Modelo:** Fable 5 rascunha a lista + dono aprova (é vocabulário de marca e segmentação).
Registrada em 2026-07-11 (feedback do 1º teste do wizard, ISSUE-313): a lista de áreas
(`op_area` em `src/lib/radar/oportunidades.ts`) pode não abranger todo o público — falta clara
de **TI/Tecnologia**; candidatos: Logística/Supply, Compras/Procurement, Dados/BI, Comunicação/
PR, Administrativo, Saúde, Educação. ⚠️ **É vocabulário COMPARTILHADO com o Radar de
Oportunidades** — mexer aqui muda o quiz do radar também; `op_area` tem `scored:false` (não
pontua, só personaliza exemplos e segmenta → baixo risco técnico). Escopo: definir a lista com
o dono; adicionar ids/labels; opcionalmente estender os overrides de cena por área
(`CENA_POR_AREA` em `wizard-flow.ts`, hoje só 5 áreas — as demais caem no genérico, que já
existe). **Dep.:** nenhuma. **Risco:** baixo (aditivo; ids congelados não mudam, só entram novos).

---

## FASE 2 — Valor de produto (Lab) — 🔼 PROMOVIDA em 2026-07-09 · plano detalhado em `13_plano_fase1_lab.md`

A sessão de planejamento dedicada aconteceu em 2026-07-09: o handoff estratégico
(`docs/GPT Project Revamp/handoff_conversas_lab_fase1.md`) redefiniu o Lab de "ferramentas
separadas" (301–304) para uma **Jornada Guiada de Construção única** (wizard → classificação →
plano salvo → biblioteca conectada → perfil). O plano completo — diagnóstico, telas, modelo de
dados, IA, premium e critérios de aceite — está em **`13_plano_fase1_lab.md`**; decisões do
dono na pergunta 14 do `00b_open_questions.md`. A execução usa a **série 310+** abaixo.
Largada autorizada **em paralelo** às pendências do launch do funil (ISSUE-112).

## ISSUE-301 — ⛔ SUPERSEDED (2026-07-09) — Wizard "Que solução devo construir?"
Absorvida pela jornada única: o wizard virou a entrada da jornada (ISSUE-313).
## ISSUE-302 — ⛔ SUPERSEDED (2026-07-09) — Classificação em 4 níveis de app
Absorvida: a classificação (9 tipos, incl. os 4 níveis de app) é o coração do diagnóstico da
jornada (ISSUE-312/314), não uma página educativa separada.
## ISSUE-303 — ⛔ SUPERSEDED (2026-07-09) — Builder Canvas
Vira artefato sugerido no plano + ativo da biblioteca (ISSUE-316/326), não tela própria.
## ISSUE-304 — ⛔ SUPERSEDED (2026-07-09) — PRD Kit
Idem 303: template na biblioteca, orientado aos 4Ds (ISSUE-316/326).
## ISSUE-305 — Área premium inicial + fluxo direto Stripe → absorvida pela ISSUE-325 (Fase 1C)
Contexto registrado (dono, 2026-07-05): hoje a assinatura paga é intermediada pela newsletter
(Substack) com autorização MANUAL — o dono adiciona o e-mail em `authorized_emails` e envia
boas-vindas. Volume atual baixíssimo (meses sem assinante pago novo) → manual é suficiente por
ora. Esta issue mapeia e implementa o fluxo direto quando fizer sentido:
`página /lab ou /premium → Stripe Checkout (assinatura R$15–29/mês, preço a definir) →
webhook `checkout.session.completed` (rota `api/stripe/webhook`, service_role) → INSERT em
`authorized_emails` + e-mail de boas-vindas via Resend → login liberado`. Inclui: produto/preço
no Stripe (dono cria no dashboard), tratamento de cancelamento (webhook
`customer.subscription.deleted` → expirar autorização), página de gestão mínima. Decisão
pendente na abertura: Stripe substitui ou convive com o plano pago do Substack (recomendação:
convivem — Substack para quem já está lá, Stripe para conversão direta do site).
## ISSUE-306 — Primeiros 10 ativos premium → absorvida pelas ISSUE-316 (seed inicial, 1A) e ISSUE-326 (completar + paywall, 1C)
## ISSUE-307 — Mentoria e palestras sobre IA no portfólio de produtos
Registrado em 2026-07-06 (dono): as pesquisas/formulários mostram demanda de **empreendedores**
(problemas complexos, sem tempo, precisam de aprendizado estruturado) e o dono quer oferecer
**mentoria e palestras sobre IA** como produtos do portfólio — fora da plataforma, mas presentes
na página inicial. Escopo a detalhar quando a Fase 1 provar: seção/página de portfólio, captura
de interesse (possível reuso de `lab_interest` ou flag própria), segmentação dos leads por área
(`Empreendedor` já capturado no radar desde a Fase 1, ver doc 11 §9.6). **Na Fase 1 não se
promete nada disso na home** (regra anti-promessa do §12 da product spec).

## SÉRIE 310+ — Jornada Guiada de Construção (execução da Fase 2 / Lab)

> Detalhe completo de cada issue (escopo, modelo de dados, critérios): `13_plano_fase1_lab.md`
> §8. Rotas em português: `/lab/inicio`, `/lab/novo-projeto`, `/lab/projeto/[id]`,
> `/lab/biblioteca`, `/lab/perfil`. Route group novo `(lab)` com LabShell DS2 próprio —
> **proibido tocar no AppShell/`(app)` legado**. Padrão de segurança: RLS `auth.uid()` +
> REVOKE seletivo (herda a disciplina da ISSUE-106 e da auditoria da Fase 3).
>
> **Critério de modelo (registrado em 2026-07-09, mesma regra de `05_model_execution_strategy.md`
> §1):** Fable 5 onde o custo do erro é alto (segurança/RLS/pagamento), onde a issue **fecha
> uma spec de conteúdo ainda aberta** (voz da marca — perguntas do wizard, texto dos planos por
> tipo, ativos da biblioteca), ou onde é gate/QA/tracking público. Sonnet onde a spec já está
> fechada — inclusive **dentro da mesma issue**, quando ela tem uma metade de decisão (Fable 5)
> e uma metade de execução mecânica (Sonnet): registrado issue a issue abaixo.

### Fase 1A — Protótipo navegável sem IA (ordem de execução)

## ISSUE-310 — SQL das tabelas do Lab (`lab_profiles`, `lab_projects`, `lab_assets`)
**Status:** ✅ concluída em 2026-07-09 — SQL rodado em produção pelo dono
(`docs/revamp/ISSUE-310-sql-lab.md`); 4 SELECTs de verificação auditados (RLS on, 7 políticas
`{authenticated}`, privilégios corretos, 3 triggers) + teste anon nas 3 tabelas devolvendo
`42501 permission denied`. Isolamento entre 2 contas fica pro roteiro da 314/319 (sem UI ainda).
**Tipo:** Dados/SQL · **Prioridade:** Alta · **Complexidade:** Média · **Modelo:** Fable 5 + dono (roda SQL no painel)
RLS por usuário + REVOKE; JSONB versionado (`engine_version`) para diagnóstico/plano; SELECTs
de verificação. **Dep.:** nenhuma. **Risco:** primeira RLS `auth.uid()` em tabela nova — auditar.

## ISSUE-311 — Route group `(lab)` + LabShell + gate server-side (`@supabase/ssr`)
**Status:** ⚠️ parcial em 2026-07-09 — implementada e validada nos caminhos anônimos; falta o
roteiro logado do dono. Entregue: sessão migrada de localStorage → **cookie**
(`createBrowserClient`; decisão do dono com ciente do relogin único; cookie de auth é
estritamente necessário — LGPD ok, /privacidade ganhou seção de cookies);
`src/lib/supabase-server.ts` (sessão + `verificarAutorizacao` via service role);
`src/middleware.ts` ESCOPADO só às rotas logadas do Lab (refresh de token + anônimo →
`/auth?next=` — testado no build de prod: **307 server-side, zero flash**; vitrine `/lab`,
home, `/auth` e `/dashboard` intocados); gate no layout `(lab)` (não autorizado → tela "beta
fechado" DS2; `plan_type ≠ 'lab_beta'` → link discreto pro legado); `LabShell` DS2 (Início
ativo · Biblioteca/Perfil "em breve"); esqueleto `/lab/inicio`; `?next=` no `/auth` (com
guarda anti open-redirect). Nasceu a **ISSUE-209** (banner de consentimento pros cookies de
tracking — gap pré-existente achado na conversa de LGPD). tsc/lint/build limpos.
**Falta (roteiro do dono, precisa de conta real):** login → volta pro `/lab/inicio`; conta
autorizada vê o shell; conta não autorizada vê "beta fechado"; logout limpa e volta pra home;
relogin único no legado pós-migração de cookie.
**Tipo:** Frontend/Auth · **Prioridade:** Alta · **Complexidade:** Média · **Modelo:** Fable 5
Casca da área logada com navegação DS2 (Início · Biblioteca · Perfil); anônimo → `/auth` sem
flash; logado não autorizado → tela "beta fechado"; link discreto pro legado **só para
assinantes antigos** (decisão pergunta 14). **Dep.:** nenhuma. **Risco:** introduz
`@supabase/ssr` — testar login/logout ponta a ponta.

## ISSUE-312 — Motor do Lab (adaptador wizard→classificação + gerador de plano, lib pura)
**Status:** ✅ concluída em 2026-07-09 — `src/lib/lab/{types,engine,plan-generator}.ts` + 2
suites vitest (76 testes verdes no total, 9 tipos cobertos ponta a ponta); classificação 100%
reusada do motor do radar; templates de plano na voz da newsletter semeados pelo `content.ts`;
registro canônico de 10 slugs de materiais exportado (`SLUGS_CANONICOS`) como contrato da 316;
tsc/lint/build limpos. Contrato de entrada `WizardAnswers` v1 fixado — a spec de perguntas da
313 decide o texto, não os ids.
**Tipo:** Lógica/Testes · **Prioridade:** Alta · **Complexidade:** Média
**Modelo:** Fable 5 — o adaptador de classificação é mecânico (reusa `oportunidades.ts`), mas
os **templates de plano por tipo × área × fluência são texto de metodologia/marca**, mesmo
critério da revisão da matriz de pesos do radar (dentro da 104).
`src/lib/lab/engine.ts` (reusa motor de `radar/oportunidades.ts`) + `plan-generator.ts`
(templates por tipo × área × fluência, semeados pelo `content.ts`) + testes vitest cobrindo os
9 tipos. **Dep.:** nenhuma. **Risco:** baixo.

## ISSUE-313 — Wizard `/lab/novo-projeto`
**Status:** ⚠️ implementada por completo em 2026-07-11 (v3.11.7) — **falta só o roteiro
manual do dono** (3 portas com conta real + mobile). Entregue nesta data: UI completa da
"Conversa de Consultor" sob a spec v2.1 + decisões de UX da pergunta 16 do `00b` (notas do
consultor manuscritas como protagonista — fonte Caveat só na rota; split-screen desktop /
coluna única mobile; ritmo ágil; framer-motion + lucide animado padrão pqoqubbw, zero dep
nova). Componentes em `src/components/lab/wizard/` (orquestrador, notas, etapas de todos os
formatos, espelho com ajuste por dimensão, desempate transparente, proposta assistida com
alternativas); rascunho salvo por virada de bloco + retomada no ponto certo; rotas
`api/lab/projects` (POST) e `[id]` (PATCH rascunho/finalizar — motor roda NO SERVIDOR, com
`validarCompleto` estrito de `validacao.ts`); `ajustarDiagnosticoParaTipo` no engine
(aditivo — plano segue a ESCOLHA, pontuação preserva o veredito); esqueleto mínimo de
`/lab/projeto/[id]` pra receber o redirect (página real segue sendo a 314); CTA real no
`/lab/inicio`. 138 testes verdes · tsc/lint/build limpos · smoke anônimo: 307 sem flash nas
rotas do Lab, 401 nas APIs, rotas públicas intocadas.
**🔎 Feedback do 1º teste do dono (2026-07-11) — roteado, não perdido:**
- **Moldura antes das 3 opções:** ✅ RESOLVIDO na própria 313 nesta data — a proposta agora
  abre com beat "analisando teu caso…" + leitura do consultor ("analisei; pra [benefício] eu
  recomendo [tipo]; lê os três e escolhe o que é o teu"). Era o "final frio" que ele apontou.
- **Lista de áreas pode não abranger todos** (falta TI/Tecnologia, provavelmente Logística/
  Supply, Compras, Dados/BI, Comunicação, Administrativo): é o `op_area` do Radar (vocabulário
  **compartilhado**, `scored:false` → baixo risco técnico, mas toca o Radar e é voz de marca).
  → **registrado como ISSUE-210** (revisão de taxonomia de áreas, Fable 5 + dono aprova a lista).
- **"Página do projeto fria/genérica/determinística" + "e depois? salva? começa?":** era o
  ESQUELETO que a 313 deixou no lugar — é exatamente o que a **ISSUE-314** resolve (tela
  diagnóstica, texto pré-formatado, checklist, "começar", materiais). Sinal forte pra 314.
- **"O plano saiu errado" (fluidez/realidade do negócio):** duas pistas — revisão editorial
  dos templates determinísticos (**312/content**, Fable 5) e a profundidade real com IA
  (passo a passo detalhado) que é a **fase 1B / ISSUE-320-321**. Ele mesmo intuiu "conectar IA".

**Histórico:** ⚠️ 2026-07-09 — spec v2.1 aprovada + MOTOR COMPLETO implementado e auditado
(v3.11.5). Spec "Conversa de Consultor"
(`docs/revamp/ISSUE-313-spec-wizard.md`): 4 blocos, 3 trilhas (ideia/dor/difusa), hipóteses
pré-marcadas, `ambiente[]` (arsenal), slider de horas, desempate condicional, proposta +
alternativas; IA só na ISSUE-320 (slots com fallback). Motor entregue em `src/lib/lab/`:
schema v2 (`types.ts`), árvore como dado (`wizard-flow.ts`), `diagnosticarV2` (`engine.ts`,
motor do radar intocado), `desempate.ts` (pergunta derivada da matriz — 36 pares
discrimináveis), `plan-generator` 1.1.0 (linha de arsenal + diligência shadow + manchete
quantificada) e **auditoria exaustiva das 700.000 combinações** (`auditoria.test.ts`) — que
já pagou: calibrou o `LIMIAR_DESEMPATE` de 1→0 (56%→22,7% de disparo) com guarda-corpo <30%
no CI. 125 testes verdes (eram 76). **Falta só a UI:** telas dos 4 blocos + rascunho por
bloco + rotas `api/lab/projects` (Sonnet, sob a spec fechada) — dependências (310, 311, 312)
todas satisfeitas, **próxima sessão elegível**. **Impacto sinalizado na 314** (proposta
escolhida, não veredito — §9 da spec).
**Tipo:** Frontend · **Prioridade:** Alta · **Complexidade:** Média-alta
**Modelo:** **Fable 5 fecha as perguntas do wizard com o dono (sessão de spec) → Sonnet
implementa o formulário sob a spec fechada.** Não pular a 1ª etapa: as perguntas exatas ainda
não foram revisadas — é o mesmo caso do ISSUE-105 (voz da marca no momento de pico de atenção).
4 passos (~10 campos do handoff §8.1.2 — **revisar as perguntas com o dono antes de codar**);
rascunho salvo por passo; submissão roda a 312 e redireciona pro projeto. **Dep.:** 310–312.

## ISSUE-314 — Página do projeto `/lab/projeto/[id]` (diagnóstico + plano + materiais)
**Tipo:** Frontend · **Prioridade:** Alta · **Complexidade:** Média
**Modelo:** **Fable 5 escreve a copy/estrutura da tela (é a tela que precisa "parecer diferente
de um chat genérico" — equivalente à ISSUE-105) → Sonnet implementa o componente sob a spec
fechada.**
Classificação + plano com checklist persistido + materiais recomendados; projeto alheio → 404
(testar com 2 contas). **Dep.:** 312, 313.
> 🔎 **Do teste do dono (2026-07-11):** o esqueleto que a 313 deixou aqui foi sentido como
> "frio/genérico/determinístico" e sem "e depois?". Esta issue é a resposta — tela DIAGNÓSTICA
> com texto pré-formatado e robusto, não tabela seca; deixar claro o próximo passo (começar/
> salvar/checklist/materiais). É a tela que "não pode parecer chat genérico" (crit. do Modelo).

## ISSUE-315 — Hub `/lab/inicio` com estados reais
**Tipo:** Frontend · **Prioridade:** Alta · **Complexidade:** Baixa
**Modelo:** Sonnet — estados de tela mecânicos, sem decisão de voz pendente (313/314 já fixaram
o padrão visual).
Estados vazio / 1 projeto / vários; "continue de onde parou" com progresso. **Dep.:** 311, 313, 314.
> 🔎 **Do teste do dono (2026-07-11):** hoje, terminado o wizard, não há como RECONSULTAR o
> projeto depois — o hub é esqueleto e não lista nada. É esta issue que precisa mostrar o
> histórico de projetos (e o link de volta pra cada um), fechando o "não consigo voltar nele".

## ISSUE-316 — Biblioteca `/lab/biblioteca` + seed dos primeiros 6–10 ativos
**Tipo:** Frontend/Conteúdo · **Prioridade:** Alta · **Complexidade:** Média
**Modelo:** Sonnet no código (filtro/render é trivial) + **Fable 5 rascunha o conteúdo dos
ativos, dono aprova** (decisão pergunta 14) — o gargalo desta issue é conteúdo, não código.
Filtros por tipo/formato, leitura markdown; ativos rascunhados pelo Claude a partir do
`content.ts`, **publicação só com aprovação do dono**; zero slug quebrado nos planos.
**Dep.:** 310, 311. **Risco:** gargalo é conteúdo.

## ISSUE-317 — Perfil do Builder `/lab/perfil`
**Tipo:** Frontend · **Prioridade:** Média · **Complexidade:** Baixa · **Modelo:** Sonnet — form simples, spec fechada.
Form único (área, senioridade, fluência, objetivo, gargalo); alimenta personalização da 1B.
**Dep.:** 310, 311.

## ISSUE-318 — Analytics `lab_*` + vitrine `/lab` em modo beta + rotina de convites
**Tipo:** Analytics/Growth · **Prioridade:** Alta · **Complexidade:** Média
**Modelo:** Fable 5 (persona Analytics & Ads) — toca tracking público, trava crítica do
projeto; qualquer issue que mexa nisso pede a persona dedicada, sem exceção.
Eventos novos no padrão `radar-events.ts` + spec GTM pro dono; vitrine ganha estado "beta no
ar"; doc da rotina de convite (`lab_leads` → `authorized_emails` `plan_type='lab_beta'` +
Resend). **⚠️ Toca página pública — revalidar conversão GTM/Ads antes de commitar.**
**Dep.:** 313–315.

## ISSUE-319 — Gate de QA da Fase 1A
**Tipo:** QA · **Prioridade:** Alta · **Complexidade:** Média
**Modelo:** Fable 5 + dono (dispositivos reais) — papel de "QA final cético e gate de launch",
mesmo critério da ISSUE-112.
Critérios do §9 do doc 13: jornada completa <10min no celular, RLS com 2 contas, Lighthouse
≥85 nas rotas novas, funis públicos revalidados, métrica norte ("projetos que chegam a plano")
mensurável. **Dep.:** 310–318.

### Fase 1B — IA controlada (OpenAI, modelo barato — decisão pergunta 14)

## ISSUE-320 — Infra de IA (SDK OpenAI, env, rota server, telemetria de tokens, limites)
**Modelo:** Fable 5 — 1ª integração de IA no projeto: decisão arquitetural de schema
estruturado, fallback e custo, mesmo critério da ISSUE-101 (define o padrão que as próximas
issues de IA replicam).

## ISSUE-321 — Entrevista complementar `/lab/projeto/[id]/entrevista` (3–5 perguntas geradas, formulário — nunca chat; fallback gracioso se a IA falhar)
**Modelo:** Sonnet, sob review Fable 5 — uma vez a 320 fixar o padrão, é replicação
disciplinada (mesmo raciocínio da Fase 1B do restyle: "a 114 define, da 115 em diante é
replicação").

## ISSUE-322 — Plano enriquecido por IA + export Markdown (justificativa da classificação; regeneração limitada)
**Modelo:** Sonnet, sob review Fable 5 — mesma lógica da 321; a justificativa em linguagem
natural pode pedir 1 passada de Fable 5 se soar genérica.

## ISSUE-323 — Medição da 1B (eventos de entrevista, custo por projeto, critério "IA melhora sem virar chat")
**Modelo:** Sonnet — analytics mecânico, spec fechada.

### Fase 1C — Premium inicial

## ISSUE-324 — Modelo de planos free × premium (`src/lib/lab/limits.ts`: free = 1 projeto, plano resumido, biblioteca parcial)
**Modelo:** Fable 5 — é decisão de produto (onde cortar), não implementação.

## ISSUE-325 — Stripe (absorve a ISSUE-305: checkout, webhooks, `authorized_emails`, boas-vindas Resend; convive com Substack)
**Modelo:** Fable 5 configura/revisa webhooks e fluxo de acesso (custo de erro alto — cobrança
ou acesso errado) → Sonnet implementa sob a spec fechada.

## ISSUE-326 — Biblioteca premium + export PDF (absorve a ISSUE-306: completar 10+ ativos, paywall efetivo, materiais `origin='workshop'`)
**Modelo:** Sonnet no código + Fable 5/dono no conteúdo — mesmo padrão da 316.

### Fase 2 do Lab — Integração com workshops

## ISSUE-330 — Acesso/cupom por turma de workshop, materiais da turma na biblioteca, feedback e cases
**Modelo:** a definir na abertura (fora do escopo imediato da Fase 1).

## FASE 3 — Ecossistema / Lab (resumo)

## ISSUE-401 — Trilha Artesanato Digital (curso autoguiado)
## ISSUE-402 — Biblioteca de casos de uso corporativos
## ISSUE-403 — Playbooks por área
## ISSUE-404 — App Readiness Checklist
## ISSUE-405 — Miniapps internos do Lab

## FASE 4 — Evolução contínua

## ISSUE-501 — Meta-issue: processo de abertura de issues por domínio
Toda feature nova nasce como issue neste arquivo (ou no GitHub Issues se o projeto migrar),
com o mesmo formato, marcada por tipo (produto/UI/UX/conteúdo/dados/integrações/premium/
analytics/testes/documentação) e com recomendação de modelo. Usar `/nova-feature` na execução.
