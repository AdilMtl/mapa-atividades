'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { 
  Coffee, 
  Lock, 
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  KeyRound
} from 'lucide-react'
import { DESIGN_TOKENS, cn } from '@/lib/design-system'

export default function ResetPasswordPage() {
  // Estados
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Verificar token ao carregar página
  useEffect(() => {
    const checkTokenAndSetSession = async () => {
      try {
        // Obter parâmetros da URL
        const accessToken = searchParams?.get('access_token')
        const refreshToken = searchParams?.get('refresh_token')
        const type = searchParams?.get('type')
        
        // Verificar fragment também (caso venha no #)
        const hash = window.location.hash
        const hashParams = new URLSearchParams(hash.substring(1))
        const hashAccessToken = hashParams.get('access_token')
        const hashRefreshToken = hashParams.get('refresh_token')
        const errorCode = hashParams.get('error_code')
        const error = hashParams.get('error')

        console.log('Reset Page - Params:', { 
          accessToken, refreshToken, type, 
          hashAccessToken, errorCode, error 
        })

        // Usar token do hash se disponível, senão da query
        const finalAccessToken = hashAccessToken || accessToken
        const finalRefreshToken = hashRefreshToken || refreshToken

        // Verificar se há erro
        if (errorCode === 'otp_expired' || error === 'access_denied') {
          setMessage({
            type: 'error',
            text: '🔗 Link expirado ou inválido!\n\nSolicite um novo link de recuperação.'
          })
          setIsChecking(false)
          return
        }

        // Verificar se tem token
        if (!finalAccessToken) {
          setMessage({
            type: 'error', 
            text: 'Link de recuperação inválido. Solicite um novo link.'
          })
          setIsChecking(false)
          return
        }

        // Definir sessão no Supabase
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: finalAccessToken,
          refresh_token: finalRefreshToken || ''
        })

        if (sessionError || !data.session) {
          console.error('Erro ao definir sessão:', sessionError)
          setMessage({
            type: 'error',
            text: 'Token expirado ou inválido. Solicite um novo link de recuperação.'
          })
          setIsChecking(false)
          return
        }

        // Sucesso - token válido
        setIsValidToken(true)
        setMessage({
          type: 'success',
          text: 'Link válido! ✅ Digite sua nova senha abaixo.'
        })
        setIsChecking(false)

        // Limpar URL
        router.replace('/reset-password')

      } catch (error) {
        console.error('Erro ao processar token:', error)
        setMessage({
          type: 'error',
          text: 'Erro ao processar link. Solicite um novo.'
        })
        setIsChecking(false)
      }
    }

    checkTokenAndSetSession()
  }, [searchParams, router])

  // Função para definir nova senha
  const handleResetPassword = async () => {
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
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Erro ao atualizar senha:', error)
        
        if (error.message.includes('session_not_found') || error.message.includes('invalid_token')) {
          setMessage({ 
            type: 'error', 
            text: 'Sessão expirada. Solicite um novo link de recuperação.' 
          })
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Erro ao definir nova senha: ' + error.message 
          })
        }
        setLoading(false)
        return
      }

      // Sucesso!
      setMessage({ 
        type: 'success', 
        text: '🎉 Nova senha definida com sucesso!\n\nRedirecionando para o sistema...' 
      })

      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)

    } catch (error: any) {
      console.error('Erro inesperado:', error)
      setMessage({ 
        type: 'error', 
        text: 'Erro inesperado. Tente novamente ou solicite novo link.' 
      })
      setLoading(false)
    }
  }

  // Função para Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidToken) {
      handleResetPassword()
    }
  }

  return (
    <div className={cn(
      'min-h-screen w-full',
      `bg-[${DESIGN_TOKENS.colors.background}]`,
      'text-white relative overflow-hidden'
    )}>
      {/* Background Pattern */}
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
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-accent" />
            </div>
            <h1 className={cn(DESIGN_TOKENS.typography.h1, "text-3xl font-bold font-mono")}>
              {isChecking ? 'Verificando Link...' : 
               isValidToken ? 'Definir Nova Senha' : 
               'Link Inválido'}
            </h1>
            <p className="text-white/70">
              {isChecking ? 'Aguarde enquanto validamos seu link de recuperação' :
               isValidToken ? 'Digite sua nova senha para finalizar a recuperação' :
               'Houve um problema com seu link de recuperação'
              }
            </p>
          </div>

          {/* Card Principal */}
          <div className="glass rounded-2xl p-8 space-y-6">
            
            {/* Loading State */}
            {isChecking && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-white/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/80">Validando link...</p>
              </div>
            )}

            {/* Message de Feedback */}
            {message && !isChecking && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-100' :
                message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-100' :
                'bg-blue-500/10 border-blue-500/30 text-blue-100'
              )}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> :
                 <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
            )}

            {/* Form de Nova Senha */}
            {isValidToken && !isChecking && (
              <div className="space-y-4">
                {/* Nova Senha */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-white/90">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua nova senha (mín. 6 caracteres)"
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

                {/* Confirmar Nova Senha */}
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

                {/* Indicador de Força da Senha */}
                {newPassword && (
                  <div className="text-xs text-white/60">
                    Força da senha: 
                    <span className={cn(
                      "ml-2 font-medium",
                      newPassword.length < 6 ? "text-red-400" :
                      newPassword.length < 8 ? "text-yellow-400" : "text-green-400"
                    )}>
                      {newPassword.length < 6 ? "Fraca" :
                       newPassword.length < 8 ? "Média" : "Forte"}
                    </span>
                  </div>
                )}

                {/* Botão Definir Senha */}
                <Button 
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 text-base"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Definindo nova senha...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Definir Nova Senha
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Ações Alternativas */}
            {!isChecking && (
              <div className="text-center pt-4 border-t border-white/10 space-y-3">
                {!isValidToken && (
                  <>
                    <Link 
                      href="/auth"
                      className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Solicitar novo link de recuperação
                    </Link>
                    <div className="text-white/60 text-xs">
                      Ou entre em contato conosco se o problema persistir
                    </div>
                  </>
                )}
                
                {isValidToken && (
                  <Link 
                    href="/auth"
                    className="text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    Voltar ao login
                  </Link>
                )}
              </div>
            )}

            {/* Informações de Segurança */}
            {isValidToken && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-100 text-sm">Link Verificado ✅</h4>
                    <ul className="text-xs text-green-100/80 space-y-1">
                      <li>• Sua identidade foi confirmada</li>
                      <li>• Esta é uma sessão segura e temporária</li>
                      <li>• Após definir a senha, você será logado automaticamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas de Segurança */}
            {isValidToken && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-medium text-blue-100 text-sm mb-2">💡 Dicas para uma senha forte:</h4>
                <ul className="text-xs text-blue-100/80 space-y-1">
                  <li>• Use pelo menos 8 caracteres</li>
                  <li>• Combine letras, números e símbolos</li>
                  <li>• Evite informações pessoais óbvias</li>
                  <li>• Use uma senha única para esta conta</li>
                </ul>
              </div>
            )}
          </div>

          {/* Links úteis */}
          <div className="text-center space-y-3">
            <div className="flex justify-center gap-4 text-sm">
              <Link 
                href="/privacidade" 
                className="text-white/60 hover:text-accent transition-colors"
              >
                Privacidade
              </Link>
              <span className="text-white/30">•</span>
              <a 
                href="https://conversasnocorredor.substack.com/about" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-accent transition-colors"
              >
                Sobre
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}