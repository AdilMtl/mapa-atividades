# ISSUE-314 — Conteúdo editorial: materiais, prompts e copy da página do projeto

> Autorado em 2026-07-11 (Fable 5), sob a spec `ISSUE-314-spec-pagina-projeto.md`.
> **Status: aguardando aprovação do dono.** Nada daqui vira código antes do veto/aprovação
> (mesma regra da 316). Na implementação, o Sonnet transpõe: §2–§3 pra copy dos componentes,
> §4–§6 pra `src/lib/lab/materiais.ts` (módulo puro, testável), §7 pras funções de
> personalização.
>
> Convenções: placeholders `{{area}}`, `{{entrega}}`, `{{ferramenta}}`, `{{horas}}` são
> resolvidos deterministicamente (regras no §7) — **todo placeholder tem fallback; prompt
> nunca sai com buraco.** Voz: a da newsletter (mesma régua do `plan-generator.ts` e do
> `radar/content.ts`, que são a referência aprovada).

---

## 1. Mapa de uso

| Peça | Onde entra na página | Fonte no código |
|---|---|---|
| Copy dos 5 blocos (§2) | Títulos, textos fixos, botões | componentes da 314 |
| Devolutiva (§3) | Bloco 1 | `materiais.ts` (fragmentos) + função de composição |
| Guias dos 10 slugs (§4) | Bloco 4 (guia do slug âncora); a 316 reaproveita TODOS | `materiais.ts` |
| Prompts de arranque (§5) | Bloco 4 (um por projeto, pelo tipo) | `materiais.ts` |
| Linhas de evolução (§6) | Bloco 5 (quando a regra da escada permitir) | `materiais.ts` |
| Regras de personalização (§7) | Servidor, na montagem da página | função pura + testes |

---

## 2. Copy dos 5 blocos

### Títulos dos blocos (na ordem)

1. **O que eu ouvi de você**
2. **A leitura do teu caso**
3. **O plano**
4. **Mão na massa**
5. **Daqui pra frente**

### Botão de avanço (modo leitura guiada)

Rótulo único, constante: **"Continuar"** — com uma exceção: do bloco 3 pro 4, o botão diz
**"E como eu começo?"** (é a pergunta que a pessoa está fazendo nesse exato momento; o botão
verbaliza a intenção dela, regra de CTA da casa).

### Aberturas fixas de cada bloco (1 linha, antes do conteúdo dinâmico)

- Bloco 2: *"Agora deixa eu te devolver o que isso significa."*
- Bloco 3: *"O caminho, do jeito que eu desenharia contigo numa folha."*
- Bloco 4: *"Nada disso vale se você não arrancar. Então eu já deixei o arranque pronto."*
- Bloco 5: *"Última coisa — e é a mais importante."*

(O bloco 1 não tem abertura fixa: ele JÁ É a abertura da página.)

### Bloco 5 — texto de rotina (fixo)

> Esse projeto agora é teu lugar de trabalho aqui dentro: marca as etapas conforme for
> fazendo, volta quando travar, copia o prompt de novo quando precisar. Ele fica te esperando
> do jeito que você deixou — e é assim, uma etapa por semana que seja, que isso entra na tua
> rotina de verdade. Não é sprint, é ofício.

### Botão "Concluir projeto" e fechamento de conclusão

Botão (aparece só com todas as etapas marcadas): **"Concluir projeto"**.

Texto exibido ao concluir:

> Fechou. Você pegou uma coisa que morava na tua cabeça — ou na tua pilha — e transformou num
> ativo que existe e funciona. Pouca gente atravessa esse caminho inteiro; a maioria para na
> conversa. Esse projeto fica guardado aqui, do jeito que você construiu. E se o uso da semana
> te mostrar um degrau novo, você sabe onde me encontrar.

### Rodapé auditável (mono, discreto, fim da página)

Formato: `classificação: {tipo} · família {familia} · motor {engine_version} · plano {generator_version}`
(sem texto adicional — transparência técnica, não conteúdo).

---

## 3. Devolutiva — fragmentos e composição (Bloco 1)

A devolutiva é montada de 2 a 4 frases, nesta ordem: **chegada** (obrigatória) → **horas**
(se `horas_semana` > 0) → **público** (se houver) → **relato** (se houver). Cada fragmento só
entra se o dado existe; com só a chegada, o bloco ainda funciona. Projetos v1 (schema antigo)
usam o fallback da chegada.

### 3.1 Chegada — por porta

**Porta `ideia`** — varia pelo arquétipo:

| Arquétipo | Frase |
|---|---|
| `arq_painel` | Você chegou aqui com uma ideia clara: um painel pra parar de montar o mesmo relatório na mão. |
| `arq_organizador` | Você chegou com uma ideia debaixo do braço: um organizador pra tirar o controle da tua cabeça (e das quinze abas). |
| `arq_input` | Você chegou com uma ideia específica: uma tela de entrada pra informação parar de chegar de qualquer jeito. |
| `arq_consolidador` | Você chegou sabendo o que quer: um consolidador pra juntar o que hoje vive espalhado em três lugares. |
| `arq_assistente` | Você chegou com uma ideia ambiciosa — um assistente que responde pelas coisas que hoje só você sabe responder. |
| `arq_automatizador` | Você chegou com a ideia certa pra quem tá cansado de tarefa repetida: fazer isso rodar sozinho. |
| `arq_outro` / ausente | Você chegou com uma ideia própria — e ideia própria é o melhor jeito de chegar. |

**Porta `dor`:**
> Você não chegou com uma ferramenta na cabeça — chegou com uma dor de verdade, dessas que
> comem a semana. É o melhor ponto de partida que existe.

**Porta `difusa`:**
> Você chegou meio sem saber por onde começar — e isso é mais comum do que parece. A boa
> notícia: a conversa que a gente teve já resolveu essa parte.

### 3.2 Horas (se `horas_semana` > 0)

> Me contou que isso come {{horas}} da tua semana — toda semana.

(`{{horas}}` = "~Nh"; com N ≥ 8, acrescentar: *"Isso é mais de um dia inteiro de trabalho."*)

### 3.3 Público (por `pub_*`, padrão; fallback: omitir a frase)

Padrão: *"E o resultado disso vai direto pra {{publico_frase}}."* — onde `{{publico_frase}}`
traduz o id pra linguagem de gente (ex.: `pub_lideranca` → "tua liderança";
`pub_time` → "o teu time"; `pub_cliente` → "cliente, gente de fora"; `pub_voce` → "você
mesmo — o que só aumenta a tentação de deixar pra depois"). A tabela id→frase final é fechada
na implementação com o vocabulário real de `radar/oportunidades.ts`; o padrão e o tom são
estes.

### 3.4 Relato (se houver; truncado em ~140 chars, corte em palavra + "…")

> Nas tuas palavras: *"{{relato}}"*. Eu anotei. **(esta é a linha manuscrita/Caveat do bloco)**

Sem relato, a linha manuscrita do bloco 1 vira a frase das horas (se existir) — e sem as
duas, o bloco 1 vai sem manuscrito (a página tem no máximo 3 ecos manuscritos; nenhum é
obrigatório).

---

## 4. Guias dos materiais (10 slugs)

Cada guia: título + 3 parágrafos na voz da casa. Na página, aparece o guia do **slug âncora**
do tipo (primeiro de `SLUGS_POR_TIPO`); a biblioteca (316) herda todos.

### 4.1 `prompt-de-quatro-partes` (âncora de: prompt)

**O prompt de quatro partes**

O problema nunca foi o prompt — foi o que você não disse nele. A IA não conhece tua empresa,
teu chefe, teu padrão de qualidade; quando a resposta vem genérica, é porque o pedido foi
genérico. As quatro partes resolvem isso: **contexto** (quem você é, pra quem é a entrega),
**objetivo** (o que precisa sair), **formato** (como precisa sair) e **critérios** (como você
decide se ficou bom).

A quarta parte é a que separa amador de profissional — e é a que todo mundo pula. Critério de
revisão é você dizendo pra IA o que você corrigiria na mão: "sem jargão", "números sempre com
fonte", "máximo uma página". Cada correção que você fizer numa resposta vira critério novo no
prompt. Em duas ou três rodadas, ele sai bom de primeira.

Guarda o prompt num bloco de notas, não na memória. Prompt que funciona duas vezes seguidas é
padrão — e padrão salvo é o primeiro ativo digital teu nessa história.

### 4.2 `template-de-campos-fixos` (âncora de: template)

**O template de campos fixos**

Olha as três últimas versões dessa tua entrega, lado a lado. O que aparece nas três é
estrutura; o que muda é campo. Template é só isso: congelar a estrutura e marcar os campos —
`[nome]`, `[situação]`, `[prazo]` — pra IA preencher a partir do caso concreto.

A ordem importa: acerta a estrutura NA MÃO primeiro, depois congela. Template de processo ruim
só produz erro mais rápido — padronizar bagunça é multiplicar bagunça. Se a última versão da
entrega ainda te incomoda, arruma ela antes de virar molde.

Usa por uma semana, em entrega real. O que travar é ajuste no molde, não gambiarra no dia. E
quando o molde estabilizar, ele deixa de ser "um documento teu" e vira ferramenta de time —
dá até pra embutir num Gem ou GPT personalizado depois, e aí ninguém mais precisa nem ver o
esqueleto.

### 4.3 `fluxo-em-etapas` (âncora de: workflow)

**O fluxo em etapas**

O que você descreveu não é uma tarefa — é uma sequência disfarçada de tarefa. Coletar,
consolidar, resumir, revisar, entregar. Jogar isso inteiro num prompt só é pedir pra IA
adivinhar demais; o resultado sai diferente a cada vez, e você para de confiar.

Desenha o fluxo em 4 a 6 passos numerados, com uma pergunta por passo: o que ENTRA aqui, o que
SAI daqui? Se não cabe em seis, o recorte tá grande — corta. Depois roda a sequência uma vez
inteira, com a IA em cada etapa e você validando no meio. Onde funcionar, congela o prompt do
passo.

O ganho não é só velocidade — é auditabilidade. Quando cada etapa tem entrada, saída e prompt
fixo, você sabe exatamente ONDE o resultado degradou quando degradar. E esse desenho de passos
numerados é, literalmente, a planta da automação que isso pode virar um dia.

### 4.4 `regra-quando-x-faca-y` (âncora de: automacao)

**A regra "quando X, faça Y"**

Automação não começa em ferramenta — começa numa frase. "Quando chegar e-mail com anexo do
fornecedor, salva na pasta e me avisa." Se você não consegue escrever a tua nessa forma, o
processo ainda não está pronto pra automatizar: volta um passo, padroniza, tenta de novo. A
frase é o teste.

Com a frase escrita, escolhe só o gatilho e a PRIMEIRA ação — não o processo inteiro. n8n,
Make ou Zapier no plano gratuito montam isso sem código; o que eles pedem não é técnica, é
clareza. E automação nova trabalha em dupla com o manual por uma semana: você confere se ela
acerta antes de entregar a chave.

A regra de ouro: automação amplifica o que existe — inclusive o erro. Regra confusa na mão
vira erro em escala na máquina. Por isso cada etapa nova passa pelo mesmo ritual: frase, teste
em paralelo, aí assume. Você vira supervisor, não operador — e é essa a graça toda.

### 4.5 `painel-das-tres-perguntas` (âncora de: dashboard)

**O painel das três perguntas**

Todo painel que presta nasce de uma lista curta: as três perguntas que alguém faz TODA SEMANA
sobre esse dado. "Como estamos contra a meta?" "O que travou?" "O que mudou desde ontem?" O
painel existe pra responder essas três — o resto é tentação, e cada gráfico a mais é um lugar
pro olhar se perder.

Antes do painel, a fonte: a planilha que você já atualiza, com colunas limpas e nomes que
qualquer pessoa entende. Painel bom em cima de fonte bagunçada é fachada. Com a fonte
arrumada, a primeira versão sai em uma sentada — Gemini conectado na planilha, ou Looker
Studio grátis — e feio-e-útil ganha de bonito-e-parado, sempre.

O teste final não é estética: mostra pra quem faz as perguntas e observa se alguma DECISÃO
mudou. Painel que não muda comportamento é decoração. E combina desde já quando a fonte
atualiza — porque a pergunta "esse número tá atualizado?" é a primeira coisa que mata um
painel.

### 4.6 `descricao-de-uma-pagina` (âncora de: app_offline; usado por: app_tabela, orquestrado)

**A descrição de uma página**

Antes de qualquer código — que a IA escreve por você — vem o documento que separa projeto de
devaneio: uma página, cinco blocos. **Quem usa** (de verdade, com nome se possível), **a dor**
(o que acontece hoje sem a ferramenta), **o que entra** (dados, informação), **o que sai**
(o resultado que resolve a dor) e **a primeira tela** (o que a pessoa vê quando abre).

Uma página é o tamanho certo por design: se não cabe, a ambição tá maior que o recorte — e
recorte grande é onde projeto de gente ocupada vai morrer. Corta até caber. A versão que cabe
numa página é a que sai do papel num fim de semana.

Com a descrição pronta, cola no Claude, no Google AI Studio ou na ferramenta de construção que
tiver à mão, e pede a primeira versão. Ela vem torta — a segunda te surpreende. E cada coisa
que te confundir no uso vira ajuste na DESCRIÇÃO, não desculpa pra desistir: o documento é a
fonte da verdade, o código é consequência.

### 4.7 `tabela-de-dez-registros` (usado por: app_tabela)

**A tabela de dez registros**

A tentação é começar pela interface. Resiste: começa pela tabela — Google Sheets ou Airtable —
com DEZ registros reais, de verdade, do teu trabalho. Dado inventado valida ferramenta
inventada; dez linhas reais te contam na hora quais colunas faltam, quais sobram e qual nome
de campo ninguém entende.

Roda uma semana só com a planilha, sem app nenhum. O que as pessoas pedirem que a planilha não
dá conta — ISSO é a primeira tela do teu app, definida por demanda real e não por achismo. É o
jeito mais barato que existe de descobrir o que construir.

E quando o app nascer em cima dela, lembra: o app vive se a tabela vive. Combina quem registra
o quê, e segura duas semanas de uso real antes de qualquer feature nova. Ferramenta com dado
morto é cemitério com login.

### 4.8 `recorte-do-fluxo-principal` (âncora de: orquestrado; usado por: agentico)

**O recorte do fluxo principal**

Sistema de verdade se constrói por recorte, não por escopo completo — porque sistema que nasce
completo nasce atrasado. O exercício: descreve o fluxo principal em CINCO frases. Quem entra,
o que faz, o que sai. Precisou da sexta frase? O recorte ainda tá grande. Corta de novo.

O recorte certo tem uma tela, um perfil de usuário, uma integração. Só. A segunda tela, o
segundo perfil e a segunda integração esperam a primeira rodada provar valor — e quem decide o
que entra depois não é tua empolgação, são as três pessoas que usaram a primeira versão.

Esse disciplina de recorte é o que diferencia quem CONSTRÓI de quem desenha arquitetura no
papel pra sempre. A versão de teste feia que resolve UM fluxo real vale mais que o diagrama
perfeito do sistema inteiro — porque ela existe.

### 4.9 `consulta-a-base-antes-do-agente` (usado por: agentico)

**A consulta à base — antes do agente**

Todo projeto agêntico esconde uma pergunta anterior: as respostas que saem da tua base de
conhecimento PRESTAM? Porque autonomia em cima de resposta ruim não é inteligência — é erro em
escala, com a tua assinatura. Por isso a ordem é inegociável: primeiro consulta, depois
decisão, por último ação.

Monta só o primeiro elo: um fluxo que responde perguntas a partir da tua base, com dados
controlados, sem agir sobre nada. Roda uma amostra real e mede — as respostas estão certas?
Completas? Na voz certa? Enquanto a resposta for "mais ou menos", o agente espera.

Quando a consulta provar qualidade, as camadas entram uma por vez: classificar intenção,
rotear, agir — cada uma auditada antes da próxima. E define desde o desenho onde o humano
aprova: mesmo os melhores times do mundo põem gente nos pontos críticos. Supervisão não é
falta de ambição — é engenharia.

### 4.10 `cuidado-com-dados-sensiveis` (diligência — versão biblioteca)

**Cuidado com dados sensíveis**

(Nota de implementação: na PÁGINA do projeto, o aviso de diligência do bloco 2 usa o
`BLOCO_DILIGENCIA` oficial do `radar/content.ts`, já aprovado — não duplicar texto. Este guia
é a versão de biblioteca/consulta, complementar.)

Dado sensível não proíbe o projeto — muda a ordem dele. A regra prática que resolve 90% dos
casos: a IA trabalha na **estrutura** (modelos, padrões, esqueletos, rascunhos com exemplo
fictício), os dados reais ficam onde já estão. Você constrói o molde com a IA e preenche com
dado de verdade do lado de cá.

O teste rápido antes de colar qualquer coisa numa IA: "se esse conteúdo vazasse com meu nome
junto, seria um problema?" Nome de cliente, salário, dado de saúde, informação estratégica —
tudo isso responde sim. Anonimiza, troca por placeholder, ou simplesmente não sobe.

E a jogada que quase ninguém faz: pergunta pra quem cuida disso na tua empresa. Existir essa
conversa já te coloca na frente da maioria — e transforma teu projeto de "risco em potencial"
em "caso exemplar de uso responsável". É diferencial, não burocracia.

---

## 5. Prompts de arranque (um por tipo — 9)

O prompt de arranque destrava a **primeira etapa** do plano. É colado na IA da pessoa
(`{{ferramenta}}` resolvida pelo arsenal, §7). Todos seguem a mesma anatomia — contexto,
objetivo, processo, formato, critérios — porque o prompt também ENSINA o método pelo exemplo.
Na página: bloco copiável, com o botão "Copiar prompt".

> Nota de forma: os prompts pedem pra IA **entrevistar antes de gerar** ("me pergunte antes")
> — é o "grill me" do método do dono virando produto, e é o que separa esses prompts de um
> template da internet.

### 5.1 `prompt` — arranque do prompt estruturado

```text
Você vai me ajudar a construir um prompt reutilizável de quatro partes para uma tarefa real
do meu trabalho. Trabalho com {{area}} e a tarefa é produzir {{entrega}}.

Antes de escrever qualquer coisa, me entreviste: faça até 5 perguntas, uma de cada vez, para
entender (1) quem recebe essa entrega, (2) o que ela precisa conter, (3) o formato em que ela
precisa sair e (4) como eu avalio se ficou boa — o que eu corrigiria na mão se viesse errado.

Depois das respostas, monte o prompt final com quatro partes rotuladas: CONTEXTO, OBJETIVO,
FORMATO e CRITÉRIOS DE REVISÃO. O prompt deve ser autossuficiente: qualquer IA que o receber
deve produzir a entrega sem me fazer perguntas de novo.

Regra: não invente informações sobre meu trabalho — o que você não souber, pergunte.
```

### 5.2 `template` — arranque do template

```text
Você vai me ajudar a transformar uma entrega repetitiva em um template de campos fixos.
Trabalho com {{area}} e a entrega que se repete é {{entrega}}.

Vou te colar 2 ou 3 versões recentes dessa entrega (com dados sensíveis trocados por
exemplos fictícios). Sua tarefa, nesta ordem:
1. Compare as versões e liste: o que se repete em todas (estrutura) e o que muda (campos).
2. Me mostre a lista e pergunte se concordo antes de continuar.
3. Monte o template: a estrutura fixa com os campos variáveis entre colchetes, tipo [nome],
   [situação], [prazo].
4. Escreva o prompt de preenchimento: a instrução que eu vou usar no dia a dia para você
   preencher o template a partir de um caso novo.

Critério de qualidade: se eu usar o template numa entrega real esta semana e precisar
reescrever mais de 20% do resultado, o molde falhou — nesse caso, quero ajustar o template,
não o texto.
```

### 5.3 `workflow` — arranque do fluxo em etapas

```text
Você vai me ajudar a desenhar um fluxo de trabalho em etapas para uma sequência que hoje eu
faço na mão. Trabalho com {{area}} e o resultado final é {{entrega}}.

Primeiro, me entreviste: faça até 4 perguntas, uma de cada vez, para mapear a sequência
completa — de onde a informação vem, o que eu faço com ela em cada passo e onde ela termina.

Depois, desenhe o fluxo em 4 a 6 etapas numeradas. Para cada etapa: um nome curto, o que
ENTRA, o que SAI e um prompt pronto para eu usar com IA naquele passo. Se a sequência não
couber em 6 etapas, me proponha um recorte menor em vez de espremer.

No final, me diga qual etapa você recomenda que eu rode primeiro como teste — a que tem mais
ganho com menos risco — e por quê.
```

### 5.4 `automacao` — arranque da automação

```text
Você vai me ajudar a preparar uma automação simples, começando pela regra — não pela
ferramenta. Trabalho com {{area}} e a tarefa repetitiva envolve {{entrega}}.

Primeiro, me ajude a escrever a regra na forma "QUANDO X acontecer, FAÇA Y": me faça até 4
perguntas, uma de cada vez, sobre o que dispara a tarefa hoje, o que eu faço em resposta e
com que frequência. Se a regra não fechar numa frase clara, me diga o que ainda está confuso
no processo — isso significa que ele precisa ser padronizado antes de automatizar.

Com a regra fechada, monte o passo a passo do PRIMEIRO fluxo (só o gatilho e a primeira
ação) numa ferramenta de automação sem código com plano gratuito, como n8n ou Make: quais
blocos usar, em que ordem, e o que configurar em cada um.

Feche com o protocolo de teste: como eu rodo essa automação em paralelo com o processo
manual por uma semana antes de confiar nela.
```

### 5.5 `dashboard` — arranque do painel

```text
Você vai me ajudar a montar a primeira versão de um painel (dashboard) para dados que hoje
eu consolido na mão. Trabalho com {{area}} e o painel serve para {{entrega}}.

Primeiro, as três perguntas: me entreviste (até 4 perguntas, uma de cada vez) até a gente
definir as TRÊS perguntas que alguém faz toda semana sobre esse dado — o painel existe para
responder essas três, e mais nada na v1.

Depois, o diagnóstico da fonte: vou te descrever as colunas da minha planilha atual. Me diga
o que renomear, separar ou limpar para ela virar uma fonte confiável.

Por último, o desenho do painel: para cada uma das três perguntas, qual visualização
responde melhor (número, gráfico, tabela) e por quê. Formato final: uma tela, três blocos.
Vou montar em {{ferramenta}} ou no Looker Studio — me dê o passo a passo do que criar.
```

### 5.6 `app_offline` — arranque do app simples

```text
Você vai me ajudar a escrever a "descrição de uma página" de um app simples, que roda no
navegador, sem servidor e sem depender de TI. Trabalho com {{area}} e o app resolve uma
tarefa ligada a {{entrega}}.

Me entreviste primeiro: até 5 perguntas, uma de cada vez, cobrindo (1) quem vai usar, (2) o
que acontece hoje sem a ferramenta, (3) o que a pessoa informa ao app, (4) o que o app
devolve e (5) o que aparece na primeira tela.

Depois, escreva a descrição em UMA página, com esses cinco blocos rotulados. Se a minha
ambição não couber numa página, proponha o recorte menor — a versão que cabe é a que sai do
papel.

Quando eu aprovar a descrição, gere a primeira versão do app: um único arquivo HTML com CSS
e JavaScript embutidos, que eu salvo no computador e abro no navegador. Interface em
português, simples e com botões grandes. A primeira versão pode ser feia; ela só precisa
funcionar na tarefa real.
```

### 5.7 `app_tabela` — arranque do app com tabela

```text
Você vai me ajudar a começar um app que nasce de uma tabela — validando com planilha ANTES
de qualquer interface. Trabalho com {{area}} e a informação é sobre {{entrega}}.

Primeira missão, a tabela: me entreviste (até 4 perguntas, uma de cada vez) para definir as
colunas — o que precisa ser registrado, por quem e com que frequência. Depois me proponha a
estrutura: nome de cada coluna, tipo de dado e um exemplo de linha preenchida. Vou montar no
Google Sheets com DEZ registros reais.

Segunda missão, o teste: me dê um roteiro de uma semana usando SÓ a planilha — o que
observar, o que perguntar a quem usa, e como reconhecer o sinal de que a planilha não dá
conta (é esse sinal que define a primeira tela do app).

Não gere nenhuma interface ainda. O app vem depois que a tabela provar que o dado vive.
```

### 5.8 `orquestrado` — arranque do sistema orquestrado

```text
Você vai me ajudar a recortar um sistema grande até ele caber numa primeira versão
construível. Trabalho com {{area}} e o sistema envolve {{entrega}}.

Primeiro, o fluxo principal em 5 frases: me entreviste (até 5 perguntas, uma de cada vez)
sobre quem usa, o que a pessoa faz e o que sai. Depois, escreva o fluxo principal em NO
MÁXIMO cinco frases. Se precisar de mais, me proponha um recorte menor — repete até caber.

Com o fluxo fechado, defina a v1 com exatamente: UMA tela, UM perfil de usuário, UMA
integração (ou entrada manual de dados, se a integração puder esperar). Liste explicitamente
o que fica de FORA da v1 — essa lista é tão importante quanto o que entra.

Feche com a descrição de uma página dessa v1 (quem usa, dor, o que entra, o que sai,
primeira tela), pronta pra eu colar numa ferramenta de construção como Lovable ou v0 — ou
te pedir a primeira versão aqui mesmo.
```

### 5.9 `agentico` — arranque do agente (pela consulta)

```text
Você vai me ajudar a começar um projeto de agente de IA pelo único lugar seguro: a qualidade
das respostas — antes de qualquer autonomia. Trabalho com {{area}} e o agente atuaria sobre
{{entrega}}.

Primeiro, o inventário: me entreviste (até 4 perguntas, uma de cada vez) sobre onde vive hoje
o conhecimento que o agente usaria (documentos, planilhas, histórico, cabeça de alguém) e
que tipo de pergunta ele precisaria responder.

Depois, o teste de consulta: me ajude a montar uma rodada de 10 perguntas reais contra esse
conhecimento — perguntas que usuários fariam de verdade. Para cada uma, vou avaliar a
resposta em três critérios: está certa? está completa? está na voz certa?

Com o resultado, me diga com franqueza: a base está pronta para sustentar um agente, ou
precisa ser organizada primeiro? Se precisar, o plano de arrumação vem antes de qualquer
camada de decisão ou ação. Autonomia em cima de resposta ruim é erro em escala.
```

---

## 6. Linhas de evolução (Bloco 5)

Exibida só quando `vencedor_bruto` difere do tipo atual E está acima na escada (regra da
spec §3). Uma linha por tipo-ALVO (o degrau apontado), sempre em framing de futuro:

| Alvo (`vencedor_bruto`) | Linha |
|---|---|
| `template` | Com esse padrão rodando, teu caso tem cara de template: o mesmo pedido, congelado num molde que o time usa sem você do lado. É o próximo degrau natural. |
| `workflow` | Resolvida essa parte, o teu caso aponta pra um fluxo em etapas — a mesma clareza, aplicada na sequência inteira. É o próximo degrau natural. |
| `automacao` | Com isso estável, teu caso tem cara de automação: a regra que você já domina, rodando sozinha por gatilho. É o próximo degrau natural. |
| `dashboard` | Dando certo aqui, teu caso aponta pra um painel: o dado que você já organiza, respondendo perguntas sem você no meio. É o próximo degrau natural. |
| `app_offline` | Com essa base provada, teu caso tem cara de app simples: uma interface tua, no navegador, sem pedir permissão a ninguém. É o próximo degrau natural. |
| `app_tabela` | Provado o valor, teu caso aponta pra um app com base em tabela — a planilha que você validou virando ferramenta com tela. É o próximo degrau natural. |
| `orquestrado` | Esse projeto rodando bem, teu caso tem cara de sistema de verdade — mais gente usando, dado integrado. Um recorte de cada vez, mas o caminho existe. |
| `agentico` | Lá na frente, isso tem cara de agente: um sistema que consulta, decide e age. Longe? Menos do que parece — cada etapa deste plano já é um tijolo desse caminho. |

(Sem linha pra `prompt`: é o chão da escada, nunca é "degrau acima".)

---

## 7. Regras de personalização (contratos pro código)

### `{{ferramenta}}` — pela prioridade do arsenal (mesma ordem do `plan-generator`)

| Condição (primeira que bater) | Valor |
|---|---|
| `ambiente` inclui `amb_workspace` | `o Gemini do Google Workspace da empresa` |
| `ambiente` inclui `amb_copilot` | `o Microsoft Copilot da empresa` |
| `ambiente` inclui `amb_ia_premium` | `a minha IA paga (ChatGPT, Claude ou Gemini)` |
| Caso contrário (inclui `amb_shadow`, vazio ou v1) | `uma IA gratuita (ChatGPT, Gemini ou Claude)` |

### `{{area}}` — label da área em minúsculas ("marketing", "operações"…)

Fallback (área ausente/nula ou id sem label): **`o meu trabalho`** — e nesse caso a frase-
moldura muda de "Trabalho com {{area}}" pra "No meu trabalho" (a função de composição resolve;
nunca renderizar "Trabalho com o meu trabalho").

### `{{entrega}}` — descrição em linguagem natural derivada do label de `entrega_*`

Fallback: **`uma entrega recorrente do meu trabalho`**. A tabela id→frase é fechada na
implementação com o vocabulário real de `radar/oportunidades.ts` (mesma exigência do
`{{publico_frase}}` do §3.3) — critério: a frase precisa funcionar após "produzir…" /
"envolve…" / "sobre…" nos prompts do §5.

### `{{horas}}` — `~{n}h` (inteiro); só renderiza com n > 0

### Regra geral

Toda resolução é **pura e testável** (`materiais.ts` + testes): dado o mesmo
`wizard_answers` + diagnóstico, o mesmo texto — sempre. Nenhum placeholder pode vazar pro
usuário: teste automatizado varre `{{` no output de todas as combinações de fallback.

---

## 8. Checklist de aprovação do dono

- [ ] Copy dos 5 blocos (§2) — títulos, botões, rotina, conclusão
- [ ] Devolutiva (§3) — as 3 chegadas + arquétipos, horas, relato manuscrito
- [ ] Guias (§4) — os 10, voz e conteúdo
- [ ] Prompts de arranque (§5) — os 9 (são o coração do bloco Mão na massa)
- [ ] Linhas de evolução (§6)
- [ ] Regras de personalização (§7)

Vetos e ajustes: editar direto neste arquivo ou apontar na sessão — o que mudar aqui é a
fonte; o código segue o arquivo.
