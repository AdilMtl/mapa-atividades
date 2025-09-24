import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    // Verificar se usuário já existe no auth
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Erro ao listar usuários:', error)
      return NextResponse.json({ exists: false })
    }

    // Procurar pelo email
    const userExists = users?.some(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    )

    return NextResponse.json({ 
      exists: userExists || false,
      message: userExists ? 'Este email já possui uma conta. Use "Entrar" ao invés de "Criar Conta".' : null
    })

  } catch (error) {
    console.error('Erro na verificação:', error)
    return NextResponse.json({ exists: false })
  }
}