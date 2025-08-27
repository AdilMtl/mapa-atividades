// ═══════════════════════════════════════════════════════════════════
// 🎯 OPTION LIST - BOTÕES DE OPÇÃO NUMERADOS
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/OptionList.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/design-system';

interface Opcao {
  id: string;
  label: string;
}

interface OptionListProps {
  opcoes: Opcao[];
  onSelect: (valor: string) => void;
  isLoading?: boolean;
}

export function OptionList({ opcoes, onSelect, isLoading = false }: OptionListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Processando...</span>
        </div>
      </div>
    );
  }

  if (opcoes.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-white/60 text-sm">Carregando opções...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {opcoes.map((opcao, index) => (
        <button
          key={opcao.id}
          onClick={() => onSelect(opcao.id)}
          className="option-button w-full text-left px-4 py-3 rounded-xl text-white/90 hover:text-white transition-all duration-200 flex items-center gap-3 group"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = DESIGN_TOKENS.colors.primary;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* Número da opção */}
          <div 
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: DESIGN_TOKENS.colors.primary, color: 'black' }}
          >
            {index + 1}
          </div>

          {/* Texto da opção */}
          <span className="flex-1 text-sm font-medium leading-relaxed">
            {opcao.label}
          </span>

          {/* Indicador visual de hover */}
          <div 
            className="w-2 h-2 rounded-full bg-white/0 group-hover:bg-white/40 transition-all duration-200"
          />
        </button>
      ))}

      {/* Dica de uso no mobile */}
      <div className="mt-4 text-center">
        <p className="text-white/40 text-xs">
          💡 Toque na opção que mais se aplica ao seu caso
        </p>
      </div>
    </div>
  );
}