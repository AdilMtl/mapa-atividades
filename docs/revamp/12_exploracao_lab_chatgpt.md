# Explorando o Lab — dossiê para brainstorm externo

> Documento preparado em 2026-07-09 para levar a uma conversa exploratória (ChatGPT ou similar)
> **antes** de detalhar/codar qualquer issue da Fase 2. Objetivo: decidir onde queremos chegar
> com o Lab antes de gastar sessões de execução em cima de um esqueleto ainda não validado.
> Tudo abaixo é o que já existe documentado no projeto — não é uma proposta nova, é o material
> de partida pra não perder o que já foi pensado.

---

## 1. Contexto rápido (pra quem não conhece o projeto)

**Conversas no Corredor** é uma newsletter (Substack) sobre IA aplicada ao trabalho corporativo,
escrita por alguém que hoje trabalha implementando agentes de IA numa empresa grande, fora do
mundo de "influencer de produtividade". **+ConverSaaS** é o nome da plataforma/app que funciona
como "o ecossistema virtual" dessa newsletter.

**O que existe hoje na plataforma:**
- Uma ferramenta paga (ROI do Foco: mapa de atividades, diagnóstico de foco, plano de ação,
  kanban semanal) — assinatura hoje é manual, via Substack.
- Um funil público novo, quase pronto: dois "radares" (Maturidade em IA e Oportunidades) que
  captam lead e entregam diagnóstico gratuito + e-mail de trilha.
- Uma página `/lab` que hoje é **só uma vitrine com lista de espera** — nenhuma ferramenta do
  Lab existe de verdade ainda (detalhe na seção 4).

**A decisão que motiva essa exploração (09/07/2026):** o produto pago atual (ROI do Foco) não
teve uso real comprovado — o projeto ficou com o banco de dados pausado por meses e,
efetivamente, ninguém estava acessando. Diante disso, decidimos **não investir mais design** na
plataforma antiga (ela vira "legado", mantida no ar, sem novo trabalho) e **focar o próximo
ciclo de produto no Lab** — uma proposta de valor nova. Mas o Lab, hoje, é só um esqueleto de
issues com título e pouco detalhamento. Antes de sair implementando, queremos abrir o leque:
**quais soluções reais podemos construir aqui, e qual delas vale a pena primeiro?**

---

## 2. A tese original do Lab (documento estratégico, nunca implementada)

Trecho do documento de benchmark estratégico que originou o revamp:

> "O Conversas no Corredor deve evoluir de uma newsletter/site de conteúdo para um **laboratório
> editorial e prático para profissionais corporativos que querem aprender a construir soluções
> digitais com IA — com repertório, julgamento e aplicação real**. O site não deve ser apenas um
> arquivo de textos. Ele deve funcionar como um **hub/app de aprendizagem aplicada**, com
> trilhas, diagnóstico, área premium, templates, playbooks, ferramentas e uma jornada clara de
> maturidade."

> "A tese recomendada é posicionar o projeto como um **Laboratório do Builder Corporativo**. Esse
> laboratório combina: newsletter como motor editorial; site/app como hub de prática; área
> premium como biblioteca de ativos aplicáveis; LinkedIn e tráfego pago como canais de aquisição;
> Stripe como camada de monetização; futuros produtos como workshops, curso assíncrono,
> palestras, consultoria e eventualmente B2B."

### Módulos que o documento original cogitava para a página do Lab:

> - Diagnóstico de Fluência em IA
> - Gerador de PRD
> - Canvas de Delegação
> - Checklist de Discernimento
> - Checklist de Diligência
> - Mapa de Ideias para Apps
> - Guia "do app local ao app online"
> - Biblioteca de prompts corporativos
> - Playbooks de apresentação executiva

### O que o documento dizia para prometer como "em breve" vs. o que **não** prometer ainda:

**Pode aparecer como "em breve":**
> Wizard "Que solução devo construir?"; Builder Canvas; PRD Kit; Curso auto guiado de Vibe
> Coding / Artesanato Digital; Biblioteca de casos de uso corporativos; Playbooks por área; App
> Readiness Checklist; Templates exportáveis.

**Não prometer ainda (linha vermelha explícita):**
> Suporte individual; comunidade ativa; curso completo com acompanhamento; app builder
> automático; geração ilimitada com IA; soluções prontas para produção. **A promessa deve ser
> ambiciosa, mas controlada.**

### Critério de sucesso da Fase 2, como foi originalmente descrito:
> "O usuário percebe que o premium ajuda a estruturar soluções, não apenas a ler textos
> fechados."

---

## 3. As issues já esboçadas no backlog (título apenas — sem escopo detalhado)

O próprio backlog do projeto avisa: *"o resumo abaixo continua sendo só esqueleto... exige
sessão de planejamento dedicada para detalhar cada issue antes de codar."* Ou seja, isto é
literalmente tudo que existe escrito hoje:

| # | Título | Contexto adicional (se houver) |
|---|---|---|
| 301 | Wizard "Que solução devo construir?" (evolução do radar com detalhamento guiado) | — |
| 302 | Classificação de solução em 4 níveis de app (offline / offline+tabela / orquestrado / agêntico) como página educativa + integração nos resultados | — |
| 303 | Builder Canvas (canvas estruturado exportável) | — |
| 304 | PRD Kit (templates de PRD orientados aos 4Ds — Descrição) | — |
| 305 | Área premium inicial + fluxo direto Stripe | Fluxo mapeado: `/lab ou /premium → Stripe Checkout (R$15–29/mês, preço a definir) → webhook → INSERT em authorized_emails + e-mail de boas-vindas → login liberado`. Decisão em aberto: Stripe substitui ou convive com o Substack (recomendação registrada: convivem). |
| 306 | Primeiros 10 ativos premium (checklists dos 4Ds, template narrar valor, guia IA-na-firma) | — |
| 307 | Mentoria e palestras sobre IA no portfólio de produtos | Pesquisa apontou demanda de **empreendedores** (problemas complexos, sem tempo, precisam de aprendizado estruturado). Regra: nada disso pode ser prometido na home antes de existir de verdade. |

E, mais adiante no roadmap (Fase 3, ainda mais esqueleto): trilha "Artesanato Digital" (curso
autoguiado), biblioteca de casos de uso corporativos, playbooks por área, App Readiness
Checklist, miniapps internos do Lab.

---

## 4. O que já existe no ar HOJE (para não redesenhar do zero)

A página `/lab` é 100% vitrine — **nenhuma ferramenta do Lab foi construída ainda**. O que
existe:
- Copy atual da página: *"Em breve: uma área para transformar leitura em prática. [...] O Lab
  nasce para isso — playbooks, templates, trilhas e ferramentas para assinantes que querem
  estruturar o problema, escolher o formato certo de solução e levar o primeiro experimento até
  um ativo digital de verdade."*
- Lista de itens "futuros" mostrada na página (mesma lista do backlog, resumida): Wizard,
  Builder Canvas, PRD Kit, trilha de Artesanato Digital/Vibe Coding, biblioteca de casos de uso,
  checklists de publicação.
- Um formulário de lista de espera (nome não capturado, só e-mail) gravando numa tabela isolada
  (`lab_leads`, com RLS travada — zero acesso público, só a rota de captura grava).

Ou seja: existe demanda sendo capturada (lista de espera), mas zero produto construído. Essa
lista de e-mails é um dado real que pode informar a conversa ("quantas pessoas já levantaram a
mão").

---

## 5. Dois conceitos do projeto que já têm "motor" pronto (não são ideia nova)

Vale saber que dois blocos das issues do Lab **já reaproveitam lógica que existe e funciona** no
funil dos radares — não seriam construídos do zero:

**a) Os "4 níveis de app" (usados na ISSUE-302):** já são categorias reais do motor do Radar de
Oportunidades — `app_offline`, `app_tabela` (offline + tabela), `orquestrado`, `agentico` — parte
de uma lista maior de 9 tipos de solução que o radar já classifica hoje (`prompt`, `template`,
`workflow`, `automacao`, `dashboard` + os 4 níveis de app).

**b) Os "4Ds" (usados nas ISSUE-304 e 306):** é o framework "AI Fluency" da Anthropic —
**Delegação, Descrição, Discernimento, Diligência** — já usado hoje nas perguntas do Radar de
Maturidade. Definições resumidas do material editorial do projeto:
- *Delegação:* decidir o que vai para a IA, o que fica com você, o que é feito em conjunto.
- *Descrição:* criar um ambiente colaborativo produtivo com a IA (o que pedir, como pedir).
- *Discernimento:* avaliar produto, processo e performance do que a IA entrega.
- *Diligência:* critério sobre dados, ferramenta, contexto e transparência.

---

## 6. Perguntas para explorar (é isso que eu queria levar pro ChatGPT)

Não temos ainda uma resposta clara pra nenhuma dessas — é o motivo de parar antes de codar:

1. **Qual módulo do Lab entrega valor sozinho primeiro?** O Wizard (301), a classificação de
   solução (302) e o Builder Canvas (303) parecem depender uns dos outros — dá pra lançar só um
   e ele já se sustentar, ou precisam nascer juntos?
2. **O que "Builder Canvas" e "PRD Kit" deveriam realmente ser na prática?** Hoje são só nomes.
   Um canvas visual tipo Business Model Canvas? Um formulário guiado que gera um documento? Uma
   IA que ajuda a preencher? Que ferramentas parecidas já existem no mercado que valeria estudar
   (Notion templates, GPTs customizados, ferramentas tipo v0/Lovable, etc.)?
3. **Existe uma versão mais simples e mais rápida de validar antes de qualquer código?** Ex.:
   os primeiros "ativos premium" (306) podem nascer como PDFs/templates entregues manualmente
   por e-mail pra quem está na lista de espera, só pra testar se as pessoas realmente usam,
   antes de construir qualquer interface?
4. **Quem é o comprador real do Lab?** O radar já mostra que "empreendedores" (problema
   complexo, sem tempo, precisam de estrutura) aparecem como público com demanda clara (307) —
   isso muda o produto? O Lab é pra quem já lê a newsletter querendo ir mais fundo, ou pra atrair
   gente nova?
5. **Onde entra a monetização de verdade?** A ISSUE-305 já mapeia um fluxo técnico com Stripe,
   mas não decide o preço nem se o Lab É o produto pago ou é a porta de entrada pra outra coisa
   paga (mentoria/palestras, ISSUE-307).
6. **O que dá pra reaproveitar dos radares (motor de 9 tipos de solução, framework 4Ds) versus o
   que precisa ser pensado do zero?**
7. **Existe uma versão do Lab que NÃO é "mais uma ferramenta com formulário", e sim algo com
   identidade própria?** O documento original fala em "laboratório", "hub de aprendizagem
   aplicada" — isso pede uma experiência diferente de "preencher um wizard"?

---

## 7. O que explicitamente NÃO fazer (linhas vermelhas já registradas no projeto)

- Não prometer suporte individual, comunidade ativa, curso completo com acompanhamento, "app
  builder" automático, geração ilimitada por IA, ou soluções prontas pra produção — regra
  registrada desde o documento estratégico original.
- Não tocar na plataforma logada legada (ROI do Foco) além de manutenção mínima — decisão de
  09/07/2026 foi justamente parar de investir ali.
- Não prometer nada do Lab na home antes de existir de verdade (regra anti-promessa vigente
  desde a Fase 1).
