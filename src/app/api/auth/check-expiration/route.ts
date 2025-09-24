import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ valid: true })
    }

    // Buscar na tabela de emails autorizados
    const { data, error } = await supabaseAdmin
      .from('authorized_emails')
      .select('expires_at')
      .eq('email', email.toLowerCase().trim())
      .single()

    // Se não encontrar, permitir (usuário antigo)
    if (error || !data) {
      return NextResponse.json({ valid: true })
    }

    // Verificar se expirou
    const hoje = new Date()
    const expiracao = new Date(data.expires_at)
    
    if (hoje > expiracao) {
      const [ano, mes, dia] = data.expires_at.split('-')
      const dataFormatada = `${dia}/${mes}/${ano}`
      
      return NextResponse.json({
        valid: false,
        message: `Sua assinatura expirou em ${dataFormatada}.\n\nRenove para continuar acessando o sistema.`
      })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error('Erro na verificação de expiração:', error)
    return NextResponse.json({ valid: true })
  }
}