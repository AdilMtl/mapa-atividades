// ═══════════════════════════════════════════════════════════════════
// 💬 CHAT FLOW - COMPONENTE PRINCIPAL DO PRÉ-DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/ChatFlow.tsx

'use client'
import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { OptionList } from './OptionList';
import { ProgressBar } from './ProgressBar';
import { ResultCard } from './ResultCard';
import { EmailGate } from './EmailGate';
import { TypingDots } from './TypingDots';
import { DESIGN_TOKENS } from '@/lib/design-system';

// ═══════════════════════════════════════════════════════════════════
// 🎯 TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface ChatState {
  step: number;
  profile?: string;
  agenda?: string;
  pain?: string;
  topActivity?: string;
  goal?: string;
  resultado?: any;
  showResult: boolean;
  showEmailGate: boolean;
  isTyping: boolean;
}

interface ApiOptions {
  profiles?: Array<{id: string; label: string}>;
  dores?: Array<{id: string; label: string}>;
  atividades?: Array<{id: string; label: string}>;
  agenda?: Array<{id: string; label: string}>;
  goals?: Array<{id: string; label: string}>;
}

// ═══════════════════════════════════════════════════════════════════
// 🎭 PERGUNTAS E TEXTOS DO FLUXO
// ═══════════════════════════════════════════════════════════════════

const PERGUNTAS = [
  {
    id: 1,
    texto: "Quem é você hoje?",
    tipo: "profile",
    emoji: "👋"
  },
  {
    id: 2, 
    texto: "Como está sua agenda esta semana?",
    tipo: "agenda",
    emoji: "📅"
  },
  {
    id: 3,
    texto: "Qual é sua principal dor agora?", 
    tipo: "pain",
    emoji: "🎯"
  },
  {
    id: 4,
    texto: "Qual dessas ocupa mais tempo no seu dia?",
    tipo: "topActivity", 
    emoji: "⏰"
  },
  {
    id: 5,
    texto: "Se pudesse mudar uma coisa agora, qual seria?",
    tipo: "goal",
    emoji: "✨"
  }
];

// ═══════════════════════════════════════════════════════════════════
// 🚀 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function ChatFlow() {
  const [state, setState] = useState<ChatState>({
    step: 1,
    showResult: false,
    showEmailGate: false,
    isTyping: false
  });

  const [options, setOptions] = useState<ApiOptions>({});
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startTime = useRef<number>(Date.now());

  // ═══════════════════════════════════════════════════════════════════
  // 🔄 CARREGAR OPÇÕES INICIAIS
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    carregarOpcoes();
  }, []);

  const carregarOpcoes = async () => {
    try {
      const response = await fetch('/api/prediag/options');
      const data = await response.json();
      
      if (data.profiles) {
        // Converter array de strings para objetos com label
        const profilesFormatted = data.profiles.map((p: string) => ({
          id: p,
          label: getLabelPerfil(p)
        }));
        
        setOptions({
          profiles: profilesFormatted,
          agenda: data.agenda,
          goals: data.goals
        });
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🏷️ HELPER PARA LABELS DOS PERFIS
  // ═══════════════════════════════════════════════════════════════════

  const getLabelPerfil = (id: string): string => {
    const labels: Record<string, string> = {
      'estudante': 'Estudante',
      'estagiario': 'Estagiário',
      'analista': 'Analista/Assistente', 
      'especialista': 'Especialista/CLT pleno',
      'lider': 'Líder de equipe',
      'gestor': 'Gestor Sênior/Diretor',
      'empreendedor': 'Empreendedor/Autônomo'
    };
    return labels[id] || id;
  };

  // ═══════════════════════════════════════════════════════════════════
  // 📱 AUTO-SCROLL PARA NOVA MENSAGEM
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [state.step, state.isTyping, state.showResult]);

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 CARREGAR OPÇÕES ESPECÍFICAS POR PERFIL
  // ═══════════════════════════════════════════════════════════════════

 useEffect(() => {
  if (state.profile && (state.step === 3 || state.step === 5)) {
    carregarOpcoesPerfil(state.profile);
  }
}, [state.profile, state.step]);

  const carregarOpcoesPerfil = async (profile: string) => {
    try {
      setState(prev => ({ ...prev, isTyping: true }));
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular typing
      
      const response = await fetch(`/api/prediag/options?profile=${profile}`);
      const data = await response.json();
      
      setOptions(prev => ({
        ...prev,
        dores: data.dores,
        atividades: data.atividades,
        goals: data.goals
      }));
      
      setState(prev => ({ ...prev, isTyping: false }));
    } catch (error) {
      console.error('Erro ao carregar opções do perfil:', error);
      setState(prev => ({ ...prev, isTyping: false }));
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // ✅ HANDLER DE RESPOSTA DO USUÁRIO
  // ═══════════════════════════════════════════════════════════════════

 const handleResposta = async (valor: string) => {
  const perguntaAtual = PERGUNTAS[state.step - 1];
  
  // Atualizar estado com a resposta
  setState(prev => ({ 
    ...prev, 
    [perguntaAtual.tipo]: valor,
    isTyping: true
  }));

  // Simular delay de typing (UX mais natural)
  if (state.step < 5) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState(prev => ({ 
      ...prev, 
      step: prev.step + 1,
      isTyping: false
    }));
  } else {
    // Para a última pergunta, delay maior para compilar diagnóstico
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState(prev => ({ ...prev, isTyping: false }));
    
    // Mostrar mensagem de processamento
    setState(prev => ({ ...prev, isTyping: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Processar diagnóstico final
    await processarDiagnostico(valor);
  }
};

  // ═══════════════════════════════════════════════════════════════════
  // 🧠 PROCESSAR DIAGNÓSTICO FINAL
  // ═══════════════════════════════════════════════════════════════════

  const processarDiagnostico = async (goalFinal: string) => {
    setIsLoading(true);
    
    try {
      const duracao = Math.round((Date.now() - startTime.current) / 1000);
      
      const payload = {
        profile: state.profile,
        agenda: state.agenda,
        pain: state.pain,
        topActivity: state.topActivity,
        goal: goalFinal
      };

      const response = await fetch('/api/prediag/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev,
          goal: goalFinal,
          resultado: {
            ...data.resultado,
            sessionId: data.sessionId
          },
          showResult: true,
          isTyping: false
        }));
      } else {
        console.error('Erro no diagnóstico:', data.error);
        // Fallback com resultado genérico
        setState(prev => ({ 
          ...prev,
          resultado: {
            mix: { essencial: 40, estrategico: 25, tatico: 25, distracao: 10 },
            insight: "Não foi possível processar seu diagnóstico, mas baseado em seu perfil, há espaço para otimização.",
            sugestao: { 
              acao: "Identifique 1 atividade que consome muito tempo e automatize 25%",
              habito: "Blocos de foco de 90min, 2x por semana"
            },
            cenario: "ajustes"
          },
          showResult: true,
          isTyping: false
        }));
      }
    } catch (error) {
      console.error('Erro ao processar diagnóstico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 📧 MOSTRAR GATE DE EMAIL
  // ═══════════════════════════════════════════════════════════════════

  const handleMostrarEmailGate = () => {
    setState(prev => ({ ...prev, showEmailGate: true }));
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🎨 RENDERIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════

  const obterOpcoes = () => {
  const perguntaAtual = PERGUNTAS[state.step - 1];
  
  switch (perguntaAtual.tipo) {
    case 'profile':
      return options.profiles || [];
    case 'agenda':
      return options.agenda || [];
    case 'pain':
      return options.dores || [];
    case 'topActivity':
      return options.atividades || [];
    case 'goal':
      return options.goals || [];
    default:
      return [];
  }
};

  return (
    <div className="space-y-6">
      {/* Barra de Progresso */}
      <ProgressBar 
        current={state.showResult ? 5 : state.step} 
        total={5}
        showPercentage={!state.showResult}
      />

      {/* Histórico de Mensagens */}
      <div className="space-y-4">
        {PERGUNTAS.slice(0, state.showResult ? 5 : state.step).map((pergunta, index) => {
          const isAtual = index + 1 === state.step && !state.showResult;
          const foiRespondida = index + 1 < state.step || state.showResult;
          
          return (
            <div key={pergunta.id} className="fade-in mb-6">
  <MessageBubble
    texto={pergunta.texto}
    emoji={pergunta.emoji}
    isBot={true}
  />
  
  {foiRespondida && (
    <div className="mt-4">
      <MessageBubble
        texto={obterTextoResposta(pergunta.tipo as keyof ChatState)}
        isBot={false}
        isUser={true}
      />
    </div>
  )}
              
              {isAtual && !state.isTyping && (
  <div className="mt-6 mb-4 fade-in">
    <OptionList
      opcoes={obterOpcoes()}
      onSelect={handleResposta}
      isLoading={isLoading}
    />
  </div>
)}
            </div>
          );
        })}

        {/* Estado de Typing */}
{state.isTyping && (
  <div className="fade-in">
    <TypingDots 
      message={state.step === 5 && state.goal ? 
        "Compilando seu diagnóstico personalizado..." : 
        undefined
      } 
    />
  </div>
)}

        {/* Resultado Final */}
{state.showResult && state.resultado && !state.showEmailGate && (
  <div className="fade-in space-y-4 mt-6">
    <MessageBubble
      texto="Aqui está seu snapshot de hoje:"
      emoji="📊"
      isBot={true}
    />
    <div className="mt-4">
      <ResultCard
        resultado={state.resultado}
        onSolicitarPlanoCompleto={handleMostrarEmailGate}
      />
    </div>
  </div>
)}

        {/* Gate de Email */}
        {state.showEmailGate && (
          <div className="fade-in">
            <EmailGate
              sessionId={state.resultado?.sessionId}
              profile={state.profile || ''}
              onSuccess={() => {
                // Redirecionar para sistema completo ou página de sucesso
                window.location.href = '/auth?source=prediag';
              }}
            />
          </div>
        )}
      </div>

      {/* Referência para scroll */}
      <div ref={chatEndRef} />
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // 📝 HELPER PARA TEXTO DA RESPOSTA
  // ═══════════════════════════════════════════════════════════════════

 function obterTextoResposta(tipo: keyof ChatState): string {
  const valor = state[tipo] as string;
  
  if (!valor) return '';
  
  if (tipo === 'profile') {
    return getLabelPerfil(valor);
  }
  
  // Buscar na lista de opções correspondente ao tipo
  let listaOpcoes: Array<{id: string; label: string}> = [];
  
  switch (tipo) {
    case 'agenda':
      listaOpcoes = options.agenda || [];
      break;
    case 'pain':
      listaOpcoes = options.dores || [];
      break;
    case 'topActivity':
      listaOpcoes = options.atividades || [];
      break;
    case 'goal':
      listaOpcoes = options.goals || [];
      break;
  }
  
  const opcaoEncontrada = listaOpcoes.find(opt => opt.id === valor);
  return opcaoEncontrada?.label || valor;
}
}