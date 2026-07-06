# 06 — Definition of Done (Fase 1)

> **Revamp Conversas no Corredor / +ConverSaaS** · criado em 2026-07-05
> Este checklist é o gate de launch executado na ISSUE-112. Cada item recebe **OK**, **FALHOU**
> ou **EXCEÇÃO (justificada e aceita pelo dono)**. Launch só com zero FALHOU.

---

## A. Mensagem e posicionamento

- [ ] A homepage comunica a nova proposta em ≤5 segundos (teste com pessoa real que não conhece
      o projeto: ela descreve "IA aplicada ao trabalho", não "produtividade genérica").
- [ ] O site não parece: landing de produtividade genérica, curso raso de IA, startup neon,
      Substack com design melhor.
- [ ] A ponte de produtividade existe e é visível (seção reframe) — visitante de campanha de
      produtividade não se sente no lugar errado.
- [ ] A promessa do premium (Lab) é inteligível, sem vender o que não existe e sem prometer
      itens vetados (suporte individual, comunidade, geração ilimitada — doc estratégico §13.3).

## B. Experiência e fluxos

- [ ] Existem as duas portas de entrada, com microcopy de "melhor para quem…".
- [ ] Radar de Maturidade completo: 7 perguntas → nível correto → resultado com significado,
      risco, próximo salto, leituras e CTA cruzado.
- [ ] Radar de Oportunidades completo: 8 perguntas → 1 de 9 tipos → resultado com os 8 blocos
      obrigatórios.
- [ ] Qualquer radar completável sem conta, em mobile, em <3 minutos.
- [ ] Resultado resumido SEMPRE visível antes da captura; captura é opcional e o caminho sem
      e-mail é digno.
- [ ] `/newsletter`, `/lab` e `/obrigado` no ar; interesse no Lab persiste no banco.
- [ ] Os dois radares se cruzam (maturidade sugere oportunidades e vice-versa).

## C. Captura, dados e e-mail

- [ ] Lead salvo em `radar_leads` com sessão, UTMs e flags corretas (dono confere no Supabase).
- [ ] RLS verificada: acesso com anon key às tabelas novas FALHA (dono roda a query de
      verificação).
- [ ] Rotas novas usam service_role local, validação de e-mail e rate limit.
- [ ] E-mail de trilha: entrega em caixa real (Gmail + Outlook) **OU** exceção registrada
      (pendência de domínio) com a UI prometendo apenas o que cumpre.
- [ ] Rotina de import CSV → Substack documentada para o dono.

## D. Tracking e analytics (trava crítica)

- [ ] Conversão Google Ads do funil legado (`/pre-diagnostico` → EmailGate) re-validada em
      produção/preview com Tag Assistant — intocada.
- [ ] Snippet GTM `GTM-PDJ2K5BX` presente e byte-idêntico no layout novo.
- [ ] Os 15 eventos do doc operacional §21 disparam com nomes literais e propriedades (UTM,
      tipo, nível/solução) nos dois trilhos (dataLayer + Supabase).
- [ ] Decisão de conversão para o funil novo aplicada (mesmo label ou label novo — registrada).
- [ ] Métrica norte calculável com os dados coletados: visitante → lead → (proxy de) assinante.

## E. Design e acessibilidade

- [ ] 100% das superfícies novas no Dark Editorial Atelier (tokens DS2; zero hex solto).
- [ ] Fraunces nos títulos, IBM Plex Sans na interface, IBM Plex Mono em labels/badges.
- [ ] Zero estética genérica de IA (robôs, circuitos, neon ciano/roxo, cérebros).
- [ ] Touch targets ≥44px; fonte base ≥16px; testado em viewport 360px real.
- [ ] Contraste AA nos pares de cor usados em texto.
- [ ] Páginas legadas (dashboard, pre-diagnostico, auth) visualmente idênticas ao pré-revamp.

## F. Copy

- [ ] Grep limpo da lista proibida (domine, revolucione, desbloqueie, potencial máximo, 10x,
      futuro chegou, "Saiba mais", "Clique aqui", "Cadastre-se"…).
- [ ] Todos os CTAs verbalizam intenção do usuário.
- [ ] Dono leu toda a superfície de texto e não sentiu "cheiro de IA" (veto exercível por item).
- [ ] Vocabulário proprietário presente onde natural (fluência, repertório, julgamento,
      trabalho real, Artesanato Digital).

## G. SEO

- [ ] Title + meta description únicos por página pública (strings do doc operacional §16).
- [ ] H1 único por página; H2s escaneáveis.
- [ ] `sitemap.xml` e `robots.txt` servidos; rotas privadas fora do índice.
- [ ] OG/Twitter cards com imagem em todas as páginas públicas.
- [ ] Lighthouse SEO ≥95 nas páginas públicas.

## H. Qualidade técnica

- [ ] `npm run lint` sem erros novos; `npx tsc --noEmit` limpo; `npm run build` verde.
- [ ] Lighthouse mobile: performance ≥85 e a11y ≥90 em home e radares.
- [ ] PWA: `npm run build && npm run start` — instala, abre e navega para as rotas novas;
      atualização de SW não serve shell antigo após hard refresh.
- [ ] Matriz rota×estado: anônimo acessa todas as públicas; anônimo é redirecionado das
      privadas; assinante logado usa a plataforma como antes.
- [ ] Nenhum segredo em código/docs; `.env.local` fora do git.

## I. Não-regressão do negócio

- [ ] Funil `/pre-diagnostico` completo funciona (sessão → resultado → lead → conversão).
- [ ] Login de assinante → dashboard → mapa → kanban → relatórios funcionam.
- [ ] `/admin/assinantes` funciona.
- [ ] Fluxo de reset de senha funciona.
- [ ] `/privacidade` atualizada mencionando a captura nova.

## I-bis. Home — itens preservados por decisão do dono

- [ ] Seção "A plataforma em ação" presente com os 4 vídeos (`mapeamento`, `diagnostico`,
      `taticas`, `kanban`) e progressive loading funcionando (1º autoplay muted, demais
      click-to-play).
- [ ] Pricing presente (R$0 / R$15 mensal / anual), legível, redesenhado no DS2.
- [ ] Zero link para `/pre-diagnostico` na home nova — mas a rota responde 200 e o funil dela
      segue funcionando ponta a ponta (backstage).
- [ ] Marca "+Conversas" + mensagem "ecossistema virtual da newsletter Conversas no Corredor"
      visíveis no header/hero.

## K. Fase 1B — plataforma logada no DS2 (gate próprio, pós-launch público)

- [ ] AppShell, /auth, /dashboard, /diagnostico, /plano-acao, /painel-semanal, /relatorios,
      /perfil, /configuracoes e /admin/assinantes no DS2.
- [ ] Para CADA tela: screenshots antes/depois arquivados + fluxo manual da issue executado
      sem regressão funcional.
- [ ] Zonas ROI mantêm os hex originais (`#22c55e`/`#3b82f6`/`#eab308`/`#ef4444`).
- [ ] Exports (PNG do mapa, PDF do diagnóstico, LGPD) geram arquivos legíveis com o tema novo.
- [ ] Kanban: drag & drop funciona em touch real e persiste após reload.
- [ ] Nenhuma mudança de lógica/estado/dados no diff das issues 114–120 (revisão de diff).

## J. Processo e continuidade

- [ ] `docs/CURRENT-STATUS.md` e `docs/CHANGELOG.md` atualizados (versão nova SemVer).
- [ ] `00b_open_questions.md` atualizado com o estado final das premissas.
- [ ] Plano da Fase 1.5 confirmado (baseline de 2 semanas → decisões de A/B e campanha).
- [ ] Commits por issue, reversíveis individualmente; tag de release do launch criada.
- [ ] Dono autorizou o push/launch explicitamente.

---

**Critério-síntese:** a Fase 1 está pronta quando um desconhecido chega frio pela primeira vez,
entende em segundos que isso é sobre *IA aplicada ao trabalho real*, ganha clareza prática em
três minutos sem pagar nada, deixa o e-mail porque quer continuar — e nada do que já funcionava
(funil, plataforma paga, tracking) piorou um milímetro.
