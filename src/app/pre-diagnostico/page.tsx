// ═══════════════════════════════════════════════════════════════════
// 🎯 PÁGINA PRÉ-DIAGNÓSTICO - CONVERSACIONAL MOBILE-FIRST
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/pre-diagnostico/page.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coffee } from 'lucide-react';
import Link from 'next/link';
import { DESIGN_TOKENS } from '@/lib/design-system';
import { ChatFlow } from '@/components/prediagnostico/ChatFlow';

export default function PreDiagnosticoPage() {
  const [mounted, setMounted] = useState(false);

  // Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`min-h-screen bg-[${DESIGN_TOKENS.colors.background}] flex items-center justify-center`}>
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: DESIGN_TOKENS.colors.background,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header Fixo Mobile-First */}
      <header className="sticky top-0 z-50 px-4 py-3 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <Link 
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Voltar</span>
          </Link>

          {/* Logo/Título */}
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.primary }} />
            <h1 className="text-white font-semibold text-lg font-mono">
              Pré-Diagnóstico
            </h1>
          </div>

          {/* Espaço para simetria */}
          <div className="w-16"></div>
        </div>
      </header>

      {/* Container Principal */}
      <main className="pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Intro Sutil */}
          <div className="pt-6 pb-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <div 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: DESIGN_TOKENS.colors.primary }}
              ></div>
              <span className="text-white/80 text-sm">Demo gratuita • 2-3 minutos</span>
            </div>
            
            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
              Vamos rodar um diagnóstico rápido do seu foco profissional. 
              Responda tocando nas opções abaixo.
            </p>
          </div>

          {/* Componente Principal do Chat */}
          <ChatFlow />

          {/* Footer Discreto */}
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-white/40 text-xs">
              Baseado na metodologia{' '}
              <a 
                href="https://conversasnocorredor.substack.com/s/roi-do-foco" 
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/60 transition-colors"
              >
                ROI do Foco
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Estilos globais inline para garantir que funcionem */}
      <style jsx global>{`
        /* Garantir que body não tenha scroll horizontal */
        html, body {
          overflow-x: hidden;
          background-color: ${DESIGN_TOKENS.colors.background};
        }
        
        /* Smooth scroll para melhor UX */
        html {
          scroll-behavior: smooth;
        }
        
        /* Melhorar tap targets no mobile */
        @media (hover: none) and (pointer: coarse) {
          button, [role="button"], a {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Animação suave para elementos que aparecem */
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Estilo dos botões de opção (será usado pelos componentes) */
        .option-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        
        .option-button:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: ${DESIGN_TOKENS.colors.primary};
          transform: translateY(-1px);
        }
        
        .option-button:active {
          transform: translateY(0);
        }
        
        /* Estilo das mensagens do chat */
        .chat-message {
          animation: slideInLeft 0.4s ease-out;
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .option-button {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
