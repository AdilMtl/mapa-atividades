# HANDOFF — Sessão 2026-07-07 — Execução ISSUE-104 + ISSUE-105

> **Documento de trabalho da sessão** (o contexto será autocompactado — este arquivo é a fonte
> precisa do que fazer). Apagar ou arquivar no `/finalizar-sessao`.
> Modelo da sessão: Fable 5. Git na abertura: limpo, `main` = `3d25bcc` (v3.6.4).

---

## 0. Estado da execução (ATUALIZAR AO CONCLUIR CADA ETAPA)

- [x] ISSUE-104 — `src/lib/radar/types.ts` ✅
- [x] ISSUE-104 — `src/lib/radar/maturidade.ts` (perguntas + scoring + eixos) ✅
- [x] ISSUE-104 — `src/lib/radar/oportunidades.ts` (perguntas + matriz declarativa + motor) ✅
- [x] ISSUE-104 — vitest 4.1.10 instalado + script `npm run test` + `vitest.config.ts` (só lib/radar) ✅
- [x] ISSUE-104 — VALIDADA: **37/37 testes passam** (7 personas + varredura 7.000 combos de
      guard-rails + bordas de faixa + empates + determinismo); `tsc` limpo; `lint` sem nada novo
      em radar/vitest (só débito legado conhecido); `build` verde com as mesmas 24 rotas ✅
- [x] ISSUE-105 — `src/lib/radar/content.ts` completo: 5 maturidade (grátis) + 9 teasers
      (exploração) + 9 diagnósticos (8 blocos §11.6 + 9º "Na prática" com ferramentas da paleta)
      + cruzamento real/estimativa + convite reverso + famílias 2 níveis + bloco diligência +
      exemplos por área (Estudante/Empreendedor em todos os 9 tipos) ✅
- [x] ISSUE-105 — VALIDADA (técnica): 11 URLs conferidas byte a byte contra a fonte (§14);
      grep de frases proibidas limpo ("desbloqueio" achado e reescrito); Records TS garantem
      exaustividade (5 níveis × 9 tipos × 5 estimativas); `tsc`/`lint`/`build`/`test` verdes ✅
      ⚠️ PENDENTE (por definição): dono ler os 14 e aprovar o tom → por isso backlog = parcial.
- [x] Backlog: ISSUE-104 `✅ concluída` · ISSUE-105 `⚠️ parcial — aguarda leitura do dono` ✅
- [ ] Sugerir `/finalizar-sessao` (docs + commit; push só com confirmação do dono) ← PRÓXIMO

## 1. O que é esta sessão

Executar **ISSUE-104** (motor de assessment `lib/radar` — funções puras + vitest) e depois
**ISSUE-105** (conteúdo dos resultados — 14 blocos + teasers + "Na prática") do revamp
+ConverSaaS. Especificação do cérebro do motor **✅ APROVADA pelo dono** em
`docs/revamp/11_motor_radar_pesos_personas.md` (v2) — **a implementação é transcrição fiel;
qualquer desvio volta ao doc 11 primeiro, não se decide no código.**

## 2. Fontes canônicas (ponteiros exatos — NÃO recarregar tudo, só o que precisar)

| O quê | Onde |
|---|---|
| Matriz de pesos (P2–P7), modificadores, guard-rails, desempate | `docs/revamp/11_motor_radar_pesos_personas.md` §4–§6 |
| Corte teaser×completo + eixos radar do teaser (valores normalizados) | doc 11 §7 e §7.1 |
| Cruzamento de maturidade (real via sessionStorage / estimativa por P8) | doc 11 §8 |
| Perguntas da MATURIDADE (versões sutis aprovadas: P1, P3, P5, P7 novas) | doc 11 §2.2 |
| Perguntas maturidade P2, P4, P6 (originais) e opções da P8/fronteira | doc operacional §10.5 (`docs/GPT Project Revamp/conversas_corredor_fase1_execucao_ctas_fluxos_v2_cmo_br.md`) |
| Faixas de score maturidade + textos-base dos 5 níveis | doc operacional §10.6–§10.7 |
| Perguntas do OPORTUNIDADES (8, literais) + 9 tipos + 3 exemplos de resultado | doc operacional §11.4–§11.9 |
| Famílias em 2 níveis (apresentação) | doc 11 §3.1 |
| Paleta de ferramentas por nível (para o "Na prática") | doc 11 §8.2 |
| Personas de validação (7, com resultado esperado) | doc 11 §9 |
| Tipo `RadarResult` base (teaser/gated) | `docs/revamp/02_technical_spec.md` §3.3 |
| Tom de voz + proibições + CTAs | doc contexto editorial §7, §12 (mesma pasta GPT Project Revamp) |
| Mapa de leituras por nível/contexto | `docs/revamp/01_product_spec_faseada.md` §8 |
| Texto das issues (escopo/critérios) | `docs/revamp/04_issue_backlog.md` linhas ~123–196 |

## 3. ISSUE-104 — Especificação de implementação

### 3.1 Arquivos (todos novos; `src/lib/radar/` não existe ainda)

- `src/lib/radar/types.ts` — tipos compartilhados
- `src/lib/radar/maturidade.ts` — perguntas + `calcularMaturidade(respostas)`
- `src/lib/radar/oportunidades.ts` — perguntas + matriz **declarativa** (objeto TS, não
  if/else) + `decidirOportunidade(respostas)`
- `src/lib/radar/maturidade.test.ts` + `src/lib/radar/oportunidades.test.ts`
- `package.json`: vitest em devDependencies + script `"test": "vitest run"`. `vitest.config.ts`
  na raiz (include só `src/lib/radar/**/*.test.ts`). **vitest aprovado pelo dono SÓ para
  `lib/radar/*` — nada de testes de UI.**
- `content.ts` é da ISSUE-105 (não criar na 104; types podem declarar as interfaces de conteúdo).

### 3.2 Regras do motor (resumo executável — canônico no doc 11)

**Maturidade:** 7 perguntas pontuadas (valor = posição da opção, 1–5), total 7–35.
Faixas: Curioso 7–11 · Usuário 12–17 · Operador 18–24 · Builder 25–31 · Referência 32–35.
P8 "fronteira" NÃO pontua (personaliza próximo passo; opções = P7 original do doc op §10.5).
Eixos do gráfico (rótulos): Delegação(P1), Amplitude(P2), Descrição(P3), Construção(P4),
Discernimento(P5), Clareza de formato(P6), Diligência(P7) — valor 1–5. Sem jargão "4Ds" na tela.
Saída: `{ nivel, score, eixos[7], fronteira }`. (Quem grava
`sessionStorage['conversaas.radar.maturidade']` é a UI da ISSUE-103 — o motor é puro.)

**Oportunidades:** 9 tipos, IDs estáveis: `prompt, template, workflow, automacao, dashboard,
app_offline, app_tabela, orquestrado, agentico`. Complexidade: 1,1,2,2,2,3,3,4,5 (nessa ordem).
Pipeline: soma aditiva da matriz (doc 11 §4: P4 freq, P6 dado, P5 público, P7 desejo dominantes;
P2 entrega, P3 perda contextuais; **P1 área = peso ZERO**, só personaliza/segmenta) →
modificadores → desempate:
1. **P6 = "Dados sensíveis"** → automacao −3, orquestrado −3, agentico −3, app_tabela −2,
   workflow −1; `flags.diligencia = true` (sempre).
2. **P8 conforto** → teto de complexidade: Baixo ≤2 · Médio ≤3 · Bom/Alto/Muito alto sem teto.
   Se rebaixou, `flags.rebaixadoPorConforto = true`.
3. **Agêntico nunca é entrada:** `agentico` só vence se P8 ∈ {Alto, Muito alto} **e** P6 =
   "Dados de sistemas"; senão rebaixa pro próximo colocado com complexidade ≤4. Mesmo vencendo,
   o conteúdo (105) é redirect-que-ensina.
4. **Desempate:** menor complexidade; persistindo, ordem fixa
   prompt > template > workflow > automacao > dashboard > app_offline > app_tabela.

Saída: tipo vencedor + `teaser` (família doc 11 §3.1 + eixos normalizados 0–100 do §7.1 +
sinais dominantes 2–3) + `flags` + dados pro cruzamento (§8: estimativa por P8 quando não há
nível real). Determinístico: mesmas respostas → mesmo resultado.

**P1 (área) do oportunidades:** opções do doc op §11.4 **+ 2 novas: `Estudante` e
`Empreendedor / dono de negócio`** (decisão do dono — peso zero, exemplos/analytics próprios).

**IDs de pergunta/opção estáveis e legíveis** (analytics vai depender deles — ex.:
`freq_diario`, `dado_sensiveis`). Não usar índices numéricos como ID.

### 3.3 Testes (vitest) — casos obrigatórios

7 personas do doc 11 §9 (aritmética já conferida manualmente nesta sessão — a matriz fecha):

| Persona | Respostas-chave | Esperado |
|---|---|---|
| 1 Renata | planilhas/consolidando/semanal/liderança/planilha simples/facilitar decisão/bom | `dashboard` (11 vs 5) |
| 2 Marcos | textos/revisando/mensal/meu time/texto livre/ganhar tempo/médio | `prompt` (10 vs 6) |
| 3 Júlia | atendimento/dúvidas repetidas/diário/meu time/**sensíveis**/automatizar/médio | `template` + `flags.diligencia` (empate 4×4 c/ dashboard → menor complexidade) |
| 4 Fernando | status reports/copiando/diário/meu time/sistemas/automatizar/alto | `automacao` (10 vs 6) |
| 5 Camila | atendimento/buscando info/diário/externo/sistemas/automatizar/muito alto | `agentico` (9 vs 8 orquestrado; gate P8+P6 libera) |
| 6 Eduardo | atendimento/dúvidas repetidas/diário/externo/e-mails/automatizar/médio | `automacao` (9; agentico 7 excluído pelo teto) |
| 7 Larissa | textos/buscando info/várias×semana/só eu/documentos/ganhar tempo/bom | `prompt` (empate 7×7 c/ workflow → menor complexidade) |

Casos-limite: extremos da maturidade (7→Curioso, 35→Referência, bordas 11/12, 17/18, 24/25,
31/32); sensível + conforto baixo juntos; empate na ordem fixa; determinismo (2 chamadas
idênticas); agêntico com P8 alto mas P6 ≠ sistemas (não pode vencer); Camila com conforto
médio → rebaixa pro próximo ≤4.

### 3.4 Critérios de aceite da 104

Tabela de validação passa; dado sensível SEMPRE rebaixa + flag diligência; agêntico nunca é
entrada; determinístico; `npm run lint` + `npx tsc --noEmit` + `npm run build` +
`npm run test` verdes.

## 4. ISSUE-105 — Especificação de conteúdo

### 4.1 Arquivo

`src/lib/radar/content.ts` — tipado pelos types da 104. Conteúdo em PT-BR, voz da newsletter.

### 4.2 O que escrever

1. **5 resultados de maturidade** (grátis, inteiros na tela): base literal doc op §10.7
   (título/texto/próximo passo/CTA), enriquecidos com: risco de ficar no nível + 2–3 leituras
   (mapa em `01` §8, URLs abaixo) + ponte pro oportunidades (CTA primário). Personalização por
   `fronteira` (5 variações curtas de "próximo passo" — uma por opção da P8).
2. **9 teasers de oportunidades** (grátis na tela): tom **exploração/descoberta** ("seu
   trabalho aponta para…", nunca "aqui está seu plano"), com família + nível de entrada na
   família (doc 11 §3.1) + 2–3 sinais que pesaram + promessa concreta do completo.
3. **9 diagnósticos completos** (atrás do e-mail): os **8 blocos** do doc op §11.6 (tipo,
   porquê, complexidade, risco, primeiro passo, leitura, CTA newsletter, CTA Lab) + **9º bloco
   "Na prática"** (doc 11 §8.1): gancho "Sabia que…" com ferramenta real acessível no Brasil
   (paleta §8.2, 1–2 por resultado, calibrada por nível) + "no seu nível, comece assim" + "um
   nível acima, isso vira [nível 2 da família]" + "o como-fazer chega no e-mail".
   Os 3 exemplos do doc op §11.7–11.9 entram quase literais (app_tabela*, prompt, agentico);
   os 6 novos seguem a mesma estrutura. *(§11.7 é "app offline + tabela" = `app_tabela`.)*
   `agentico` = redirect-que-ensina (ferramentas do nível Referência + "comece pelo pedaço que
   dói mais" — nunca só frear).
4. **Cruzamento de maturidade** (dentro do completo): 2 variantes de copy — nível real ("No seu
   Radar de Maturidade você ficou em X — então…") e estimativa por faixa (doc 11 §8:
   baixo→"entre Curioso e Usuário" · médio→"entre Usuário e Operador" · bom→"por volta de
   Operador" · alto→"entre Operador e Builder" · muito alto→"entre Builder e Referência").
5. **Bloco de Diligência** (quando `flags.diligencia`): aviso concreto + leitura "A IA produz,
   mas quem leva esporro é você".
6. **Exemplos por área** na personalização (P1), incluindo **Estudante** e **Empreendedor**
   (doc 11 §9.6–9.7: NotebookLM pra estudante; WhatsApp Business/respostas automáticas pro
   empreendedor).

### 4.3 URLs verificadas da newsletter (fonte: doc contexto editorial §14 — usar EXATAMENTE)

- Fluência em IA: https://conversasnocorredor.substack.com/p/fluencia-em-ia
- Delegação ("A parte mais importante… antes de abrir o chat"): https://conversasnocorredor.substack.com/p/delegation-ai-fluency
- Descrição ("O problema nunca foi o prompt…"): https://conversasnocorredor.substack.com/p/description-ai-fluency
- Discernimento ("A IA te entrega tudo pronto…"): https://conversasnocorredor.substack.com/p/discernement-ai-fluency-4
- Diligência ("A IA produz, mas quem leva esporro é você"): https://conversasnocorredor.substack.com/p/diligence-ai-fluency-5
- "Prompt não é só um comando, é uma conversa": https://conversasnocorredor.substack.com/p/ai-fluency-prompt-nao-e-so-um-comando-6
- Ciclo estratégico ("…nunca parar pra decidir onde vale a pena"): https://conversasnocorredor.substack.com/p/ai-fluency-ciclo-estrategico-7
- HI-C: https://conversasnocorredor.substack.com/p/hi-c-o-profissional-de-alto-impacto
- "O receio de falar que usou IA…": https://conversasnocorredor.substack.com/p/o-receio-de-falar-que-usou-ia-esta
- "IA que você vê por aí vs a que cabe na sua empresa": https://conversasnocorredor.substack.com/p/a-diferenca-entre-ia-que-voce-ve-e-a-ia-corporativa
- "Se a IA faz o trabalho por você, quem aprende?": https://conversasnocorredor.substack.com/p/se-a-ia-faz-o-trabalho-por-voce-quem
- "O retorno invisível da IA": https://conversasnocorredor.substack.com/p/o-retorno-invisivel-da-ia-mais-colaboracao
- Arquivo: https://conversasnocorredor.substack.com/archive

Mapa contexto→leitura (01 §8): Curioso→Fluência em IA + IA que cabe na empresa ·
Usuário/prompt→Descrição + Prompt é conversa · Operador→Delegação + Ciclo estratégico ·
Builder→Prompt é conversa (Artesanato Digital) + Receio de falar que usou IA ·
Referência→HI-C + Quem aprende? · Diligência/sensível→Quem leva esporro é você.

### 4.4 Tom (digest do doc editorial §7/§12 — teste do cheiro)

- Conversa de corredor corporativo: direto, levemente provocativo, brasileiro, exemplos
  concretos ("dentro da firma", "pega teu café"). Frases curtas de punch + explicação.
- CTAs verbalizam intenção ("Quero ver minhas oportunidades"), nunca função ("Cadastre-se").
- **Proibido:** "domine", "revolucione", "desbloqueie", "o futuro chegou", "10x",
  "prompts secretos", "automatize tudo", tom guru/startup genérica.
- Vocabulário da casa: trabalho real, repertório, julgamento, fluência em IA, construir
  soluções, ativos digitais, IA que cabe na empresa, sem hype.
- Se a frase servia em qualquer landing de curso de IA → reescrever.
- Estrutura narrativa: tensão → contraste → conceito → exemplo → pergunta.

### 4.5 Critérios de aceite da 105

Dono lê os 14 e aprova o tom (fica pendente até ele ler — marcar `⚠️ parcial — aguarda
leitura do dono` se necessário); zero frase da lista proibida; cada resultado completo tem os
8 blocos + "Na prática"; URLs conferem com a lista acima; teasers em tom de exploração.

## 5. Travas da sessão (inegociáveis)

- **NÃO tocar:** `layout.tsx`, `EmailGate.tsx`, `api/prediag/*`, plataforma logada,
  `components/ui/*`. Esta sessão é 100% `src/lib/radar/*` + package.json/vitest config.
- Sem UI (ISSUE-103), sem backend (ISSUE-106), sem e-mail (ISSUE-113) — escopo excluído é sagrado.
- Motor puro: zero rede, zero DOM, zero sessionStorage dentro de `lib/radar` (sessionStorage é
  papel da UI/103).
- Matriz como dado declarativo, auditável — nunca if/else espalhado.
- Build valida TS mas não lint → rodar `npm run lint` e `npx tsc --noEmit` manualmente.
- **Nunca commitar/pushar nesta skill** — é papel do `/finalizar-sessao` (push só com
  confirmação explícita do dono; push na main = deploy em produção).
- Divergência entre implementação e doc 11 → parar e voltar ao doc 11 (falar com o dono),
  nunca "corrigir" a matriz por conta própria.

## 6. Fatos do ambiente (conferidos nesta sessão)

- `recharts` e `framer-motion` já estão no package.json (para a 103; nada a instalar aqui além
  do vitest). Sem nenhum framework de teste hoje.
- `src/lib/radar/` não existe; `src/components/ds2/` existe (ISSUE-102 concluída).
- Scripts npm existentes: `dev`, `build`, `start`, `lint` (não existem `type-check`/`analyze`).
- Windows 11 + PowerShell/Git Bash; repo em `c:\Users\adils\mapa-atividades`.
