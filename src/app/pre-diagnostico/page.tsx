// ═══════════════════════════════════════════════════════════════════
// 🎯 PÁGINA PRÉ-DIAGNÓSTICO - VERSÃO MELHORADA COM CONTEXTO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/pre-diagnostico/page.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Coffee, 
  Brain, 
  Clock, 
  Target,
  CheckCircle2,
  TrendingUp,
  Zap,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Sparkles,
  Map
} from 'lucide-react';
import Link from 'next/link';
import { DESIGN_TOKENS } from '@/lib/design-system';
import { ChatFlow } from '@/components/prediagnostico/ChatFlow';

export default function PreDiagnosticoPage() {
  const [mounted, setMounted] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
      {/* Header Fixo Mobile-First - MANTIDO */}
      <header className="sticky top-0 z-50 px-4 py-3 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
              Diagnóstico ROI do Foco
            </h1>
          </div>

          {/* Badge de tempo */}
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">2-3 min</span>
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <main className="pb-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {!showChat ? (
            <>
              {/* Hero Section Educativa */}
              <section className="pt-8 pb-6 text-center space-y-6">
                {/* Badge de Status */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse" 
                    style={{ backgroundColor: DESIGN_TOKENS.colors.primary }}
                  ></div>
                  <span className="text-white/80 text-sm">Demo gratuita • Sem cadastro • Resultado imediato</span>
                </div>

                {/* Título e Descrição */}
                <div className="space-y-4 max-w-2xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white font-mono">
                    Descubra onde seu tempo está sendo 
                    <span className="text-orange-500"> desperdiçado</span>
                  </h2>
                  
                  <p className="text-lg text-white/80 leading-relaxed">
                    O diagnóstico ROI do Foco analisa seu padrão atual e mostra exatamente 
                    onde você pode <strong className="text-white">ganhar 30-60 minutos por dia</strong> com 
                    apenas 3 ajustes na sua rotina.
                  </p>

                  {/* Credibilidade - Novo */}
                  <div className="glass rounded-lg p-4 max-w-xl mx-auto">
                    <p className="text-sm text-white/80">
                      Criado por{' '}
                      <a 
                        href="https://www.linkedin.com/in/adilsonmatioli/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 underline transition-colors"
                      >
                        Adilson Matioli
                      </a>
                      , que já transformou equipes e <strong className="text-white">estratégias de crescimento empresarial</strong> em 
                      histórias de sucesso. Agora, esse mesmo poder estratégico foi adaptado 
                      para simplificar sua rotina e gestão do tempo.
                    </p>
                  </div>
                </div>
              </section>

              {/* Seção: O que é ROI do Foco */}
<section className="py-6 border-t border-white/10">
  <div className="max-w-3xl mx-auto">
    <div className="glass rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold font-mono">O que é ROI do Foco?</h3>
      </div>
      
      <p className="text-white/80 text-sm leading-relaxed">
        <span className="text-orange-400 font-semibold">ROI</span> significa "Return on Investment". 
        Quando aplicamos ao <span className="text-orange-400 font-semibold">foco</span>, descobrimos 
        onde seu tempo gera maior retorno. O diagnóstico analisa suas atividades em 3 dimensões:
      </p>

      {/* As 3 Alavancas */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <Clock className="w-5 h-5 mx-auto mb-1 text-red-400" />
          <div className="text-xs font-medium">Tempo</div>
          <div className="text-xs text-white/60">Reduzir desperdício</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <Target className="w-5 h-5 mx-auto mb-1 text-blue-400" />
          <div className="text-xs font-medium">Clareza</div>
          <div className="text-xs text-white/60">Saber prioridades</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
          <div className="text-xs font-medium">Impacto</div>
          <div className="text-xs text-white/60">Gerar resultados</div>
        </div>
      </div>

      {/* ADICIONAR ESTE LINK */}
      <div className="pt-3 text-center">
        <a 
          href="https://conversasnocorredor.substack.com/p/organizar-o-tempo-e-uma-tarefa-simples"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          Entenda melhor a metodologia ROI do Foco
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
</section>

              {/* Seção: Como Funciona - REFORMULADA */}
              <section className="py-6">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-lg font-semibold text-center mb-6 font-mono">
                    Diagnóstico inteligente e personalizado
                  </h3>
                  
                  {/* 3 Blocos sobre Personalização */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-4 space-y-2">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="font-medium text-sm text-center">Análise Personalizada</h4>
                      <p className="text-xs text-white/60 text-center">
                        Cada perfil profissional tem desafios únicos. 
                        O diagnóstico se adapta às suas respostas, 
                        criando centenas de combinações possíveis.
                      </p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 space-y-2">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Brain className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="font-medium text-sm text-center">Inteligência Contextual</h4>
                      <p className="text-xs text-white/60 text-center">
                        Suas escolhas geram ramificações específicas. 
                        Um analista recebe perguntas diferentes de um gestor, 
                        tornando cada diagnóstico único.
                      </p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 space-y-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Target className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="font-medium text-sm text-center">Resultado Sob Medida</h4>
                      <p className="text-xs text-white/60 text-center">
                        Ao final, você recebe recomendações específicas 
                        para SEU contexto, não soluções genéricas 
                        de produtividade.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção: O Que Você Recebe */}
              <section className="py-6">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-lg font-semibold text-center mb-6 font-mono">
                    O que você recebe agora
                  </h3>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-4 text-center space-y-2">
                      <BarChart3 className="w-8 h-8 mx-auto text-blue-400" />
                      <h4 className="font-medium text-sm">Análise Visual</h4>
                      <p className="text-xs text-white/60">
                        Gráfico mostrando onde seu tempo está distribuído hoje
                      </p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 text-center space-y-2">
                      <Zap className="w-8 h-8 mx-auto text-orange-400" />
                      <h4 className="font-medium text-sm">3 Ações Práticas</h4>
                      <p className="text-xs text-white/60">
                        Recomendações personalizadas para implementar ainda hoje
                      </p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-green-400" />
                      <h4 className="font-medium text-sm">Insight Direcionado</h4>
                      <p className="text-xs text-white/60">
                        Entenda seu padrão atual e onde focar primeiro
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* NOVA SEÇÃO: Isso é só o começo */}
              <section className="py-6 border-t border-white/10">
                <div className="max-w-3xl mx-auto">
                  <div className="glass rounded-lg p-6 space-y-4 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Map className="w-5 h-5 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold font-mono">O pré-diagnóstico é apenas o primeiro passo</h3>
                    </div>
                    
                    <p className="text-white/80 text-sm leading-relaxed">
                      Este diagnóstico rápido oferece uma visão inicial. Com o sistema completo, você pode:
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/70">
                          Mapear TODAS as suas atividades com análise detalhada de tempo, clareza e impacto
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/70">
                          Receber um diagnóstico completo e automático com direcionamento para criar um plano de ação
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/70">
                          Gerar um plano personalizado com sugestões inteligentes de onde investir melhor o seu tempo
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/70">
                          Criar tarefas pontuais de hábitos recorrentes para ter resultados sustentáveis
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/70">
                          Acompanhar evolução com métricas reais e GANHAR MAIS TEMPO na sua rotina!
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs text-white/60 mb-3">
                        O pré-diagnóstico é gratuito e mostra o poder da metodologia. 
                        O sistema completo está disponível para assinantes anuais.
                      </p>
                      <a 
                        href="https://conversasnocorredor.substack.com/p/foco-em-pratica-bastidores-produto-digital"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Conheça o sistema completo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA para Iniciar */}
              <section className="py-6 text-center">
                <button
                  onClick={() => setShowChat(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                  Começar Diagnóstico Gratuito
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <p className="text-xs text-white/40 mt-3">
                  Sem cadastro • 100% gratuito • Resultado em 2 minutos
                </p>
              </section>

              {/* Citação Inspiradora */}
              <section className="py-6 border-t border-white/10">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-sm text-orange-400 font-medium italic">
                      "Uma rotina de impacto não precisa parecer lotada, atribulada e sem tempo para nada."
                    </p>
                    <p className="text-xs text-white/60 mt-2">
                      — Metodologia ROI do Foco
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Quando showChat = true, mostra apenas o chat */}
              <div className="pt-6 pb-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse" 
                    style={{ backgroundColor: DESIGN_TOKENS.colors.primary }}
                  ></div>
                  <span className="text-white/80 text-sm">Diagnóstico em andamento • 2-3 minutos</span>
                </div>
                
                <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
                  Responda as perguntas tocando nas opções abaixo.
                  Suas respostas geram um diagnóstico personalizado.
                </p>
              </div>

              {/* Componente Principal do Chat - MANTIDO 100% */}
              <ChatFlow />
            </>
          )}

          {/* Footer - MANTIDO */}
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
              {' '}da newsletter{' '}
              <a 
                href="https://conversasnocorredor.substack.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/60 transition-colors"
              >
                Conversas no Corredor
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Estilos globais - MANTIDOS */}
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
        
        /* Glass effect helper */
        .glass {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
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
        
        /* Estilo dos botões de opção */
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