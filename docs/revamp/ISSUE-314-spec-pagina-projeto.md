# ISSUE-314 — Spec da página do projeto `/lab/projeto/[id]` — "A Folha Virou Plano"

> Spec v1.0, fechada em 2026-07-11 na sessão de design com o dono (Fable 5), a partir do
> material preparatório (`ISSUE-314-contexto-preparatorio.md`) e das decisões registradas na
> pergunta 17 do `00b_open_questions.md`. **Sonnet implementa sob esta spec** — mesma dinâmica
> da 313. O conteúdo editorial dos materiais (9 guias + 9 primeiros prompts) é autorado pelo
> Fable em documento próprio (`ISSUE-314-materiais-conteudo.md`) e transposto pro código na
> implementação.

---

## 1. Conceito — "as notas viraram o plano"

O wizard (313) estabeleceu a cena: um consultor anotando numa folha manuscrita enquanto a
pessoa fala. Esta página é a continuação natural e o fechamento do arco: **a folha de notas
virou um documento de trabalho**. O consultor vira a folha pra pessoa e diz "deixa eu te
mostrar o que eu montei".

O que esta página NÃO é: um relatório estático que o sistema cospe (o esqueleto atual, sentido
como "frio/genérico"); um dump de cards simultâneos que convida a acelerar; um chat genérico
com resposta longa. O que ela É: uma leitura guiada na primeira visita, uma ferramenta de
trabalho nas seguintes.

A reação-alvo (palavras do dono): *"Pô, legal, nem tava imaginando isso — mas como eu faço
agora pra colocar em prática?"* — e a página responde essa pergunta no próprio corpo, com o
bloco Mão na massa.

## 2. Os dois modos da página

**Modo leitura guiada (só a primeira visita).** Os 5 blocos (§3) se revelam em sequência: a
pessoa lê um, toca "avançar", o próximo se escreve (mesma linguagem de animação da 313:
framer-motion, ritmo ágil 0.18–0.28s, beats curtos; `prefers-reduced-motion` → blocos aparecem
instantâneos, ainda gated pelo "avançar" — o gate é de leitura, não de enfeite).

**Modo documento (todas as visitas seguintes).** Página inteira aberta, sem pedágio: checklist
à mão, prompt copiável, tudo visível. A cerimônia acontece quando o diagnóstico é novidade;
depois disso o ritmo viraria atrito.

**Detecção da primeira visita:** o wizard já redireciona pra esta página ao finalizar — o
redirect passa a incluir um query param (ex.: `?leitura=1`). Com o param → modo guiado; sem →
modo documento. Zero storage, zero SQL. Trade-off aceito: refresh no meio da leitura guiada cai
no modo documento (aceitável; não punir com re-leitura).

**Estado rascunho:** se `status === 'rascunho'`, esta página redireciona pra `/lab/novo-projeto`
(que já retoma o rascunho no ponto certo). Projeto sem plano não tem o que mostrar aqui.

**Projeto alheio:** RLS devolve vazio → `notFound()` (já funciona no esqueleto; critério de
aceite: testar com 2 contas).

## 3. O arco — 5 blocos, nesta ordem

### Bloco 1 — A devolutiva ("o que eu ouvi de você")

O consultor ecoa o que a PESSOA disse antes de apresentar qualquer resultado. É o antídoto
direto contra o "genérico": nenhum chat guardou isso, o Lab guardou. Composta
deterministicamente a partir do `wizard_answers` (v2):

- `porta`/`arquetipo` → como ela chegou ("você chegou com uma ideia de painel na cabeça" /
  "você chegou com uma dor que come tua semana" / "você chegou meio sem saber por onde começar
  — e isso é mais comum do que parece").
- `horas_semana` → a quantificação ("me contou que umas 6 horas da tua semana vão embora
  nisso").
- `publico` → pra quem vai ("e que o resultado vai direto pra tua liderança").
- `relato` (quando existir) → citado CURTO, entre aspas, como o consultor cita o cliente:
  *"nas tuas palavras: 'perco a manhã toda consolidando planilha dos outros'"*. Truncar com
  elegância (~140 chars, corte em palavra); relato ausente → a devolutiva funciona sem ele.

**Eco manuscrito:** 1–2 linhas em Caveat nas margens deste bloco (ex.: a citação do relato, ou
a linha das horas) — a caligrafia do consultor sobrevive como anotação, não como estrutura.
Regra fechada com o dono: **manuscrito é coadjuvante nesta página** (o documento em si é DS2
limpo e legível). Máximo 3 aparições manuscritas na página inteira.

### Bloco 2 — A leitura do caso (diagnóstico em prosa)

O diagnóstico traduzido como um consultor explica, não como uma tabela:

- **Tipo** apresentado como leitura, com o "por quê" amarrado às respostas ("recorrente,
  estruturado, com gente decidindo em cima — isso é caso de painel, não de relatório novo").
- **Complexidade** virada pra pessoa: "o que isso exige de você" (não "complexidade: média").
- **Indicadores** (potencial_ia, potencial_automacao, risco) tecidos na prosa ou como
  destaques discretos — nunca três badges soltos sem frase.
- **Diligência** quando `flags.diligencia`: o `BLOCO_DILIGENCIA` completo (exportado pelo
  `plan-generator`) entra aqui como aviso do consultor, com o peso certo — é o único trecho
  que pode interromper o tom leve, de propósito.
- **Rodapé auditável** (discreto, mono, no fim da página, não deste bloco): tipo, família,
  engine_version, generator_version. Transparência técnica sem poluir a leitura.

### Bloco 3 — O plano (etapas + checklist vivo)

As etapas do `LabPlan` (já escritas, voz da newsletter), agora com o checklist funcionando:

- Cada etapa exibe título + descrição + o controle de marcar feito (touch ≥44px).
- Marcar/desmarcar **persiste** (PATCH — §5). Otimista na UI, com rollback em erro.
- **Status automático na entrada, cerimonial na saída** (decisão delegada e fechada):
  primeira etapa marcada → `status = 'em_construcao'` (server-side, no mesmo PATCH, sem
  cerimônia). Todas marcadas → aparece o botão explícito **"Concluir projeto"** →
  `status = 'concluido'`, com um fechamento à altura (o consultor reconhece: "de ideia a coisa
  construída — pouca gente atravessa esse caminho"). Status **nunca regride** automaticamente
  (desmarcar etapa não desfaz `em_construcao` nem `concluido`).
- Micro-feedback ao marcar: discreto (padrão `IconesAnimados` já existente), sem confete.

### Bloco 4 — Mão na massa (o "e agora?" respondido)

O bloco novo que o esqueleto não tinha e que mata a sensação de beco:

- **Guia curto** do material âncora do tipo (do conteúdo autorado — §6): o essencial do ofício
  em poucos parágrafos, na voz da newsletter. Sem página de biblioteca — o conteúdo mora aqui
  (decisão: não esperar a 316; quando a 316 nascer, ela reaproveita esses textos pelos mesmos
  slugs de `SLUGS_POR_TIPO`).
- **Primeiro prompt** — UM por projeto (não por etapa): o prompt pronto que destrava a
  primeira execução real, **personalizado deterministicamente** com o que a pessoa respondeu:
  área, entrega, e a ferramenta âncora do arsenal (`amb_workspace` → Gemini/Sheets;
  `amb_copilot` → Copilot; `amb_ia_premium` → "tua IA premium"; arsenal vazio/base → IA
  gratuita de janela). Template com placeholders, preenchido no servidor — zero IA em runtime
  (regra da 1A intacta).
- **Botão copiar** de verdade (clipboard + feedback "copiado"). A pessoa sai pra executar,
  mas sai com um artefato NOSSO na mão — e o convite explícito de voltar pra marcar a etapa.

### Bloco 5 — O fechamento de rotina

Como isso entra na semana dela de forma sólida — o mote da casa ("colocar IA na tua rotina de
trabalho") aterrissado, sem prometer a Fase 2:

- A instrução de rotina: *"marca aqui o que você for fazendo — esse projeto fica te esperando,
  do jeito que você deixou."*
- **Linha de evolução** (decisão fechada): quando `vencedor_bruto` difere do tipo atual **e**
  está acima dele na escada dos 9 tipos (ordem canônica do doc 11 — se estiver abaixo ou
  igual, omitir), o consultor aponta o degrau seguinte com framing de futuro: *"resolvido o
  painel, teu caso tem cara de automação — é o próximo degrau natural."* NUNCA como "o motor
  quase escolheu outra coisa".
- Zero CTA comercial, zero menção a curso/premium (decisão registrada). O gancho estrutural
  pro futuro fica invisível (campo/slot no código, nada na tela).

## 4. Voz e proibições de copy

- Voz da newsletter (fonte obrigatória: `contexto_editorial_newsletter_conversas_no_corredor.md`
  **+ os guias de voz do dono, fora do repo** — `C:\Users\adils\OneDrive\Desktop\Development\
  4. Newsletter agent\cnc-agentic\cnc-agentic\docs\Tom de escrita Adilson.md\Guia de Voz.md` e
  `...\3. referência de notes.md`; a régua final de qualquer copy nova é o checklist §8 do
  Guia de Voz, "isso parece o Adil?"): direto, brasileiro, levemente provocativo, exemplos
  concretos. Tratamento "tu/você" seguindo o padrão já usado no plan-generator ("teu caso",
  "tua semana"). Proibições que o dono já vetou NESTA issue (não reincidir): "arrancar/
  arranque", "te devolver o que isso significa", linguagem de entrada/saída ("o que entra,
  o que sai" — falar "o que você coloca / o que recebe de volta"), staccato, paralelismo
  "não é X, é Y" como slogan.
- Proibido: "domine", "revolucione", "desbloqueie", "10x", tom de guru, e qualquer frase que
  passaria num relatório de consultoria genérica ("com base nas suas respostas, identificamos
  que..."). Teste do cheiro: se o ChatGPT abriria a resposta assim, reescreva.
- Rótulos mecânicos do esqueleto atual ("01 / RESUMO DO PLANO") morrem. Blocos têm títulos de
  gente ("O que eu ouvi de você", "A leitura", "O plano", "Mão na massa" — títulos finais na
  copy da implementação, estes são a direção).
- Números e classificações aparecem A SERVIÇO de uma frase, nunca soltos.

## 5. Contratos técnicos (pro Sonnet)

- **Página:** Server Component busca projeto (RLS, como hoje); componente cliente novo
  (`LeituraProjeto` ou similar em `src/components/lab/projeto/`) orquestra modo guiado/
  documento, checklist e cópia do prompt. Split-screen NÃO se aplica aqui (não há "notas ao
  lado" — a folha É a página); coluna única fluida, largura de leitura confortável, mobile
  first (touch ≥44px, os padrões da casa).
- **PATCH `/api/lab/projects/[id]`** ganha ações de pós-finalização: atualizar
  `plan.checklist[].done` (validar ids contra o checklist existente — vocabulário fechado,
  mesma postura da `validacao.ts`; nunca aceitar checklist arbitrário do cliente) e transições
  de status (`em_construcao` derivada no servidor ao primeiro done; `concluido` só via ação
  explícita e só com tudo done). Mesmas 3 camadas de segurança das rotas existentes (sessão +
  gate + RLS via cliente da sessão). Motor/planos NUNCA re-rodam aqui.
- **Conteúdo dos materiais:** módulo determinístico novo (`src/lib/lab/materiais.ts`),
  keyed pelos slugs de `SLUGS_POR_TIPO` + `SLUG_DILIGENCIA` — cada entrada: título, guia
  (texto), template do primeiro prompt com placeholders tipados. Fonte editorial:
  `ISSUE-314-materiais-conteudo.md` (Fable autora, dono aprova antes de virar código — mesma
  regra da 316: nada publica sem aprovação).
- **Personalização do prompt:** função pura (testável) que resolve placeholders a partir de
  `wizard_answers` + diagnóstico; fallbacks obrigatórios pra todo campo opcional (projeto v1 /
  campos ausentes → prompt ainda sai íntegro e genérico-digno, nunca com buraco "[área]").
- **Projetos v1 (schema_version 1) e respostas ausentes:** a devolutiva degrada com graça —
  cada fragmento só entra se o dado existe; página nunca quebra por wizard antigo.
- **Validação da sessão de implementação:** vitest pros módulos puros (materiais,
  personalização, transições de status), tsc/lint/build, fluxo manual completo (wizard →
  redirect → leitura guiada → marcar etapas → revisita em modo documento → concluir), teste
  de projeto alheio com 2 contas, mobile real.

## 6. Conteúdo editorial a autorar (Fable, próximo passo)

`ISSUE-314-materiais-conteudo.md` — para os 9 tipos: guia curto do material âncora (usar os
slugs existentes; ~3–5 parágrafos cada, semeados por `CONTEUDO_OPORTUNIDADES` do
`radar/content.ts` e pela newsletter) + template do primeiro prompt (com os placeholders de
área/entrega/ferramenta). Mais: as variações de devolutiva por porta/arquétipo, a copy dos 5
blocos, o texto do fechamento de conclusão e a linha de evolução por par de tipos que a regra
da escada permitir. Dono aprova o documento antes da transposição pra código.

## 7. Escopo excluído (vinculante)

- Nada da **Fase 2 de acompanhamento** (check-up, "trouxe ganho?", realimentar o motor) — issue
  futura própria, com sessão de spec dedicada.
- Nada de task manager/kanban/calendário/notificações (handoff §9).
- Nada de IA em runtime (slots são da 320/321).
- Nada de listagem de projetos (é a 315 — mas esta página deve linkar de volta pro
  `/lab/inicio` na navegação existente, o que já acontece via LabShell).
- Nenhum CTA comercial, curso, premium.
- Não tocar em: motor (`engine.ts`, `desempate.ts`), `plan-generator` (exceto se precisar
  exportar algo já existente), wizard, rotas públicas, layout raiz, tracking.

## 8. Critérios de aceite

1. Primeira visita (redirect do wizard): leitura guiada bloco a bloco funciona, ritmo ágil,
   `prefers-reduced-motion` respeitado.
2. Revisita: página abre inteira em modo documento, sem pedágio.
3. Devolutiva ecoa dados reais do wizard da pessoa (testar com respostas diferentes → textos
   diferentes); projeto v1/dados ausentes degradam sem quebrar.
4. Checklist persiste entre sessões e dispositivos; primeira marcação vira `em_construcao`;
   "Concluir projeto" só com tudo marcado; status nunca regride.
5. Primeiro prompt copia com um toque e reflete área/entrega/arsenal da pessoa; sem
   placeholder vazando.
6. Projeto alheio → 404 (2 contas reais).
7. Zero regressão: wizard, rotas públicas, tracking e build intocados; tsc/lint/build limpos;
   testes novos verdes.
8. Teste do dono no celular: a leitura guiada "parece o consultor continuando a conversa" —
   critério subjetivo, veto dele vale.
