# Handoff Estratégico — Nova Fase do +ConverSaaS Lab

> Documento de handoff para conduzir a próxima fase de planejamento e implementação no Claude/Fable 5.  
> Objetivo: transformar a estratégia discutida em um plano inicial de implementação para a área pós-login do Lab, evitando escopo inflado e garantindo valor imediato.

---

## 1. Contexto do projeto

O projeto **Conversas no Corredor** nasceu como uma newsletter sobre carreira, produtividade e trabalho corporativo, mas evoluiu para uma tese mais forte: **IA aplicada ao trabalho real, com repertório, julgamento e construção prática**.

O site/app **+ConverSaaS** deve deixar de funcionar apenas como um hub de conteúdo ou vitrine da newsletter e passar a ser uma camada prática da marca: um espaço onde o leitor/assinante consegue transformar uma ideia, tarefa ou problema real de trabalho em um projeto digital construível com IA.

A newsletter continua sendo o motor editorial.  
O LinkedIn e o tráfego pago continuam sendo canais de aquisição.  
O Lab passa a ser o produto pós-login que materializa a proposta de valor.

---

## 2. Premissa estratégica

A proposta não é criar “mais uma ferramenta de IA”, nem “mais um curso de vibe coding”, nem um “task manager genérico”.

A tese é:

> **O Lab ajuda profissionais corporativos não técnicos a transformar problemas reais do trabalho em projetos digitais construíveis com IA — com método, repertório e acompanhamento.**

O usuário não deve sentir que entrou em um repositório de templates ou em um chat genérico.  
Ele deve sentir que entrou em uma **jornada guiada de construção**.

---

## 3. Público prioritário

O público prioritário da primeira versão é:

> **Profissionais corporativos não técnicos — analistas, coordenadores, supervisores, gerentes e profissionais de negócio — que querem usar IA de forma prática para construir soluções no trabalho, mas ainda não sabem como transformar uma ideia em algo estruturado.**

Existem dois caminhos principais de entrada:

### Caminho A — Pós-workshop

Usuários que participaram do workshop de Vibe Coding / Artesanato Digital e já tiveram o “aha moment”:

- perceberam que conseguem construir;
- querem continuar depois do workshop;
- precisam de um lugar para transformar o aprendizado em projeto;
- podem assinar para acessar materiais, etapas e suporte assíncrono.

### Caminho B — Lead frio / assinante / tráfego pago

Usuários que chegam por:

- newsletter;
- LinkedIn;
- Google Ads;
- landing page;
- radares gratuitos;
- lista de espera do Lab.

Eles ainda não tiveram necessariamente o desbloqueio do workshop. Para esse público, o Lab também funciona como porta de entrada para uma futura turma, assinatura ou trilha guiada.

---

## 4. Problema que o Lab resolve

O problema central não é “aprender IA”.

O problema é:

> **Tenho uma ideia, tarefa, dor ou processo no trabalho e não sei como transformar isso em uma solução digital simples, útil e apresentável.**

Hoje, a alternativa óbvia seria abrir ChatGPT/Gemini/Claude. Mas isso cria fricção:

- a pessoa não sabe o que pedir;
- a conversa fica solta;
- não existe método;
- não existe histórico estruturado;
- não existe progressão;
- não existe ligação com materiais de apoio;
- o resultado fica genérico;
- a pessoa não sabe o próximo passo.

O Lab deve reduzir essa fricção.

---

## 5. Diferença entre o Lab e um chat genérico

O Lab não compete com ChatGPT/Gemini em inteligência geral.

Ele se diferencia por ser:

1. **Opinionado**  
   O usuário segue um caminho desenhado com método.

2. **Contextual**  
   O fluxo parte do perfil do usuário, da rotina e do problema real de trabalho.

3. **Estruturado**  
   O output vira plano, classificação, etapas, materiais e próximos passos.

4. **Salvo**  
   O projeto fica registrado e pode ser retomado.

5. **Conectado à metodologia da marca**  
   Usa conceitos como ROI do Foco, 4Ds, Radar de Oportunidades, níveis de solução e Artesanato Digital.

6. **Prático**  
   O objetivo não é apenas refletir, mas ajudar a construir.

---

## 6. Conceito do MVP

O primeiro MVP pós-login deve ser:

# Jornada Guiada de Construção

Uma experiência em que o usuário entra com uma ideia, tarefa ou problema de trabalho e o Lab ajuda a transformar aquilo em um plano de construção.

Fluxo conceitual:

```text
Wizard inicial
→ perguntas complementares da IA
→ classificação da solução
→ plano de construção salvo
→ materiais de apoio recomendados
→ acompanhamento de etapas
→ evolução do projeto
```

---

## 7. Promessa do MVP

Promessa recomendada:

> **Transforme uma ideia ou problema real do trabalho em um plano de construção com IA.**

Versão mais comercial:

> **Descubra o que vale construir no seu trabalho e siga um caminho guiado para transformar isso em solução.**

Versão curta:

> **Da ideia ao projeto construível.**

---

## 8. Escopo funcional da Fase 1

A Fase 1 deve entregar valor imediato sem tentar construir uma plataforma completa.

### 8.1. Deve incluir

#### 1. Dashboard do Lab

Página inicial pós-login com:

- boas-vindas;
- resumo do perfil do usuário;
- projetos iniciados;
- próximo passo recomendado;
- CTA “Novo projeto”;
- CTA “Continuar projeto”;
- acesso à biblioteca de apoio.

#### 2. Novo Projeto / Wizard inicial

Formulário guiado para capturar:

- nome do projeto;
- problema ou tarefa;
- contexto;
- área de trabalho;
- objetivo;
- quem vai usar;
- rotina atual;
- dados envolvidos;
- ferramentas atuais;
- nível de confiança em IA;
- urgência;
- impacto esperado.

#### 3. Entrevista complementar com IA

Depois do wizard inicial, o sistema usa IA para fazer de 3 a 5 perguntas complementares.

Objetivo:

- melhorar clareza do problema;
- evitar briefing fraco;
- identificar lacunas;
- preparar classificação;
- simular a parte consultiva do workshop.

Importante: a IA não deve ficar aberta como chat genérico. Ela deve atuar dentro de um fluxo controlado.

#### 4. Classificação da solução

O sistema classifica o projeto em uma ou mais categorias:

- prompt;
- template;
- workflow;
- automação;
- dashboard;
- app offline;
- app offline + tabela;
- solução orquestrada;
- solução agêntica.

Também deve indicar:

- complexidade;
- potencial de IA;
- potencial de automação;
- risco;
- tipo de material recomendado;
- próximo passo.

#### 5. Plano de construção salvo

Depois da classificação, gerar um plano estruturado com:

- resumo do problema;
- objetivo do projeto;
- tipo de solução recomendado;
- etapas;
- materiais de apoio;
- riscos;
- próximos passos;
- checklist inicial;
- recomendação de ferramenta;
- artefato sugerido: prompt, canvas, PRD, checklist ou briefing.

#### 6. Materiais de apoio conectados

A biblioteca não deve ser genérica. Ela deve aparecer conectada ao projeto.

Exemplos:

- se for dashboard → guia de estrutura de dados + modelo de narrativa executiva;
- se for app offline → checklist de escopo e telas;
- se for workflow → canvas de processo;
- se for prompt/template → guia de descrição e discernimento;
- se for app com tabela → checklist de dados e publicação.

#### 7. Perfil do Builder

Área simples para salvar:

- área de atuação;
- tipo de trabalho;
- senioridade;
- nível de fluência em IA;
- objetivos;
- ferramentas que usa;
- maior dor atual;
- preferência de aprendizado;
- projetos criados.

Esse perfil deve alimentar prompts e personalização futura.

---

## 9. O que NÃO fazer na Fase 1

Não implementar ainda:

- task manager completo;
- calendário;
- Kanban complexo;
- colaboração em equipe;
- comunidade;
- notificações;
- app builder automático;
- geração ilimitada de IA;
- solução pronta para produção;
- suporte individual;
- curso completo gravado;
- múltiplos planos de assinatura complexos;
- integração com Google Calendar, Notion, Trello, Slack etc.

Esses itens podem entrar em roadmap futuro, mas não devem fazer parte do MVP.

---

## 10. Arquitetura de telas recomendada

### Tela 1 — `/lab/dashboard`

Função: hub pós-login.

Componentes:

- header com saudação;
- card “Comece um novo projeto”;
- card “Continue de onde parou”;
- lista de projetos;
- status de cada projeto;
- próximo passo;
- acesso rápido à biblioteca;
- estado premium/assinatura.

---

### Tela 2 — `/lab/new-project`

Função: wizard inicial.

Componentes:

- formulário em etapas;
- barra de progresso;
- campos simples;
- linguagem consultiva;
- botão “Gerar perguntas complementares”.

---

### Tela 3 — `/lab/project/:id/interview`

Função: entrevista complementar com IA.

Componentes:

- resumo do que já foi entendido;
- 3 a 5 perguntas geradas;
- respostas do usuário;
- botão “Gerar classificação”.

---

### Tela 4 — `/lab/project/:id/diagnosis`

Função: resultado inicial.

Componentes:

- tipo de solução recomendado;
- complexidade;
- potencial de IA;
- potencial de automação;
- risco;
- explicação em linguagem simples;
- CTA “Gerar plano de construção”.

---

### Tela 5 — `/lab/project/:id/plan`

Função: plano salvo do projeto.

Componentes:

- resumo;
- etapas;
- checklist;
- materiais recomendados;
- artefatos sugeridos;
- botão “Marcar etapa como concluída”;
- botão “Exportar Markdown/PDF”;
- CTA premium se aplicável.

---

### Tela 6 — `/lab/library`

Função: biblioteca de apoio.

Componentes:

- filtros por tipo de solução;
- filtros por maturidade;
- cards de templates;
- checklists;
- PRD Kit;
- Builder Canvas;
- guias dos 4Ds;
- materiais do workshop.

---

### Tela 7 — `/lab/profile`

Função: Perfil do Builder.

Componentes:

- dados do usuário;
- área de trabalho;
- maturidade em IA;
- objetivos;
- preferências;
- histórico de projetos;
- recomendações futuras.

---

## 11. Lógica de produto

### Objetos principais

#### UserProfile

Campos sugeridos:

- user_id;
- role_area;
- seniority;
- ai_fluency_level;
- work_style;
- main_goal;
- tools_used;
- biggest_bottleneck;
- created_at;
- updated_at.

#### Project

Campos sugeridos:

- id;
- user_id;
- title;
- problem_statement;
- context;
- target_user;
- desired_outcome;
- current_process;
- data_involved;
- tools_currently_used;
- urgency;
- impact;
- status;
- created_at;
- updated_at.

#### ProjectInterview

Campos sugeridos:

- id;
- project_id;
- questions;
- answers;
- ai_summary;
- created_at.

#### ProjectDiagnosis

Campos sugeridos:

- id;
- project_id;
- solution_type;
- complexity_level;
- ai_potential;
- automation_potential;
- risk_level;
- rationale;
- recommended_next_step;
- created_at.

#### ProjectPlan

Campos sugeridos:

- id;
- project_id;
- plan_summary;
- steps;
- checklist;
- recommended_assets;
- generated_artifacts;
- progress_status;
- created_at;
- updated_at.

#### LabAsset

Campos sugeridos:

- id;
- title;
- type;
- solution_type;
- maturity_level;
- description;
- content_url_or_markdown;
- premium_only;
- created_at;
- updated_at.

---

## 12. Uso da IA

A IA deve ser usada de forma controlada e econômica.

### Onde usar IA

1. Gerar perguntas complementares.
2. Resumir o problema do usuário.
3. Classificar ou justificar a classificação.
4. Gerar plano inicial.
5. Sugerir próximos passos.
6. Recomendar materiais.
7. Gerar artefatos em formato Markdown.

### Onde usar regras simples

1. Limites de acesso.
2. Estados do projeto.
3. Tipos de solução.
4. Filtros da biblioteca.
5. Checklists fixos.
6. Progresso de etapas.
7. Controle premium/free.

### Diretriz

> Não usar IA onde regras simples resolvem.  
> Usar IA apenas onde existe ganho claro de personalização, síntese ou orientação.

---

## 13. Monetização

A Fase 1 deve considerar o modelo premium, mas não precisa lançar todos os recursos pagos de uma vez.

### Gratuito

Possível escopo:

- criar 1 projeto;
- receber diagnóstico básico;
- acessar parte da biblioteca;
- entrar na newsletter;
- entrar na lista do workshop.

### Premium

Possível escopo:

- projetos salvos;
- planos completos;
- exportação;
- biblioteca completa;
- PRD Kit;
- Builder Canvas;
- checklists avançados;
- materiais do workshop;
- geração de plano com IA;
- histórico;
- acesso a futuras turmas com desconto.

### Stripe

Fluxo futuro mapeado:

```text
/lab ou /premium
→ Stripe Checkout
→ webhook
→ liberar acesso
→ atualizar tabela de usuários autorizados
→ e-mail de boas-vindas
→ login liberado
```

Observação estratégica:

- Stripe pode conviver com Substack;
- Substack segue como base editorial;
- Stripe controla acesso ao Lab/app.

---

## 14. Métricas de sucesso

### Métricas de ativação

- % de usuários que começam um projeto;
- % que completam o wizard;
- % que respondem perguntas complementares;
- % que chegam ao diagnóstico;
- % que geram plano.

### Métricas de valor

- projetos salvos;
- planos exportados;
- materiais acessados;
- etapas marcadas como concluídas;
- retornos ao projeto.

### Métricas de monetização

- conversão para lista de espera;
- conversão para assinatura;
- conversão para workshop;
- retenção de assinantes;
- uso de recursos premium.

### Métrica norte

Sugestão:

> **Projetos guiados concluídos até plano de construção.**

Essa métrica mede se o Lab está cumprindo a promessa: transformar uma ideia/problema em algo construível.

---

## 15. Faseamento recomendado

### Fase 1A — Protótipo navegável sem IA pesada

Objetivo: validar UX e fluxo.

Entregas:

- dashboard;
- wizard;
- diagnóstico baseado em regras;
- plano estático/parametrizado;
- biblioteca inicial;
- projetos salvos.

Critério de sucesso:

> Usuário entende a proposta e consegue criar um projeto com plano inicial sem ajuda externa.

---

### Fase 1B — IA controlada

Objetivo: adicionar personalização.

Entregas:

- geração de perguntas complementares;
- resumo do problema;
- justificativa da classificação;
- plano em Markdown;
- recomendações de materiais.

Critério de sucesso:

> A IA melhora o resultado sem transformar a experiência em chat genérico.

---

### Fase 1C — Premium inicial

Objetivo: testar monetização.

Entregas:

- controle de acesso;
- Stripe;
- biblioteca premium;
- exportação;
- projetos múltiplos;
- materiais do workshop.

Critério de sucesso:

> Usuário percebe valor suficiente para pagar ou continuar ativo.

---

### Fase 2 — Pós-workshop

Objetivo: conectar turmas ao Lab.

Entregas:

- turma de workshop;
- cupom/acesso ao Lab;
- materiais específicos;
- projetos dos participantes;
- coleta de feedback;
- cases.

Critério de sucesso:

> Participantes continuam usando o Lab depois do workshop.

---

### Fase 3 — Evolução de nível

Objetivo: aumentar retenção.

Entregas:

- níveis de maturidade;
- badges;
- trilhas;
- novos ativos;
- App Readiness Checklist;
- PRD Kit avançado;
- biblioteca de casos.

Critério de sucesso:

> Usuário entende que pode evoluir dentro da plataforma.

---

## 16. Primeiros ativos recomendados para a biblioteca

A biblioteca inicial deve ser pequena, mas útil.

Sugestão de 10 ativos:

1. Checklist dos 4Ds aplicado a projetos de IA.
2. Builder Canvas.
3. Template de PRD simples.
4. Guia “do problema ao prompt”.
5. Guia “do prompt ao workflow”.
6. Guia “do workflow ao dashboard”.
7. Guia “do app local ao app compartilhável”.
8. Checklist de dados e diligência.
9. Template para narrar valor para liderança.
10. Lista de casos de uso corporativos por área.

---

## 17. Linguagem e tom

Evitar:

- hype;
- “domine IA”;
- “aprenda a fazer apps incríveis”;
- “construa qualquer coisa em minutos”;
- promessa de produção;
- estética genérica de IA.

Usar:

- prático;
- corporativo sem ser engessado;
- sério, mas moderno;
- linguagem de oficina/laboratório;
- foco em construção;
- foco em julgamento;
- foco em rotina real.

Exemplos de copy:

> “Transforme uma dor do trabalho em um projeto construível.”

> “Não comece pelo prompt. Comece pelo problema.”

> “Descubra se sua ideia pede um prompt, um workflow, um dashboard ou um app.”

> “Leve o aprendizado do workshop para uma jornada prática.”

> “Construa com IA sem perder o julgamento de negócio.”

---

## 18. Princípios de design

Direção visual:

- manter base quente da marca;
- usar laranja como identidade;
- usar magenta como acento moderno;
- evitar visual corporativo frio;
- evitar visual genérico de IA;
- usar cards, trilhas, etapas, canvas e blocos;
- transmitir laboratório, atelier e biblioteca viva.

Personalidade visual:

> sério, moderno, editorial e prático.

---

## 19. Riscos principais

### Risco 1 — Virar chat genérico

Mitigação:

- IA sempre dentro de fluxo;
- outputs estruturados;
- botões e etapas;
- sem tela principal de chat livre.

### Risco 2 — Virar curso disfarçado

Mitigação:

- foco em projeto salvo;
- materiais como apoio;
- não transformar Lab em LMS.

### Risco 3 — Produto complexo demais

Mitigação:

- MVP com poucos objetos;
- sem calendário;
- sem comunidade;
- sem integrações externas;
- sem colaboração.

### Risco 4 — Baixa adesão

Mitigação:

- usar workshop como canal de ativação;
- testar com pessoas que já deram feedback positivo;
- coletar projetos reais;
- medir conclusão do wizard e retorno.

### Risco 5 — Promessa exagerada

Mitigação:

- comunicar que o Lab ajuda a estruturar e construir o caminho;
- não prometer app pronto para produção;
- reforçar que é uma jornada guiada, não um gerador automático de software.

---

## 20. Instruções para Claude/Fable 5

Antes de codar:

1. Ler este handoff completo.
2. Auditar a estrutura atual do projeto.
3. Identificar rotas existentes, componentes, autenticação, banco de dados e páginas do Lab.
4. Identificar o que já existe dos radares e motores de classificação.
5. Não remover funcionalidades existentes sem confirmação.
6. Não tocar na plataforma legada do ROI do Foco além do necessário.
7. Propor um plano de implementação por issues pequenas.
8. Separar claramente:
   - frontend;
   - backend;
   - banco de dados;
   - IA;
   - premium/Stripe;
   - biblioteca de ativos.
9. Antes de implementar, gerar uma spec técnica da Fase 1A.
10. Só depois quebrar em issues de execução.

---

## 21. Plano de trabalho solicitado ao Claude/Fable 5

Produzir, antes de codar:

### 1. Diagnóstico técnico do estado atual

- rotas;
- componentes;
- auth;
- banco;
- tabelas existentes;
- radares;
- página `/lab`;
- fluxo de login;
- integração Stripe/Substack, se houver;
- assets existentes.

### 2. Spec da Fase 1A

A spec deve detalhar:

- rotas;
- componentes;
- modelo de dados;
- fluxo do usuário;
- estados vazios;
- estados de erro;
- copy inicial;
- persistência;
- permissões;
- eventos de analytics;
- critérios de aceite.

### 3. Backlog inicial

Quebrar em issues pequenas:

- banco;
- rotas;
- dashboard;
- wizard;
- diagnóstico;
- plano;
- biblioteca;
- perfil;
- testes;
- deploy.

### 4. Plano de validação

Definir:

- o que medir;
- onde medir;
- como coletar feedback;
- que usuários testar primeiro;
- que sinais indicam continuar, pausar ou pivotar.

---

## 22. Definição de sucesso da Fase 1

A Fase 1 será bem-sucedida se:

1. O usuário entende claramente o que o Lab faz.
2. O usuário consegue criar um projeto guiado.
3. O sistema gera um diagnóstico útil.
4. O usuário recebe um plano de construção.
5. O projeto fica salvo.
6. O usuário enxerga materiais de apoio relevantes.
7. A experiência parece diferente de abrir um chat genérico.
8. A plataforma cria base para premium/Stripe.
9. A implementação não infla escopo.
10. O produto reforça a nova proposta de valor da marca.

---

## 23. Síntese final

O +ConverSaaS Lab deve ser a camada prática da newsletter Conversas no Corredor.

A newsletter cria repertório.  
O workshop gera desbloqueio.  
O Lab transforma esse desbloqueio em projeto salvo, plano de construção e evolução prática.

A primeira fase deve provar uma coisa:

> **Existe valor em guiar profissionais corporativos não técnicos da ideia ao projeto construível com IA.**

Se essa hipótese for validada, o produto pode evoluir para:

- área premium;
- biblioteca robusta;
- workshops pagos;
- trilhas autoguiadas;
- App Readiness Checklist;
- PRD Kit avançado;
- cases corporativos;
- futuros produtos B2B.

Mas a primeira entrega deve ser simples, clara e útil.

**Não construir uma plataforma gigante. Construir o primeiro caminho guiado que prova o valor do Lab.**
