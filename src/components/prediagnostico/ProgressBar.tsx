// ═══════════════════════════════════════════════════════════════════
// 📊 PROGRESS BAR - INDICADOR DE PROGRESSO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/ProgressBar.tsx

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/design-system';

interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  const isCompleted = current >= total;

  return (
    <div className="mb-6">
      {/* Header do Progresso */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 
              className="w-5 h-5" 
              style={{ color: DESIGN_TOKENS.colors.primary }}
            />
          ) : (
            <div className="flex items-center gap-1">
              {Array.from({ length: total }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < current 
                      ? 'opacity-100' 
                      : 'opacity-30'
                  }`}
                  style={{ 
                    backgroundColor: index < current 
                      ? DESIGN_TOKENS.colors.primary 
                      : 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>
          )}
          
          <span className="text-white/80 text-sm font-medium">
            {isCompleted ? 'Concluído!' : `Passo ${current} de ${total}`}
          </span>
        </div>

        {showPercentage && (
          <span 
            className="text-sm font-bold px-2 py-1 rounded-full"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: DESIGN_TOKENS.colors.primary
            }}
          >
            {percentage}%
          </span>
        )}
      </div>

      {/* Barra Visual */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: DESIGN_TOKENS.colors.primary,
            boxShadow: `0 0 10px ${DESIGN_TOKENS.colors.primary}40`
          }}
        />
      </div>

      {/* Tempo estimado */}
      {!isCompleted && (
        <div className="mt-2 text-center">
          <p className="text-white/50 text-xs">
            ⏱️ Tempo restante: ~{Math.max(0, (5 - current) * 30)} segundos
          </p>
        </div>
      )}
    </div>
  );
}
