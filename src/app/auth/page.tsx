'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const [isReset, setIsReset] = useState(false)
  const [isNewPassword, setIsNewPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Novos estados para UX
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Detectar se veio do email de reset
  useEffect(() => {
    // Verificar query params
    const accessToken = searchParams?.get('access_token')
    const refreshToken = searchParams?.get('refresh_token')
    const type = searchParams?.get('type')
    
    // Verificar hash params (fragment depois do #)
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const errorCode = hashParams.get('error_code')
    const error = hashParams.get('error')
    const hashAccessToken = hashParams.get('access_token')
    const hashRefreshToken = hashParams.get('refresh_token')
    const hashType = hashParams.get('type')
    
    console.log('Debug - Query:', { accessToken, refreshToken, type })
    console.log('Debug - Hash:', { errorCode, error, hashAccessToken, hashType })
    
    // Priorizar dados do hash se existirem
    const finalAccessToken = hashAccessToken || accessToken
    const finalRefreshToken = hashRefreshToken || refreshToken
    const finalType = hashType || type
    
    if (finalType === 'recovery') {
      if (errorCode === 'otp_expired' || error === 'access_denied') {
        // Link expirado
        setIsNewPassword(false)
        setIsLogin(true)
        setMessage({ 
          type: 'error', 
          text: '🔗 Link de recuperação expirado!\n\nOs links expiram em 1 hora. Solicite um novo clicando em "Esqueci minha senha".' 
        })
        // Limpar URL após 3 segundos
        setTimeout(() => router.replace('/auth'), 3000)
      } else if (finalAccessToken) {
        // Link válido - definir sessão do usuário
        const processValidLink = async () => {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: finalAccessToken,
              refresh_token: finalRefreshToken || ''
            })
            
            if (error) {
              console.error('Erro ao definir sessão:', error)
              setMessage({ 
                type: 'error', 
                text: 'Erro ao processar link. Solicite um novo link.' 
              })
              return
            }

            // Sucesso - mostrar form nova senha
            setIsReset(false)
            setIsLogin(false) 
            setIsNewPassword(true)
            setMessage({ 
              type: 'success', 
              text: 'Link válido! ✅\nAgora digite sua nova senha abaixo.' 
            })
            
            // Limpar URL
            router.replace('/auth')
          } catch (err) {
            console.error('Erro ao processar:', err)
            setMessage({ 
              type: 'error', 
              text: 'Erro inesperado. Solicite um novo link.' 
            })
          }
        }
        
        processValidLink()
      } else {
        // Link sem token válido
        setMessage({ 
          type: 'error', 
          text: 'Link inválido ou malformado. Solicite um novo.' 
        })
      }
    }
  }, [searchParams, router])

  // 🔐 NOVA FUNÇÃO: Definir nova senha
  const handleNewPassword = async () => {
    if (!newPassword) {
      setMessage({ type: 'error', text: 'Digite a nova senha' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Atualizar senha no Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: 'Nova senha definida com sucesso! ✅\nRedirecionando para o dashboard...' 
      })

      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao definir nova senha: ' + error.message })
    }
    setLoading(false)
  }

  // 🔐 NOVA FUNÇÃO: Reset de senha seguro
  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Digite seu email para recuperar a senha' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Verificar se email está autorizado
      const validacao = await emailAutorizado(email)
      
      if (!validacao.autorizado) {
        setMessage({ 
          type: 'error', 
          text: 'Email não autorizado. Apenas assinantes anuais podem resetar senha.' 
        })
        setLoading(false)
        return
      }

      // Enviar email de reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
       redirectTo: `${window.location.origin}/auth?type=recovery`
      })

      if (error) {
        if (error.message.includes('User not found')) {
          setMessage({ 
            type: 'error', 
            text: 'Este email não possui conta criada. Clique em "Criar Conta" primeiro.' 
          })
        } else {
          setMessage({ type: 'error', text: 'Erro ao enviar email: ' + error.message })
        }
      } else {
        setMessage({ 
          type: 'success', 
          text: `Email de recuperação enviado para ${email}.\n\nVerifique sua caixa de entrada e spam.` 
        })
        setEmail('')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' })
    }
    setLoading(false)
  }

  // Lógica existente (mantida exatamente igual)
  const handleAuth = async () => {

    if (isReset) {
      await handleResetPassword()
      return
    }

    if (isNewPassword) {
      await handleNewPassword()
      return
    }

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
              {isNewPassword ? 'Definir Nova Senha' : 
               isReset ? 'Recuperar Senha' : 
               isLogin ? 'Bem-vindo de volta' : 'Junte-se à comunidade'}
            </h1>
            <p className="text-white/70">
              {isNewPassword ? 'Digite sua nova senha para finalizar a recuperação' :
               isReset ? 'Digite seu email para receber as instruções de recuperação' :
               isLogin ? 'Acesse suas ferramentas de produtividade' : 
               'Crie sua conta e comece a organizar suas prioridades'
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
              {!isNewPassword && (
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
              )}

              {/* Senha Normal (Login/Cadastro) */}
              {!isReset && !isNewPassword && (
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
              )}

              {/* Nova Senha (Recovery) */}
              {isNewPassword && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-white/90">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Digite novamente a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-11 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Botão Principal */}
              <Button 
                onClick={handleAuth} 
                disabled={loading || (!isNewPassword && !email) || (!isReset && !isNewPassword && !senha) || (isNewPassword && (!newPassword || !confirmPassword))}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isNewPassword ? 'Definindo...' : isReset ? 'Enviando...' : 'Verificando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isNewPassword ? <Lock className="w-5 h-5" /> : 
                     isReset ? <Mail className="w-5 h-5" /> : 
                     isLogin ? <Mail className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    {isNewPassword ? 'Definir Nova Senha' :
                     isReset ? 'Enviar Email de Recuperação' : 
                     isLogin ? 'Entrar' : 'Criar Conta'}
                  </div>
                )}
              </Button>
            </div>

            {/* Alternar modo */}
            <div className="text-center pt-4 border-t border-white/10 space-y-3">
              {!isReset && !isNewPassword ? (
                <>
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
                  
                  {isLogin && (
                    <div>
                      <button 
                        onClick={() => {
                          setIsReset(true)
                          setIsLogin(false)
                          setMessage(null)
                        }}
                        className="text-orange-400 hover:text-orange-300 transition-colors text-sm underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  )}
                </>
              ) : (
                !isNewPassword && (
                  <button 
                    onClick={() => {
                      setIsReset(false)
                      setIsLogin(true)
                      setMessage(null)
                    }}
                    className="flex items-center gap-2 mx-auto text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao login
                  </button>
                )
              )}
            </div>

            {/* Aviso sobre recuperação de senha */}
            {isReset && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <h4 className="font-medium text-orange-100">Como funciona a recuperação</h4>
                    <div className="text-sm text-orange-100/80 leading-relaxed space-y-2">
                      <p>
                        <strong>1.</strong> Digite seu email → <strong>2.</strong> Receberá email com link → 
                        <strong>3.</strong> Clique no link para validar → <strong>4.</strong> Digite sua nova senha direto na tela
                      </p>
                      <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-400/30">
                        <p className="font-medium text-orange-100 mb-1">🔒 Segurança:</p>
                        <ul className="space-y-1 text-orange-100/80">
                          <li>• Link expira em 1 hora</li>
                          <li>• Apenas emails autorizados podem recuperar senha</li>
                          <li>• Validamos sua identidade antes de enviar</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aviso sobre acesso restrito */}
            {!isLogin && !isReset && !isNewPassword && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-100">Como funciona o cadastro</h4>
                    <div className="text-sm text-blue-100/80 leading-relaxed space-y-2">
                      <p>
                        <strong>1.</strong> Digite seu email e senha → <strong>2.</strong> Receberá email de confirmação → 
                        <strong>3.</strong> Clique no link para ativar sua conta
                      </p>
                      <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                        <p className="font-medium text-blue-100 mb-1">⚠️ Importante:</p>
                        <p>
                          Apenas <strong>assinantes anuais</strong> da newsletter conseguem criar conta. 
                          Seu email será verificado automaticamente durante o cadastro.
                        </p>
                      </div>
                      <p className="text-blue-200/70">
                        Ainda não é assinante? 
                        <Link href="/" className="text-accent hover:underline ml-1">
                          Volte à página inicial para se inscrever
                        </Link>
                      </p>
                    </div>
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