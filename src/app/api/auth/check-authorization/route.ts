// API SEGURA DE VERIFICAÇÃO DE AUTORIZAÇÃO
// app/api/auth/check-authorization/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Criar cliente Supabase com Service Role (acesso total)
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
    // Pegar email do body
    const body = await request.json()
    const { email } = body

    // Validação básica
    if (!email) {
      return NextResponse.json(
        { authorized: false, motivo: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Buscar email na tabela segura (service role ignora RLS)
    const { data, error } = await supabaseAdmin
      .from('authorized_emails')
      .select('expires_at, plan_type, notes')
      .eq('email', email.toLowerCase().trim())
      .single()

    // Email não encontrado
    if (error || !data) {
      return NextResponse.json({
        authorized: false,
        motivo: 'Email não autorizado'
      })
    }

    // Verificar se expirou
    const hoje = new Date()
    const expiracao = new Date(data.expires_at)
    
    if (hoje > expiracao) {
      // Formatar data para DD/MM/YYYY (IGUAL AO FORMATO ATUAL)
      const [ano, mes, dia] = data.expires_at.split('-')
      const dataFormatada = `${dia}/${mes}/${ano}`
      
      return NextResponse.json({
        authorized: false,
        motivo: `Acesso expirado em ${dataFormatada}`
      })
    }

    // Tudo OK - autorizado!
    return NextResponse.json({
      authorized: true,
      planType: data.plan_type || 'manual',
      notes: data.notes,
      expiresAt: data.expires_at
    })

  } catch (error) {
    console.error('Erro na verificação:', error)
    return NextResponse.json(
      { authorized: false, motivo: 'Erro na verificação' },
      { status: 500 }
    )
  }
}