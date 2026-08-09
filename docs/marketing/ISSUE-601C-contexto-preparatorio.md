# ISSUE-601C — Contexto preparatório (grounding pré-Fable)

> Escrito pelo Sonnet em 09/08/2026, ao final da sessão que fechou a ISSUE-601D. Segue o padrão já
> usado neste projeto: antes de uma sessão do Fable, o Sonnet grava aqui a visão do dono e o
> grounding técnico, pra a sessão de spec/implementação começar já alinhada — não é pra o Fable
> reconstruir isso lendo scroll de conversa antiga.
>
> **Leia isto inteiro antes de tocar em código ou de propor qualquer desenho de tela.** As
> restrições abaixo vieram diretamente do dono, na sessão em que a 601D foi validada em produção.

## 🔴 Regra que domina todas as outras: nada de envio real além do próprio dono, por enquanto

O dono foi explícito e repetiu de duas formas diferentes: **nesta fase de construção da 601C,
nenhum e-mail pode sair para qualquer destinatário que não seja o e-mail dele mesmo.** Isso vale
para:
- Qualquer teste manual feito durante a implementação (inclusive verificação "ao vivo" contra a
  API já publicada).
- Qualquer script, curl, chamada de teste rodada pelo agente durante o desenvolvimento.
- O primeiro uso real da funcionalidade em produção — a primeira vez que um segmento de verdade
  recebe algo, **quem aperta o botão e decide é o dono, não o agente**, e só depois que ele tiver
  visto e aprovado o fluxo enviando pra si mesmo.

Isso não é só "cuidado geral" — é a razão pela qual a dono pediu explicitamente pra esperar o
Fable/601C em vez de deixar o Sonnet implementar um atalho de "enviar teste" na 601D (ver decisão
abaixo). Trate como o critério de aceite mais importante da issue, acima de qualquer prazo.

**Implicação de desenho:** a tela de seleção de destinatários (mockup, tela 3) precisa deixar
trivial escolher **uma pessoa só** (o próprio dono) — não pode ser uma UI que só sabe disparar
pra segmento inteiro. Isso resolve ao mesmo tempo a necessidade de teste seguro e o critério de
aceite 2 do §9 da spec (confirmação explícita antes de reenviar).

## O que já está pronto (não precisa refazer)

- **ISSUE-601A** — `marketing_sends`, `marketing_unsubscribes` (tabela existe, ainda vazia — falta
  a rota que grava nela), `vw_marketing_contatos`, os 6 segmentos como funções puras
  (`src/lib/marketing/segmentos.ts`).
- **ISSUE-601B** — telas de Jornada e Segmentos em `/admin/funil` (`PainelFunil.tsx`), só leitura.
- **ISSUE-601D** — pasta de templates (`marketing_templates`, versionada, índice único parcial
  garantindo 1 `ativo` por slug no banco). `src/lib/marketing/templates.ts` tem as funções puras
  de validação/versionamento; `src/lib/marketing/email-preview.ts` tem a prévia visual (fiel ao
  layout real, mas é casca própria — não é o HTML que sai de fato). Aba **Templates** já no ar.
  - `convite_lab` está com conteúdo real, versão `ativo` — é o único slug pronto pra virar disparo
    de verdade hoje. Os outros 5 estão rascunho vazio, aguardando a ISSUE-601E (copy, Opus, guias
    de voz, dono aprova) — **não force a 601C a esperar a copy dos outros 5**; ela deve funcionar
    com qualquer template que esteja com uma versão `ativo`, o que hoje é só `convite_lab`.

## O que a 601C precisa entregar (§7, §9, §12 da spec)

1. **Rota pública `GET /descadastrar?t=<token>`** — token assinado derivado do e-mail (nunca o
   e-mail em texto plano na URL). Confirmação de um clique, sem login, sem formulário. Grava em
   `marketing_unsubscribes`. **Isso é pré-requisito de qualquer disparo real** — precisa estar
   testado ponta a ponta (link → clique → grava → pessoa some dos segmentos) antes do primeiro
   envio de verdade, mesmo que esse primeiro envio seja só pro próprio dono.
2. **Tela de seleção de pessoas** (mockup tela 3) — lista de um segmento, com checkbox por pessoa.
   Tem que ser fácil selecionar 1 só.
3. **Tela de confirmação** (mockup tela 4) — antes de qualquer envio, mostrar: quantos vão receber
   agora, quantos já receberam esse template antes (exige segundo toque pra reenviar), quantos
   estão bloqueados por `optin_newsletter = false` (esses **não podem ser forçados**, é o critério
   de aceite 5 do §9 — LGPD vence preferência de qualquer um, inclusive o dono).
4. **`POST /api/admin/funil/disparar`** — `{ template_slug, emails[], forcar_reenvio? }`. Valida
   optin, valida duplicidade, chama o Resend, grava em `marketing_sends` **inclusive nas
   falhas** (armadilha já documentada: o SDK do Resend não lança exceção em erro — devolve
   `{ error }` na resposta; precisa de teste provando que isso vira `status = 'falhou'` com
   motivo, não um sucesso silencioso).
5. **`api/admin/lab-beta` passa a registrar em `marketing_sends`** quando manda convite (hoje não
   registra).
6. **`git diff` zero** em `layout.tsx`, `EmailGate.tsx` e `api/prediag/*` — a rota nova é adição
   isolada, não pode tocar no tracking que converte.

## Decisões do dono que fecham dúvidas de escopo (não reabrir sem pedido explícito)

- **Dados legados ficam como estão.** Contatos já capturados sem nunca terem visto um checkbox
  real de consentimento **não são re-perguntados retroativamente** — é uma decisão consciente do
  dono, sabendo que isso pode significar mandar pra menos gente por ora. Não é trabalho da 601C
  "corrigir o passado"; é trabalho da 601C respeitar o campo `optin_newsletter` como ele está hoje
  e garantir que, DAQUI PRA FRENTE, o descadastro funcione de verdade.
- **`roi_leads` (funil legado) continua fora** — decisão de 08/08, reafirmada. Não tem coluna de
  opt-in nenhuma, é lista fria, risco de reputação de domínio. Não criar segmento pra ela.
- **"Newsletter" aqui não é a newsletter do Substack.** São duas coisas separadas: a newsletter de
  verdade (assinatura via Substack, unsubscribe deles, fora do alcance deste projeto) e os e-mails
  que este sistema manda via Resend pra quem passou pelo radar/Lab. O nome da coluna
  `newsletter_optin` é impreciso por isso — não confundir as duas bases nem tentar integrá-las
  (§8 da spec já exclui integração com Substack do escopo).
- **Trava anti-CRM (§8) continua valendo**: sem notas manuais, sem edição de segmento à mão, sem
  página de detalhe de contato, sem importação/exportação de lista, sem automação por tempo (isso
  é a 602, não a 601C).

## Achado novo desta sessão: auditoria LGPD do ciclo completo

Ao investigar se o opt-in estava coberto, uma varredura mais ampla (não só a Série 600) achou
gaps no produto inteiro. Documento completo: `docs/auditoria-lgpd-ciclo-completo.md`. Os pontos
que tocam diretamente a 601C:

- **Nenhuma das origens de captura tem checkbox real de opt-in pra e-mail de marketing** — nem o
  radar, nem o Lab, nem o cadastro de conta. A 601C não precisa resolver isso (é trabalho de tela
  de captura, não de disparo), mas precisa **respeitar o campo como ele está** (§3.3 já cobre
  isso) e não assumir que `optin_newsletter = true` significa consentimento verificado — é, na
  prática, um default.
- **Achado urgente, mas o dono decidiu registrar e decidir depois, não bloquear a 601C com isso:**
  o funil legado `/pre-diagnostico` está ativo em produção e dispara e-mail via Resend sem
  nenhum gate de consentimento, para qualquer um que ache a URL (não tem mais link visível, mas a
  rota responde). Isso é **independente** da 601C — não é para a 601C tocar em
  `api/prediag/*` (aliás, é proibido pelo critério de aceite 7 do §9, `git diff` zero nesses
  arquivos). Só está registrado aqui pra o Fable não presumir, ao ler o código, que esse é um
  problema que a issue dele deveria resolver — não é.
- Não existe hoje nenhum mecanismo de exclusão/exportação de dado pra quem não tem conta (leads
  soltos) — fora do escopo da 601C, registrado só como contexto.

## Perguntas em aberto que só o dono responde (não decidir sozinho)

Da própria spec, §11 lista duas — a segunda (`roi_leads` entra?) já foi respondida em §4.1
("fica de fora", decisão de 08/08, reafirmada nesta sessão). Só a primeira segue em aberto:

1. **O convite pro Lab deveria continuar 100% manual, ou a 601C deveria oferecer algum atalho pra
   convidar direto da tela de segmento `lead_sem_convite`** (hoje isso é feito em
   `/admin/lab-beta`, uma tela separada, sem ligação com o painel de Funil)?

## Onde ler mais, na ordem que importa

1. `docs/marketing/ISSUE-601-spec-painel-funil.md` — a spec inteira, principalmente §3.4
   (descadastro), §7 (contrato de API), §8 (trava anti-CRM), §9 (critérios de aceite), §12 (esta
   issue).
2. `docs/auditoria-lgpd-ciclo-completo.md` — o achado desta sessão.
3. `docs/marketing/mockups/601-painel-funil.html` — protótipo aprovado, telas 3 e 4 (seleção e
   confirmação) são as que faltam construir de verdade.
4. `docs/CURRENT-STATUS.md` (topo) — estado mais recente antes desta sessão.
