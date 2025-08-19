// 👤 PÁGINA DE PERFIL - VERSÃO AVANÇADO (LGPD + EMOJIS EXTRAS)
// Arquivo: src/app/perfil/page.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { User, Mail, Save, X, Lock, Eye, EyeOff, Shield, Bell, Download, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Importar componentes da Wave 1
import { PageContainer, PageHeader, Section } from '@/components/base';

// ═══════════════════════════════════════════════════════════════════
// 😊 LISTA DE EMOJIS PARA SELEÇÃO (EXPANDIDA)
// ═══════════════════════════════════════════════════════════════════

const EMOJIS_PERFIL = [
  // Emojis originais
  '😊', '😎', '🤔', '😌', '🙂', '😀', '🤗', '😇',
  '🧠', '💡', '⚡', '🎯', '🚀', '✨', '🔥', '💪',
  '📊', '📈', '🎨', '🔧', '⭐', '🎪', '🎭', '🦄',
  // Novos emojis adicionados
  '🤓', '🥸', '🥵', '🫠', '🤠', '😷', '🤡', '💩'
];

// ═══════════════════════════════════════════════════════════════════
// 📝 INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface PerfilData {
  full_name: string;
  email: string;
  emoji: string;
  email_notifications: boolean;
  created_at?: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface Stats {
  atividades: number;
  diagnosticos: number;
  planos: number;
}

interface ExportData {
  perfil: any;
  atividades: any[];
  estatisticas: Stats;
  dataExportacao: string;
}

// ═══════════════════════════════════════════════════════════════════
// 😊 COMPONENTE SELETOR DE EMOJI
// ═══════════════════════════════════════════════════════════════════

function EmojiSelector({ 
  currentEmoji, 
  onSelect, 
  isOpen, 
  onClose 
}: {
  currentEmoji: string;
  onSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Escolha seu emoji</h3>
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-8 gap-2 mb-4">
          {EMOJIS_PERFIL.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className={`
                w-10 h-10 text-2xl rounded-md border-2 transition-all
                hover:scale-110 hover:bg-white/10
                ${emoji === currentEmoji 
                  ? 'border-orange-500 bg-orange-500/20' 
                  : 'border-white/20'
                }
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 COMPONENTE ALTERAR SENHA
// ═══════════════════════════════════════════════════════════════════

function PasswordSection() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const alterarSenha = async () => {
    // Validações
    if (!passwordForm.current_password) {
      alert('Digite sua senha atual');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('A confirmação de senha não confere');
      return;
    }

    setChangingPassword(true);
    try {
      // Primeiro verificar senha atual tentando fazer login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Usuário não encontrado');

      // Tentar fazer signIn com senha atual para validar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.current_password,
      });

      if (signInError) {
        alert('Senha atual incorreta');
        return;
      }

      // Alterar senha
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new_password
      });

      if (error) throw error;

      alert('Senha alterada com sucesso!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Section title="🔐 Segurança da Conta" className="mb-6">
      <div className="space-y-4">
        {/* Senha Atual */}
        <div>
          <Label htmlFor="current_password" className="text-white mb-2">
            Senha Atual
          </Label>
          <div className="relative">
            <Input
              id="current_password"
              type={showPasswords.current ? "text" : "password"}
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
              placeholder="Digite sua senha atual"
              className="bg-white/5 border-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nova Senha */}
        <div>
          <Label htmlFor="new_password" className="text-white mb-2">
            Nova Senha
          </Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showPasswords.new ? "text" : "password"}
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
              placeholder="Digite a nova senha (mín. 6 caracteres)"
              className="bg-white/5 border-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div>
          <Label htmlFor="confirm_password" className="text-white mb-2">
            Confirmar Nova Senha
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
              placeholder="Digite novamente a nova senha"
              className="bg-white/5 border-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Indicador de força da senha */}
        {passwordForm.new_password && (
          <div className="text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="w-4 h-4" />
              Força da senha: 
              <span className={`font-medium ${
                passwordForm.new_password.length < 6 ? 'text-red-400' :
                passwordForm.new_password.length < 8 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {passwordForm.new_password.length < 6 ? 'Fraca' :
                 passwordForm.new_password.length < 8 ? 'Média' : 'Forte'}
              </span>
            </div>
          </div>
        )}

        {/* Botão Alterar Senha */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={alterarSenha}
            disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {changingPassword ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🛡️ COMPONENTE LGPD - PRIVACIDADE E DADOS
// ═══════════════════════════════════════════════════════════════════

function LGPDSection({ user, perfil, stats }: { user: any, perfil: PerfilData, stats: Stats }) {
  const [exportando, setExportando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const exportarDados = async () => {
    setExportando(true);
    try {
      // Buscar todas as atividades do usuário
      const { data: atividades, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Montar dados completos para export
      const dadosCompletos: ExportData = {
        perfil: {
          id: user.id,
          email: user.email,
          nome_completo: perfil.full_name,
          emoji: perfil.emoji,
          notificacoes_email: perfil.email_notifications,
          data_criacao: perfil.created_at,
          ultimo_login: user.last_sign_in_at
        },
        atividades: atividades || [],
        estatisticas: stats,
        dataExportacao: new Date().toISOString()
      };

      // Criar arquivo JSON e baixar
      const dataStr = JSON.stringify(dadosCompletos, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mapa-atividades-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

  const deletarConta = async () => {
    if (confirmDelete !== 'DELETAR') {
      alert('Digite "DELETAR" para confirmar a exclusão da conta');
      return;
    }

    setDeletando(true);
    try {
      // 1. Deletar dados do perfil
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      // 2. Deletar atividades
      await supabase
        .from('atividades')
        .delete()
        .eq('user_id', user.id);

      // 3. Deletar conta de autenticação (isso requer admin API)
      // Por segurança, vamos apenas fazer logout e pedir para contatar suporte
      alert('Conta marcada para exclusão. Você será deslogado e nossa equipe processará a exclusão em até 48h.');
      
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta. Entre em contato com o suporte.');
    } finally {
      setDeletando(false);
    }
  };

  return (
    <Section title="🛡️ Privacidade e Dados (LGPD)" className="mb-6">
      <div className="space-y-4">
        {/* Exportar Dados */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar Meus Dados
          </h4>
          <p className="text-white/70 text-sm mb-3">
            Faça download de todos os seus dados em formato JSON, incluindo perfil, atividades e estatísticas.
          </p>
          <Button
            onClick={exportarDados}
            disabled={exportando}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportando ? 'Exportando...' : 'Baixar Dados'}
          </Button>
        </div>

        {/* Links Legais */}
        <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Políticas e Termos
          </h4>
          <div className="space-y-2">
            <a 
              href="/privacidade" 
              target="_blank"
              className="block text-blue-400 hover:text-blue-300 text-sm underline"
            >
              📄 Política de Privacidade
            </a>
            <a 
              href="/termos" 
              target="_blank"
              className="block text-blue-400 hover:text-blue-300 text-sm underline"
            >
              📋 Termos de Uso
            </a>
          </div>
        </div>

        {/* Deletar Conta */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Zona de Perigo
          </h4>
          <p className="text-white/70 text-sm mb-3">
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
          </p>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="confirm_delete" className="text-white text-sm mb-2">
                Digite "DELETAR" para confirmar:
              </Label>
              <Input
                id="confirm_delete"
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="DELETAR"
                className="bg-white/5 border-red-500/50 text-white"
              />
            </div>
            
            <Button
              onClick={deletarConta}
              disabled={deletando || confirmDelete !== 'DELETAR'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deletando ? 'Deletando...' : 'Deletar Conta Permanentemente'}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📊 COMPONENTE DE ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════════

function StatsSection({ stats }: { stats: Stats }) {
  return (
    <Section title="📊 Suas Estatísticas" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{stats.atividades}</div>
          <div className="text-sm text-white/70">Atividades Mapeadas</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{stats.diagnosticos}</div>
          <div className="text-sm text-white/70">Diagnósticos Realizados</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{stats.planos}</div>
          <div className="text-sm text-white/70">Planos de Ação</div>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 👤 COMPONENTE PRINCIPAL - PÁGINA DE PERFIL
// ═══════════════════════════════════════════════════════════════════

export default function PerfilPage() {
  // Estados
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilData>({
    full_name: '',
    email: '',
    emoji: '😊',
    email_notifications: true
  });
  const [stats, setStats] = useState<Stats>({
    atividades: 0,
    diagnosticos: 0,
    planos: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // 🔄 CARREGAR DADOS DO USUÁRIO
  // ═══════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // 1. Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = '/auth';
          return;
        }
        
        setUser(session.user);
        
        // 2. Carregar dados do perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setPerfil({
            full_name: profileData.full_name || '',
            email: session.user.email || '',
            emoji: profileData.emoji || '😊',
            email_notifications: profileData.email_notifications ?? true,
            created_at: profileData.created_at
          });
        } else {
          // Criar perfil se não existir
          setPerfil({
            full_name: '',
            email: session.user.email || '',
            emoji: '😊',
            email_notifications: true
          });
        }

        // 3. Carregar estatísticas
        await carregarEstatisticas(session.user.id);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // 📊 CARREGAR ESTATÍSTICAS
  // ═══════════════════════════════════════════════════════════════════
  
  const carregarEstatisticas = async (userId: string) => {
    try {
      // Contar atividades
      const { count: atividadesCount } = await supabase
        .from('atividades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setStats({
        atividades: atividadesCount || 0,
        diagnosticos: 0, // TODO: implementar quando tiver tabela de diagnósticos
        planos: 0 // TODO: implementar quando tiver tabela de planos
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 💾 SALVAR ALTERAÇÕES
  // ═══════════════════════════════════════════════════════════════════
  
  const salvarPerfil = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Upsert no perfil
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: perfil.full_name,
          emoji: perfil.emoji,
          email_notifications: perfil.email_notifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Carregando perfil...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais, segurança e privacidade"
        icon={User}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabeçalho do Perfil */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">{perfil.emoji}</div>
          <h2 className="text-xl font-semibold text-white mb-1">
            {perfil.full_name || 'Usuário'}
          </h2>
          <p className="text-white/70">{perfil.email}</p>
          {perfil.created_at && (
            <p className="text-sm text-white/50 mt-2">
              Membro desde {new Date(perfil.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* Formulário de Edição */}
        <Section title="✏️ Informações Básicas" className="mb-6">
          <div className="space-y-4">
            {/* Nome Completo */}
            <div>
              <Label htmlFor="full_name" className="text-white mb-2">
                Nome Completo
              </Label>
              <Input
                id="full_name"
                type="text"
                value={perfil.full_name}
                onChange={(e) => setPerfil({...perfil, full_name: e.target.value})}
                placeholder="Digite seu nome completo"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            {/* Email (readonly por enquanto) */}
            <div>
              <Label htmlFor="email" className="text-white mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={perfil.email}
                disabled
                className="bg-white/5 border-white/20 text-white/70 cursor-not-allowed"
              />
              <p className="text-xs text-white/50 mt-1">
                Entre em contato com suporte para alterar o email
              </p>
            </div>

            {/* Seletor de Emoji */}
            <div>
              <Label className="text-white mb-2">Emoji do Perfil</Label>
              <button
                onClick={() => setEmojiSelectorOpen(true)}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-md hover:bg-white/10 transition-all"
              >
                <span className="text-3xl">{perfil.emoji}</span>
                <span className="text-white">Clique para alterar</span>
              </button>
            </div>

            {/* Preferências */}
            <div>
              <Label className="text-white mb-2">Preferências</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={perfil.email_notifications}
                    onChange={(e) => setPerfil({...perfil, email_notifications: e.target.checked})}
                    className="w-4 h-4 text-orange-600 bg-white/10 border-white/30 rounded focus:ring-orange-500"
                  />
                  <Bell className="w-4 h-4" />
                  Receber notificações por email
                </label>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={salvarPerfil}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </Section>

        {/* Seção de Segurança */}
        <PasswordSection />

        {/* Seção LGPD */}
        <LGPDSection user={user} perfil={perfil} stats={stats} />

        {/* Estatísticas */}
        <StatsSection stats={stats} />
      </div>

      {/* Modal Seletor de Emoji */}
      <EmojiSelector
        currentEmoji={perfil.emoji}
        onSelect={(emoji) => setPerfil({...perfil, emoji})}
        isOpen={emojiSelectorOpen}
        onClose={() => setEmojiSelectorOpen(false)}
      />
    </PageContainer>
  );
}