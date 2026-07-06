# 00 — Definição do Problema

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Fontes: `docs/GPT Project Revamp/*` (5 documentos) + auditoria do código em `src/`.
> Este documento é a âncora: se uma decisão de design, copy ou engenharia contradisser o que
> está aqui, ou este documento está errado (atualize-o) ou a decisão está errada (corrija-a).

---

## 1. Qual problema estamos resolvendo?

**O site de produção vende um produto que a marca já não é mais.**

- A newsletter evoluiu para *IA aplicada ao trabalho corporativo* (série Fluência em IA / 4Ds,
  Artesanato Digital, HI-C, "IA que cabe na empresa") — território autoral, anti-hype, defensável.
- O site (`/`) ainda vende produtividade genérica: headline "Trabalhe menos, Conquiste mais",
  funil de pré-diagnóstico sobre gestão de tempo (ROI do Foco), pricing R$15/mês da newsletter.
- Consequência dupla:
  1. **Tráfego frio de Google Ads** cai numa promessa saturada (produtividade) que não diferencia;
  2. **Leitores da newsletter** que visitam o site não reconhecem a marca que leem.

O problema da Fase 1, formulado como gargalo:

> O site recebe tráfego pago, mas não traduz a proposta atual da newsletter nem entrega uma
> experiência prática suficiente para converter visitante frio em lead qualificado **para o
> território novo** (IA aplicada ao trabalho real).

## 2. Qual problema NÃO estamos resolvendo agora?

- **Não** estamos monetizando o premium (sem Stripe, sem área paga nova, sem paywall novo).
- **Não** estamos construindo o Lab completo (Wizard, Builder Canvas, PRD Kit → Fase 2+).
- **Não** estamos criando curso, comunidade ou B2B (Fase 3+).
- **Não** estamos mudando LÓGICA, dados ou fluxos da plataforma logada do ROI do Foco — mas o
  **visual dela entra no plano** (Fase 1B: redesign DS2 de todas as telas logadas, decisão do
  dono em 2026-07-05). Restyle sim, refactor de comportamento não.
- **Não** estamos adicionando IA generativa aberta para visitante frio (restrição explícita:
  lógica estruturada, scoring e resultados pré-escritos na Fase 1).
- **Não** estamos matando o funil `/pre-diagnostico` — ele converte hoje, tem campanha ativa
  apontando pra ele e é a fonte de leads atual. Ele coexiste com o novo até a migração de
  campanhas ser decidida com dados.

## 3. Quem é o usuário prioritário da Fase 1?

**Primário — visitante frio de Google Ads:** profissional corporativo brasileiro (analista,
coordenador, gerente, especialista de negócio), pragmático, que já usa IA superficialmente e
busca "produtividade", "IA no trabalho", "automação", "criar app com IA" ou "carreira e IA".
Não quer curso, não quer comunidade — quer uma resposta rápida para uma inquietação.

**Secundário — leitor atual/potencial da newsletter:** aceita densidade, precisa entender por
que o site existe além do Substack.

**Explicitamente fora do foco da Fase 1:** executivos que buscam chancela, devs avançados,
caçadores de prompt pronto, quem quer notícia de IA.

## 4. Qual comportamento queremos gerar?

A jornada mínima que a Fase 1 precisa produzir, na ordem:

```text
chega frio → entende a proposta em ~5s → escolhe uma das duas portas
(maturidade OU oportunidade) → completa um radar de 7–8 perguntas →
vê resultado útil SEM pagar com e-mail antes → deixa o e-mail para
receber a trilha completa → entra na newsletter → (opcional) entra na
lista de interesse do Lab
```

O ganho psicológico-alvo (o "aha" barato da Fase 1): *"eu não preciso acompanhar todo o hype;
preciso saber onde aplicar, que tipo de solução faz sentido e qual é meu próximo passo."*

## 5. Papel de cada peça do ecossistema

| Peça | Papel | Não é |
|---|---|---|
| **Newsletter (Substack)** | Motor editorial, autoridade, relacionamento recorrente. A conversão-fim da Fase 1. | Produto premium sozinha |
| **Site/app (+ConverSaaS)** | Camada de aquisição, diagnóstico e aplicação prática. Landing + app leve + laboratório em construção. | Arquivo de textos, landing institucional |
| **Premium futuro (Lab)** | Promessa visível ("em breve") + lista de interesse. Transformar oportunidade em solução estruturada. | Entrega da Fase 1 |
| **Plataforma ROI do Foco (logada)** | Ativo real do produto: demonstrada na home nova (4 vídeos) e redesenhada no DS2 na **Fase 1B** (visual novo, lógica 100% intocada) | Alvo de refactor de lógica |
| **`/pre-diagnostico`** | No ar e funcionando (campanhas atuais seguem atendidas e convertendo). Sem link nomeado na navegação nova. **Destino temporário** dos CTAs de diagnóstico da home enquanto os radares não existem (ISSUE-107) — a ISSUE-107B troca esse destino assim que os radares ficarem prontos. Reformulação do fluxo em si fica para fase futura. | Página com identidade própria na navegação nova |

## 6. Qual é o desalinhamento do site atual? (evidência da auditoria)

1. **Mensagem:** hero atual = "Trabalhe menos, Conquiste mais" + pricing de newsletter → landing
   de produtividade genérica, exatamente o que os documentos mandam deixar de ser.
2. **Estrutura técnica:** root layout é client component com auth-gate que **redireciona toda
   rota fora de `/`, `/auth`, `/pre-diagnostico`** — o site é uma SPA por trás de um gate; não há
   `export const metadata`, sitemap ou robots → SEO estrutural quase nulo (um `<title>` único
   para o site inteiro).
3. **Visual:** paleta atual (verde `#042f2e` + laranja) sem identidade tipográfica (system-ui);
   o Design System v1 "Dark Editorial Atelier" (Fraunces + IBM Plex + magenta) existe só em doc.
4. ~~Entrega de valor por e-mail quebrada~~ **[Corrigido — confirmado pelo dono em
   2026-07-05]:** o e-mail pós-lead entrega normalmente via Resend (plano gratuito). Política:
   e-mail transacional só para quem completa o pré-diagnóstico/radar; domínio próprio adiado
   até escalar. Bug remanescente e SEPARADO: e-mail de reset de senha não chega (registrado no
   `00b`, fora do escopo do revamp).
5. **Nomenclatura:** o app já se chama "+ConverSaaS" no PWA, mas a arquitetura de marca
   (Conversas no Corredor = marca-mãe / +ConverSaaS = plataforma) não aparece em lugar nenhum
   da experiência.

## 7. Qual é a hipótese principal da Fase 1?

> **Visitantes frios convertem melhor em audiência qualificada quando recebem clareza prática
> (nível de maturidade OU oportunidade concreta) antes de serem convidados a assinar.**

Corolário (ponte de tráfego): quem chega buscando produtividade aceita o reposicionamento se a
ponte for explícita — *"produtividade agora também é saber construir sistemas de trabalho
melhores com IA"*.

## 8. Como saberemos se a Fase 1 deu certo?

**Métrica norte:** taxa de conversão visitante → lead qualificado (e-mail capturado pós-radar)
→ assinante da newsletter.

Instrumentação mínima para poder responder (eventos + funil, ver spec técnica):

- CTR dos CTAs do hero (por porta);
- taxa de início e de conclusão de cada radar;
- taxa de captura de e-mail pós-resultado;
- cliques em textos recomendados;
- inscrições na lista do Lab;
- custo por lead por campanha/cluster (via UTM).

**Baseline honesto:** hoje não temos esses números para o funil novo. A primeira quinzena após
o deploy serve para estabelecer baseline; a Fase 1.5 otimiza contra ele. Sinal qualitativo de
sucesso: o funil novo gera leads a custo comparável ou melhor que o `/pre-diagnostico` atual,
com leads mais aderentes ao território de IA.

**Guard-rail inegociável:** a conversão do funil atual (`/pre-diagnostico` + gtag
`AW-16601345592`) não pode regredir durante a transição.
