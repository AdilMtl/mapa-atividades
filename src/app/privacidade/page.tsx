// 🛡️ PÁGINA DE PRIVACIDADE ATUALIZADA - COM MODAL DE TERMOS
// Arquivo: src/app/privacidade/page.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, FileText, ArrowLeft, AlertTriangle, Check, Lock, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// Importar componentes da Wave 1
import { PageContainer, PageHeader, Section } from '@/components/base';

// Importar o modal de termos
import { TermosModal } from '@/components/TermosModal';

// ═══════════════════════════════════════════════════════════════════
// 🛡️ COMPONENTE PRINCIPAL - PRIVACIDADE E DADOS
// ═══════════════════════════════════════════════════════════════════

export default function PrivacidadePage() {
  const [user, setUser] = useState<any>(null);
  const [termosModalOpen, setTermosModalOpen] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const carregarUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    carregarUsuario();
  }, []);

  // Função de exportar dados
  const exportarDados = async () => {
    if (!user) return;
    
    setExportando(true);
    try {
      // Buscar dados do usuário
      const { data: perfil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: atividades } = await supabase
        .from('atividades')
        .select('*')
        .eq('user_id', user.id);

      // Montar dados completos
      const dadosCompletos = {
        usuario: {
          id: user.id,
          email: user.email,
          criado_em: user.created_at,
          ultimo_login: user.last_sign_in_at
        },
        perfil: perfil || {},
        atividades: atividades || [],
        data_exportacao: new Date().toISOString()
      };

      // Criar e baixar arquivo
      const dataStr = JSON.stringify(dadosCompletos, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-dados-mapa-atividades-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <PageContainer>
      <PageHeader
        title="Privacidade e Dados"
        subtitle="Como protegemos e utilizamos suas informações pessoais"
        icon={Shield}
        action={
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Seção de Links Legais */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos Legais
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setTermosModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Termos de Uso
            </Button>
            <p className="text-white/70 text-sm flex items-center">
              Consulte nossos termos e condições de uso do sistema
            </p>
          </div>
        </div>

        {/* Informações Coletadas */}
        <Section title="📊 Quais Dados Coletamos">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Dados Pessoais
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• Email para autenticação</li>
                <li>• Nome completo (opcional)</li>
                <li>• Emoji de perfil escolhido</li>
                <li>• Preferências de notificação</li>
                <li>• Data de criação da conta</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Dados de Uso
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li>• Atividades que você mapeia</li>
                <li>• Diagnósticos gerados</li>
                <li>• Planos de ação criados</li>
                <li>• Estatísticas de uso</li>
                <li>• Logs de acesso (segurança)</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Como Protegemos */}
        <Section title="🔒 Como Protegemos Seus Dados">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-2">Criptografia</h4>
              <p className="text-white/70 text-sm">
                Todos os dados são criptografados em trânsito e em repouso
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-2">RLS (Row Level Security)</h4>
              <p className="text-white/70 text-sm">
                Cada usuário só acessa seus próprios dados
              </p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-2">LGPD Compliance</h4>
              <p className="text-white/70 text-sm">
                Conformidade total com a Lei Geral de Proteção de Dados
              </p>
            </div>
          </div>
        </Section>

        {/* Como Usamos */}
        <Section title="🎯 Como Usamos Seus Dados">
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">✅ Finalidades Legítimas:</h4>
              <ul className="text-white/80 text-sm space-y-1 ml-4">
                <li>• Gerar seus diagnósticos personalizados</li>
                <li>• Criar sugestões de planos de ação</li>
                <li>• Melhorar algoritmos (dados anônimos)</li>
                <li>• Fornecer suporte técnico quando solicitado</li>
                <li>• Garantir segurança e prevenir fraudes</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">❌ Nunca Fazemos:</h4>
              <ul className="text-white/80 text-sm space-y-1 ml-4">
                <li>• Vender seus dados para terceiros</li>
                <li>• Usar para publicidade direcionada</li>
                <li>• Compartilhar sem sua autorização</li>
                <li>• Acessar dados para fins pessoais</li>
                <li>• Armazenar além do necessário</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Seus Direitos LGPD */}
        <Section title="⚖️ Seus Direitos (LGPD)">
          <div className="space-y-4">
            <p className="text-white/80">
              Conforme a Lei Geral de Proteção de Dados, você tem os seguintes direitos:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">📥 Portabilidade</h4>
                  <p className="text-white/70 text-xs">Baixar todos os seus dados</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">🗑️ Exclusão</h4>
                  <p className="text-white/70 text-xs">Deletar sua conta e dados</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">✏️ Retificação</h4>
                  <p className="text-white/70 text-xs">Corrigir dados incorretos</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">👁️ Acesso</h4>
                  <p className="text-white/70 text-xs">Ver quais dados temos</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">🛑 Oposição</h4>
                  <p className="text-white/70 text-xs">Contestar o tratamento</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm mb-1">ℹ️ Informação</h4>
                  <p className="text-white/70 text-xs">Saber como usamos</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Ações Práticas */}
        <Section title="🔧 Exercer Seus Direitos">
          <div className="space-y-4">
            {user ? (
              <>
                {/* Para usuários logados */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">📥 Baixar Seus Dados (Portabilidade)</h4>
                  <p className="text-white/70 text-sm mb-4">
                    Faça download de todos os seus dados em formato JSON, incluindo perfil, atividades e estatísticas.
                  </p>
                  <Button
                    onClick={exportarDados}
                    disabled={exportando}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportando ? 'Exportando...' : 'Baixar Meus Dados'}
                  </Button>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">🗑️ Deletar Conta e Dados</h4>
                  <p className="text-white/70 text-sm mb-4">
                    Para deletar permanentemente sua conta e todos os dados, acesse a página de perfil.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/perfil'}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Ir para Perfil → Deletar Conta
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">🔐 Faça Login para Acessar Suas Opções</h4>
                <p className="text-white/70 text-sm mb-3">
                  Para exercer seus direitos LGPD, você precisa estar logado na sua conta.
                </p>
                <Button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fazer Login
                </Button>
              </div>
            )}
          </div>
        </Section>

        {/* Contato */}
        <Section title="📞 Contato para Questões de Privacidade">
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">
                📧 Encarregado de Proteção de Dados
              </h4>
              <p className="text-white/80 text-sm mb-2">
                Para questões específicas sobre privacidade e LGPD:
              </p>
              <p className="text-blue-400">privacidade@mapaatividades.com</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">⏱️ Prazo de Resposta</h4>
              <p className="text-white/80 text-sm">
                Respondemos solicitações LGPD em até <strong>15 dias úteis</strong>, 
                conforme estabelecido na legislação.
              </p>
            </div>
          </div>
        </Section>

        {/* Atualizações */}
        <Section title="📅 Atualizações desta Política">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/80 text-sm">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}<br />
              <strong>Versão:</strong> 1.0<br />
              <strong>Próxima revisão:</strong> {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-white/70 text-xs mt-3">
              Quando houver alterações significativas nesta política, você será notificado 
              por email ou através do sistema.
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <div className="text-white/70 space-y-2">
            <p className="text-lg font-medium text-white">
              🛡️ Política de Privacidade - Mapa de Atividades
            </p>
            <p className="text-sm">
              Comprometidos com a proteção dos seus dados pessoais
            </p>
            <p className="text-xs">
              © 2025 Mapa de Atividades - Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => setTermosModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver Termos de Uso
          </Button>
        </div>
      </div>

      {/* Modal de Termos */}
      <TermosModal 
        isOpen={termosModalOpen} 
        onClose={() => setTermosModalOpen(false)} 
      />
    </PageContainer>
  );
}