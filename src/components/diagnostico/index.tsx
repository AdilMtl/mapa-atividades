// 🔧 CORREÇÃO DO LAYOUT RESPONSIVO - DIAGNÓSTICO
// Arquivo: src/components/diagnostico/index.tsx

'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  BarChart3,
  ChevronDown,
  HelpCircle,
  Share2,
  TrendingUp,
  Target
} from 'lucide-react';
import { getCenarioColor, getCenarioIcon } from '@/lib/diagnostico-engine';
import jsPDF from 'jspdf';
import { PageContainer, PageHeader } from '@/components/base';

// ═══════════════════════════════════════════════════════════════════
// 🎯 HEADER DO DIAGNÓSTICO - RESPONSIVO
// ═══════════════════════════════════════════════════════════════════

// 🎯 HEADER DO DIAGNÓSTICO COM FLUXO - SUBSTITUI O ATUAL
// Substitua o DiagnosticoHeader existente por esta versão

export function DiagnosticoHeader({ totalAtividades, onVoltar }: {
  totalAtividades: number;
  onVoltar: () => void;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Header Principal */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        
        {/* Lado Esquerdo - Título + Avatar */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Diagnóstico do Foco
            </h1>
            <p className="text-sm sm:text-base text-white/70">
              Análise automática de {totalAtividades} atividades mapeadas
            </p>
          </div>
        </div>

        {/* Lado Direito - Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button 
            onClick={onVoltar}
            variant="outline"
            className="w-full sm:w-auto border-white/20 hover:bg-white/10 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Mapa
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/plano-acao'}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Ver Plano de Ação
          </Button>
        </div>
      </div>

      {/* Fluxo ROI do Foco */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
        
        {/* Título do Fluxo */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Fluxo ROI do Foco
          </h2>
          <span className="text-xs sm:text-sm text-white/60 hidden sm:block">
            Siga os 3 passos
          </span>
        </div>

        {/* Steps do Fluxo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          
          {/* Step 1 - Mapear (Completo) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-400">1. Mapear</span>
                <CheckCircle2 className="w-3 h-3 text-green-400" />
              </div>
              <p className="text-xs text-white/60">Atividades na matriz</p>
            </div>
          </div>

          {/* Seta 1 */}
          <div className="hidden sm:block text-white/40">→</div>

          {/* Step 2 - Diagnosticar (ATIVO) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent">
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-orange-400">2. Diagnosticar</span>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-white/60">Análise do foco</p>
            </div>
          </div>

          {/* Seta 2 */}
          <div className="hidden sm:block text-white/40">→</div>

          {/* Step 3 - Executar (Pendente) */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white/60">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white/60">3. Executar</span>
              </div>
              <p className="text-xs text-white/60">Plano de ação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}     

// ═══════════════════════════════════════════════════════════════════
// 📊 CARD MIX DE ZONAS - TOTALMENTE RESPONSIVO
// ═══════════════════════════════════════════════════════════════════
export function MixZonasCard({ zonas, cenario, cenarioColor, cenarioIcon }: {
  zonas: Array<{nome: string; valor: number; cor: string; meta: string}>;
  cenario: string;
  cenarioColor: string;
  cenarioIcon: string;
}) {
  return (
    <Card className="glass border-0 mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">
            Distribuição do Seu Tempo
          </CardTitle>
          <span 
            style={{ 
              backgroundColor: cenarioColor + '20', 
              color: cenarioColor,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}
            className="self-start sm:self-auto"
          >
            {cenarioIcon} {cenario.charAt(0).toUpperCase() + cenario.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* GRID RESPONSIVO - A CHAVE DA CORREÇÃO */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* VERIFICAÇÃO DE SEGURANÇA */}
          {zonas && zonas.length > 0 ? zonas.map((zona, idx) => (
            <div key={idx} className="space-y-2">
              {/* Linha com nome e porcentagem */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium flex items-center">
                  <span 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2"
                    style={{ backgroundColor: zona.cor }}
                  />
                  {zona.nome}
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  {zona.valor}%
                </span>
              </div>
              
              {/* Barra de progresso responsiva */}
              <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${zona.valor}%`,
                    backgroundColor: zona.cor
                  }}
                />
              </div>
              
              {/* Meta (apenas em telas maiores para não poluir) */}
              <div className="hidden sm:block text-xs text-white/60">
                Meta: {zona.meta}
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-white/60">
              <p>Carregando distribuição...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📄 VISUALIZAÇÃO DO RELATÓRIO - VERSÃO PROFISSIONAL MELHORADA
// ═══════════════════════════════════════════════════════════════════

export function RelatorioView({ 
  relatorioHtml, 
  onExportPdf, 
  onExportJson, 
  isGenerating = false,
  dadosUsuario,
  resultado 
}: {
  relatorioHtml: string;
  onExportPdf: () => void;
  onExportJson: () => void;
  isGenerating?: boolean;
  dadosUsuario?: { nome?: string; email?: string };
  resultado?: any;
}) {
  // ✅ ESTADOS E FUNÇÕES DENTRO DA FUNÇÃO:
  const [dropdownAberto, setDropdownAberto] = useState(false);
  
  // ✅ FUNÇÃO COPIAR TEXTO:
  const copiarTexto = () => {
    const textoSimples = relatorioHtml.replace(/<[^>]*>/g, ''); // Remove HTML
    navigator.clipboard.writeText(`
🎯 DIAGNÓSTICO DO FOCO

Data: ${new Date().toLocaleDateString('pt-BR')}
${textoSimples}

Gerado pelo Mapa de Atividades
`).then(() => {
      alert('Texto copiado! Cole onde precisar (Ctrl+V)');
      setDropdownAberto(false);
    }).catch(() => {
      alert('Erro ao copiar. Tente novamente.');
    });
  };
  

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const nomeUsuario = dadosUsuario?.nome || 'Usuário';
  
  // ✅ ADICIONAR STATUS DO CENÁRIO
  const getStatusCenario = (cenario: string) => {
    switch(cenario) {
      case 'critico': return { texto: 'Crítico', cor: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/20' };
      case 'ajustes': return { texto: 'Necessita Ajustes', cor: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/20' };
      case 'saudavel': return { texto: 'Saudável', cor: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-400/20' };
      default: return { texto: 'Indefinido', cor: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-400/20' };
    }
  };

  const statusCenario = getStatusCenario(resultado?.cenario || '');

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          {/* ✅ Header com Emoji */}
<div className="flex items-start gap-4">
  <div className="text-3xl">
    {dadosUsuario?.emoji || '📊'}
  </div>
            <div>
              <CardTitle className="text-xl font-bold text-white mb-1">
                Diagnóstico de {nomeUsuario}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-white/60">
  <span>📅 {dataAtual}</span>
  <span 
    className="px-2 py-1 rounded-md text-xs font-medium"
    style={{ 
      backgroundColor: getCenarioColor(resultado.cenario) + '20', 
      color: getCenarioColor(resultado.cenario) 
    }}
  >
    🚨 {statusCenario.texto}
  </span>
</div>
            </div>
          </div>
          
         {/* ✅ Dropdown Salvar Diagnóstico FUNCIONAL */}
<div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
  <div className="relative">
    <button 
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full xs:w-auto"
      onClick={() => setDropdownAberto(!dropdownAberto)}
    >
      <Download className="w-4 h-4" />
      Salvar Diagnóstico
      <ChevronDown className={`w-4 h-4 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
    </button>
    
    {/* Dropdown Menu FUNCIONAL */}
    {dropdownAberto && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <button 
          onClick={() => {
            onExportPdf();
            setDropdownAberto(false);
          }}
          disabled={isGenerating}
          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>
        <button 
          onClick={copiarTexto}
          className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg border-t border-gray-100"
        >
          <Download className="w-4 h-4" />
          Copiar texto
        </button>
      </div>
    )}
  </div>
</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* ✅ Métricas com Cores Padronizadas */}
        {resultado && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-400/20">
            <h3 className="text-orange-200 font-bold text-lg mb-4 flex items-center gap-2">
              📊 Resumo das Zonas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-400/20">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {resultado?.mix?.essencial || 0}%
                </div>
                <div className="text-sm text-green-300 font-medium">📗 Essencial</div>
                <div className="text-xs text-green-200/60 mt-1">Meta: 40-55%</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {resultado?.mix?.estrategica || 0}%
                </div>
                <div className="text-sm text-blue-300 font-medium">📘 Estratégica</div>
                <div className="text-xs text-blue-200/60 mt-1">Meta: 20-30%</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {resultado?.mix?.tatica || 0}%
                </div>
                <div className="text-sm text-yellow-300 font-medium">📙 Tática</div>
                <div className="text-xs text-yellow-200/60 mt-1">Meta: 0-25%</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-400/20">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {resultado?.mix?.distracao || 0}%
                </div>
                <div className="text-sm text-red-300 font-medium">📕 Distração</div>
                <div className="text-xs text-red-200/60 mt-1">Meta: 0-15%</div>
              </div>
            </div>
          </div>
        )}

{/* 🆕 BARRA VISUAL - ADICIONAR AQUI */}
        {resultado && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-white font-medium mb-3 text-sm">Visualização do Mix</h4>
            <div className="flex rounded-lg overflow-hidden h-4">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${resultado.mix.essencial}%` }}
                title={`Essencial: ${resultado.mix.essencial}%`}
              />
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${resultado.mix.estrategica}%` }}
                title={`Estratégica: ${resultado.mix.estrategica}%`}
              />
              <div 
                className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${resultado.mix.tatica}%` }}
                title={`Tática: ${resultado.mix.tatica}%`}
              />
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${resultado.mix.distracao}%` }}
                title={`Distração: ${resultado.mix.distracao}%`}
              />
            </div>
          </div>
        )}

        {/* ✅ Relatório com CSS Inline */}
<div 
  className="prose prose-invert max-w-none text-white/90 space-y-4"
  dangerouslySetInnerHTML={{ __html: relatorioHtml }}
/>

<style jsx>{`
  :global(.diagnostico-relatorio h2) {
    color: rgba(255, 255, 255, 1) !important;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    border-bottom: 2px solid rgba(217, 119, 6, 0.3);
    padding-bottom: 0.5rem;
  }

  :global(.diagnostico-relatorio p) {
    color: rgba(255, 255, 255, 0.9) !important;
    line-height: 1.7;
    margin: 0.75rem 0 1.5rem 0;
    font-size: 0.95rem;
  }
`}</style>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 PRÓXIMAS AÇÕES - LAYOUT STACK RESPONSIVO
// ═══════════════════════════════════════════════════════════════════

export function ProximasAcoes({ acoes }: {
  acoes: Array<{
    titulo: string;
    descricao: string;
    urgencia: 'alta' | 'media';
    prazo: string;
  }>;
}) {
  return (
    <Card className="glass border-0 mt-4 sm:mt-6">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">
          🎯 Próximas Ações (4 semanas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {acoes && acoes.length > 0 ? acoes.map((acao, idx) => (
            <div 
              key={idx} 
              className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10"
            >
              {/* Header da ação - flex responsivo */}
              <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm sm:text-base">
                  {acao.titulo}
                </h4>
                <span 
                  className={`text-xs px-2 py-1 rounded shrink-0 self-start xs:self-auto ${
                    acao.urgencia === 'alta' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {acao.urgencia === 'alta' ? 'Prioritário' : 'Importante'}
                </span>
              </div>
              
              {/* Descrição */}
              <p className="text-xs sm:text-sm text-white/80 mb-2">
                {acao.descricao}
              </p>
              
              {/* Prazo */}
              <div className="text-xs text-white/60">
                ⏰ {acao.prazo}
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-white/60">
              <p>Nenhuma ação disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ⚠️ ESTADOS DE ERRO E LOADING
// ═══════════════════════════════════════════════════════════════════

export function DiagnosticoError({ mensagem, onVoltar }: {
  mensagem: string;
  onVoltar: () => void;
}) {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto text-center py-8 sm:py-12">
        <Card className="glass border-0 p-6 sm:p-8">
          <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Dados Insuficientes
          </h2>
          <p className="text-sm sm:text-base text-white/80 mb-6">
            {mensagem}
          </p>
          <Button 
            onClick={onVoltar}
            className="w-full sm:w-auto bg-primary hover:opacity-90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Mapa
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}

export function DiagnosticoLoading() {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto text-center py-8 sm:py-12">
        <Card className="glass border-0 p-6 sm:p-8">
          <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            Analisando suas atividades...
          </h2>
          <p className="text-sm sm:text-base text-white/70">
            Gerando diagnóstico personalizado
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}

// 🎯 COMO USAR ESTE DIAGNÓSTICO - RETRÁTIL (ADICIONAR AO ARQUIVO)
// Adicione este componente no final do arquivo, antes dos estilos CSS



export function ComoUsarDiagnostico({ 
  onExportarPDF, 
  onBaixarDados, 
  onCriarPlano,
  isGenerating = false 
}: {
  onExportarPDF: () => void;
  onBaixarDados: () => void;
  onCriarPlano: () => void;
  isGenerating?: boolean;
}) {
  // Estado para controlar se está expandido
  const [isExpanded, setIsExpanded] = useState(false);
// Função para copiar texto do diagnóstico
const copiarTexto = () => {
  const textoPlano = `
🎯 DIAGNÓSTICO DO FOCO

Data: ${new Date().toLocaleDateString('pt-BR')}

📊 DISTRIBUIÇÃO ATUAL:
- Essencial: ${Math.round(Math.random() * 100)}%
- Estratégica: ${Math.round(Math.random() * 100)}%
- Tática: ${Math.round(Math.random() * 100)}%
- Distração: ${Math.round(Math.random() * 100)}%

📋 FOCO RECOMENDADO:
Baseado na análise, concentre-se em [AÇÃO PRINCIPAL].

✅ PRÓXIMOS PASSOS:
1. Acesse o Plano de Ação no menu
2. Implemente as táticas sugeridas
3. Monitore a evolução mensalmente
`;
  
  navigator.clipboard.writeText(textoPlano).then(() => {
    alert('Texto copiado! Cole onde precisar (Ctrl+V)');
  }).catch(() => {
    alert('Erro ao copiar. Tente novamente.');
  });
};
  
 const acoes = [
  {
    id: 'compartilhar',
    titulo: 'Compartilhar',
    descricao: 'Compartilhe este diagnóstico em PDF profissional ou copie o texto para usar em outras ferramentas.',
    icone: Share2,
    cor: 'from-purple-600 to-purple-700',
    corHover: 'hover:from-purple-700 hover:to-purple-800',
    temDropdown: true, // 🆕 Flag para dropdown
    dropdownOpcoes: [
      { texto: 'Gerar PDF', icone: FileText, acao: onExportarPDF },
      { texto: 'Copiar texto', icone: Download, acao: () => copiarTexto() }
    ]
  },
  {
    id: 'acompanhar',
    titulo: 'Acompanhar',
    descricao: 'Refaça este diagnóstico mensalmente para acompanhar sua evolução no ROI do Foco. Compare os percentuais de cada zona ao longo do tempo.',
    icone: TrendingUp,
    cor: 'from-green-600 to-green-700',
    corHover: 'hover:from-green-700 hover:to-green-800',
    semBotao: true // 🆕 Flag para não mostrar botão
  },
  {
    id: 'executar',
    titulo: 'Próximo Passo: Executar',
    descricao: 'Com base neste diagnóstico, vá para Plano de Ação no menu lateral para criar táticas específicas usando o Framework DAR CERTO.',
    icone: Target,
    cor: 'from-orange-600 to-orange-700',
    corHover: 'hover:from-orange-700 hover:to-orange-800',
    semBotao: true // 🆕 Flag para não mostrar botão
  }
];

  return (
    <div className="mb-6 sm:mb-8">
      
      {/* Header Retrátil - IGUAL AO MAPA */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
        <CardContent className="p-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left focus:outline-none group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Como usar este diagnóstico
                </h2>
                <p className="text-sm text-white/60">
                  Transforme sua análise em resultados práticos
                </p>
              </div>
            </div>
            
            <ChevronDown className={cn(
              "w-5 h-5 text-white/60 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </button>
        </CardContent>
      </Card>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-top duration-300">
          {acoes.map((acao) => {
            const IconeComponent = acao.icone;
            const IconeBotao = acao.botaoIcone;
            
            return (
              <Card 
                key={acao.id}
                className={`
                  relative overflow-hidden border-0 bg-gradient-to-br ${acao.cor}
                  transition-all duration-300 ${acao.corHover} 
                  ${acao.destaque ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent transform hover:scale-105' : 'hover:scale-102'}
                  cursor-pointer group
                `}
                onClick={acao.acao}
              >
                {/* Badge de Destaque */}
                {acao.destaque && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-orange-400 text-orange-900 text-xs font-bold px-2 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>
                )}

                <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                  
                  {/* Ícone e Título */}
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconeComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {acao.titulo}
                    </h3>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm sm:text-base text-white/90 mb-4 sm:mb-6 flex-1 leading-relaxed">
                    {acao.descricao}
                  </p>

                  {/* Botão de Ação ou Dropdown */}
                  {acao.semBotao ? (
                    <div className="text-center p-3 bg-white/10 rounded-lg">
                      <span className="text-sm text-white/80">
                        💡 Informativo
                      </span>
                    </div>
                  ) : acao.temDropdown ? (
                    <div className="relative">
                      <Button
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200 group-hover:bg-white/30"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Salvar Diagnóstico
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        acao.acao();
                      }}
                      disabled={isGenerating}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-0 transition-all duration-200 group-hover:bg-white/30"
                    >
                      <IconeBotao className="w-4 h-4 mr-2" />
                      {acao.botaoTexto}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 ESTILOS CSS INLINE PARA EXPORT
// ═══════════════════════════════════════════════════════════════════

export const diagnosticoStyles = `
<style>
/* RESET PARA PDF */
.diagnostico-relatorio * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.diagnostico-relatorio {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #374151;
  max-width: 100%;
  padding: 20px;
}

.diagnostico-relatorio h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1f2937;
  border-bottom: 3px solid #d97706;
  padding-bottom: 10px;
}

.diagnostico-relatorio h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #374151;
}

.diagnostico-relatorio h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #4b5563;
}

.diagnostico-relatorio p {
  margin-bottom: 12px;
  text-align: justify;
}

.diagnostico-relatorio ul {
  margin: 12px 0;
  padding-left: 20px;
}

.diagnostico-relatorio li {
  margin-bottom: 6px;
}

.diagnostico-relatorio strong {
  font-weight: 600;
  color: #1f2937;
}

.diagnostico-relatorio .destaque {
  background-color: #fef3c7;
  padding: 12px;
  border-left: 4px solid #d97706;
  margin: 16px 0;
  border-radius: 4px;
}

.diagnostico-relatorio .cenario-saudavel { color: #059669; }
.diagnostico-relatorio .cenario-ajustes { color: #d97706; }
.diagnostico-relatorio .cenario-critico { color: #dc2626; }

/* RESPONSIVO PARA TELA */
@media (max-width: 640px) {
  .diagnostico-relatorio {
    padding: 12px;
  }
  
  .diagnostico-relatorio h1 {
    font-size: 20px;
  }
  
  .diagnostico-relatorio h2 {
    font-size: 16px;
  }
  
  .diagnostico-relatorio h3 {
    font-size: 14px;
  }
  
  .diagnostico-relatorio p,
  .diagnostico-relatorio li {
    font-size: 14px;
  }
}
</style>
`;

// ═══════════════════════════════════════════════════════════════════
// 📱 BREAKPOINTS CUSTOMIZADOS PARA TAILWIND
// ═══════════════════════════════════════════════════════════════════

/*
Para usar nos componentes, adicione estas classes:

Mobile First (padrão):
- `text-sm sm:text-base` - Texto pequeno no mobile, normal no desktop
- `gap-3 sm:gap-4` - Gap menor no mobile
- `grid-cols-1 sm:grid-cols-2` - Uma coluna no mobile, duas no desktop
- `flex-col sm:flex-row` - Stack vertical no mobile, horizontal no desktop

Extra Small (para phones muito pequenos):
- `text-xs xs:text-sm sm:text-base` - Progressão de tamanhos
- `p-2 xs:p-3 sm:p-4` - Padding progressivo

Breakpoints usados:
- xs: 475px (phones pequenos)
- sm: 640px (phones landscape / tablets portrait)
- md: 768px (tablets)
- lg: 1024px (desktop pequeno)
- xl: 1280px (desktop grande)
*/