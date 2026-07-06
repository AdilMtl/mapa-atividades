# 01 — Product Spec Faseada

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Complementa: `00_problem_definition.md` (problema) e `02_technical_spec.md` (como construir).
> Copy literal (headlines, perguntas, resultados): fonte é o
> `docs/GPT Project Revamp/conversas_corredor_fase1_execucao_ctas_fluxos_v2_cmo_br.md` — esta
> spec referencia as seções de lá em vez de duplicar tudo.

---

## 1. Visão do produto

O site/app é a **camada prática da newsletter**: recebe tráfego, dá clareza em minutos
(maturidade OU oportunidade), captura o lead com valor entregue antes, e conduz para a
newsletter. O premium (Lab) aparece como continuidade em construção.

A régua de temperatura que organiza toda a experiência:

| Temperatura | Quem é | Mensagem | Conversão |
|---|---|---|---|
| Frio | chegou por Ads/busca | "Descubra onde aplicar IA no seu trabalho" | completar radar + e-mail |
| Morno | leu um post, veio do LinkedIn | "Transforme leitura em prática" | trilha + newsletter |
| Quente | leitor recorrente / pós-workshop | "Evolua do uso para a construção" | lista do Lab |

## 2. Públicos e jobs to be done

**P1 — Profissional corporativo frio (prioritário).**
JTBD: *"Quando percebo que todo mundo fala de IA e eu só uso superficialmente, quero entender
onde IA se aplica ao MEU trabalho, para evoluir sem me perder no hype."*

**P2 — Leitor da newsletter (secundário).**
JTBD: *"Quando termino um texto denso, quero um lugar para aplicar a ideia, para que a leitura
vire prática."*

**P3 — Pós-workshop (futuro, Fase 2+).**
JTBD: *"Depois de ver meu primeiro app funcionar, quero saber como estruturar e publicar de
verdade."* — Não dimensionar a Fase 1 por ele.

## 3. Jornada do usuário (Fase 1, fluxo principal)

```text
Anúncio/busca (cluster: produtividade | IA no trabalho | automação | criar app | carreira)
   ↓  message match por cluster (§17 do doc operacional)
Homepage — entende a tese em ~5s
   ↓  escolhe porta
/radar/maturidade  (7 perguntas, ~2min)     /radar/oportunidades  (8 perguntas, ~3min)
   ↓                                            ↓
Resultado resumido NA TELA (nível + interpretação + próximo passo + 2-3 leituras)
   ↓  "Quer receber sua trilha completa?"
Captura de e-mail (opcional — resultado já foi entregue)
   ↓
/obrigado — links imediatos + embed/CTA Substack + lista do Lab
   ↓
E-mail 1 (resultado/trilha) → sequência de 4 e-mails (§15 do doc operacional) → newsletter
```

Regras de ouro do fluxo:
1. **Valor antes do e-mail** — o resultado resumido nunca fica atrás do gate.
2. **Radares se cruzam** — resultado da maturidade sugere o radar de oportunidades e vice-versa
   (evita parecer duas ferramentas soltas).
3. **Sem conta, sem login** — visitante completa tudo anonimamente.

## 4. Arquitetura de informação (Fase 1)

### Páginas novas/reformadas

| Rota | Função | Prioridade |
|---|---|---|
| `/` | Homepage reposicionada (estrutura §5 abaixo) | Obrigatória |
| `/radar/maturidade` | Radar de Maturidade em IA | Obrigatória |
| `/radar/oportunidades` | Radar de Oportunidades de IA | Obrigatória |
| `/newsletter` | Página editorial da newsletter (temas, séries, exemplos, assinar) | Obrigatória |
| `/obrigado` | Pós-captura: confirma, recomenda leituras, lista do Lab | Obrigatória |
| `/lab` | Premium em construção + lista de interesse | Obrigatória |
| `/comece-aqui` | Trilha de entrada para leitores novos (5 leituras + conceitos) | Desejável |
| `/sobre` | Manifesto + credibilidade do autor | Desejável |
| `/privacidade` | Já existe — revisar menção à captura nova | Ajuste |

### Páginas intocadas (legado funcionando)

`/pre-diagnostico` (funil ativo), `/auth`, `/dashboard`, `/diagnostico`, `/plano-acao`,
`/painel-semanal`, `/relatorios`, `/perfil`, `/configuracoes`, `/reset-password`,
`/admin/assinantes`. O acesso de assinantes à plataforma ROI do Foco permanece via link
discreto de login (header/footer), sem destaque na narrativa nova.

## 5. Homepage — estrutura de seções

Fonte de copy: doc operacional §8 (usar literalmente como base; ajustes só pela voz do §7 do
README). Ordem das seções:

1. **Hero** — headline A: *"Você já usa IA. Agora falta descobrir onde ela realmente melhora
   seu trabalho."* + sub + CTA primário *"Quero ver minhas oportunidades"* + secundário
   *"Descobrir meu nível em IA"* + terciário editorial *"Assinar a newsletter"* + microcopy de
   tempo/valor. Grid técnico sutil no fundo. CTAs de diagnóstico apontam para `/radar/*` a
   partir do momento em que existirem (ISSUE-107B); **até lá, apontam temporariamente para
   `/pre-diagnostico`** — decisão do dono para lançar o reskin sem esperar os radares (ver
   `04_issue_backlog.md`, ISSUE-107).
2. **Problema** — "Todo mundo fala de IA. Pouca gente mostra como isso vira trabalho melhor." + bullets de identificação.
3. **Reframe de produtividade** — ponte para o tráfego atual (essencial para message match das
   campanhas de produtividade).
4. **Duas portas de entrada** — cards Maturidade e Oportunidades com microcopy de "melhor para
   quem...".
5. **Como funciona** — 5 passos + microcopy de transparência (sem IA generativa, lógica guiada).
6. **A plataforma em ação (demo)** — decisão do dono: preservar o showcase da ferramenta.
   4 cards `Module` DS2 com os vídeos existentes (`/videos/mapeamento.mp4`, `diagnostico.mp4`,
   `taticas.mp4`, `kanban.mp4` — já comprimidos), labels mono (`01 / MAPA DE ATIVIDADES` etc.),
   progressive loading (1º autoplay muted, demais click-to-play). Narrativa: "isso é o que
   assinantes já usam hoje — o ecossistema +Conversas em funcionamento".
7. **Newsletter** — temas + CTA "Receber as próximas conversas".
8. **Diferenciação** — tabela "Mercado comum vs Conversas no Corredor".
9. **Pricing** — decisão do dono: tabela mantida (R$0 / R$15 mensal / anual), redesenhada no
   DS2 (card do plano pago = `card-featured`; sem glow, sem urgência artificial).
10. **Lab em construção** — itens futuros + CTA lista de interesse.
11. **Sobre o autor** — credibilidade corporativa (breve, com link LinkedIn).
12. **Rodapé** — manifesto curto, links (newsletter, séries, privacidade, login de assinante).

**Decisões do dono (2026-07-05) já incorporadas na estrutura acima:** pricing fica (seção 9);
vídeos de demo ficam (seção 6); marca **"+ConverSaaS"** apresentada como "o ecossistema
virtual da newsletter Conversas no Corredor" desde o header/hero (`00b` perguntas 4, 9 e 11).
**Direção visual decidida:** híbrido A+C — hero mantém o frame com grid técnico da A e recebe
a headline builder com "construir com IA" em gradiente + a janela animada do radar (da C).
Spec pixel-a-pixel: `mockups/landing-preview-final.html` (processo completo no doc 09).

O que a home atual tem e a nova NÃO terá: FAQ de produtividade (copy antiga), sticky bar de
assinatura (avaliar na 1.5 se volta). O `/pre-diagnostico` não tem link nomeado na navegação,
mas é o destino funcional temporário dos CTAs de diagnóstico até a ISSUE-107B trocá-los pelos
radares (ver `04_issue_backlog.md`).

## 6. Radar de Maturidade — especificação funcional

- **Perguntas:** 7 (doc operacional §10.5, usar literalmente).
- **Escala:** cada resposta vale 1–5; total 7–35.
- **Níveis:** Curioso (7–11), Usuário (12–17), Operador (18–24), Builder (25–31), Referência (32–35).
- **Resultado (tela):** nível + o que significa + risco de ficar nele + próximo salto + CTA
  cruzado para o radar de oportunidades + 2–3 leituras da newsletter (mapeadas por nível, ver
  §8) + captura.
- **Textos de resultado:** doc operacional §10.7 (pré-escritos, um por nível).
- **UX:** uma pergunta por tela, barra de progresso, voltar permitido, ~2 minutos, mobile-first.
  Sem persistência entre sessões (recomeçar é barato).

## 7. Radar de Oportunidades — especificação funcional

- **Perguntas:** 8 (doc operacional §11.4: área, tipo de entrega, perda de tempo, frequência,
  público, tipo de dado, resultado desejado, conforto digital).
- **Saída:** 1 de 9 tipos de solução — prompt estruturado, template, workflow, automação
  simples, dashboard, app offline, app + tabela, sistema orquestrado, sistema agêntico.
- **Lógica:** árvore de decisão/pontuação determinística (ver `02_technical_spec.md` §6 —
  frequência × estrutura do dado × público × desejo de reuso são os eixos dominantes; dados
  sensíveis rebaixam recomendação para opções de menor risco com aviso).
- **Resultado (tela), 8 blocos obrigatórios (doc §11.6):** tipo recomendado, porquê,
  complexidade, risco principal, primeiro passo, leitura recomendada, CTA newsletter, CTA Lab.
- **Exemplos pré-escritos:** doc §11.7–11.9 (app+tabela, prompt, agêntico) — completar os 6
  restantes na mesma estrutura durante a implementação de conteúdo.
- **Cruzamento:** resultado inclui estimativa leve de maturidade ("pelo tipo de desafio, você
  parece estar entre Usuário e Operador...").

## 8. Conteúdo editorial mapeado (leituras recomendadas)

Mapeamento nível/tipo → textos reais da newsletter (URLs no doc de contexto editorial §14):

| Contexto | Leituras candidatas |
|---|---|
| Curioso / entrada | "Fluência em IA"; "IA que você vê por aí vs a que cabe na sua empresa" |
| Usuário / prompt | "O problema nunca foi o prompt"; "Prompt não é só um comando, é uma conversa" |
| Operador / workflow-automação | "A parte mais importante acontece antes de abrir o chat" (Delegação); "Ciclo estratégico" |
| Builder / app | "Prompt não é só um comando" (Artesanato Digital); "O receio de falar que usou IA" |
| Referência | "HI-C"; "Se a IA faz o trabalho por você, quem aprende?" |
| Diligência/risco (dados sensíveis) | "A IA produz, mas quem leva esporro é você" |

## 9. Estados de usuário

Fase 1 tem apenas dois estados: **anônimo** (tudo público) e **assinante autenticado** (acessa
plataforma ROI do Foco legada — inalterado). Não há estado "lead logado". Lead é um registro no
banco, não uma conta.

**Fluxo de pagamento/acesso (esclarecido pelo dono, 2026-07-05):** o pagamento passa pela
newsletter (Substack). Quando alguém assina o plano pago, o dono autoriza manualmente o acesso
ao site (via `authorized_emails` / mensagem de boas-vindas manual). Com o volume atual isso é
suficiente; automatizar fica para fase futura (registrar junto da decisão Stripe vs Substack na
ISSUE-305). A Fase 1 não muda nada nesse fluxo.

## 10. Features por fase (visão consolidada)

**Fase 1:** tudo do §4–§8 + SEO básico + eventos analytics + e-mail de trilha (Resend
funcionando — política: só quem completa radar/pré-diagnóstico recebe e-mail).
**Fase 1.5:** A/B hero (A vs B §8.2 do doc), A/B CTA, A/B captura; sequência de 4 e-mails
automatizada; segmentação por UTM; refinamento de perguntas/resultados com dados; landing
âncoras por cluster de campanha; acessibilidade (WCAG AA nos fluxos); performance budget;
decisão de migração/redirect do `/pre-diagnostico`.
**Fase 2:** Wizard "Que solução devo construir?" (evolução do radar de oportunidades com
detalhamento), classificação em 4 níveis de app, Builder Canvas, PRD Kit, templates
exportáveis, área premium inicial + decisão Stripe vs Substack como gateway.
**Fase 3:** trilha Artesanato Digital, biblioteca de casos, playbooks por área, App Readiness
Checklist, miniapps, materiais B2B.
**Fase 4:** contínua, issues por domínio (produto/UX/conteúdo/dados/integrações/premium/analytics/testes/docs).

## 11. Critérios de aceite da Fase 1 (produto)

Consolidados dos dois documentos-fonte (estratégico §16, operacional §23):

1. Homepage comunica a nova proposta em ≤5s (teste: mostrar a um desconhecido por 5s e pedir
   para dizer do que se trata).
2. O site não parece landing de produtividade genérica nem curso de IA.
3. Duas portas claras; usuário completa qualquer radar sem conta, em mobile, em <3 min.
4. Resultado entrega valor ANTES da captura; captura parece continuação natural.
5. CTAs humanos e orientados a intenção (zero "Saiba mais"/"Cadastre-se").
6. Newsletter integrada na jornada (resultado, obrigado, home, e-mail).
7. Lab sinalizado como futuro, sem promessa de escopo indevida (§13.3 do doc estratégico).
8. SEO: H1 único, title/description únicos por página, links internos, URLs limpas.
9. Eventos de analytics implementados e verificados (lista na spec técnica).
10. Design 100% no Dark Editorial Atelier; zero estética genérica de IA.
11. Copy passa no "teste do cheiro" da voz editorial (leitura pelo dono).
12. Nenhum fluxo crítico atual quebrado: conversão do `/pre-diagnostico`, login de assinante,
    plataforma logada, PWA.

## 12. Riscos de produto e mitigações

| Risco | Mitigação |
|---|---|
| Novo posicionamento converte pior que produtividade no tráfego atual | Coexistência de funis + reframe de produtividade na home + migração de campanha só com dados |
| Radar parecer "quiz de marketing" raso | Resultados densos e específicos, com risco/primeiro passo/leitura — não só um rótulo |
| Promessa do Lab gerar expectativa que a Fase 2 não cumpre | Copy do Lab lista temas, não features com data; lista de interesse como validação |
| Copy soar GPT/guru | Contexto editorial como fonte obrigatória + revisão final humana (dono) |
| Deliverability no plano gratuito do Resend quando o volume escalar | E-mail entrega hoje (confirmado pelo dono); resultado completo sempre na tela como rede de segurança; reabrir decisão de domínio próprio quando escalar |
| Excesso de escopo na Fase 1 | Lista "não construir" (§24 do doc operacional) colada no backlog |

## 13. Dependências e perguntas abertas

Ver `00b_open_questions.md` — em especial: e-mail/domínio (bloqueia ISSUE-013), decisão de
pricing na home (premissa 9) e coexistência de funis (premissa 6).
