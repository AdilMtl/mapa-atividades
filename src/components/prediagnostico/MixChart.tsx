// ═══════════════════════════════════════════════════════════════════
// 📊 MIX CHART - GRÁFICO VISUAL DO MIX DE ATIVIDADES
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/MixChart.tsx

import React from 'react';

interface MixData {
  essencial: number;
  estrategico: number;
  tatico: number;
  distracao: number;
}

interface MixChartProps {
  mix: MixData;
}

export function MixChart({ mix }: MixChartProps) {
  // Garantir que soma seja 100%
  const total = mix.essencial + mix.estrategico + mix.tatico + mix.distracao;
  const normalizado = {
    essencial: Math.round((mix.essencial / total) * 100),
    estrategico: Math.round((mix.estrategico / total) * 100),
    tatico: Math.round((mix.tatico / total) * 100),
    distracao: Math.round((mix.distracao / total) * 100)
  };

  // Cores das zonas (baseadas no design system existente)
  const cores = {
    essencial: '#22c55e',    // Verde
    estrategico: '#3b82f6',  // Azul
    tatico: '#f59e0b',       // Amarelo
    distracao: '#ef4444'     // Vermelho
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Gráfico de Barras Horizontal */}
      <div className="space-y-3">
        {/* Essencial */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cores.essencial }}
              />
              📗 Essencial
            </span>
            <span className="text-white/90 text-sm font-bold">{normalizado.essencial}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizado.essencial}%`,
                backgroundColor: cores.essencial,
                boxShadow: `0 0 8px ${cores.essencial}60`
              }}
            />
          </div>
        </div>

        {/* Estratégico */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cores.estrategico }}
              />
              📘 Estratégico
            </span>
            <span className="text-white/90 text-sm font-bold">{normalizado.estrategico}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizado.estrategico}%`,
                backgroundColor: cores.estrategico,
                boxShadow: `0 0 8px ${cores.estrategico}60`,
                animationDelay: '200ms'
              }}
            />
          </div>
        </div>

        {/* Tático */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cores.tatico }}
              />
              📙 Tático
            </span>
            <span className="text-white/90 text-sm font-bold">{normalizado.tatico}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizado.tatico}%`,
                backgroundColor: cores.tatico,
                boxShadow: `0 0 8px ${cores.tatico}60`,
                animationDelay: '400ms'
              }}
            />
          </div>
        </div>

        {/* Distração */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-white/80 text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cores.distracao }}
              />
              📕 Distração
            </span>
            <span className="text-white/90 text-sm font-bold">{normalizado.distracao}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${normalizado.distracao}%`,
                backgroundColor: cores.distracao,
                boxShadow: `0 0 8px ${cores.distracao}60`,
                animationDelay: '600ms'
              }}
            />
          </div>
        </div>
      </div>

      {/* Interpretação Rápida */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span className="text-white/70 text-xs">
            {normalizado.essencial >= 40 
              ? '✅ Foco saudável' 
              : normalizado.tatico + normalizado.distracao >= 50
              ? '⚠️ Foco disperso'
              : '🔄 Precisa ajustar'
            }
          </span>
        </div>
      </div>

      {/* Metas Ideais (discreto) */}
      <div className="mt-3 text-center">
        <p className="text-white/40 text-xs">
          Ideal: 40-55% Essencial • 20-30% Estratégico • &lt;25% Tático • &lt;15% Distração
        </p>
      </div>
    </div>
  );
}