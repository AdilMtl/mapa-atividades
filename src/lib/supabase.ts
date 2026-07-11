import { createBrowserClient } from '@supabase/ssr'

// Cliente do NAVEGADOR. Desde a ISSUE-311 a sessão vive em COOKIE (não mais
// localStorage): é o que permite o gate server-side do Lab ler a sessão e
// redirecionar sem flash. API idêntica ao cliente antigo (supabase-js) — os
// consumidores (AppShell, auth, kanban…) não mudam. Efeito único da migração:
// quem estava logado via localStorage precisa logar de novo uma vez.
// Cookie de autenticação é estritamente necessário (LGPD: sem consentimento
// prévio; transparência na página /privacidade).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
