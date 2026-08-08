---
name: research
description: Investiga uma pergunta contra fontes primárias de alta confiança e registra as descobertas num arquivo Markdown do repositório. Use quando o usuário pedir para pesquisar um tema, levantar fatos de documentação/API (Supabase, Vercel, Next.js, Google Ads/GTM etc.), ou delegar leitura para um agente em background. Use também SEMPRE que for afirmar limite, preço, comportamento de UI ou feature de plataforma de terceiros — neste projeto, nunca se afirma isso de memória ou por analogia.
---

# Research

Suba um **agente em background** para fazer a pesquisa, para que o trabalho principal continue
enquanto ele lê.

O trabalho dele:

1. Investigar a pergunta contra **fontes primárias** — documentação oficial, código-fonte, specs,
   APIs de primeira mão — nunca um resumo de terceiros. Siga cada afirmação até a fonte que é
   dona dela.
2. Escrever as descobertas num único arquivo Markdown, **citando a fonte (URL/versão) de cada
   afirmação** e a data da consulta.
3. Salvar em `docs/pesquisas/AAAA-MM-DD-tema.md` (crie a pasta se não existir) e dizer onde salvou.

## Regras deste projeto

- **Nunca afirme por analogia** comportamento de UI, limite ou plano do Supabase/Vercel/Google.
  Se a doc oficial não responder (ex.: detalhe de tela do dashboard), diga isso e peça um print
  ao dono em vez de supor — esse é um feedback antigo e inegociável dele.
- Distinga no arquivo o que é **fato citado** do que é **inferência sua** (marque inferências
  explicitamente).
- Se a pergunta envolver o stack do projeto, verifique contra as versões reais do `package.json`
  (ex.: Next 15 App Router, React 19, Tailwind v4, next-pwa 5.6) — doc de versão errada é fonte
  errada.
- Output em português (Brasil), como todo o resto do projeto.
