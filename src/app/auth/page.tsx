'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { emailAutorizado } from '@/lib/email-validator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Coffee, 
  Mail, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  BookOpen
} from 'lucide-react'
import { DESIGN_TOKENS, cn } from '@/lib/design-system'

export default function AuthPage() {
  // Estados existentes (mantidos)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // Novos estados para UX
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  // Lógica existente (mantida exatamente igual)
  const handleAuth = async () => {
    if (!email || !senha) {
      setMessage({ type: 'error', text: 'Preencha todos os campos' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        // LOGIN - não verifica lista (usuário já foi validado antes)
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({ type: 'error', text: 'Email ou senha incorretos' })
          } else {
            setMessage({ type: 'error', text: error.message })
          }
          setLoading(false)
          return
        }
        window.location.href = '/dashboard'
      } else {
        // CADASTRO - verificar se email está autorizado
        const validacao = await emailAutorizado(email)
        
        if (!validacao.autorizado) {
          setMessage({ 
            type: 'error', 
            text: `${validacao.motivo}\n\nApenas assinantes anuais da newsletter têm acesso.` 
          })
          setLoading(false)
          return
        }
        
        const { error } = await supabase.auth.signUp({ email, password: senha })
        if (error) {
          setMessage({ type: 'error', text: error.message })
          setLoading(false)
          return
        }
        setMessage({ 
          type: 'success', 
          text: 'Conta criada! Verifique seu email para confirmar o cadastro.' 
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' })
    }
    setLoading(false)
  }

  // Função para Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth()
    }
  }

  return (
    <div className={cn(
      'min-h-screen w-full',
      `bg-[${DESIGN_TOKENS.colors.background}]`,
      'text-white relative overflow-hidden'
    )}>
      {/* Background Pattern (igual da landing) */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-green-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 p-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 accent" />
            <div className="text-lg font-bold font-mono accent">
              Conversas no Corredor
            </div>
          </div>
        </Link>
        
        <div className="flex items-center gap-4 text-sm">
          <a 
            href="https://conversasnocorredor.substack.com/about" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
          >
            <Users className="w-4 h-4" />
            Sobre
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className={cn(DESIGN_TOKENS.typography.h1, "text-3xl font-bold font-mono")}>
              {isLogin ? 'Bem-vindo de volta' : 'Junte-se à comunidade'}
            </h1>
            <p className="text-white/70">
              {isLogin 
                ? 'Acesse suas ferramentas de produtividade' 
                : 'Crie sua conta e comece a organizar suas prioridades'
              }
            </p>
          </div>

          {/* Card Principal */}
          <div className="glass rounded-2xl p-8 space-y-6">
            
            {/* Message de Feedback */}
            {message && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-100' :
                message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-100' :
                'bg-blue-500/10 border-blue-500/30 text-blue-100'
              )}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> :
                 message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" /> :
                 <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/90">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-accent focus:ring-accent"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium text-white/90">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-11 pr-11 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-accent focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Botão Principal */}
              <Button 
                onClick={handleAuth} 
                disabled={loading || !email || !senha}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verificando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLogin ? <Mail className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                  </div>
                )}
              </Button>
            </div>

            {/* Alternar modo */}
            <div className="text-center pt-4 border-t border-white/10">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage(null)
                }}
                className="text-white/70 hover:text-accent transition-colors text-sm"
              >
                {isLogin ? (
                  <span>Não tem conta? <strong>Criar uma</strong></span>
                ) : (
                  <span>Já tem conta? <strong>Fazer login</strong></span>
                )}
              </button>
            </div>

            {/* Aviso sobre acesso restrito */}
            {!isLogin && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-100">Acesso Exclusivo</h4>
                    <p className="text-sm text-blue-100/80 leading-relaxed">
                      Apenas <strong>assinantes anuais</strong> da newsletter têm acesso ao sistema. 
                      Se você ainda não assina, volte à página inicial para se inscrever.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Links úteis */}
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-4 text-sm">
              <a 
                href="https://conversasnocorredor.substack.com/subscribe" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                Assinar Newsletter
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-white/30">•</span>
              <Link 
                href="/privacidade" 
                className="text-white/60 hover:text-accent transition-colors"
              >
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}