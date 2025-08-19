// 📄 MODAL DE TERMOS DE USO - COMPONENTE POPUP
// Arquivo: src/components/TermosModal.tsx

'use client'
import React from 'react';
import { X, FileText, Shield, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════════
// 📄 COMPONENTE MODAL DE TERMOS DE USO
// ═══════════════════════════════════════════════════════════════════

interface TermosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermosModal({ isOpen, onClose }: TermosModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Termos de Uso</h2>
          </div>
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6 text-white/80">
            
            {/* Informações Gerais */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Informações Importantes
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Última atualização:</strong><br />
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <strong>Vigência:</strong><br />
                  A partir da data de aceite
                </div>
                <div>
                  <strong>Aplicabilidade:</strong><br />
                  Todos os usuários
                </div>
              </div>
            </div>

            {/* 1. Aceitação dos Termos */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">1. 📋 Aceitação dos Termos</h3>
              <p className="mb-3">
                Ao acessar e usar o <strong>Mapa de Atividades</strong>, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-sm">
                  <strong>💡 Em resumo:</strong> Usar nosso app significa que você aceita estas regras. 
                  É como um "contrato digital" entre nós.
                </p>
              </div>
            </div>

            {/* 2. Descrição do Serviço */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">2. 🎯 O que é o Mapa de Atividades</h3>
              <p className="mb-3">O Mapa de Atividades é uma ferramenta digital que ajuda você a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                <li>Mapear suas atividades em uma matriz de Impacto × Clareza</li>
                <li>Gerar diagnósticos automáticos sobre seu foco</li>
                <li>Criar planos de ação personalizados</li>
                <li>Acompanhar sua evolução ao longo do tempo</li>
              </ul>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                  <strong>Nosso compromisso:</strong> Fornecer uma ferramenta gratuita, segura e eficaz 
                  para otimização de produtividade pessoal.
                </p>
              </div>
            </div>

            {/* 3. Responsabilidades do Usuário */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">3. 👤 Suas Responsabilidades</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">✅ O que PODE fazer:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Usar para fins pessoais ou profissionais</li>
                    <li>• Mapear suas atividades reais</li>
                    <li>• Exportar seus próprios dados</li>
                    <li>• Compartilhar insights gerados</li>
                  </ul>
                </div>
                
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">❌ O que NÃO PODE fazer:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tentar hackear ou quebrar o sistema</li>
                    <li>• Criar múltiplas contas falsas</li>
                    <li>• Usar para atividades ilegais</li>
                    <li>• Revender acesso ao serviço</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <strong>Importante:</strong> Você é responsável por manter sua senha segura e 
                  por todas as atividades que ocorrem em sua conta.
                </p>
              </div>
            </div>

            {/* 4. Propriedade Intelectual */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">4. 💡 Propriedade Intelectual</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-white mb-2">🏢 O que é nosso:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Design e interface do app</li>
                    <li>• Algoritmos de diagnóstico</li>
                    <li>• Metodologia do mapa</li>
                    <li>• Código fonte e tecnologia</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-2">👤 O que é seu:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Suas atividades mapeadas</li>
                    <li>• Dados pessoais inseridos</li>
                    <li>• Planos de ação criados</li>
                    <li>• Insights e resultados</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm">
                <strong>Regra simples:</strong> Você pode usar livremente seus dados, mas não pode 
                copiar ou reproduzir nossa tecnologia.
              </p>
            </div>

            {/* 5. Privacidade */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">5. 🔒 Privacidade e Proteção de Dados</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">✅ Como protegemos você:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Criptografia de dados</li>
                    <li>• Isolamento por usuário (RLS)</li>
                    <li>• Servidores seguros</li>
                    <li>• Conformidade com LGPD</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">📊 Como usamos dados:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Gerar seus diagnósticos</li>
                    <li>• Melhorar o algoritmo</li>
                    <li>• Estatísticas anônimas</li>
                    <li>• Suporte técnico</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm">
                Para detalhes completos, consulte nossa Política de Privacidade.
              </p>
            </div>

            {/* 6. Limitação de Responsabilidade */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">6. ⚖️ Limitações e Responsabilidades</h3>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Importante entender:
                </h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <strong>• Ferramenta de apoio:</strong> O Mapa de Atividades é uma ferramenta 
                    de produtividade, não um conselho profissional.
                  </li>
                  <li>
                    <strong>• Decisões suas:</strong> Você é responsável pelas decisões baseadas 
                    nos insights gerados.
                  </li>
                  <li>
                    <strong>• Sem garantias:</strong> Não garantimos resultados específicos de 
                    produtividade ou sucesso.
                  </li>
                  <li>
                    <strong>• Uso por sua conta:</strong> Use com bom senso e de acordo com 
                    sua realidade.
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. Contato */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">7. 📞 Contato e Suporte</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-1">📧 Para dúvidas gerais:</h4>
                  <p className="text-sm">suporte@mapaatividades.com</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-1">🔒 Para questões de privacidade:</h4>
                  <p className="text-sm">privacidade@mapaatividades.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-white/70">
              <strong>Termos de Uso - Mapa de Atividades</strong><br />
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={onClose}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Entendi, Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}