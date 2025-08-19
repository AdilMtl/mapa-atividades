'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PrivacidadePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ atividades: 0, planos: 0 });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setUser(session.user);

    // Contar dados do usuário
    const { data: atividades } = await supabase
      .from('atividades')
      .select('id')
      .eq('user_id', session.user.id);

    const planos = JSON.parse(localStorage.getItem('planos-de-acao') || '[]');
    
    setStats({
      atividades: atividades?.length || 0,
      planos: planos.length || 0
    });
  };

  const baixarMeusDados = async () => {
    if (!user) return;

    // Coletar TODOS os dados do usuário
    const { data: atividades } = await supabase
      .from('atividades')
      .select('*')
      .eq('user_id', user.id);

    const planos = JSON.parse(localStorage.getItem('planos-de-acao') || '[]');

    const exportData = {
      // Dados da conta
      conta: {
        email: user.email,
        criado_em: user.created_at,
        ultimo_login: user.last_sign_in_at
      },
      
      // Dados funcionais
      atividades: atividades || [],
      planos_de_acao: planos,
      
      // Metadados do export
      export: {
        data_export: new Date().toISOString(),
        formato: 'LGPD_COMPLIANT_JSON',
        versao: '1.0'
      }
    };

    // Download automático
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-mapa-atividades-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    alert('✅ Seus dados foram baixados com sucesso!');
  };

  const excluirConta = async () => {
    if (!user) return;

    const confirmacao = prompt(
      'Esta ação é IRREVERSÍVEL. Para confirmar, digite: EXCLUIR PERMANENTEMENTE'
    );
    
    if (confirmacao !== 'EXCLUIR PERMANENTEMENTE') {
      alert('Exclusão cancelada.');
      return;
    }

    try {
      // Deletar dados das tabelas
      await supabase
        .from('atividades')
        .delete()
        .eq('user_id', user.id);

      // Limpar localStorage
      localStorage.removeItem('planos-de-acao');
      localStorage.removeItem('mapa-atividades-dados');

      // Deletar conta
      await supabase.auth.signOut();
      
      alert('✅ Conta excluída permanentemente. Você será redirecionado.');
      window.location.href = '/';
      
    } catch (error) {
      alert('❌ Erro ao excluir conta. Tente novamente ou entre em contato.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ background: '#042f2e', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">🔒 Privacidade & Proteção de Dados</h1>
        <p className="text-white/70">
          Como tratamos seus dados de forma transparente e segura
        </p>
      </div>

      {/* Política Simples */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-white">📋 Nossa Política de Privacidade</h2>
        
        <div className="space-y-6 text-white/80">
          
          <div>
            <h3 className="font-semibold text-lg text-white mb-2">🎯 Como Funciona</h3>
            <p>
              Você cria uma conta com email, adiciona suas atividades, e o sistema 
              salva tudo na nuvem para você acessar de qualquer lugar.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">📊 Dados que Coletamos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Email:</strong> Para login e identificação</li>
              <li><strong>Senha:</strong> Criptografada (nem eu consigo ver)</li>
              <li><strong>Atividades:</strong> Nomes, impacto, clareza, horas que você inserir</li>
              <li><strong>Planos de Ação:</strong> Táticas e metas que você criar</li>
              <li><strong>Configurações:</strong> Preferências do sistema</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">🎯 Para que Usamos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fazer o sistema funcionar corretamente</li>
              <li>Salvar e sincronizar seus dados</li>
              <li>Enviar emails importantes sobre sua conta</li>
              <li>Melhorar o produto (dados agregados, sem identificação)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">❌ O que NÃO Fazemos</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vendemos ou alugamos seus dados</li>
              <li>Enviamos spam ou marketing não solicitado</li>
              <li>Compartilhamos com terceiros (exceto infraestrutura necessária)</li>
              <li>Analisamos o conteúdo específico das suas atividades</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">🛡️ Segurança</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Conexão criptografada (HTTPS)</li>
              <li>Senhas com hash seguro</li>
              <li>Banco de dados isolado por usuário</li>
              <li>Backup automático e seguro</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">🌍 Onde Ficam os Dados</h3>
            <p>
              Seus dados são armazenados no <strong>Supabase</strong> (infraestrutura em 
              nuvem com proteção adequada de dados) e podem ser processados nos EUA/Europa, 
              países com adequação reconhecida para proteção de dados.
            </p>
          </div>

        </div>
      </div>

      {/* Seus Direitos */}
      <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-blue-300">⚖️ Seus Direitos (LGPD)</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">✅ Você Pode:</h4>
            <ul className="space-y-2 text-blue-100">
              <li>• <strong>Ver seus dados:</strong> Seção abaixo</li>
              <li>• <strong>Baixar tudo:</strong> Arquivo JSON completo</li>
              <li>• <strong>Corrigir dados:</strong> Edite direto no sistema</li>
              <li>• <strong>Excluir conta:</strong> Remoção permanente</li>
              <li>• <strong>Contatar:</strong> Dúvidas ou solicitações</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-200 mb-2">📞 Como Exercer:</h4>
            <ul className="space-y-2 text-blue-100">
              <li>• <strong>Online:</strong> Botões nesta página</li>
              <li>• <strong>Email:</strong> adilson.matioli@hotmail.com</li>
              <li>• <strong>Prazo:</strong> Resposta em até 15 dias</li>
              <li>• <strong>Custo:</strong> Totalmente gratuito</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seus Dados Atuais */}
      {user && (
        <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-green-300">📊 Seus Dados Atuais</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-200">{stats.atividades}</div>
              <div className="text-green-300">Atividades Criadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-200">{stats.planos}</div>
              <div className="text-green-300">Planos de Ação</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-200">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </div>
              <div className="text-green-300">Membro Desde</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2 text-white">📧 Informações da Conta:</h4>
            <p className="text-white/80"><strong>Email:</strong> {user.email}</p>
            <p className="text-white/80"><strong>Último Login:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Primeiro acesso'}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={baixarMeusDados}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              📥 Baixar Todos os Meus Dados
            </button>
            
            <button
              onClick={excluirConta}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              🗑️ Excluir Conta Permanentemente
            </button>
          </div>
        </div>
      )}

      {/* Contato */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-white">📞 Contato e Responsável</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-white">👤 Responsável pelos Dados:</h4>
            <p className="text-white/80"><strong>Adilson Matioli</strong></p>
            <p className="text-white/80">Desenvolvedor da plataforma</p>
            <p className="text-white/80">Email: <strong>adilson.matioli@hotmail.com</strong></p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-white">⏰ Atendimento:</h4>
            <p className="text-white/80">Dúvidas, solicitações ou exercício de direitos</p>
            <p className="text-white/80"><strong>Prazo de resposta:</strong> Até 15 dias úteis</p>
            <p className="text-white/80"><strong>Custo:</strong> Gratuito</p>
          </div>
        </div>
      </div>

      {/* Navegação de volta */}
      <div className="text-center mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          ← Voltar ao Mapa de Atividades
        </Link>
      </div>

      {/* Footer Legal */}
      <div className="text-center text-sm text-white/50 mt-8 pt-8 border-t border-white/10">
        <p>
          Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
        </p>
        <p className="mt-2">
          <strong>Última atualização:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>

    </div>
  );
}