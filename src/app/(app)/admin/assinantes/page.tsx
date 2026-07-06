'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageContainer, PageHeader } from '@/components/base'
import { DESIGN_TOKENS } from '@/lib/design-system'
import { 
  Users, Plus, Trash2, Edit, Check, X, 
  Search, RefreshCw, ArrowLeft
} from 'lucide-react'

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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editEmail, setEditEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPeriodo, setFilterPeriodo] = useState('todos')
  const [sortBy, setSortBy] = useState('email')
  
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
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

  const hoje = new Date()
  const ativos = assinantes.filter(a => new Date(a.expires_at) >= hoje).length
  const expirados = assinantes.length - ativos

  if (!isAdmin) return null

  return (
    <PageContainer>
      <PageHeader
        title="Gerenciar Assinantes"
        subtitle={`${ativos} ativos • ${expirados} expirados • ${assinantes.length} total`}
        icon={Users}
        action={
          <div className="flex gap-2">
  <button
    onClick={() => router.push('/dashboard')} 
    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
  >
    <ArrowLeft className="w-4 h-4" />
    Mapa
  </button>
  <button
    onClick={() => setShowAddForm(!showAddForm)} 
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d97706] text-white hover:bg-[#d97706]/80 transition-all"
  >
    <Plus className="w-4 h-4" />
    Adicionar
  </button>
  <button
    onClick={loadAssinantes}
    className="p-2 rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
  >
    <RefreshCw className="w-4 h-4" />
  </button>
</div>
        }
      />

      <div className="space-y-6">

       {/* Busca e Filtros */}
<div className="space-y-4">
  {/* Linha 1: Busca */}
  <div className="relative">
    <Search className="absolute left-3 top-3 w-5 h-5 text-white/40" />
    <Input
      placeholder="Buscar email..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/40"
    />
  </div>
  
  {/* Linha 2: Filtros */}
  <div className="flex flex-wrap gap-3">
    {/* Filtro Status */}
<div className="flex items-center gap-2">
  <label className="text-white/60 text-sm">Status:</label>
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-white/30 hover:bg-black/60 cursor-pointer"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
  >
    <option value="todos" style={{ backgroundColor: '#1a1a1a' }}>Todos</option>
    <option value="ativos" style={{ backgroundColor: '#1a1a1a' }}>✅ Ativos</option>
    <option value="expirados" style={{ backgroundColor: '#1a1a1a' }}>❌ Expirados</option>
    <option value="sem_conta" style={{ backgroundColor: '#1a1a1a' }}>⏸️ Sem conta</option>
    <option value="com_conta" style={{ backgroundColor: '#1a1a1a' }}>👤 Com conta</option>
    <option value="nao_confirmado" style={{ backgroundColor: '#1a1a1a' }}>📧 Não confirmado</option>
  </select>
</div>

{/* Filtro Período */}
<div className="flex items-center gap-2">
  <label className="text-white/60 text-sm">Acesso:</label>
  <select
    value={filterPeriodo}
    onChange={(e) => setFilterPeriodo(e.target.value)}
    className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-white/30 hover:bg-black/60 cursor-pointer"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
  >
    <option value="todos" style={{ backgroundColor: '#1a1a1a' }}>Todos</option>
    <option value="hoje" style={{ backgroundColor: '#1a1a1a' }}>Hoje</option>
    <option value="semana" style={{ backgroundColor: '#1a1a1a' }}>Esta semana</option>
    <option value="mes" style={{ backgroundColor: '#1a1a1a' }}>Este mês</option>
    <option value="inativo_30" style={{ backgroundColor: '#1a1a1a' }}>Inativo 30+ dias</option>
    <option value="inativo_60" style={{ backgroundColor: '#1a1a1a' }}>Inativo 60+ dias</option>
    <option value="nunca" style={{ backgroundColor: '#1a1a1a' }}>Nunca acessou</option>
  </select>
</div>

{/* Ordenação */}
<div className="flex items-center gap-2">
  <label className="text-white/60 text-sm">Ordenar:</label>
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-white/30 hover:bg-black/60 cursor-pointer"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
  >
    <option value="email" style={{ backgroundColor: '#1a1a1a' }}>Nome (A-Z)</option>
    <option value="email_desc" style={{ backgroundColor: '#1a1a1a' }}>Nome (Z-A)</option>
    <option value="expira" style={{ backgroundColor: '#1a1a1a' }}>Data expiração</option>
    <option value="acesso" style={{ backgroundColor: '#1a1a1a' }}>Último acesso</option>
    <option value="atividades" style={{ backgroundColor: '#1a1a1a' }}>Mais ativo</option>
  </select>
</div>

{/* Botão limpar filtros */}
{(filterStatus !== 'todos' || filterPeriodo !== 'todos' || search) && (
  <button
    onClick={() => {
      setFilterStatus('todos')
      setFilterPeriodo('todos')
      setSearch('')
    }}
    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all flex items-center gap-1"
  >
    <X className="w-3 h-3" />
    Limpar filtros
  </button>
)}

    {/* Contador de resultados */}
    <div className="flex items-center ml-auto">
      <span className="text-white/40 text-sm">
        {filteredAssinantes.length} de {assinantes.length} assinantes
      </span>
    </div>
  </div>
</div>

        {/* Form Adicionar */}
        {showAddForm && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Adicionar Novo Assinante</h3>
            <div className="flex gap-2">
              <Input
                placeholder="email@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-black/20 border-white/10 text-white"
              />
              <Input
                type="date"
                value={newExpires}
                onChange={(e) => setNewExpires(e.target.value)}
                className="bg-black/20 border-white/10 text-white"
              />
              <button
  onClick={handleAdd} 
  className="p-2 rounded-lg bg-green-600/20 border border-green-600/50 text-green-400 hover:bg-green-600/30 transition-all"
>
  <Check className="w-4 h-4" />
</button>
<button
  onClick={() => setShowAddForm(false)}
  className="p-2 rounded-lg bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
>
  <X className="w-4 h-4" />
</button>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
          {loading ? (
            <div className="p-8 text-center text-white/60">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
  <tr>
    <th className="text-left p-4 text-white/80 font-medium">Email</th>
    <th className="text-left p-4 text-white/80 font-medium">Expira em</th>
    <th className="text-left p-4 text-white/80 font-medium">Último Acesso</th>
    <th className="text-left p-4 text-white/80 font-medium">Status</th>
    <th className="text-left p-4 text-white/80 font-medium">Atividades</th>
    <th className="text-left p-4 text-white/80 font-medium">Ações</th>
  </tr>
</thead>
<tbody>
  {filteredAssinantes.map(assinante => {
    const expirado = new Date(assinante.expires_at) < hoje
    const [ano, mes, dia] = assinante.expires_at.split('-')
    const dataFormatada = `${dia}/${mes}/${ano}`
    
    // Formatar último acesso
    const formatarUltimoAcesso = () => {
      if (!assinante.ultimo_acesso) return 'Nunca'
      const data = new Date(assinante.ultimo_acesso)
      const agora = new Date()
      const diffHoras = (agora.getTime() - data.getTime()) / (1000 * 60 * 60)
      
      if (diffHoras < 1) return 'Agora mesmo'
      if (diffHoras < 24) return 'Hoje'
      if (diffHoras < 48) return 'Ontem'
      if (diffHoras < 168) return `${Math.floor(diffHoras / 24)} dias atrás`
      return data.toLocaleDateString('pt-BR')
    }
    
    // Determinar status
    const getStatus = () => {
      if (expirado) return <span className="text-red-400">❌ Expirado</span>
      if (!assinante.tem_conta) return <span className="text-yellow-400">⏸️ Sem conta</span>
      if (!assinante.email_confirmado) return <span className="text-orange-400">📧 Não confirmado</span>
      return <span className="text-green-400">✅ Ativo</span>
    }
    
    return (
      <tr key={assinante.id} className="border-t border-white/5 hover:bg-white/5">
        <td className="p-4">
          {editingId === assinante.id ? (
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="bg-black/20 border-white/10 text-white w-full"
            />
          ) : (
            <div>
              <span className="text-white/90">{assinante.email}</span>
              {assinante.notes === 'Admin' && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                  Admin
                </span>
              )}
            </div>
          )}
        </td>
        <td className="p-4">
          {editingId === assinante.id ? (
            <Input
              type="date"
              value={editExpires}
              onChange={(e) => setEditExpires(e.target.value)}
              className="bg-black/20 border-white/10 text-white w-40"
            />
          ) : (
            <span className="text-white/90">{dataFormatada}</span>
          )}
        </td>
        <td className="p-4 text-white/60 text-sm">
          {formatarUltimoAcesso()}
        </td>
        <td className="p-4">
          {getStatus()}
        </td>
        <td className="p-4 text-center">
          {assinante.tem_conta ? (
            <span className="text-white/60">{assinante.total_atividades || 0}</span>
          ) : (
            <span className="text-white/30">-</span>
          )}
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            {editingId === assinante.id ? (
              <>
                <button
                  onClick={() => handleUpdate(assinante.id)}
                  className="p-1.5 rounded-lg bg-green-600/20 border border-green-600/50 text-green-400 hover:bg-green-600/30 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(assinante.id)
                    setEditEmail(assinante.email)
                    setEditExpires(assinante.expires_at)
                  }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(assinante.id, assinante.email)}
                  className="p-1.5 rounded-lg bg-white/5 border border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50 transition-all"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    )
  })}
</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}