// =============================================================================
// MIDDLEWARE — só para as rotas LOGADAS do Lab (ISSUE-311)
// Dois papéis: (1) refrescar o token de sessão e regravar o cookie (Server
// Component não pode escrever cookie); (2) anônimo → /auth?next=<rota> ANTES
// de qualquer render — é isso que garante o "redirect sem flash" do aceite.
// O matcher NÃO cobre a vitrine pública /lab nem nada do site público/legado:
// zero mudança de comportamento fora do Lab logado.
// =============================================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser valida (e, se preciso, refresca) a sessão — nunca confiar só no cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Rotas logadas do Lab (doc 13 §8) — a vitrine /lab fica FORA de propósito.
  matcher: [
    '/lab/inicio/:path*',
    '/lab/novo-projeto/:path*',
    '/lab/projeto/:path*',
    '/lab/biblioteca/:path*',
    '/lab/perfil/:path*',
  ],
}
