'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { BarChart3, Map, User, Settings, LogOut, Menu, X, Target, Shield, TrendingUp, Calendar, FlaskConical, UserCog } from 'lucide-react'

// E-mail do dono/admin — mesma constante hardcoded já usada em
// api/admin/assinantes/route.ts e admin/assinantes/page.tsx (fonte da verdade
// do gate de admin; não duplicar lógica nova, só reusar o mesmo critério).
const ADMIN_EMAIL = 'adilson.matioli@gmail.com'

// Gate de auth + navegação da plataforma logada (extraído do layout raiz na ISSUE-101,
// extraído do (app)/layout.tsx para AppShell na ISSUE-110 — só para o layout poder
// exportar `metadata` com robots:index:false; lógica idêntica, nada mudou aqui).
// Link pro Lab no sidebar (ajuste pontual, sessão 2026-07-11): só assinante
// `plan_type = 'lab_beta'` vê o atalho — espelha o link discreto pro legado que
// o LabShell já mostra pro sentido contrário (pergunta 14 do 00b). Resto da
// navegação/lógica do AppShell continua intocado.

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [temAcessoLab, setTemAcessoLab] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)

      // Redirecionar não autenticados (exceto landing e auth)
      if (!session?.user && pathname !== '/auth' && pathname !== '/' && pathname !== '/pre-diagnostico') {
        router.push('/')
      }

      if (session?.user?.email) {
        try {
          const res = await fetch('/api/auth/check-authorization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email })
          })
          const data = await res.json()
          // Mesma regra do gate real do Lab (verificarAutorizacao): QUALQUER
          // authorized_emails válido entra, não só plan_type='lab_beta'
          // (esse campo só decide se o LabShell mostra o link de volta).
          setTemAcessoLab(Boolean(data.authorized))
        } catch (err) {
          console.error('Erro ao verificar acesso ao Lab:', err)
        }
      }
    }
    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (!session?.user && pathname !== '/auth' && pathname !== '/' && pathname !== '/pre-diagnostico') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Páginas que não mostram o menu
  const authPages = ['/auth', '/', '/pre-diagnostico']
  const showNavigation = user && !authPages.includes(pathname)

  // 🎯 NAVEGAÇÃO CORRIGIDA - Com Fluxo Semanal
  const navigationItems = [
    ...(temAcessoLab ? [{ href: '/lab/inicio', label: 'Lab', icon: FlaskConical }] : []),
    ...(user?.email === ADMIN_EMAIL ? [{ href: '/admin/assinantes', label: 'Admin', icon: UserCog }] : []),
    { href: '/dashboard', label: 'Mapa', icon: Map },
    { href: '/diagnostico', label: 'Diagnóstico', icon: TrendingUp },
    { href: '/plano-acao', label: 'Plano de Ação', icon: Target },
    { href: '/painel-semanal', label: 'Fluxo Semanal', icon: Calendar },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    { href: '/perfil', label: 'Perfil', icon: User },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
    { href: '/privacidade', label: 'Privacidade', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showNavigation ? (
        <div className="flex h-screen">
          {/* Sidebar Desktop */}
          <aside className={`hidden md:flex md:flex-col md:w-64 glass border-r border-white/10`}>
            <div className="flex-1 flex flex-col">
              {/* Logo/Header */}
              <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold font-mono accent">
                  +Conversas no Corredor
                </h1>
                <p className="text-xs opacity-70 mt-1">
                  {user?.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'accent-bg font-semibold'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/10">
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-red-600/20"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sair
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
              <aside className="w-64 h-full glass border-r border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex-1 flex flex-col">
                  {/* Header with close */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h1 className="text-lg font-bold font-mono accent">
                      +Conversas no Corredor
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? 'accent-bg font-semibold'
                              : 'hover:bg-white/10'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Logout */}
                  <div className="p-4 border-t border-white/10">
                    <Button
                      onClick={logout}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-red-600/20"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sair
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden p-4 border-b border-white/10 glass flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-bold accent">+Conversas no Corredor</h1>
              <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      ) : (
        // Página de auth (sem menu)
        children
      )}
    </>
  )
}
