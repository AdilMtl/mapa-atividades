# 11 — Motor dos Radares: Tabela de Pesos + Personas de Validação

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-06 · **v2** (revisado no
> mesmo dia com o feedback do dono — ver §1.2)
> **Entregável 1 da ISSUE-104** — o "cérebro" do motor, para **validação do dono ANTES do código**.
> Complementa [02_technical_spec.md](02_technical_spec.md) §3.3/§6 e
> [10_jornada_captura_radares.md](10_jornada_captura_radares.md). Perguntas/opções do
> oportunidades: literais do doc operacional §11.4. Perguntas da maturidade: **revisadas aqui**
> (§2) por decisão do dono — versões sutis mapeadas à AI Fluency, escala e faixas intactas.

---

## 1. Decisões registradas (2026-07-06)

### 1.1 Rodada 1 (sessão de visão)

1. **Wizard = card de produto** (a "janela de app" do mock do hero), não o chat do
   `/pre-diagnostico` — message match visual entre o hero animado e a ferramenta real.
2. **Resultados com gráfico radar (recharts):** maturidade = perfil em 7 eixos + nível;
   oportunidades = eixos do trabalho + família (teaser grátis).
3. **Validação do cérebro no papel antes do código** (este doc). **vitest aprovado**, só
   `lib/radar/*`.
4. **Cruzamento real via `sessionStorage`** (nível viaja do degrau 1 ao degrau 2; só navegador).

### 1.2 Rodada 2 (feedback do dono sobre a v1 deste doc)

5. **Personas 1–4 validadas** (dashboard/prompt/template+diligência/automação ✓). **Persona 5
   resolvida:** mantém `agentico` com conteúdo de redirect — mas o redirect **ensina** (ferramentas
   reais + o "clique" de começar menor), não só freia.
6. **Maturidade conectada à AI Fluency (Anthropic):** as perguntas mapeiam as 4 dimensões
   (Delegação, Descrição, Discernimento, Diligência) + Construção (a extensão builder da tese),
   MAS formuladas de forma **sutil e comportamental** — cenários de rotina, não autoavaliação
   tipo "quantas vezes por dia você usa ChatGPT" (topo de funil; também dificulta "roubar" no
   teste). Estrutura preservada: 7 pontuadas (escala 7–35 e faixas do doc §10.6 intactas) + 1
   pergunta final não pontuada que personaliza o resultado. Novas versões em §2.2, **aguardando
   aprovação do dono**.
7. **Famílias de oportunidade em 2 níveis** (visão do dono): cada família tem nível de entrada
   e nível de evolução — camada de **apresentação/conteúdo** sobre os 9 tipos, sem mexer no
   motor (§3.1). O resultado diz onde a pessoa está na família e o que destrava o próximo nível.
8. **Resultados acionáveis — regra do "sabia que":** todo diagnóstico completo termina com um
   gancho prático concreto ("sabia que você consegue montar um dashboard no Gemini conectado às
   suas planilhas?") e o **e-mail entrega o mini-guia de execução** (passo a passo + prompts
   prontos). O valor gated deixa de ser só "diagnóstico completo" e vira "diagnóstico + como
   fazer" (§7/§8).
9. **Paleta de ferramentas Builder/Referência enriquecida** (§8.2): Claude Code, Cursor,
   Google Antigravity, Lovable, v0, n8n avançado, MCP. *(Correção do dono na rodada 3:
   "open-clone"/"opencode" foi erro de transcrição — as ferramentas pretendidas eram Claude
   Code, Cursor, Lovable e o universo de vibe coding.)*
10. **Dois públicos novos** das pesquisas do dono: **Estudantes** e **Empreendedores** —
    entram como opções da P1 (área) do oportunidades, ganham personas de validação (§9.6/§9.7)
    e exemplos próprios no conteúdo. **Mentoria e palestras sobre IA** registradas como produto
    futuro do portfólio (ISSUE-307, Fase 2) — sem promessa na Fase 1.

---

## 2. Radar de Maturidade — motor

### 2.1 Estrutura (inalterada no scoring)

- 7 perguntas pontuadas, resposta vale 1–5 (posição da opção). Total: 7–35.
- Faixas literais do doc §10.6: Curioso 7–11 · Usuário 12–17 · Operador 18–24 ·
  Builder 25–31 · Referência 32–35.
- **+ P8 final, NÃO pontuada** ("maior dificuldade hoje", opções literais da P7 original) —
  personaliza o "próximo passo" do resultado e alimenta analytics. Custo: ~15s a mais.

### 2.2 As perguntas revisadas (sutis, mapeadas à AI Fluency) — APROVAR

> Princípio: cenário comportamental ("o que você fez semana passada") em vez de autoavaliação
> abstrata. A escada 1→5 continua monotônica para o scoring, mas a "resposta certa" não fica
> gritante. P2, P4 e P6 permanecem as originais do doc §10.5 (já eram comportamentais).

**P1 — Delegação** *(substitui "com que frequência você usa IA")*
"Pense na sua última semana de trabalho. Qual frase soa mais como você?"
1. IA ainda não entrou de verdade na minha rotina
2. Usei IA em momentos pontuais, quando lembrei
3. Usei IA nas tarefas que se repetem toda semana
4. Várias entregas minhas já começam pela IA
5. Escolho conscientemente o que fica comigo e o que vai para a IA

**P2 — Amplitude** *(original)* — "Para que você mais usa IA hoje?" (curiosidade → textos →
análises → processos → construção)

**P3 — Descrição** *(substitui "tarefa repetitiva"; o sinal de repetição já vive em P1/P2/P4)*
"Quando a resposta da IA vem 'mais ou menos', o que você costuma fazer?"
1. Desisto e faço manualmente
2. Tento perguntar de outro jeito, no improviso
3. Acrescento contexto e exemplos até melhorar
4. Tenho um jeito próprio de estruturar pedidos que costuma funcionar de primeira
5. Meus prompts viram padrão que outras pessoas reutilizam

**P4 — Construção** *(original)* — "Você já criou alguma ferramenta, dashboard, app ou
automação com apoio de IA?" (não → testei → algo simples pra mim → outras pessoas usaram →
virou referência no time)

**P5 — Discernimento** *(cenário no lugar de "como você avalia a qualidade")*
"A IA te entrega uma análise que parece ótima. O que acontece antes de você usar?"
1. Se parece boa, uso direto
2. Dou uma lida por cima
3. Confiro os pontos-chave com o contexto e as fontes que conheço
4. Tenho critérios claros do que precisa estar certo antes de sair
5. Ajudo outras pessoas a criar esse filtro também

**P6 — Clareza de formato** *(original)* — "Você sabe diferenciar quando uma tarefa pede
prompt, automação, dashboard, app ou processo?"

**P7 — Diligência** *(nova — a dimensão que faltava)*
"E usar IA com informações do trabalho — como você lida com isso?"
1. Nunca parei para pensar nisso
2. Evito, mas mais por receio do que por critério
3. Tomo cuidados básicos (não colo dado sensível)
4. Sigo critérios claros do que pode e do que não pode
5. Oriento outras pessoas sobre uso responsável

**P8 — Fronteira** *(não pontuada; personaliza)* — "Qual é sua maior dificuldade hoje?"
(opções literais da P7 original do doc §10.5)

### 2.3 Eixos do gráfico radar (valor = pontos 1–5)

| Eixo (rótulo na tela) | Pergunta | Dimensão AI Fluency |
|---|---|---|
| Delegação | P1 | Delegation |
| Amplitude | P2 | Delegation (escopo) |
| Descrição | P3 | Description |
| Construção | P4 | — (extensão builder da tese) |
| Discernimento | P5 | Discernment |
| Clareza de formato | P6 | Delegation (formato) |
| Diligência | P7 | Diligence |

O mapeamento aos 4 Ds é **lente interna** (conteúdo/análise) — na tela os rótulos são os da
coluna 1, sem jargão de framework.

**Saída do motor:** `{ nivel, score, eixos[7], fronteira }` + textos da ISSUE-105. Ao exibir,
grava `sessionStorage['conversaas.radar.maturidade'] = { nivel, score }` para o degrau 2.

---

## 3. Radar de Oportunidades — arquitetura do motor

- **9 tipos** (IDs estáveis): `prompt`, `template`, `workflow`, `automacao`, `dashboard`,
  `app_offline`, `app_tabela`, `orquestrado`, `agentico`.
- **Escala de complexidade** (para rebaixamentos e desempate): prompt=1 · template=1 ·
  workflow=2 · automacao=2 · dashboard=2 · app_offline=3 · app_tabela=3 · orquestrado=4 ·
  agentico=5.
- **Mecânica:** scoring aditivo (§4) → modificadores (§5) → desempate (§6). Determinístico.
  A matriz vive como **dado declarativo** (objeto TS), não if/else — auditável e testável.

### 3.1 Famílias em 2 níveis (camada de apresentação — decisão do dono, §1.2 item 7)

O motor continua entregando 1 de 9 tipos; a **apresentação** posiciona o tipo dentro da família
e mostra o degrau seguinte (a mecânica de "passar de nível" dentro da própria oportunidade):

| Família | Nível 1 (entrada) | Nível 2 (evolução) | Frase-mãe do teaser |
|---|---|---|---|
| Conversação estruturada | prompt estruturado | template reutilizável → Gem/GPT personalizado | "resolver com linguagem bem estruturada" |
| Fluxo e automação | workflow assistido | automação que roda sozinha | "resolver com processo que se repete sem você" |
| Visualização e decisão | dashboard gerado da planilha | dashboard vivo (conectado, atualiza sozinho) | "resolver tornando o dado visível para decidir" |
| Construção de ferramenta | app pessoal (offline / + tabela) | sistema (orquestrado / agêntico) | "resolver criando uma ferramenta sua" |

Cada resultado diz: **sua família + em que nível dela você está entrando + o que destrava o
nível 2** (ferramenta/estratégia — o "como" chega no e-mail, §7). É a versão dentro-da-família
da provocação de maturidade do §8.

> **Referência técnica (verificada na fonte, 2026-07-06):** a escada linear é boa prática
> documentada — a guidance oficial da Anthropic, *Building Effective Agents*
> (anthropic.com/research/building-effective-agents), recomenda "encontrar a solução mais
> simples possível e só aumentar a complexidade quando necessário": prompt otimizado →
> workflow para tarefa bem definida → agente apenas quando a flexibilidade justificar o custo.
> É o mesmo princípio que sustenta o guard-rail do §5.3 (agêntico nunca é entrada) e o
> desempate por menor complexidade (§6). No mercado, o padrão equivalente é o
> "crawl–walk–run" de maturidade de automação.

## 4. Matriz de pesos

> Convenção: pesos 1–3. Dominantes (frequência, dado, público, desejo) usam 2–3; contextuais
> (entrega, perda de tempo) usam 1–2. **P1 (área) tem peso zero** — personaliza exemplos no
> conteúdo (ISSUE-105) e segmenta analytics.
> **P1 ganha 2 opções novas (dono, 2026-07-06):** `Estudante` e `Empreendedor / dono de
> negócio` — públicos reais das pesquisas; peso zero como as demais áreas, mas com exemplos
> próprios no conteúdo e segmentação própria no analytics.

### P4 — Frequência (dominante)

| Resposta | Pesos |
|---|---|
| Raramente | prompt +3, template +1 |
| Mensalmente | prompt +2, template +2, workflow +1 |
| Semanalmente | template +2, workflow +2, dashboard +1 |
| Várias vezes por semana | workflow +2, automacao +2, dashboard +2, app_tabela +1 |
| Todos os dias | automacao +3, app_tabela +2, dashboard +2, orquestrado +1 |

### P6 — Tipo de dado (dominante)

| Resposta | Pesos |
|---|---|
| Texto livre | prompt +3, template +2, workflow +1 |
| Planilha simples | app_tabela +3, dashboard +2, automacao +1 |
| Dados de sistemas | orquestrado +3, dashboard +2, automacao +1, agentico +2 |
| Documentos | prompt +2, workflow +2, template +1 |
| E-mails / mensagens | workflow +2, automacao +2, template +1 |
| Dados sensíveis | app_offline +2, prompt +1 **+ modificador §5.1** |
| Não sei | zero (o conteúdo orienta a descobrir; não distorce o scoring) |

### P5 — Público da entrega (dominante)

| Resposta | Pesos |
|---|---|
| Só por mim | prompt +2, app_offline +2, template +1 |
| Meu time | template +2, dashboard +2, app_tabela +2 |
| Outra área | dashboard +2, app_tabela +2, workflow +1, orquestrado +1 |
| Liderança | dashboard +3, template +1, app_tabela +1 |
| Cliente / usuário externo | orquestrado +3, automacao +1, dashboard +1, agentico +2 |

### P7 — Resultado desejado (dominante)

| Resposta | Pesos |
|---|---|
| Ganhar tempo | automacao +2, workflow +2, prompt +1 |
| Reduzir erro | template +2, workflow +2, automacao +1 |
| Padronizar entrega | template +3, workflow +2 |
| Melhorar visualização | dashboard +3 |
| Facilitar decisão | dashboard +3, app_offline +1 |
| Compartilhar com outras pessoas | app_tabela +2, dashboard +2, orquestrado +1 |
| Automatizar parte do processo | automacao +3, workflow +1, orquestrado +1, agentico +1 |
| Criar uma ferramenta reutilizável | app_tabela +3, app_offline +2, orquestrado +1 |

### P2 — Tipo de entrega (contextual)

| Resposta | Pesos |
|---|---|
| Relatórios | template +1, dashboard +1 |
| Planilhas | app_tabela +1, dashboard +1 |
| Apresentações | template +1, prompt +1 |
| Análises | prompt +1, dashboard +1 |
| Textos / comunicações | prompt +2 |
| Status reports | automacao +1, template +1 |
| Dashboards | dashboard +2 |
| Processos / fluxos | workflow +2 |
| Atendimento / respostas | template +1, agentico +2 |
| Reuniões / decisões | prompt +1, app_offline +1 |

### P3 — Perda de tempo (contextual)

| Resposta | Pesos |
|---|---|
| Consolidando informação | workflow +1, dashboard +1 |
| Copiando e colando dados | automacao +2 |
| Revisando textos | prompt +2 |
| Criando apresentações | template +2 |
| Atualizando planilhas | app_tabela +2, automacao +1 |
| Respondendo dúvidas repetidas | template +1, workflow +1, agentico +2 |
| Buscando informações | workflow +1, agentico +2 |
| Fazendo análises manuais | dashboard +1, prompt +1 |
| Organizando tarefas | automacao +1, app_tabela +1 |
| Alinhando pessoas | template +1, workflow +1 |

## 5. Modificadores e guard-rails (aplicados após a soma)

### 5.1 Dados sensíveis (P6) — SEMPRE rebaixa + marca diligência

Se P6 = "Dados sensíveis":
- Penalidade nos tipos que empurram dado para serviços externos: **automacao −3, orquestrado
  −3, agentico −3, app_tabela −2, workflow −1**.
- `flags.diligencia = true` → o resultado ganha bloco de Diligência + leitura
  *"A IA produz, mas quem leva esporro é você"* (mapa de leituras, [01](01_product_spec_faseada.md) §8).
- Critério de aceite da ISSUE-104 (inalterado): dado sensível **nunca** resulta em recomendação
  de subir dado para fora sem aviso.

### 5.2 Conforto digital (P8) — teto de complexidade

| Resposta | Teto de complexidade | Efeito |
|---|---|---|
| Baixo | ≤ 2 | vence o tipo de maior pontuação com complexidade ≤2 |
| Médio | ≤ 3 | exclui orquestrado e agêntico da vitória |
| Bom / Alto / Muito alto | sem teto | — |

Quando o teto rebaixa, `flags.rebaixadoPorConforto = true` — o conteúdo ajusta o "primeiro
passo" (começar menor) sem esconder o potencial ("isso pode evoluir para X").

### 5.3 Agêntico nunca é porta de entrada

- `agentico` só pode vencer se **P8 ∈ {Alto, Muito alto}** e **P6 = "Dados de sistemas"**;
  fora disso, rebaixa para o próximo colocado com complexidade ≤ 4.
- **Mesmo vencendo**, o conteúdo é o redirect do doc operacional §11.9 — mas na versão
  **que ensina** (decisão do dono, §1.2 item 5): apresenta as ferramentas reais do nível
  Referência (§8.2), dá o "clique" ("comece pelo pedaço que dói mais") e o e-mail entrega o
  caminho do primeiro protótipo em etapas.

## 6. Desempate

1. Vence a **menor complexidade** (coerente com a tese: reduzir escopo é parte do método).
2. Persistindo o empate (mesma complexidade), ordem fixa declarada:
   prompt > template > workflow > automacao > dashboard > app_offline > app_tabela.

## 7. O corte teaser × completo (oportunidades)

| Camada | O que contém |
|---|---|
| **Teaser (grátis, na tela)** | Gráfico radar dos eixos do trabalho (§7.1) + **família** + em que nível da família a pessoa entra (§3.1) + 1 frase de direção no tom exploração + o que pesou (2–3 sinais nomeados) + promessa concreta do completo ("o diagnóstico completo mostra o que dá pra montar com ferramenta gratuita — e o passo a passo chega no seu e-mail") |
| **Completo (após e-mail, na tela)** | Tipo exato (1 de 9) + os 8 blocos do doc §11.6 + cruzamento de maturidade (§8) + **9º bloco "Na prática"**: o gancho "sabia que…" com ferramenta nomeada calibrada pelo nível |
| **E-mail** | Tudo do completo + **mini-guia de execução** (passo a passo + prompts prontos + dica de subir de nível na família) — é o "manualzinho" (dono, §1.2 item 8) |

### 7.1 Eixos do gráfico radar do teaser (normalizados 0–100)

| Eixo | Fonte | Mapeamento |
|---|---|---|
| Repetição | P4 | raramente=10 · mensal=30 · semanal=55 · várias/semana=80 · diário=100 |
| Estrutura do dado | P6 | texto livre=20 · documentos/e-mails=40 · não sei=50 · planilha=70 · sistemas=95 · sensíveis=50* |
| Alcance | P5 | só eu=15 · time=45 · outra área=65 · liderança=80 · externo=100 |
| Ambição de reuso | P7 | tempo/erro=30 · padronizar/visualizar/decidir=55 · compartilhar=70 · automatizar=85 · ferramenta=100 |
| Cuidado exigido | P6 + contexto | sensíveis=100 · sistemas=60 · demais=25 |
| Autonomia digital | P8 | baixo=15 · médio=40 · bom=60 · alto=80 · muito alto=100 |

*\* "sensíveis" pontua Cuidado exigido em 100 e Estrutura em 50 (não sabemos a forma real do dado).*

O ajuste fino é detalhe da ISSUE-104 — o que este doc trava é o **conceito**: o teaser é uma
leitura visual real do trabalho da pessoa, não caixa preta.

## 8. Cruzamento de maturidade (dentro do diagnóstico completo)

1. **Nível real** se `sessionStorage['conversaas.radar.maturidade']` existir. Copy: "No seu
   Radar de Maturidade você ficou em **Operador** — então…"
2. **Estimativa leve** caso contrário, por P8 + sinais (copy sempre em faixa):
   baixo → "entre Curioso e Usuário" · médio → "entre Usuário e Operador" · bom → "por volta
   de Operador" · alto → "entre Operador e Builder" · muito alto → "entre Builder e Referência".

### 8.1 Bloco "Na prática" (regra do "sabia que" — o coração do valor)

Estrutura fixa por resultado (ISSUE-105 escreve as 9 variações × calibragem por nível):

- **Gancho:** "Sabia que você consegue [coisa concreta] com [ferramenta acessível no Brasil,
  de preferência plano grátis]?" — específico o bastante para dar o "clique".
- **No seu nível, comece assim:** primeiro movimento tangível.
- **Um nível acima, isso vira:** a forma mais poderosa da MESMA oportunidade (nível 2 da
  família, §3.1) — a provocação de evolução.
- **O como-fazer chega no e-mail:** mini-guia (passo a passo + prompts prontos).

### 8.2 Paleta de ferramentas por nível (guia para a ISSUE-105; citar 1–2 por resultado)

| Nível | Ferramentas de referência |
|---|---|
| Curioso / Usuário | ChatGPT (grátis), Gemini, Copilot — prompts e templates prontos |
| Operador | NotebookLM, Gems/GPTs personalizados, Google Sheets/Excel + IA, Canva/Gamma |
| Builder | Claude (artefatos), Google AI Studio, ferramentas de vibe coding (Lovable, v0), Apps Script, n8n/Make/Zapier, Looker Studio, Airtable |
| Referência | Claude Code, Cursor, Google Antigravity, n8n avançado (fluxos multi-etapas/agentes), MCP (conectar IA aos seus sistemas), práticas de avaliação e governança |

## 9. Personas de validação

> Personas 1–4 **✅ validadas pelo dono (2026-07-06)** — mantidas como casos de teste do vitest.
> Persona 5 **✅ resolvida** (agêntico com redirect-que-ensina). Personas 6–7 **novas — validar**.
> Todos os resultados agora incluem o exemplo do bloco "Na prática" (§8.1), conforme o padrão
> que o dono descreveu por persona.

### Persona 1 — Renata, analista de vendas ✅
Planilhas · consolidando informação · semanal · liderança · planilha simples · facilitar
decisão · conforto bom → **`dashboard`** (≈11 vs 5 do 2º).
**Na prática:** "Sabia que você consegue montar um dashboard no Gemini conectado às suas
planilhas?" → e-mail: manual de como gerar e manter (Gemini/Looker Studio grátis).

### Persona 2 — Marcos, comunicação interna ✅
Textos · revisando textos · mensal · meu time · texto livre · ganhar tempo · conforto médio
→ **`prompt` estruturado** (≈10 vs 6).
**Na prática:** "Sabia que dá pra criar um Gem/GPT personalizado que revisa seus textos no seu
padrão — uma vez, e nunca mais explicar do zero?" → e-mail: como criar o seu (nível 2 da
família Conversação).

### Persona 3 — Júlia, RH (guard-rail de dado sensível) ✅
Atendimento · dúvidas repetidas · diário · meu time · **dados sensíveis** · automatizar ·
conforto médio → **`template` + flag diligência** (automação venceria sem o modificador; a
penalidade derruba e o template vence no desempate). Bloco de Diligência + leitura "quem leva
esporro é você".
**Na prática:** "Sabia que dá pra montar uma base de respostas-padrão que a IA preenche sem
nunca colar dado pessoal de ninguém?" → e-mail: o template + as regras do que pode/não pode.

### Persona 4 — Fernando, operações ✅
Status reports · copiando e colando · diário · meu time · dados de sistemas · automatizar ·
conforto alto → **`automacao`** (≈10 vs 6).
**Na prática:** "Sabia que esse fluxo dá pra montar no n8n ou Make no plano gratuito, com
alguns prompts prontos?" → e-mail: passo a passo do primeiro fluxo; provocação: "um nível
acima, ele roda sozinho com aprovações" — e como chegar lá.

### Persona 5 — Camila, a visionária do agente (teto do agêntico) ✅ resolvida
Atendimento · buscando informações · diário · cliente externo · dados de sistemas ·
automatizar · conforto muito alto → **`agentico`** (≈9 vs 8; P8+P6 liberam a vitória), com o
conteúdo de redirect **que ensina**: apresenta Claude Code/Cursor/Antigravity/n8n
multi-agente, dá o clique ("comece pelo pedaço que dói mais — a busca na base") → e-mail: o
caminho do primeiro protótipo em etapas. Se o conforto fosse médio, rebaixaria para o próximo
colocado ≤4.

### Persona 6 — Eduardo, empreendedor (NOVA — validar)
*Dono de negócio pequeno; mil coisas ao mesmo tempo, apagando incêndio; sem tempo de aprender
ferramenta complexa.*

| Pergunta | Resposta |
|---|---|
| Área | **Empreendedor / dono de negócio** (opção nova) |
| Entrega | Atendimento / respostas |
| Perda de tempo | Respondendo dúvidas repetidas |
| Frequência | Todos os dias |
| Público | Cliente / usuário externo |
| Dado | E-mails / mensagens |
| Deseja | Automatizar parte do processo |
| Conforto | Médio |

**Resultado esperado: `automacao` simples** (≈9; agêntico pontua 7 mas o teto de conforto
médio o exclui — o guard-rail protege exatamente quem não tem tempo de brigar com ferramenta).
**Na prática:** "Sabia que dá pra deixar respostas automáticas com IA no WhatsApp Business e
no e-mail, sem contratar ninguém?" → e-mail: kit de primeiros fluxos para donos de negócio.
Segmento marcado no analytics (área) — alimenta o produto futuro de mentoria (ISSUE-307).

### Persona 7 — Larissa, estudante (NOVA — validar)
*Universitária com estágio; pesquisa, resumos, trabalhos e TCC.*

| Pergunta | Resposta |
|---|---|
| Área | **Estudante** (opção nova) |
| Entrega | Textos / comunicações |
| Perda de tempo | Buscando informações |
| Frequência | Várias vezes por semana |
| Público | Só por mim |
| Dado | Documentos |
| Deseja | Ganhar tempo |
| Conforto | Bom |

**Resultado esperado: `prompt` estruturado** (empata ≈7 com workflow; desempate por menor
complexidade → prompt — certo para quem ainda constrói base).
**Na prática:** "Sabia que o NotebookLM transforma seus PDFs de aula em resumos, mapas e
simulados — de graça?" → e-mail: guia de estudo com IA (prompts de pesquisa + fluxo de fontes
confiáveis). Captura o segmento estudante para a newsletter.

## 10. Validação — ✅ DOC APROVADO PELO DONO (2026-07-06, rodada 3)

- ✅ Rodada 2: personas 1–5, matriz de pesos, corte teaser×completo, regra do "sabia que".
- ✅ Rodada 3: as 7 perguntas revisadas da maturidade (§2.2), a 8ª tela não pontuada,
  personas 6 (Eduardo → automação) e 7 (Larissa → prompt), famílias em 2 níveis (§3.1).
- ✅ Correção aplicada: "opencode" removido da paleta (era erro de transcrição — ferramentas
  pretendidas: Claude Code, Cursor, Lovable/vibe coding).
- ✅ Referência técnica da escada de famílias verificada na fonte (§3.1): *Building Effective
  Agents* (Anthropic).

**Este doc é a especificação final do cérebro.** A ISSUE-104 codifica a matriz **exatamente
como está aqui** (vitest cobrindo as 7 personas + casos-limite: extremos, sensível + conforto
baixo juntos, empates). Qualquer desvio na implementação volta para este doc primeiro.

---

## Apêndice — sanity check contra melhores práticas de assessment

Validação final pedida pelo dono (§1.2): o desenho segue os princípios que fazem esse tipo de
funil funcionar — perguntas comportamentais/cenário em vez de autoavaliação (menos viés de
desejabilidade social, mais difícil de "roubar"); um construto dominante por pergunta, escadas
monotônicas; scoring determinístico e auditável (transparência é diferencial da marca — "sem
IA generativa, lógica guiada"); tempo até o valor <3min; resultado com identidade nomeada
("você é Operador") + especificidade (radar visual + risco + primeiro passo) em vez de rótulo
raso; gate no aprofundamento com valor real antes (teaser) e entrega redundante tela+e-mail.
Referências do próprio projeto: benchmark estratégico (casos Reforge/Section/HubSpot-style
assessment-led growth) e contexto editorial (tom).
