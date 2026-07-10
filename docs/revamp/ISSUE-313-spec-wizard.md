# ISSUE-313 — Spec do Wizard `/lab/novo-projeto` · v2.1 "Conversa de Consultor" (2026-07-09)

> **Status:** proposta consolidada após 2 rodadas de feedback do dono, aguardando aprovação
> final (§11). Histórico: v1 (formulário de 4 passos) rejeitada; v2 (conversa com leitura de
> texto livre por dicionário) corrigida nesta v2.1 — texto livre não classifica mais nada na
> 1A. Versões anteriores no git.
> **Contrato técnico:** `wizard_answers.schema_version = 2` (v1 congelado, como previsto no
> `types.ts`). `decidirOportunidade` (motor da ISSUE-312, 76 testes) **intocado**;
> `plan-generator` ganha extensão aditiva (§7.3).

---

## 1. As duas correções de rota (e por quê)

**v1 → v2:** era um form que pedia categorização antes de entendimento, assumia que toda
entrada é um problema (nos workshops a maioria chega com **ideia de ferramenta**), ignorava a
maturidade até o fim e pedia o que a pessoa não sabe responder (impacto livre). Virou conversa
com 3 portas de entrada.

**v2 → v2.1:** a v2 ainda tinha um ponto frágil — classificar o relato livre do ramo DOR com
dicionário de palavras-chave. Diagnóstico do dono: heurística aberta "parece robusta mas só
funciona para casos específicos"; impossível mapear o vocabulário real. Correção estrutural:
**na Fase 1A, texto livre nunca classifica** — a heurística só opera sobre alternativas
prefixadas (ids fechados), convergindo estilo Akinator. A robustez passa a ser **por
construção**: o espaço de respostas é finito, então dá pra auditar em teste automatizado
TODAS as combinações (§7.4) — garantia que nenhum dicionário oferece.

## 2. Decisões do dono (acumuladas — 2026-07-09, 2 rodadas)

1. **Entradas reais:** ideia de ferramenta (mais comum) + dor/tarefa + vontade difusa.
2. **Método de referência:** o workshop de vibe code (ideia → "grill me" até conhecimento
   compartilhado → construir MENOR que a ambição → ampliar se der certo).
3. **Benefício ancorado, nunca impacto livre** — é o que vende o projeto internamente.
4. **Resultado = proposta + 1–2 alternativas**, escolha assistida (impacta a ISSUE-314).
5. **IA só quando a ISSUE-320 existir** (decisão fechada na rodada 2). Os slots ficam prontos
   no código; a IA futura categoriza texto livre **dentro do framing da heurística** (mesmos
   ids), nunca por fora — princípio: *IA sugere, heurística decide, pessoa confirma*.
6. **Texto livre fica, como cor:** guardado pro espelho, pro plano e como insumo da 1B — fora
   do caminho de classificação da 1A.
7. **Ambiente/arsenal entra no wizard:** o público SEMPRE tem alguma IA de janela ("tem que
   ter IA" — nem que gratuita/pessoal, shadow AI ética); o que varia é a ampliação
   (Workspace/AppScript, Copilot/M365, premium). O plano recomenda só o que cabe no arsenal.
8. **Teto de perguntas: delegado ao design**, com a referência do onboarding do Foodvisor —
   muitas perguntas funcionam quando o FORMATO varia e o progresso é visível.
9. **Desempate condicional aprovado, com transparência** ("tá entre dois caminhos — me
   responde mais uma").

## 3. Princípios (contrato editorial + de engenharia)

1. **Heurística fechada, robusta por construção.** Toda classificação nasce de escolha
   prefixada. Espaço finito → auditoria exaustiva em vitest (§7.4).
2. **Texto livre é cor, nunca classificador (1A).** Aparece no espelho ("nas tuas palavras"),
   viaja pro plano e espera a IA da 1B.
3. **IA sugere, heurística decide, pessoa confirma.** Slot de IA = pré-marcação sugerida dos
   MESMOS ids fechados, sempre confirmável. Sem confiança → pergunta fechada normal.
4. **O sistema categoriza, a pessoa confirma.** Hipóteses pré-marcadas (1 toque confirma,
   1 toque corrige) — nunca pedir taxonomia.
5. **Convergência visível (o Akinator-feel).** Espelho incremental ("o que já sei do teu
   caso") atualiza a cada bloco; desempate condicional quando o motor está em dúvida.
6. **Formato variado, monotonia cansa** (lição Foodvisor): cards, chips, escala visual,
   slider — cada formato servindo ao dado, nunca enfeite.
7. **Benefício quantificado quando der.** Slider de horas/semana transforma a manchete de
   "ganhar tempo" em "comprar de volta ~4h da tua semana".
8. **Protótipo de corredor primeiro.** Base universal = o caminho do workshop (IA de janela +
   HTML local + CSV/JSON) — todo mundo do público alcança; o arsenal decide a ampliação.
9. **Diligência ativa.** Dado sensível + arsenal pessoal/shadow → o consultor reage na hora,
   não só no plano (§4, bloco 3).

## 4. A conversa — 4 blocos nomeados, ~14 interações típicas

Barra de progresso por bloco (não por pergunta): **Sobre você · Teu caso · Teu ambiente ·
Fechamento**. O espelho (card "O que já entendi") atualiza ao fim de cada bloco — no mobile,
compacto e expansível.

### Bloco 1 — "Sobre você" (3 interações)

**1.1 Fluência** (grava `conforto`, ids `conf_*`; formato: escala visual de 5 posições,
labels comportamentais):
**"Pra eu falar tua língua: o quanto você já usa IA hoje?"**
"Quase nada, tô começando" → `conf_baixo` · "Uso ChatGPT/Gemini pra textos e ideias" →
`conf_medio` · "Escrevo prompts caprichados, com contexto" → `conf_bom` · "Já montei
automações ou mini-apps com IA" → `conf_alto` · "Sou eu que ensino os outros" →
`conf_muito_alto`. Pré-preenche do perfil/radar quando existir, sempre editável.

**1.2 Área** (grava `area`, ids `area_*`; formato: grid de chips): **"Em qual área você
atua?"** — personaliza os exemplos de tudo que vem depois (`content.ts`).

**1.3 Porta** (grava `porta`; formato: 3 cards grandes): **"O que te traz aqui hoje?"**
- **"Já sei o que quero construir"** → trilha IDEIA
- **"Tem uma tarefa que me consome"** → trilha DOR
- **"Quero descobrir por onde começar"** → trilha DIFUSA

### Bloco 2 — "Teu caso" (4–6 interações, conforme a trilha)

**Trilha IDEIA:** arquétipo primeiro, resto pré-marcado.
- **2.I1 Arquétipo** (grava `arquetipo`; cards): **"O que você tem em mente?"** — Painel/
  dashboard · Organizador de atividades · Tela de input/registro de dados · Consolidador de
  planilhas · Assistente de textos/respostas · Automatizador de processo · Outra coisa (1
  frase curta → segue trilha DOR, sem classificar o texto).
- **2.I2 Benefício** (grava `desejo`, ids `desejo_*`, labels contextuais ao arquétipo — mapa
  §7.2): **"Um [painel]. E o que ele muda no teu dia?"** *apoio:* "É isso que você vai usar
  pra vender a ideia aí dentro."
- **2.I3 Confirmação da rotina** (grava `entrega`+`perda`, hipóteses do arquétipo
  pré-marcadas): **"Aposto que teu dia tem bastante [consolidar informação] pra entregar
  [relatórios]. Acertei?"** → "É isso" / "Não é bem isso" (abre opções).
- **2.I4 Frequência** (grava `frequencia`, ids `freq_*`): **"E a tarefa que isso resolve —
  acontece com que frequência?"**
- **2.I5 Horas** (grava `horas_semana`, cor — formato: slider 0–10+ h/semana): **"Chutando
  baixo: quanto tempo isso come por semana?"** — quantifica a manchete do benefício.

**Trilha DOR:** cena primeiro (fechada — o dicionário de palavras-chave da v2 morreu).
- **2.D1 Cena** (grava `perda`, ids `perda_*`; cards com exemplos da área): **"Qual dessas
  cenas é a tua?"** — ex. p/ Vendas: "Juntar números de 3 planilhas pro mesmo relatório"
  (`perda_consolidando`) · "Responder as mesmas dúvidas no WhatsApp" (`perda_duvidas`) · …
- **2.D2 Entrega** (grava `entrega`): **"E essa tarefa produz o quê no final?"**
- **2.D3 Benefício** (grava `desejo`): **"Se ela sumir da tua semana, o que você ganha
  primeiro?"**
- **2.D4 Frequência** + **2.D5 Horas** (idem trilha IDEIA).

**Trilha DIFUSA:** mesma mecânica da DOR com copy exploratória — **"Pensa na tua última
semana de trabalho. Qual dessas cenas te soa familiar?"** — e exemplos mais didáticos.
Escolheu a cena → o caso aterrissou → segue D2 em diante.

*Espelho ao fim do bloco 2:* "Teu caso: [montar relatório] [toda semana] (~[4h]) e o que você
quer é [as segundas de volta]."

### Bloco 3 — "Teu ambiente" (3 interações)

- **3.1 Matéria-prima** (grava `dado`, ids `dado_*`): **"De onde vem o insumo disso hoje?"**
- **3.2 Quem usa** (grava `publico`, ids `pub_*`): **"Quem usa o resultado além de você?"**
- **3.3 Arsenal** (grava `ambiente[]`, slugs novos §7.1; formato: chips multiselect):
  **"O que você tem à mão — oficial ou por conta própria?"**
  - "ChatGPT/Gemini gratuito" → `amb_ia_gratuita`
  - "IA premium (GPT Plus, Gemini Advanced…)" → `amb_ia_premium`
  - "Google Workspace (Sheets, AppScript)" → `amb_workspace`
  - "Copilot/M365 da firma" → `amb_copilot`
  - "Uso IA por conta própria — a firma não liberou" → `amb_shadow`
  *Reação condicional (dado sensível + `amb_shadow`):* **"Anotado — o plano vai incluir como
  fazer isso sem subir dado da firma pra tua conta pessoal."** (diligência ativa, §3.9)

### Bloco 4 — "Fechamento" (3–4 interações)

- **4.1 Espelho completo**, manchete quantificada: **"O que você quer: comprar de volta ~4h
  da tua semana.** Você [monta um relatório] [toda semana], com [planilhas simples], pra
  [liderança], e tem [Gemini + Workspace] à mão." Ações: "É exatamente isso" / "Quase — deixa
  eu ajustar" (volta só à dimensão errada).
- **4.2 Nas tuas palavras** (grava `relato`, texto livre OPCIONAL — cor, insumo da 1B):
  **"Quer registrar o caso do teu jeito? Vai afinar a conversa quando o assistente chegar."**
- **4.3 Desempate condicional** (só quando a margem 1º–2º da pontuação for apertada —
  limiar definido na implementação e auditado nos testes): **"Teu caso tá entre [um painel] e
  [um consolidador] — me responde mais uma: [pergunta que mais discrimina o par, derivada da
  matriz de pesos]."** Máximo 1 desempate por conversa.
- **4.4 Nome + proposta:** nome sugerido por template (editável, nunca campo vazio) → motor
  roda → **proposta + alternativas** (2º/3º da `diagnosis.pontuacao`), cada uma no formato
  consultor: o que é · por que serve pro TEU caso · **versão de corredor pra começar**
  (sempre alcançável com o arsenal marcado; base universal = IA de janela + HTML local + CSV)
  · "pode evoluir para" (nível 2 da família / `vencedor_bruto`). Escolha grava `escolha_tipo`.

## 5. Contagem e ritmo

Típico: 3 + 5 + 3 + 3 = **~14 interações**, sendo 1 slider, 1 multiselect, 1 texto opcional e
o resto 1 toque. Desempate adiciona no máximo 1. Sem teto rígido — o ritmo vem dos blocos
nomeados + espelho por bloco (padrão Foodvisor: variedade e progresso visível seguram
engajamento melhor que brevidade).

## 6. O que saiu / mudou da v2

- **D2 (leitura de relato por dicionário): morto.** Trilha DOR agora abre por cena fechada.
- **Relato livre: moveu pro fechamento**, opcional, como cor — não há mais texto obrigatório
  em NENHUMA trilha (na v2, o ramo DOR exigia).
- **Arsenal (`ambiente[]`): dimensão nova** — era "ferramentas no perfil (317)"; a rodada 2
  mostrou que é restrição de viabilidade do plano, não cadastro.
- **Slider de horas: novo** (cor quantificadora da manchete).
- **`urgencia`/`impacto_esperado`: seguem fora** (decisão v2 mantida).

## 7. Mapa técnico

### 7.1 Schema v2 (`wizard_answers`)

```
schema_version: 2
porta: 'ideia' | 'dor' | 'difusa'
arquetipo?: string                        (trilha IDEIA)
relato?: string                           cor opcional — NUNCA entra na classificação (1A)
titulo: string                            sugerido por template, editável
area, entrega, perda, frequencia,
publico, dado, desejo, conforto           MESMOS ids de opção do v1/radar (congelados)
ambiente: string[]                        novo — amb_ia_gratuita | amb_ia_premium |
                                          amb_workspace | amb_copilot | amb_shadow
horas_semana?: number                     novo — cor quantificadora (slider)
hipoteses_confirmadas?: string[]          analytics: dimensões aceitas sem correção
desempate?: { par: [tipo,tipo], resposta: string }   auditoria do desempate
escolha_tipo?: SolutionTypeId             tipo escolhido na proposta assistida
```

### 7.2 Arquétipo → hipóteses + labels contextuais (trilha IDEIA)

| Arquétipo | entrega | perda | desejo (labels de 2.I2) |
|---|---|---|---|
| Painel/dashboard | `entrega_dashboards` | `perda_consolidando` | visualização · decisão · compartilhar |
| Organizador de atividades | `entrega_status` | `perda_organizando` | tempo · padronizar · compartilhar |
| Tela de input/registro | `entrega_planilhas` | `perda_copiando` | erro · padronizar · ferramenta |
| Consolidador de planilhas | `entrega_planilhas` | `perda_consolidando` | tempo · erro · automatizar |
| Assistente de textos/respostas | `entrega_textos` | `perda_revisando` | tempo · padronizar · erro |
| Automatizador de processo | `entrega_processos` | `perda_copiando` | automatizar · tempo · erro |

Hipótese ≠ resposta: sempre pré-marcada e corrigível (2.I3). Quem pontua no motor é a
resposta confirmada.

### 7.3 Motor (ISSUE-312): o que muda e o que não muda

- `decidirOportunidade`: **zero mudança** — os 76 testes seguem valendo.
- `engine.ts`: ganha adaptador v2 (traduz schema v2 → entrada do motor) + testes próprios.
- `plan-generator.ts`: **extensão aditiva** — `PlanoOpcoes` ganha `ambiente?: string[]`
  (recomendação de ferramenta filtrada pelo arsenal; `amb_shadow` + `dado_sensiveis` reforça
  a etapa de diligência; sem ambiente → base universal). Campo opcional: testes existentes
  intactos, casos novos cobrem a modulação.
- Desempate: função pura nova (`desempate.ts`) que, dado o par líder e a matriz de pesos,
  devolve a pergunta mais discriminante — determinística e testável.

### 7.4 Auditoria exaustiva (a resposta ao "parece robusto mas só funciona às vezes")

Suite vitest que enumera **todas as combinações fechadas** (espaço finito) e valida
invariantes, no mínimo: (a) todo tipo é alcançável por alguma trilha; (b) `conf_baixo` nunca
recebe proposta acima do teto; (c) `dado_sensiveis` sempre gera etapa de diligência e nunca
recomendação que exporte o dado (invariante já parcial no motor — estende ao plano);
(d) desempate só dispara dentro do limiar e no máximo 1×; (e) toda proposta tem "versão de
corredor" compatível com QUALQUER arsenal (base universal). Combinações que gerarem resultado
editorial absurdo viram fixture de regressão.

## 8. Slots de IA (ficam prontos; ligam quando a ISSUE-320 existir — decisão fechada)

| # | Onde | O que fará | Fallback (comportamento da 1A) |
|---|---|---|---|
| 1 | "Outra coisa" (2.I1) e `relato` (4.2) | Categorizar o texto nos MESMOS ids fechados e pré-marcar (pessoa confirma) | Segue trilha DOR fechada / relato fica como cor |
| 2 | Espelho (4.1) | Redigir o resumo em prosa natural citando as palavras da pessoa | Template com slots |

Contrato do slot: entrada = texto + contexto; saída = sugestão de ids fechados + confiança;
abaixo do limiar → pergunta fechada normal. *IA sugere, heurística decide, pessoa confirma.*
Custo estimado (OpenAI, modelo barato): <R$0,01/projeto.

## 9. Impacto nas outras issues

- **ISSUE-314:** diagnóstico vira proposta escolhida + "caminhos deixados pra depois";
  manchete quantificada quando `horas_semana` existir. Reabrir a spec dela com essa lente.
- **ISSUE-317 (perfil):** `ferramentas` do perfil vira espelho do `ambiente[]` capturado no
  wizard (fonte primária passa a ser o wizard, não o cadastro).
- **ISSUE-320/321:** os slots §8 são o contrato de integração; a entrevista da 1B estende o
  slot 1.
- **ISSUE-318 (analytics):** dimensões novas de evento — `porta`, `arquetipo`,
  `hipoteses_confirmadas` (mede acerto das hipóteses!), disparo de desempate, uso do slider.
  A taxa de correção de hipóteses é o termômetro da qualidade da heurística em produção.

## 10. Critérios de aceite

- Fluxo completo pelas 3 portas cria projeto `planejado` e redireciona pra `/lab/projeto/[id]`.
- Nenhum texto obrigatório em nenhuma trilha; trilha IDEIA no caminho feliz ≈ 14 interações,
  <3–4min no celular.
- Abandono preserva rascunho por bloco; retomada volta ao ponto certo com tudo marcado.
- Corrigir hipótese/dimensão nunca descarta as demais respostas.
- Proposta sempre com ≥1 alternativa e versão de corredor compatível com o arsenal.
- Suite de auditoria exaustiva (§7.4) verde; `decidirOportunidade` sem 1 linha alterada;
  tsc/lint/build limpos; zero mudança em rota pública.

## 11. O que o dono aprova nesta v2.1

1. A estrutura de 4 blocos + 3 trilhas (§4) e a contagem/ritmo (§5).
2. A dimensão nova `ambiente[]` com os 5 slugs e a reação de diligência ativa (bloco 3.3).
3. O slider de horas como quantificador da manchete.
4. Os textos-chave das perguntas (§4) — microcopy fina vem na implementação, sob este tom.
5. O plano de auditoria exaustiva (§7.4) como critério de aceite obrigatório.
