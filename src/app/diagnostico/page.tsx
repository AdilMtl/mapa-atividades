// 📊 DIAGNÓSTICO - VISUAL PROFISSIONAL COMPLETO
// Arquivo: src/app/diagnostico/page.tsx

'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { 
  gerarDiagnostico, 
  validarDadosParaDiagnostico,
  getCenarioColor,
  getCenarioIcon,
  formatarPercentual,
  type AtividadeDiagnostico,
  type ResultadoDiagnostico,
  type MixZonas,
  type Cenario
} from '@/lib/diagnostico-engine';
import { 
  PageContainer,
  PageHeader,
  LoadingSpinner,
  EmptyState,
  MetricCard,
  MetricGrid,
  Section,
  StatusBadge
} from '@/components/base';
import { DiagnosticoHeader, ComoUsarDiagnostico } from '@/components/diagnostico';
import { 
  ArrowLeft, 
  Target, 
  BarChart3, 
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Shield,
  Lightbulb,
  Calendar,
  BookOpen,
  Eye,
ChevronDown,    
  HelpCircle 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DiagnosticoPage() {
  // Estados
  const [user, setUser] = useState<any>(null);
  const [atividades, setAtividades] = useState<AtividadeDiagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<ResultadoDiagnostico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
 const [comoUsarExpanded, setComoUsarExpanded] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Carregamento de dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setErro(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          window.location.href = '/auth';
          return;
        }

        setUser(session.user);

        const { data, error } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        const atividadesFormatadas: AtividadeDiagnostico[] = data?.map(item => ({
          nome: item.nome,
          eixoX: item.eixo_x,
          eixoY: item.eixo_y,
          horasMes: item.horas_mes || 0
        })) || [];

        setAtividades(atividadesFormatadas);

        const validacao = validarDadosParaDiagnostico(atividadesFormatadas);
        if (!validacao.valido) {
          setErro(validacao.erro || 'Dados insuficientes');
          return;
        }

        const diagnosticoGerado = gerarDiagnostico(atividadesFormatadas);
        setResultado(diagnosticoGerado);

      } catch (error) {
        console.error('Erro:', error);
        setErro(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Funções de ação
  const voltarMapa = () => {
    window.location.href = '/dashboard';
  };

  const irParaPlano = () => {
  // Salvar dados do diagnóstico para o plano de ação
  if (resultado) {
    localStorage.setItem('ultimo-diagnostico', JSON.stringify({
      focoPrimario: resultado.focoPrimario,
      focoSecundario: resultado.focoSecundario,
      cenario: resultado.cenario,
      metaTexto: resultado.metaTexto,
      timestamp: new Date().toISOString()
    }));
  }
  window.location.href = '/plano-acao';
};

  const exportarPDF = async () => {
    if (!resultado || !exportRef.current) return;
    
    setGenerating(true);
    try {
      exportRef.current.style.display = 'block';
      exportRef.current.style.position = 'fixed';
      exportRef.current.style.top = '-9999px';
      
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      exportRef.current.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`diagnostico-foco-${timestamp}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGenerating(false);
    }
  };

  const exportarJSON = () => {
    if (!resultado) return;

    const dados = {
      timestamp: new Date().toISOString(),
      usuario: user?.email,
      resultado
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading
  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner 
          size="lg" 
          text="Analisando suas atividades..." 
        />
      </PageContainer>
    );
  }

  // Erro
  if (erro || !resultado) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertTriangle}
          title="Dados Insuficientes"
          subtitle={erro || 'Erro interno ao gerar diagnóstico'}
          actionLabel="Voltar ao Mapa"
          onAction={voltarMapa}
        />
      </PageContainer>
    );
  }

  const cenarioColor = getCenarioColor(resultado.cenario);
  const cenarioIcon = getCenarioIcon(resultado.cenario);

  return (
    <>
      <PageContainer maxWidth="lg">
        
        {/* Header com Fluxo */}
        <div className="mb-8 sm:mb-10">
          {/* Header Principal - MANTÉM O DESIGN ORIGINAL */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            
            {/* Lado Esquerdo - Título + Ícone */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-3 rounded-lg bg-[#d97706]/20 text-[#d97706]">
                <BarChart3 size={24} />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Diagnóstico do Foco
                </h1>
                <p className="text-base text-white/70">
                  Análise de {resultado.totalAtividades} atividades • {resultado.totalHoras}h/mês
                </p>
              </div>
            </div>

            {/* Lado Direito - Ações ORIGINAIS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={voltarMapa}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Mapa
              </Button>
              <Button 
                onClick={irParaPlano}
                className="bg-[#d97706] hover:bg-[#b45309] text-black font-semibold"
              >
                <Target className="w-4 h-4 mr-2" />
                Criar Plano
              </Button>
            </div>
          </div>

          {/* Fluxo ROI do Foco - NOVO */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Fluxo ROI do Foco
              </h2>
              <span className="text-xs sm:text-sm text-white/60 hidden sm:block">
                Siga os 3 passos
              </span>
            </div>

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

              <div className="hidden sm:block text-white/40">→</div>

              {/* Step 2 - Diagnosticar (Ativo) */}
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
                  <p className="text-xs text-white/40">Plano de ação</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Progresso</span>
                <span>66% completo</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500" 
                     style={{ width: '66%' }}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Contexto Melhorado */}
<div className="mb-8 sm:mb-10">
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/20 backdrop-blur-sm">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20 flex-shrink-0">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-blue-200 mb-3 sm:mb-4 text-base sm:text-lg">
            💡 Como interpretar este diagnóstico
          </h3>
          
          {/* Lista de Passos Objetivos */}
          <div className="space-y-2 sm:space-y-3">
            
            {/* Passo 1 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-blue-200">1</span>
              </div>
              <div>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Entenda a <strong className="text-blue-50">Distribuição do Seu Tempo</strong>
                </p>
                <p className="text-blue-100/80 text-xs sm:text-sm">
                  Veja os percentuais nas 4 zonas e compare com os alvos ideais
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-blue-200">2</span>
              </div>
              <div>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Leia o <strong className="text-blue-50">Relatório Completo</strong>
                </p>
                <p className="text-blue-100/80 text-xs sm:text-sm">
                  Análise personalizada baseada no seu padrão atual
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs sm:text-sm font-bold text-blue-200">3</span>
              </div>
              <div>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  Aplique as <strong className="text-blue-50">Próximas Ações</strong>
                </p>
                <p className="text-blue-100/80 text-xs sm:text-sm">
                  Foque nas recomendações para as próximas 4 semanas
                </p>
              </div>
            </div>

          </div>

          {/* Call to Action */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-blue-400/20">
            <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
              <strong className="text-blue-50">🎯 Meta:</strong> Use este diagnóstico para criar um plano de ação eficaz e acompanhe sua evolução mensalmente.
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

{/* Como Usar - Retrátil - MOVER PARA AQUI */}
        <div className="mb-8 sm:mb-10">
          
          {/* Header Retrátil */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
            <CardContent className="p-4">
              <button
                onClick={() => setComoUsarExpanded(!comoUsarExpanded)}
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
                
                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-200 ${comoUsarExpanded ? 'rotate-180' : ''}`} />
              </button>
            </CardContent>
          </Card>

          {/* Conteúdo Expandido com Transição Suave */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            comoUsarExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
              
              {/* Card 1: Compartilhar */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Users className="w-5 h-5 text-purple-300" />
                    </div>
                    <h3 className="font-semibold text-purple-200">Compartilhar</h3>
                  </div>
                  <p className="text-purple-100 text-sm leading-relaxed mb-4">
                    Exporte para PDF e compartilhe com seu time, mentor ou coach. 
                    Use como base para 1:1s ou planejamento de equipe.
                  </p>
                  <Button 
                    onClick={exportarPDF}
                    disabled={generating}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {generating ? 'Gerando...' : 'Exportar PDF'}
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2: Acompanhar */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <TrendingUp className="w-5 h-5 text-green-300" />
                    </div>
                    <h3 className="font-semibold text-green-200">Acompanhar</h3>
                  </div>
                  <p className="text-green-100 text-sm leading-relaxed mb-4">
                    Refaça este diagnóstico a cada 30 dias para acompanhar sua evolução. 
                    Compare os percentuais e ajuste seu foco.
                  </p>
                  <Button 
                    onClick={exportarJSON}
                    size="sm"
                    variant="outline"
                    className="bg-green-600/20 border-green-500/30 text-green-200 hover:bg-green-600/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Dados
                  </Button>
                </CardContent>
              </Card>

              {/* Card 3: Executar */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-400/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Zap className="w-5 h-5 text-orange-300" />
                    </div>
                    <h3 className="font-semibold text-orange-200">Executar</h3>
                  </div>
                  <p className="text-orange-100 text-sm leading-relaxed mb-4">
                    Transforme os insights em ação. Crie um plano com táticas específicas 
                    baseadas no seu foco primário.
                  </p>
                  <Button 
                    onClick={irParaPlano}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Criar Plano
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>


        {/* Mix de Zonas */}
       <div className="mb-8 sm:mb-10">
        <Section title="Distribuição do Seu Tempo">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Mix Atual
                </CardTitle>
                <div 
                  className="px-3 py-1 rounded-full border text-sm font-medium"
                  style={{ 
                    backgroundColor: cenarioColor + '20', 
                    color: cenarioColor,
                    borderColor: cenarioColor + '40'
                  }}
                >
                  {cenarioIcon} {resultado.cenario.charAt(0).toUpperCase() + resultado.cenario.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MetricGrid columns={4}>
                <MetricCard
                  title="📗 Essencial"
                  value={formatarPercentual(resultado.mix.essencial)}
                  subtitle="Ideal: 40-55%"
                  trend={resultado.mix.essencial >= 40 ? "✓ No alvo" : "⚠ Abaixo"}
                  trendDirection={resultado.mix.essencial >= 40 ? "up" : "down"}
                  color="success"
                />
                <MetricCard
                  title="📘 Estratégica"
                  value={formatarPercentual(resultado.mix.estrategica)}
                  subtitle="Ideal: 20-30%"
                  trend={resultado.mix.estrategica >= 20 ? "✓ No alvo" : "⚠ Abaixo"}
                  trendDirection={resultado.mix.estrategica >= 20 ? "up" : "down"}
                  color="primary"
                />
                <MetricCard
                  title="📙 Tática"
                  value={formatarPercentual(resultado.mix.tatica)}
                  subtitle="Ideal: 0-25%"
                  trend={resultado.mix.tatica <= 25 ? "✓ No alvo" : "⚠ Acima"}
                  trendDirection={resultado.mix.tatica <= 25 ? "up" : "down"}
                  color="warning"
                />
                <MetricCard
                  title="📕 Distração"
                  value={formatarPercentual(resultado.mix.distracao)}
                  subtitle="Ideal: 0-15%"
                  trend={resultado.mix.distracao <= 15 ? "✓ No alvo" : "⚠ Acima"}
                  trendDirection={resultado.mix.distracao <= 15 ? "up" : "down"}
                  color="error"
                />
              </MetricGrid>

              {/* Barra Visual do Mix */}
              <div className="mt-6 p-4 rounded-lg bg-white/5">
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
                <div className="flex justify-between mt-2 text-xs text-white/60">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
</Section>
        </div>

        {/* Relatório */}
<div className="mb-8 sm:mb-10">
        <Section title="Seu Diagnóstico Personalizado">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Relatório Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                className="diagnostico-content text-white/90"
                dangerouslySetInnerHTML={{ __html: resultado.relatorioHtml }}
              />
            </CardContent>
          </Card>
        </Section>
 </div>
        
        
        {/* Próximas Ações */}
<div className="mb-8 sm:mb-10">
        <Section title="Próximas Ações">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              
              {/* Foco Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                
                {/* Foco Primário */}
                <div className="p-4 rounded-lg border-2 border-orange-500/30 bg-orange-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Target className="w-5 h-5 text-orange-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-200 text-sm">🎯 FOCO PRIMÁRIO</h4>
                      <p className="text-orange-100 font-medium">
                        {resultado.focoPrimario.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                  <p className="text-orange-100/80 text-sm">
                    Concentre 70% dos seus esforços aqui nas próximas 4 semanas
                  </p>
                </div>

                {/* Foco Secundário */}
                {resultado.focoSecundario && (
                  <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-200 text-sm">⚡ FOCO SECUNDÁRIO</h4>
                        <p className="text-blue-100 font-medium">
                          {resultado.focoSecundario.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-100/80 text-sm">
                      Ação complementar para maximizar resultados
                    </p>
                  </div>
                )}

              </div>

              {/* Meta */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Calendar className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-200 mb-2">📅 Meta das próximas 4 semanas</h4>
                    <p className="text-cyan-100 font-medium text-sm">
                      {resultado.metaTexto}
                    </p>
                    <p className="text-cyan-100/70 text-xs mt-2">
                      Refaça este diagnóstico em 30 dias para acompanhar a evolução
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={irParaPlano}
                  className="bg-[#d97706] hover:bg-[#b45309] text-black font-semibold flex-1"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Criar Plano de Ação Agora
                </Button>
                
                <Button
                  onClick={voltarMapa}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ajustar Mapa
                </Button>
              </div>

            </CardContent>
          </Card>
        </Section>
</div>

      </PageContainer>

      {/* Div oculta para export PDF */}
      <div 
        ref={exportRef}
        style={{ display: 'none' }}
        className="bg-white p-8 text-black min-h-screen"
      >
        <div className="max-w-4xl mx-auto">
          <div className="border-b-2 border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Diagnóstico do Foco
            </h1>
            <div className="flex justify-between items-center text-gray-600">
              <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
              <span>{resultado.totalAtividades} atividades • {resultado.totalHoras}h/mês</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📈 Distribuição Atual</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{resultado.mix.essencial}%</div>
                <div className="text-sm text-green-600">📗 Essencial</div>
                <div className="text-xs text-gray-500 mt-1">Ideal: 40-55%</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{resultado.mix.estrategica}%</div>
                <div className="text-sm text-blue-600">📘 Estratégica</div>
                <div className="text-xs text-gray-500 mt-1">Ideal: 20-30%</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{resultado.mix.tatica}%</div>
                <div className="text-sm text-yellow-600">📙 Tática</div>
                <div className="text-xs text-gray-500 mt-1">Ideal: 0-25%</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{resultado.mix.distracao}%</div>
                <div className="text-sm text-red-600">📕 Distração</div>
                <div className="text-xs text-gray-500 mt-1">Ideal: 0-15%</div>
              </div>
            </div>
          </div>

          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: resultado.relatorioHtml }}
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#374151'
            }}
          />

          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Gerado pelo Mapa de Atividades • {new Date().toLocaleDateString('pt-BR')}</p>
              <p className="mt-1">Para mais insights, acesse seu Plano de Ação personalizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Global */}
      <style jsx global>{`
        .diagnostico-content h2 {
          color: rgba(255, 255, 255, 1) !important;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          border-bottom: 2px solid rgba(217, 119, 6, 0.3);
          padding-bottom: 0.5rem;
        }

        .diagnostico-content p {
          color: rgba(255, 255, 255, 0.9) !important;
          line-height: 1.7;
          margin: 0.75rem 0;
          font-size: 0.95rem;
        }

        .diagnostico-content strong {
          color: rgba(255, 255, 255, 1) !important;
          font-weight: 600;
        }

        .diagnostico-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .diagnostico-content li {
          color: rgba(255, 255, 255, 0.85) !important;
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .diagnostico-content h2 {
            font-size: 1.1rem;
          }
          
          .diagnostico-content p {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}