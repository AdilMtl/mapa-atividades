// ═══════════════════════════════════════════════════════════════════
// 📊 RESULT CARD - EXIBIÇÃO DO RESULTADO DO DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/ResultCard.tsx

import React from 'react';
import { ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/design-system';
import { MixChart } from './MixChart';

interface ResultadoMix {
  essencial: number;
  estrategico: number;
  tatico: number;
  distracao: number;
}

interface ResultadoCompleto {
  mix: ResultadoMix;
  insight: string;
  sugestao: {
    acao: string;
    habito: string;
  };
  cenario: 'saudavel' | 'ajustes' | 'critico';
  sessionId?: string;
}

interface ResultCardProps {
  resultado: ResultadoCompleto;
  onSolicitarPlanoCompleto: () => void;
}

export function ResultCard({ resultado, onSolicitarPlanoCompleto }: ResultCardProps) {
  const { mix, insight, sugestao, cenario } = resultado;

  // Cores por cenário
  const getCenarioColor = (cenario: string) => {
    switch (cenario) {
      case 'saudavel': return '#22c55e'; // Verde
      case 'critico': return '#ef4444';  // Vermelho
      default: return '#f59e0b';         // Amarelo (ajustes)
    }
  };

  const getCenarioIcon = (cenario: string) => {
    switch (cenario) {
      case 'saudavel': return '🟢';
      case 'critico': return '🔴';
      default: return '🟡';
    }
  };

  const getCenarioLabel = (cenario: string) => {
    switch (cenario) {
      case 'saudavel': return 'Saudável';
      case 'critico': return 'Crítico';
      default: return 'Ajustes Necessários';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header com Status */}
      <div className="mb-6 text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3"
          style={{
            backgroundColor: getCenarioColor(cenario) + '20',
            border: `1px solid ${getCenarioColor(cenario)}40`,
            color: getCenarioColor(cenario)
          }}
        >
          <span>{getCenarioIcon(cenario)}</span>
          {getCenarioLabel(cenario)}
        </div>
      </div>

      {/* Mix Visual */}
      <div className="mb-6">
        <h3 className="text-white font-semibold text-lg mb-4 text-center">
          📊 Seu Mix Atual
        </h3>
        <MixChart mix={mix} />
        
        {/* Legenda dos percentuais */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white/80">Essencial: {mix.essencial}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-white/80">Estratégico: {mix.estrategico}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-white/80">Tático: {mix.tatico}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white/80">Distração: {mix.distracao}%</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-start gap-3">
          <TrendingUp 
            className="w-5 h-5 flex-shrink-0 mt-0.5" 
            style={{ color: DESIGN_TOKENS.colors.primary }}
          />
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">
              💡 O que isso revela
            </h4>
            <div 
  className="text-white/80 text-sm leading-relaxed"
  dangerouslySetInnerHTML={{
    __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }}
/>
          </div>
        </div>
      </div>

      {/* Sugestão Prática */}
      <div className="mb-6 space-y-3">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2">
          <Zap 
            className="w-4 h-4" 
            style={{ color: DESIGN_TOKENS.colors.primary }}
          />
          🎯 Sugestão Prática
        </h4>
        
        <div className="space-y-3">
          {/* Ação */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start gap-3">
              <Target className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">Ação:</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {sugestao.acao}
                </p>
              </div>
            </div>
          </div>

          {/* Hábito */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-400 flex-shrink-0 mt-1"></div>
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">Hábito:</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {sugestao.habito}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Principal */}
      <div className="text-center">
        <button
          onClick={onSolicitarPlanoCompleto}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black transition-all duration-200 hover:scale-105 shadow-lg"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.primary,
            boxShadow: `0 4px 20px ${DESIGN_TOKENS.colors.primary}40`
          }}
        >
          <span>Quero 3 recomendações + 1 hábito</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <p className="text-white/50 text-xs mt-3 max-w-xs mx-auto">
          Receba um plano detalhado personalizado para seu perfil
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-white/60 text-xs text-center leading-relaxed">
          💡 Este é um <strong>snapshot</strong> do seu momento atual. No sistema completo, 
          você acompanha a evolução mês a mês e recebe planos detalhados por atividade.
        </p>
      </div>
    </div>
  );
}