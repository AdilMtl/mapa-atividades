# ISSUE-111 — Briefing de revisão de copy (voz editorial)

> Preparado por Sonnet em 2026-07-08, para o Fable 5 executar. Não é o backlog — é o mapa de
> onde olhar e o que já foi verificado, para minimizar redescoberta. Leia isto DEPOIS de
> `docs/revamp/04_issue_backlog.md` (seção ISSUE-111) e `docs/revamp/README.md` §7, e antes de
> abrir qualquer arquivo de código.

---

## 1. Objetivo (da issue, não reinterpretar)

Passar toda superfície de texto nova (Fase 1 do revamp) pelo filtro da voz da newsletter.
**Ajustes in place** — não é reescrita estrutural, é revisão de copy. Produzir ao final um
relatório curto do que mudou.

**Fora de escopo:** qualquer mudança de estrutura, layout ou UX. Se um texto parece errado
por causa da estrutura (não da palavra), isso é outra issue — registre, não implemente aqui.

## 2. Direção do dono (prioridade real desta sessão)

O dono já leu a home e considera que ela está **majoritariamente OK** — só pontos pontuais lá
(ver §5.1 abaixo, já mapeados). O esforço real desta issue deve ir para:

1. **Radar de Maturidade e Radar de Oportunidades** (perguntas, resultados, microcopy do fluxo)
2. **Diagnósticos/resultados** (os textos que aparecem depois que a pessoa responde)
3. **`/newsletter`, `/lab`, `/obrigado`** (periferia do funil)
4. Microcopy geral, mensagens de erro, metadata

Não redistribua esforço de volta pra home sem um motivo concreto encontrado no texto — a
home já foi lida nesta preparação e está alinhada à voz (§5.1).

## 3. Fontes obrigatórias de voz (leia antes de julgar qualquer frase)

- `docs/GPT Project Revamp/contexto_editorial_newsletter_conversas_no_corredor.md`
  — **§7 (Tom de voz)** e **§12 (Voz da marca para copy do site)** são a régua desta issue.
  Leia também §6 (conceitos editoriais recorrentes: 4Ds, Artesanato Digital, IA que cabe na
  empresa) — vocabulário proprietário que deve aparecer, não ser evitado.
- `docs/revamp/README.md` §7 — resumo operacional + **lista proibida**: "domine", "revolucione",
  "desbloqueie", "o futuro chegou", "10x", superlativo de guru. CTAs verbalizam intenção
  ("Quero ver minhas oportunidades"), nunca função ("Cadastre-se", "Saiba mais").
- Teste do cheiro (doc editorial §7.5, cap. 3): *se a frase poderia estar em qualquer landing
  de curso de IA, reescreva.*

**Sanity check já rodado nesta preparação:** grep por toda a lista proibida em `src/` inteiro
— **zero ocorrências reais** (só aparece dentro do comentário que documenta a própria regra,
em `src/lib/radar/content.ts:8-9`). Ou seja, não existe copy "gritantemente errada" hoje — o
trabalho aqui é de refinamento de tom, não de caça a erro óbvio.

## 4. Critérios de aceite (da issue, verbatim)

- Dono lê e não "sente cheiro de IA".
- Zero termo proibido (grep pela lista — já limpo, revalidar no final).
- CTAs todos no padrão de intenção.

## 5. Mapa de arquivos por prioridade, com o que já foi observado

### 5.1 Home — baixa prioridade, só os pontos pontuais abaixo

Lida nesta preparação (`HeroSection.tsx`, `PortasSection.tsx`): headline, subheadline, CTAs e
os dois cards de radar já usam contraste, vocabulário próprio ("sem virar dev", "retrato
honesto, sem ranking") e CTAs de intenção. **Não abrir o resto da home** (`AutorSection`,
`ComoFuncionaSection`, `DiferenciacaoSection`, `PricingSection`, `ProblemaSection`,
`ReframeSection`, `PlataformaDemoSection`) a menos que o dono aponte uma frase específica —
não foram lidos nesta preparação e não estão confirmados, mas a orientação do dono é "menos
esforço aqui".

### 5.2 Radares — alta prioridade

- **`src/lib/radar/content.ts`** (867 linhas) — os 14 blocos de resultado (5 níveis de
  maturidade + 9 tipos de oportunidade + cruzamento + famílias + bloco de diligência). **Já é
  o padrão-ouro de voz nesta base de código**: estrutura tensão→contraste→exemplo, vocabulário
  "dentro da firma", "esporro", frases curtas de punch. Tratar como **referência de tom**, não
  como alvo prioritário de reescrita — passe o pente fino mesmo assim (14 blocos são muita
  superfície), mas espere poucos achados. Se algo soar "sem graça" ou genérico aqui, é sinal
  real de que precisa de ajuste — o bar está alto.
- **`src/lib/radar/maturidade.ts`** e **`oportunidades.ts`** — os textos das PERGUNTAS (não a
  lógica de scoring, que é fora de escopo). Ex.: `text: 'Pense na sua última semana de
  trabalho. Qual frase soa mais como você?'` e as `options` de cada pergunta (labels da
  escada). São mais neutras/funcionais que o `content.ts` — candidatas reais a um pouco mais
  de voz, com cuidado: são opções de múltipla escolha, precisam continuar claras e
  diferenciáveis entre si acima de tudo.
- **`src/components/radar/QuestionCard.tsx`** — microcopy fixa: "Pergunta X de Y", "~N min",
  "Voltar", "Continuar →". Puramente funcional/UI — provavelmente fica como está (clareza >
  voz em elementos de navegação), mas revisar se cabe.
- **`src/components/radar/MaturidadeResultado.tsx`** / **`OportunidadesResultado.tsx`** — pouca
  copy própria (a maior parte vem do `content.ts`), mas tem frases soltas: "Combinado — sua
  interpretação chega no e-mail.", "Diagnóstico enviado também para o seu e-mail.". Já estão
  no tom certo (o "Combinado —" é bem a cara da voz); conferir só.
- **`src/app/(publico)/radar/maturidade/page.tsx`** e **`oportunidades/page.tsx`** — só
  `metadata` (title/description). Já revisados na ISSUE-110 para SEO; conferir se passam pela
  régua de voz/lista proibida (leitura rápida nesta preparação: parecem OK, sem termo
  proibido).

### 5.3 Formulários e microcopy de erro — prioridade média, decisão de julgamento

- **`src/components/radar/EmailCaptureRadar.tsx`** e **`src/components/lab/LabWaitlistForm.tsx`**
  — têm as MESMAS mensagens (texto duplicado entre os dois arquivos, não é bug, mas se
  reescrever uma, replicar a mudança na outra para não divergir):
  - `'Digite seu nome'`, `'Digite um e-mail válido'`
  - `'Não foi possível conectar agora. Tente novamente em instantes.'`
  - `'Não foi possível salvar seu e-mail. Tente novamente.'`
  - `'Erro de conexão. Tente novamente.'`

  Essas são neutras/técnicas — nenhuma viola a lista proibida, mas também não têm nenhuma
  marca de voz. **Isto é uma decisão de julgamento, não um mandato de reescrever**: mensagem
  de erro geralmente deve priorizar clareza sobre personalidade (usuário frustrado não quer
  piada). Se decidir tocar, mantenha o registro direto — não force humor num momento de erro.
  Escopo inclui "mensagens de erro" explicitamente (backlog), então pelo menos avalie cada
  uma; não é obrigatório mudar todas.
  - Microcopy boa já presente, conferir e preservar: `'Sem conta, sem spam — só o resultado no
    seu e-mail.'` (EmailCaptureRadar), `'Você está na lista. Avisamos assim que o Lab abrir.'`
    (LabWaitlistForm) — ambas já no tom certo.

### 5.4 Periferia do funil — alta prioridade, achado concreto no Lab

- **`src/app/(publico)/newsletter/page.tsx`** — já competente: "A newsletter é onde a conversa
  continua.", "escrita por quem vive o corredor corporativo, não por quem vende curso." Baixo
  risco, conferir mesmo assim.
- **`src/app/(publico)/obrigado/page.tsx`** — já competente: "Sua trilha está a caminho.",
  "Enquanto o e-mail não chega, você pode começar por uma destas conversas." Baixo risco.
- **`src/app/(publico)/lab/page.tsx`** — **achado real**: o parágrafo de corpo (linha ~33-38)
  lê como lista de features encadeada, sem a estrutura de tensão/contraste do resto do site:
  > "O Lab do Conversas no Corredor está sendo desenhado para assinantes que querem ir além da
  > leitura: playbooks, templates, trilhas e ferramentas para estruturar ideias, escolher o
  > tipo certo de solução e evoluir do primeiro experimento para um ativo digital real."

  Compare com o padrão do `content.ts` (tensão → contraste → conceito) ou com o parágrafo da
  própria home ("Sem hype. Sem virar dev."). Este é o candidato mais forte desta varredura
  para reescrita de verdade — não só polimento. Headline ("Em breve: uma área para transformar
  leitura em prática.") e o badge/itens futuros estão OK como estão.

### 5.5 Metadata (SEO, ISSUE-110) — baixa prioridade, checagem rápida

`layout.tsx` (metadataBase/openGraph padrão), `sitemap.ts`/`robots.ts` não têm copy visível ao
usuário. As `metadata.description` por página (`newsletter`, `lab`, `obrigado`,
`radar/maturidade`, `radar/oportunidades`, home) já foram lidas nesta preparação — nenhuma
viola a lista proibida ou soa genérica. Conferir rapidamente, não é prioridade.

## 6. Processo sugerido

1. Releia `content.ts` inteiro primeiro — é o calibrador de "como soa certo" antes de julgar
   qualquer outro arquivo.
2. Siga a ordem de prioridade do §5 (radares → periferia, com foco no Lab → formulários/erro →
   home só se achar algo concreto → metadata).
3. Ajuste in place, sem mudar estrutura, props, ou nomes de variável/export (isso quebraria os
   componentes que consomem `content.ts`).
4. Ao final, rode de novo o grep da lista proibida em `src/` inteiro para confirmar que
   continua limpo.
5. Produza o relatório curto pedido pela issue: o que mudou e por quê, arquivo por arquivo.

## 7. Fechamento

Depois de aplicado, marcar em `docs/revamp/04_issue_backlog.md` (linha logo abaixo do
cabeçalho da ISSUE-111): `**Status:** ✅ concluída em AAAA-MM-DD`. Push/deploy só depois de
`/finalizar-sessao` com confirmação do dono.
