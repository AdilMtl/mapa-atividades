---
name: corrigir-bug
description: Investiga e corrige um bug no projeto +Conversas no Corredor (ROI do Foco) buscando a causa raiz, não o sintoma. Use quando o usuário reportar algo quebrado, com comportamento errado, erro, exceção, tela branca, dado errado, ou disser "não funciona", "deu erro", "corrige o bug". Reproduz antes de teorizar, corrige a causa e verifica que o fluxo real voltou a funcionar.
---

# Corrigir Bug

O histórico deste projeto é cheio de correção reativa. Esta skill impõe método para não trocar
um bug por outro.

## Passo 1 — Entender e reproduzir

- Pergunte/confirme: o que era esperado, o que aconteceu, em qual página/fluxo, mobile ou desktop,
  logado ou não, e a mensagem de erro exata (se houver).
- **Reproduza antes de teorizar.** Rode `npm run dev` e siga os passos. Se não reproduzir, colete
  mais dados (console do navegador, logs do Supabase Auth/DB, Network tab).
- Não conserte nada até ter visto o bug acontecer ou entendido exatamente a condição que o dispara.

## Passo 2 — Achar a causa raiz

- Localize o código com Grep/Glob. Leia o trecho e o contexto ao redor.
- Suspeitos frequentes neste projeto:
  - **RLS bloqueando API pública** (ex.: inserts em `roi_leads`) → erro `42501`.
  - **Views com SECURITY DEFINER** → recriar com `WITH (security_invoker = true)`.
  - **Bugs conhecidos do Supabase** (ex.: `auth.admin.listUsers()` com `confirmation_token` NULL
    → usar RPC `admin_list_users()`).
  - **Auth/redirect** em páginas públicas (`/pre-diagnostico`) no `layout.tsx`.
  - **Erros de tipo silenciosos**: o build ignora TS/ESLint, então rode `npx tsc --noEmit` — o bug
    pode ser um erro de tipo que nunca falhou o build.
- Explique a causa raiz em 1–2 frases antes de corrigir. Se houver incerteza, diga o grau de confiança.

## Passo 3 — Corrigir com o mínimo necessário

- Faça a menor mudança que resolve a causa raiz. Não refatore de brinde.
- Se a origem for dados/RLS, escreva o SQL e explique por que é seguro.

## Passo 4 — Verificar

```bash
npm run lint
npx tsc --noEmit
npm run dev     # reproduza os MESMOS passos do Passo 1 — o bug sumiu?
```
- Confirme que a correção resolve o caso relatado **e** não quebrou o fluxo vizinho.
- Se o bug era de PWA, valide com `npm run build && npm run start`.

## Passo 5 — Registrar

Todo bug relevante vira uma entrada `### 🔧 Corrigido` no `CHANGELOG.md` com **causa raiz** e
**solução** (esse projeto valoriza documentar o "porquê"). Deixe para a `/finalizar-sessao` ou
faça na hora, conforme o fluxo.

## Regras
- Nunca "conserte" mascarando o sintoma (ex.: try/catch engolindo erro) sem entender a causa.
- Nunca commite/pushe aqui — isso é papel da `/finalizar-sessao`.
