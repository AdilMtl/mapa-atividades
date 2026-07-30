'use client'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  Users, Plus, Trash2, Edit, Check, X,
  Search, RefreshCw, SlidersHorizontal
} from 'lucide-react'

import { AdminShell } from '@/components/admin/AdminShell'
import { Badge, Button, Card, Eyebrow, PageContainer, SectionTitle } from '@/components/ds2'

interface Assinante {
  id: string
  email: string
  expires_at: string
  notes: string
  created_at: string
conta_criada?: string
  ultimo_acesso?: string
  email_confirmado?: boolean
  tem_conta?: boolean
  total_atividades?: number
}

// Fundo escuro explícito nas <option> — o navegador renderiza o popup nativo
// do <select> com o tema do SO por padrão; sem isso, texto claro em fundo
// claro fica ilegível (regressão histórica conhecida, v3.2.0).
const OPCAO_ESCURA = { backgroundColor: '#08110F', color: '#F8F0E6' }
const CLASSE_SELECT =
  'min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-bg-app px-3 text-sm text-ds2-text-primary outline-none focus:border-ds2-orange/50'
const CLASSE_INPUT =
  'min-h-[44px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-4 text-base text-ds2-text-primary placeholder-ds2-text-muted outline-none focus:border-ds2-orange/50'

export default function AdminAssinantesPage() {
  const [assinantes, setAssinantes] = useState<Assinante[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newExpires, setNewExpires] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editExpires, setEditExpires] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editEmail, setEditEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPeriodo, setFilterPeriodo] = useState('todos')
  const [sortBy, setSortBy] = useState('email')
  // Filtros colapsados por padrão: o trabalho real desta tela é achar alguém
  // pela busca; 3 selects fixos comiam meia tela no celular sem serem usados.
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  const router = useRouter()

  useEffect(() => {
    checkAdmin()
    // Roda uma vez na montagem — checkAdmin é estável na prática (legado).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    if (!user || user.email !== 'adilson.matioli@gmail.com') {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    loadAssinantes()
  }

  const loadAssinantes = async () => {
    setLoading(true)

    const response = await fetch('/api/admin/assinantes', {
      headers: {
        'x-user-email': currentUser?.email || ''
      }
    })
    const data = await response.json()

    if (data.assinantes) {
      setAssinantes(data.assinantes)
    }

    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newEmail || !newExpires) return

    const response = await fetch('/api/admin/assinantes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({
        email: newEmail,
        expires_at: newExpires
      })
    })

    if (response.ok) {
      setNewEmail('')
      setNewExpires('')
      setShowAddForm(false)
      loadAssinantes()
    }
  }

  const handleUpdate = async (id: string) => {
  const response = await fetch('/api/admin/assinantes', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': currentUser?.email || ''
    },
    body: JSON.stringify({
      id,
      email: editEmail,
      expires_at: editExpires
    })
  })

    if (response.ok) {
      setEditingId(null)
      loadAssinantes()
    }
  }

  const handleDelete = async (id: string, email: string) => {
  // Confirmação mais amigável
  const confirmar = window.confirm(`Remover ${email} da lista de assinantes?`)
  if (!confirmar) return

    const response = await fetch('/api/admin/assinantes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ id })
    })

    if (response.ok) {
      loadAssinantes()
    }
  }

  // Aplicar filtros e ordenação
const getFilteredAndSorted = () => {
  let filtered = [...assinantes]

  // Aplicar busca
  if (search) {
    filtered = filtered.filter(a =>
      a.email.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Aplicar filtro de status
  const hoje = new Date()
  switch (filterStatus) {
    case 'ativos':
      filtered = filtered.filter(a =>
        new Date(a.expires_at) >= hoje && a.tem_conta && a.email_confirmado
      )
      break
    case 'expirados':
      filtered = filtered.filter(a => new Date(a.expires_at) < hoje)
      break
    case 'sem_conta':
      filtered = filtered.filter(a => !a.tem_conta)
      break
    case 'com_conta':
      filtered = filtered.filter(a => a.tem_conta)
      break
    case 'nao_confirmado':
      filtered = filtered.filter(a => a.tem_conta && !a.email_confirmado)
      break
  }

  // Aplicar filtro de período
  switch (filterPeriodo) {
    case 'hoje':
      filtered = filtered.filter(a => {
        if (!a.ultimo_acesso) return false
        const diff = (hoje.getTime() - new Date(a.ultimo_acesso).getTime()) / (1000 * 60 * 60)
        return diff < 24
      })
      break
    case 'semana':
      filtered = filtered.filter(a => {
        if (!a.ultimo_acesso) return false
        const diff = (hoje.getTime() - new Date(a.ultimo_acesso).getTime()) / (1000 * 60 * 60 * 24)
        return diff < 7
      })
      break
    case 'mes':
      filtered = filtered.filter(a => {
        if (!a.ultimo_acesso) return false
        const diff = (hoje.getTime() - new Date(a.ultimo_acesso).getTime()) / (1000 * 60 * 60 * 24)
        return diff < 30
      })
      break
    case 'inativo_30':
      filtered = filtered.filter(a => {
        if (!a.ultimo_acesso) return true
        const diff = (hoje.getTime() - new Date(a.ultimo_acesso).getTime()) / (1000 * 60 * 60 * 24)
        return diff >= 30
      })
      break
    case 'inativo_60':
      filtered = filtered.filter(a => {
        if (!a.ultimo_acesso) return true
        const diff = (hoje.getTime() - new Date(a.ultimo_acesso).getTime()) / (1000 * 60 * 60 * 24)
        return diff >= 60
      })
      break
    case 'nunca':
      filtered = filtered.filter(a => !a.ultimo_acesso)
      break
  }

  // Aplicar ordenação
  switch (sortBy) {
    case 'email':
      filtered.sort((a, b) => a.email.localeCompare(b.email))
      break
    case 'email_desc':
      filtered.sort((a, b) => b.email.localeCompare(a.email))
      break
    case 'expira':
      filtered.sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
      break
    case 'acesso':
      filtered.sort((a, b) => {
        if (!a.ultimo_acesso && !b.ultimo_acesso) return 0
        if (!a.ultimo_acesso) return 1
        if (!b.ultimo_acesso) return -1
        return new Date(b.ultimo_acesso).getTime() - new Date(a.ultimo_acesso).getTime()
      })
      break
    case 'atividades':
      filtered.sort((a, b) => (b.total_atividades || 0) - (a.total_atividades || 0))
      break
  }

  return filtered
}

const filteredAssinantes = getFilteredAndSorted()

  // Quantos filtros estão de fato estreitando a lista — vira o contador do
  // botão "Filtros" (a pessoa precisa saber que a lista está filtrada mesmo
  // com o painel fechado, senão o resultado parcial vira armadilha).
  const filtrosAtivos =
    (filterStatus !== 'todos' ? 1 : 0) + (filterPeriodo !== 'todos' ? 1 : 0) + (search ? 1 : 0)

  const hoje = new Date()
  const ativos = assinantes.filter(a => new Date(a.expires_at) >= hoje).length
  const expirados = assinantes.length - ativos

  if (!isAdmin) return null

  const formatarUltimoAcesso = (ultimoAcesso?: string) => {
    if (!ultimoAcesso) return 'Nunca'
    const data = new Date(ultimoAcesso)
    const agora = new Date()
    const diffHoras = (agora.getTime() - data.getTime()) / (1000 * 60 * 60)

    if (diffHoras < 1) return 'Agora mesmo'
    if (diffHoras < 24) return 'Hoje'
    if (diffHoras < 48) return 'Ontem'
    if (diffHoras < 168) return `${Math.floor(diffHoras / 24)} dias atrás`
    return data.toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (assinante: Assinante, expirado: boolean) => {
    if (expirado) return <Badge className="border-red-400/30 text-red-400">expirado</Badge>
    if (!assinante.tem_conta) return <Badge className="border-yellow-400/30 text-yellow-400">sem conta</Badge>
    if (!assinante.email_confirmado)
      return <Badge className="border-ds2-orange/30 text-ds2-orange">não confirmado</Badge>
    return <Badge className="border-green-400/30 text-green-400">ativo</Badge>
  }

  return (
    <AdminShell email={currentUser?.email ?? ''}>
      <div className="ds2-bg-ambient min-h-screen">
        <PageContainer className="max-w-4xl space-y-5 pb-16 pt-6">
          {/* Header compacto: título + contexto numérico na mesma respiração,
              ações à direita. O que antes eram 3 blocos empilhados virou 1. */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Eyebrow>admin</Eyebrow>
              <SectionTitle as="h1" className="mt-1 text-[24px] md:text-[32px]">
                Assinantes
              </SectionTitle>
              <p className="mt-1 font-ds2-mono text-[11px] text-ds2-text-muted">
                {ativos} ativos · {expirados} expirados · {assinantes.length} total
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                variant="primary"
                className="px-3.5 py-2.5 text-xs"
                onClick={() => setShowAddForm(!showAddForm)}
                aria-label="Adicionar assinante"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2.5"
                onClick={loadAssinantes}
                aria-label="Recarregar lista"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Busca + acesso aos filtros na MESMA linha — busca é a ação real
              desta tela; filtro é exceção e fica atrás de um toque. */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ds2-text-muted" />
              <input
                type="text"
                placeholder="Buscar email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar email"
                className={`${CLASSE_INPUT} w-full pl-10`}
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              aria-expanded={filtrosAbertos}
              className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-ds2-pill border px-3.5 font-ds2-mono text-xs transition-colors ${
                filtrosAtivos > 0
                  ? 'border-ds2-orange/50 bg-ds2-orange/15 text-ds2-text-primary'
                  : 'border-ds2-border-subtle text-ds2-text-secondary hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {filtrosAtivos > 0 && <span>({filtrosAtivos})</span>}
            </button>
          </div>

          {filtrosAbertos && (
            <Card className="flex flex-wrap items-center gap-3 py-3.5">
              <label className="flex items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted">
                status
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className={CLASSE_SELECT}
                >
                  <option value="todos" style={OPCAO_ESCURA}>Todos</option>
                  <option value="ativos" style={OPCAO_ESCURA}>Ativos</option>
                  <option value="expirados" style={OPCAO_ESCURA}>Expirados</option>
                  <option value="sem_conta" style={OPCAO_ESCURA}>Sem conta</option>
                  <option value="com_conta" style={OPCAO_ESCURA}>Com conta</option>
                  <option value="nao_confirmado" style={OPCAO_ESCURA}>Não confirmado</option>
                </select>
              </label>

              <label className="flex items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted">
                acesso
                <select
                  value={filterPeriodo}
                  onChange={(e) => setFilterPeriodo(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className={CLASSE_SELECT}
                >
                  <option value="todos" style={OPCAO_ESCURA}>Todos</option>
                  <option value="hoje" style={OPCAO_ESCURA}>Hoje</option>
                  <option value="semana" style={OPCAO_ESCURA}>Esta semana</option>
                  <option value="mes" style={OPCAO_ESCURA}>Este mês</option>
                  <option value="inativo_30" style={OPCAO_ESCURA}>Inativo 30+ dias</option>
                  <option value="inativo_60" style={OPCAO_ESCURA}>Inativo 60+ dias</option>
                  <option value="nunca" style={OPCAO_ESCURA}>Nunca acessou</option>
                </select>
              </label>

              <label className="flex items-center gap-2 font-ds2-mono text-xs text-ds2-text-muted">
                ordenar
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className={CLASSE_SELECT}
                >
                  <option value="email" style={OPCAO_ESCURA}>Nome (A-Z)</option>
                  <option value="email_desc" style={OPCAO_ESCURA}>Nome (Z-A)</option>
                  <option value="expira" style={OPCAO_ESCURA}>Data expiração</option>
                  <option value="acesso" style={OPCAO_ESCURA}>Último acesso</option>
                  <option value="atividades" style={OPCAO_ESCURA}>Mais ativo</option>
                </select>
              </label>

              {filtrosAtivos > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterStatus('todos')
                    setFilterPeriodo('todos')
                    setSearch('')
                  }}
                  className="flex min-h-[44px] items-center gap-1.5 rounded-ds2-pill border border-red-400/30 px-3 font-ds2-mono text-xs text-red-400 hover:bg-red-400/10"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar
                </button>
              )}
            </Card>
          )}

          {filtrosAtivos > 0 && (
            <p className="font-ds2-mono text-[11px] text-ds2-text-muted">
              mostrando {filteredAssinantes.length} de {assinantes.length}
            </p>
          )}

          {/* Form adicionar */}
          {showAddForm && (
            <Card className="space-y-3">
              <p className="font-ds2-sans text-sm font-medium text-ds2-text-primary">
                Adicionar novo assinante
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  aria-label="E-mail do novo assinante"
                  className={`${CLASSE_INPUT} flex-1`}
                />
                <input
                  type="date"
                  value={newExpires}
                  onChange={(e) => setNewExpires(e.target.value)}
                  aria-label="Data de expiração"
                  className={CLASSE_INPUT}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="primary" className="px-3.5 py-2.5" onClick={handleAdd}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3.5 py-2.5"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista — cards, não tabela (mesmo achado da 318A: 6 colunas não cabem
              no celular nem com scroll interno; cards empilham sem overflow). */}
          {loading ? (
            <Card>
              <p className="font-ds2-sans text-sm text-ds2-text-muted">Carregando…</p>
            </Card>
          ) : filteredAssinantes.length === 0 ? (
            <Card>
              <p className="flex items-center gap-2 font-ds2-sans text-sm text-ds2-text-muted">
                <Users className="h-4 w-4" /> Nenhum assinante encontrado.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredAssinantes.map((assinante) => {
                const expirado = new Date(assinante.expires_at) < hoje
                const [ano, mes, dia] = assinante.expires_at.split('-')
                const dataFormatada = `${dia}/${mes}/${ano}`
                const editando = editingId === assinante.id

                return (
                  <Card key={assinante.id} className="space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        {editando ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            aria-label="Editar e-mail"
                            className={`${CLASSE_INPUT} w-full`}
                          />
                        ) : (
                          <p className="flex flex-wrap items-center gap-2 font-ds2-sans text-sm font-medium text-ds2-text-primary">
                            {assinante.email}
                            {assinante.notes === 'Admin' && (
                              <Badge className="border-ds2-orange/30 text-ds2-orange">admin</Badge>
                            )}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ds2-mono text-[11px] text-ds2-text-muted">
                          {getStatusBadge(assinante, expirado)}
                          <span>
                            expira:{' '}
                            {editando ? (
                              <input
                                type="date"
                                value={editExpires}
                                onChange={(e) => setEditExpires(e.target.value)}
                                aria-label="Editar data de expiração"
                                className="ml-1 min-h-[36px] rounded-ds2-card border border-ds2-border-subtle bg-ds2-surface-glass px-2 text-xs text-ds2-text-primary outline-none"
                              />
                            ) : (
                              dataFormatada
                            )}
                          </span>
                          <span>último acesso: {formatarUltimoAcesso(assinante.ultimo_acesso)}</span>
                          <span>
                            atividades: {assinante.tem_conta ? assinante.total_atividades || 0 : '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        {editando ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdate(assinante.id)}
                              aria-label="Salvar"
                              className="flex h-11 w-11 items-center justify-center rounded-ds2-pill border border-green-600/40 text-green-400 hover:bg-green-600/10"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              aria-label="Cancelar edição"
                              className="flex h-11 w-11 items-center justify-center rounded-ds2-pill border border-ds2-border-subtle text-ds2-text-secondary hover:bg-white/5"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(assinante.id)
                                setEditEmail(assinante.email)
                                setEditExpires(assinante.expires_at)
                              }}
                              aria-label="Editar assinante"
                              className="flex h-11 w-11 items-center justify-center rounded-ds2-pill border border-ds2-border-subtle text-ds2-text-secondary hover:bg-white/5"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(assinante.id, assinante.email)}
                              aria-label="Remover assinante"
                              className="flex h-11 w-11 items-center justify-center rounded-ds2-pill border border-red-400/30 text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </PageContainer>
      </div>
    </AdminShell>
  )
}
