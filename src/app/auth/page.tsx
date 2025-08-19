'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { emailAutorizado } from '@/lib/email-validator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    try {
      if (isLogin) {
        // LOGIN - não verifica lista (usuário já foi validado antes)
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
        window.location.href = '/dashboard'
      } else {
        // CADASTRO - verificar se email está autorizado
        const validacao = await emailAutorizado(email)
        
        if (!validacao.autorizado) {
          alert(`❌ ${validacao.motivo}\n\nContate o administrador para solicitar acesso.`)
          setLoading(false)
          return
        }
        
        const { error } = await supabase.auth.signUp({ email, password: senha })
        if (error) throw error
        alert('✅ Conta criada! Verifique seu email para confirmar.')
      }
    } catch (error: any) {
      alert('❌ Erro: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#042f2e] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? 'Login' : 'Criar Conta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Button 
            onClick={handleAuth} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verificando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full"
          >
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
          </Button>
          
          {!isLogin && (
            <div className="text-xs text-center opacity-70 mt-4 p-3 bg-blue-900/20 rounded">
              📧 <strong>Acesso restrito:</strong> Apenas emails autorizados podem criar contas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}