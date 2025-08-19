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
  Eye
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
        
        {/* Header */}
        <PageHeader
          title="Diagnóstico do Foco"
          subtitle={`Análise de ${resultado.totalAtividades} atividades • ${resultado.totalHoras}h/mês`}
          icon={BarChart3}
          action={
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
          }
        />

        {/* Card de Contexto */}
        <Section title="">
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/20 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Lightbulb className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">💡 Como interpretar este diagnóstico</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Este relatório identifica onde você está gastando energia e sugere ajustes para maximizar impacto. 
                    Use os insights para criar um plano de ação eficaz nas próximas 4 semanas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* Mix de Zonas */}
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

        {/* Relatório */}
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

        {/* Cards de Utilização */}
        <Section title="Como usar este diagnóstico">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
        </Section>

        {/* Próximas Ações */}
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