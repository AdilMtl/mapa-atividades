import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verificar se é admin
async function isAdmin(email: string | null) {
  return email === 'adilson.matioli@gmail.com'
}

// GET - Listar assinantes com informações de acesso
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    // Buscar assinantes da tabela authorized_emails
    const { data: assinantes, error: assinantesError } = await supabaseAdmin
      .from('authorized_emails')
      .select('*')
      .order('email')

    if (assinantesError) {
      console.error('Erro ao buscar assinantes:', assinantesError)
      return NextResponse.json({ assinantes: [] })
    }

    // Para cada assinante, buscar dados do auth.users
    const assinantesComDados = await Promise.all(
      (assinantes || []).map(async (assinante) => {
        // Buscar usuário no auth
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
        const authUser = authUsers.users?.find(
          u => u.email?.toLowerCase() === assinante.email.toLowerCase()
        )

        // Contar atividades se o usuário existir
        let totalAtividades = 0
        if (authUser) {
          const { data: usuario } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', assinante.email)
            .single()

          if (usuario) {
            const { count } = await supabaseAdmin
              .from('atividades')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', usuario.id)
            
            totalAtividades = count || 0
          }
        }

        return {
          ...assinante,
          // Dados do auth.users
          conta_criada: authUser?.created_at || null,
          ultimo_acesso: authUser?.last_sign_in_at || null,
          email_confirmado: authUser?.email_confirmed_at ? true : false,
          tem_conta: !!authUser,
          // Métricas
          total_atividades: totalAtividades
        }
      })
    )

    return NextResponse.json({ assinantes: assinantesComDados })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ assinantes: [] })
  }
}
// POST - Adicionar assinante
export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { email: newEmail, expires_at } = body

  const { data, error } = await supabaseAdmin
    .from('authorized_emails')
    .insert({ 
      email: newEmail.toLowerCase().trim(),
      expires_at,
      notes: 'Assinante'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, data })
}

// PUT - Atualizar assinante
export async function PUT(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { id, email: newEmail, expires_at } = body

const updateData: any = { expires_at }
if (newEmail) {
  updateData.email = newEmail.toLowerCase().trim()
}

const { error } = await supabaseAdmin
  .from('authorized_emails')
  .update(updateData)
  .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

// DELETE - Remover assinante
export async function DELETE(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  
  if (!isAdmin(email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await request.json()
  const { id } = body

  const { error } = await supabaseAdmin
    .from('authorized_emails')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}