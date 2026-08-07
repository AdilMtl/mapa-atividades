# ISSUE-319 — Relatório do Gate de QA da Fase 1A

**Data da rodada:** 2026-08-06 · **Executor:** Fable 5 (persona "QA final cético e gate de launch") ·
**Base:** v3.11.39, working tree limpo, commit `2923c6e`.

**Contexto da rodada:** o dono aprovou **em bloco** (decisão de 2026-08-06, nesta sessão) as
pendências manuais acumuladas das issues 311, 313, 314D, 318 e 318B, mais as herdadas da 318C
(teste do dropout no painel, UTM em produção), com reavaliação futura a critério dele. Os
critérios abaixo marcados **APROVADO EM BLOCO** dependem dessas validações manuais e foram
aceitos nessa condição — não foram executados nesta rodada.

---

## Veredito

**8 dos 9 critérios do §9 passam** (parte por verificação automatizada, parte pela aprovação em
bloco do dono). **1 critério tem um FALHOU objetivo e novo** — o alvo Lighthouse ≥85 de
performance não é atingido em nenhuma rota pública medida, nem no ambiente local nem em
produção. O achado está detalhado abaixo; a causa dominante é **peso de terceiros** (GTM/Ads —
infraestrutura de tracking intocável por decisão do projeto — e o embed do Substack na home),
não o código novo da Fase 1A, cujo payload próprio é leve (First Load JS 106–188 kB).

**O gate, como escrito ("zero FALHOU"), não fecha nesta rodada.** A decisão é do dono:
**(a)** aceitar com ressalva declarada e rotear a performance para a **Fase 1.5**, que já prevê
"performance" no escopo (README §3) — o selo sai com essa nota; ou **(b)** tratar antes do selo
(qualquer mexida no carregamento do GTM é mudança de tracking → persona Analytics & Ads,
validação de conversão obrigatória).

---

## Os 9 critérios (§9 do `13_plano_fase1_lab.md`)

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| 1 | Proposta clara (teste dos 5s, ≥3 pessoas de fora) | 🟡 APROVADO EM BLOCO | Único critério que exige terceiros; não rodado. Fica como pendência declarada do dono. |
| 2 | Jornada completa <10min no celular, sem ajuda | 🟡 APROVADO EM BLOCO | Coberto pelos roteiros manuais das issues 311 (login/gate) e 313 (wizard, 3 portas + mobile), aprovados em bloco. |
| 3 | Diagnóstico útil (9 tipos, explicação, consistente com o radar) | ✅ PASSOU | Motor 100% reusado do radar (`lab/engine.ts`); suítes vitest cobrem os 9 tipos ponta a ponta (dentro dos 456/456 verdes). |
| 4 | Plano real (resumo + etapas + checklist + artefato + ≥2 materiais) | ✅ PASSOU | `plan-generator.ts` testado; `SLUGS_CANONICOS` (10 slugs) é o contrato com a biblioteca — materiais linkados existem. |
| 5 | Persistência + RLS (refresh, 2 contas, usuário B não vê A) | 🟡 APROVADO EM BLOCO | Roteiro de 2 contas é manual (dono). Base técnica já verificada: RLS auditada na Fase 3, gate server-side de admin/lab corrigido na 318, motor roda no servidor com validação estrita. |
| 6 | Biblioteca mínima (6–10 ativos, filtráveis, mobile) | ✅ PASSOU | 10 guias publicados; leitura no mobile validada pelo dono na 316B (2026-07-29). |
| 7 | Diferente de chat (zero conversa livre) | ✅ PASSOU | Nenhum campo de texto livre conversacional nas rotas do Lab; IA futura já tem lugar reservado em fluxo estruturado (spec 320/321). |
| 8 | Não-regressão (funis, legado, tsc/lint/build, Lighthouse ≥85) | 🔴 PARCIAL | Detalhe abaixo — tudo passa, **exceto o alvo Lighthouse de performance**. |
| 9 | Métrica norte ("projetos que chegam a plano") mensurável | ✅ PASSOU | Funil do Lab no `/admin/analytics` (Bloco 6, 318A2): contado por tabela (`lab_projects.plan`), exato, acumulado do beta. |

### Critério 8 — decomposição

| Item | Resultado | Evidência (2026-08-06) |
|---|---|---|
| `npx tsc --noEmit` | ✅ limpo | zero erro |
| Suíte de testes | ✅ 456/456 | 18 arquivos, vitest |
| `npm run build` | ✅ verde | 50 rotas; públicas seguem estáticas |
| Lint no código do revamp/Lab | ✅ zero | ESLint escopado em `(publico)`, `(lab)`, `components/{radar,home,lab}`, `lib/{radar,lab,admin,analytics}`, `api/{radar,lab,admin}`, `admin/*`: **zero problema no código novo**. Débito pré-existente declarado: 3 páginas legadas movidas pro `(publico)` (`auth`, `pre-diagnostico`, `privacidade` — 7 erros/4 warnings) + plataforma legada `(app)`. Anterior ao revamp, fora do escopo do gate. |
| Trava de tracking | ✅ intocada | Working tree limpo sobre `2923c6e`; conversão do Ads consertada e validada com Tag Assistant em 06/08 (v3.11.38); gate não tocou código. |
| Funis públicos revalidados | 🟡 APROVADO EM BLOCO | Tag Assistant/GTM Preview são do dono (pendências 318 aprovadas em bloco). |
| **Lighthouse ≥85 (rotas novas)** | 🔴 **FALHOU em performance** | Tabela abaixo. Acessibilidade 93–94 ✅ · SEO 100 ✅ (o 63 do `/obrigado` é o noindex **intencional** de página de agradecimento) · Best Practices 79 em todas (cookies de terceiros dos próprios Google tags — estrutural) · **Performance 27–59, todas abaixo de 85**. |

---

## O FALHOU em detalhe: Lighthouse de performance

**Método:** Lighthouse 12 (npx), Chrome headless, emulação mobile padrão (CPU 4x), 4 categorias.
Rodado em **local** (`npm run build && npm run start`) e em **produção** (Vercel). Rotas logadas
`/lab/*` não são auditáveis sem sessão (middleware redireciona anônimo) — ver ressalvas.

| Rota (produção) | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| `/` (home) | **41** (rerun: 27) | 94 | 79 | 100 |
| `/radar/maturidade` | **51** | 93 | 79 | 100 |
| `/radar/oportunidades` | **41** | 93 | 79 | 100 |
| `/newsletter` | **53** | 93 | 79 | 100 |
| `/lab` (vitrine) | **59** | 94 | 79 | 100 |
| `/obrigado` | **56** | 93 | 79 | 63* |

\* noindex intencional (`is-crawlable=0`) — não é falha.

**Causa (diagnóstico da home em produção):** TBT ~19–22s no traço simulado, dominado por:
- **Google Tag Manager: 7,7s de bloqueio** de thread (492 kB) + `gtag/js` (AW-16601345592) e
  `gtm.js` somando ~8s de CPU — é o stack de conversão que **não pode ser tocado** sem a
  persona Analytics & Ads e revalidação completa;
- **Embed do Substack na home: 2,5 MB** transferidos do substackcdn (imagens do feed);
- Best Practices 79 = cookies de terceiros (Google Ads) — estrutural, some quando o Chrome
  cortar 3P cookies ou com consent mode, não por código nosso.

**Ressalvas de leitura (QA cético):**
1. **Variância alta**: home local deu 16, produção deu 41 e 27 em duas rodadas — máquina do
   audit influencia o throttling simulado. O número exato não é confiável; a conclusão
   ("muito abaixo de 85, por causa de terceiros") é.
2. **O código da Fase 1A não é o problema**: payload próprio das rotas 106–188 kB, CLS ~0 nos
   radares, FCP local dos radares ~2s. "Nascem leves" continua verdadeiro para o que a 1A
   construiu; o peso é herdado do layout (tracking) e da home (embed).
3. **Rotas logadas `/lab/*` sem audit**: exigem sessão real. Proxy disponível: First Load JS
   106–188 kB (mais leve que a home). Se o dono quiser o número real: Lighthouse do DevTools
   no Chrome logado (aba Lighthouse → Analyze), fica a critério dele.

**Recomendação (se a decisão for tratar — vai pra Fase 1.5, não pra cá):** lazy-load do embed
do Substack na home (maior ganho sem tocar tracking); avaliação de consent mode / carregamento
do GTM **somente** com a persona Analytics & Ads e validação de conversão ponta a ponta antes
de qualquer commit. Nenhuma dessas mudanças cabe no escopo da 319.

> **Atualização (mesma data):** o dono decidiu **tratar**. A remediação virou a
> **ISSUE-319B** (ver backlog): Fase A (facade do Substack) já implementada — substackcdn
> zerado do carregamento inicial da home no audit local; Fase B é a limpeza guiada do
> container GTM pelo dono. O gate reavalia o critério 8 após deploy + re-medição.

---

## Pendências que o selo carrega (aprovadas em bloco, reavaliação futura do dono)

1. Roteiro logado da 311 (login → `/lab/inicio`, conta autorizada × não autorizada, logout, relogin legado).
2. Roteiro do wizard da 313 (3 portas, conta real, mobile).
3. Veto de leitura da copy do check-up de resultado (314D).
4. GTM Preview do trigger `CE - Eventos do Lab` + convite real + Tag Assistant no legado (318).
5. Operação real de editar/excluir assinante no celular (318B).
6. Abandono de radar → conferir dropout no painel; UTM em produção (herdadas da 318C).
7. Teste dos 5 segundos com ≥3 pessoas de fora (critério 1).
8. Lighthouse autenticado das rotas `/lab/*` (opcional, ver ressalva 3).
