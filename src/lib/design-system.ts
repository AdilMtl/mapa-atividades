// 🎨 DESIGN SYSTEM - MAPA ATIVIDADES
// Arquivo: src/lib/design-system.ts

// ═══════════════════════════════════════════════════════════════════
// 🎯 DESIGN TOKENS - CENTRALIZADOS
// ═══════════════════════════════════════════════════════════════════

export const DESIGN_TOKENS = {
  // 🎨 CORES PRINCIPAIS (baseadas no mapa-atividades atual)
  colors: {
    // Cores primárias do sistema
    primary: '#d97706',      // Laranja/âmbar - cor de destaque
    background: '#042f2e',   // Verde escuro - fundo principal
    
    // Cores das zonas do mapa
    essencial: '#22c55e',    // Verde - Alto impacto + Alta clareza
    estrategica: '#3b82f6',  // Azul - Alto impacto + Baixa clareza
    tatica: '#f59e0b',       // Amarelo - Baixo impacto + Alta clareza
    distracao: '#ef4444',    // Vermelho - Baixo impacto + Baixa clareza
    
    // Cores de estado
    success: '#22c55e',      // Verde para sucesso
    error: '#ef4444',        // Vermelho para erro
    warning: '#f59e0b',      // Amarelo para aviso
    info: '#3b82f6',         // Azul para informação
    
    // Tons neutros
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },

  // 📏 ESPAÇAMENTOS PADRONIZADOS
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // 📝 TIPOGRAFIA CONSISTENTE
  typography: {
    // Tamanhos de título
    h1: 'text-3xl font-bold tracking-tight',      // 30px
    h2: 'text-2xl font-semibold tracking-tight',  // 24px
    h3: 'text-xl font-semibold',                  // 20px
    h4: 'text-lg font-medium',                    // 18px
    
    // Textos do corpo
    body: 'text-base',           // 16px
    bodySmall: 'text-sm',        // 14px
    caption: 'text-xs',          // 12px
    
    // Texto especial
    lead: 'text-lg text-gray-600',
    muted: 'text-sm text-gray-500',
  },

  // 🔲 BORDAS E RAIOS
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',    // 2px
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px
      xl: '0.75rem',     // 12px
      full: '9999px',
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '4px',
    }
  },

  // 🌟 EFEITOS VISUAIS
  effects: {
    // Sombras padronizadas
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    
    // Glass effect (usado no projeto)
    glass: 'backdrop-blur-sm bg-white/10 border border-white/20',
    
    // Transições suaves
    transition: {
      fast: 'transition-all duration-150 ease-in-out',
      normal: 'transition-all duration-300 ease-in-out',
      slow: 'transition-all duration-500 ease-in-out',
    }
  },

  // 📱 BREAKPOINTS RESPONSIVOS
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
} as const;

// ═══════════════════════════════════════════════════════════════════
// 🛠️ HELPER FUNCTIONS - UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════

// Função para gerar classes CSS rapidamente
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Função para determinar zona do mapa (do código original)
export function getZonaInfo(impacto: number, clareza: number) {
  const THRESHOLD_HIGH = 4;
  const impactoAlto = impacto >= THRESHOLD_HIGH;
  const clarezaAlta = clareza >= THRESHOLD_HIGH;
  
  if (impactoAlto && clarezaAlta) {
    return { 
      zona: 'essencial', 
      cor: DESIGN_TOKENS.colors.essencial,
      label: 'Essencial',
      description: 'Alto impacto + Alta clareza'
    };
  }
  if (!impactoAlto && !clarezaAlta) {
    return { 
      zona: 'distracao', 
      cor: DESIGN_TOKENS.colors.distracao,
      label: 'Distração',
      description: 'Baixo impacto + Baixa clareza'
    };
  }
  if (!impactoAlto && clarezaAlta) {
    return { 
      zona: 'tatica', 
      cor: DESIGN_TOKENS.colors.tatica,
      label: 'Tática',
      description: 'Baixo impacto + Alta clareza'
    };
  }
  return { 
    zona: 'estrategica', 
    cor: DESIGN_TOKENS.colors.estrategica,
    label: 'Estratégica',
    description: 'Alto impacto + Baixa clareza'
  };
}

// Função para formatar horas
export function formatHoras(horas: number): string {
  if (horas === 0) return '0h';
  if (horas < 1) return `${Math.round(horas * 60)}min`;
  if (horas % 1 === 0) return `${horas}h`;
  return `${horas.toFixed(1)}h`;
}

// Função para calcular horas por dia
export function calcularHorasPorDia(horasMes: number): number {
  return Number((horasMes / 30).toFixed(1));
}

// ═══════════════════════════════════════════════════════════════════
// 📐 VARIANTES DE COMPONENTES - SISTEMA CONSISTENTE
// ═══════════════════════════════════════════════════════════════════

export const COMPONENT_VARIANTS = {
  // Variantes de botões
  button: {
    // Tamanhos
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10 p-0',
    },
    
    // Estilos
    variant: {
      primary: `bg-[${DESIGN_TOKENS.colors.primary}] text-white hover:opacity-90`,
      secondary: 'bg-white/10 text-white hover:bg-white/20',
      outline: 'border border-white/30 bg-transparent hover:bg-white/10',
      ghost: 'bg-transparent hover:bg-white/10',
      danger: `bg-[${DESIGN_TOKENS.colors.error}] text-white hover:opacity-90`,
    }
  },
  
  // Variantes de cards
  card: {
    variant: {
      default: 'bg-white/5 border border-white/10 backdrop-blur-sm',
      glass: DESIGN_TOKENS.effects.glass,
      solid: 'bg-white border border-gray-200',
      highlighted: `bg-[${DESIGN_TOKENS.colors.primary}]/10 border border-[${DESIGN_TOKENS.colors.primary}]/30`,
    },
    
    padding: {
      sm: 'p-3',
      md: 'p-4', 
      lg: 'p-6',
      xl: 'p-8',
    }
  },
  
  // Variantes de texto
  text: {
    variant: {
      default: 'text-white',
      muted: 'text-white/70',
      accent: `text-[${DESIGN_TOKENS.colors.primary}]`,
      success: `text-[${DESIGN_TOKENS.colors.success}]`,
      error: `text-[${DESIGN_TOKENS.colors.error}]`,
      warning: `text-[${DESIGN_TOKENS.colors.warning}]`,
    }
  }
} as const;

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS TYPESCRIPT - PARA AUTOCOMPLETAR
// ═══════════════════════════════════════════════════════════════════

export type ButtonSize = keyof typeof COMPONENT_VARIANTS.button.size;
export type ButtonVariant = keyof typeof COMPONENT_VARIANTS.button.variant;
export type CardVariant = keyof typeof COMPONENT_VARIANTS.card.variant;
export type CardPadding = keyof typeof COMPONENT_VARIANTS.card.padding;
export type TextVariant = keyof typeof COMPONENT_VARIANTS.text.variant;

export type ZonaType = 'essencial' | 'estrategica' | 'tatica' | 'distracao';

// Interface da atividade (mantendo compatibilidade)
export interface Atividade {
  id?: string;
  nome: string;
  eixoX: number;      // Impacto (1-6)
  eixoY: number;      // Clareza (1-6)
  horasMes: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ═══════════════════════════════════════════════════════════════════
// 📋 EXEMPLO DE USO
// ═══════════════════════════════════════════════════════════════════

/*
// Como usar no seu código:

import { DESIGN_TOKENS, cn, getZonaInfo, COMPONENT_VARIANTS } from '@/lib/design-system';

// Cores consistentes
<div style={{ backgroundColor: DESIGN_TOKENS.colors.primary }}>

// Classes utilitárias
<div className={cn(
  DESIGN_TOKENS.typography.h1,
  COMPONENT_VARIANTS.text.variant.accent,
  DESIGN_TOKENS.effects.transition.normal
)}>

// Zona do mapa
const zonaInfo = getZonaInfo(impacto, clareza);
<div style={{ backgroundColor: zonaInfo.cor }}>
  {zonaInfo.label}
</div>
*/