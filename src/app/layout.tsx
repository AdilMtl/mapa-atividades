'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { BarChart3, Map, User, Settings, LogOut, Menu, X, Target, Shield, TrendingUp, Calendar } from 'lucide-react'
import './globals.css'
import Script from 'next/script'

// Usando as mesmas cores do mapa-atividades
const BG = "#042f2e"
const ACCENT = "#d97706"

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      <html lang="pt-BR">
        <body style={{ backgroundColor: BG, color: '#fff' }}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p>Carregando...</p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-BR">
      <head>




        <title>+Conversas no Corredor</title>
        <meta name="description" content="Mapeie, diagnostique e otimize seu foco profissional" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="+Conversas no Corredor" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="+ConverSaaS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d97706" />
        
        {/* Favicon e Ícones */}
        {/* PWA Manifest e Ícones */}
<link rel="manifest" href="/pwa/manifest.json" />
<link rel="apple-touch-icon" href="/pwa/icons/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/pwa/icons/icon-192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/pwa/icons/icon-512.png" />
        
        <style>{`
          :root { 
            --bg: ${BG}; 
            --accent: ${ACCENT}; 
          }
          body { 
            background-color: var(--bg); 
            color: #fff; 
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          }
          .accent { color: var(--accent); }
          .accent-bg { background-color: var(--accent); color: #000; }
          .glass { 
            backdrop-filter: blur(8px); 
            background-color: rgba(255,255,255,0.06); 
          }
        `}</style>
      </head>
      <body>

        {/* Google Analytics + Google Ads*/}
        <!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PDJ2K5BX');</script>
<!-- End Google Tag Manager -->

        <div className="min-h-screen">
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
        </div>
      </body>
    </html>
  )
}