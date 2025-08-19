// 🔧 CORREÇÃO DO LAYOUT RESPONSIVO - DIAGNÓSTICO
// Arquivo: src/components/diagnostico/index.tsx

'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import jsPDF from 'jspdf';
import { PageContainer, PageHeader } from '@/components/base';

// ═══════════════════════════════════════════════════════════════════
// 🎯 HEADER DO DIAGNÓSTICO - RESPONSIVO
// ═══════════════════════════════════════════════════════════════════

export function DiagnosticoHeader({ totalAtividades, onVoltar }: {
  totalAtividades: number;
  onVoltar: () => void;
}) {
  return (
    <PageHeader
      title="Diagnóstico do Foco"
      subtitle={`Análise automática de ${totalAtividades} atividades mapeadas`}
      icon={BarChart3}
      action={
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <Button 
            onClick={onVoltar}
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Voltar ao Mapa
          </Button>
          <Button 
            onClick={() => window.location.href = '/plano-acao'}
            className="w-full sm:w-auto bg-primary hover:opacity-90 text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Criar Plano
          </Button>
        </div>
      }
    />
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
// 📄 VISUALIZAÇÃO DO RELATÓRIO - MOBILE FIRST
// ═══════════════════════════════════════════════════════════════════

export function RelatorioView({ 
  relatorioHtml, 
  onExportPdf, 
  onExportJson, 
  isGenerating = false 
}: {
  relatorioHtml: string;
  onExportPdf: () => void;
  onExportJson: () => void;
  isGenerating?: boolean;
}) {
  return (
    <Card className="glass border-0">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">
            Seu Relatório de Foco
          </CardTitle>
          
          {/* Botões de export - responsivos */}
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={onExportPdf}
              disabled={isGenerating}
              className="flex-1 xs:flex-none bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {isGenerating ? 'Gerando...' : 'PDF'}
            </Button>
            <Button 
              onClick={onExportJson}
              variant="outline"
              className="flex-1 xs:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Relatório - com tipografia responsiva */}
        <div 
          className="text-white/90 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed"
          dangerouslySetInnerHTML={{ __html: relatorioHtml }}
        />
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