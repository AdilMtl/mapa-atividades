// ═══════════════════════════════════════════════════════════════════
// 📧 EMAIL GATE - CAPTURA DE LEADS
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/EmailGate.tsx

import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/design-system';

interface EmailGateProps {
  sessionId?: string;
  profile: string;
  onSuccess: () => void;
}

export function EmailGate({ sessionId, profile, onSuccess }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return;
    }

    if (!validarEmail(email)) {
      setError('Por favor, digite um email válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/prediag/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
  setSuccess(true);
  // Removido redirecionamento automático
} else {
        setError(data.error || 'Erro ao salvar email. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
  return (
    <div className="w-full max-w-md mx-auto text-center fade-in">
      <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
        <CheckCircle2 
          className="w-12 h-12 mx-auto mb-4" 
          style={{ color: '#22c55e' }}
        />
        <h3 className="text-white font-semibold text-lg mb-2">
          📧 Solicitação enviada com sucesso!
        </h3>
        <p className="text-white/80 text-sm mb-4">
          Você receberá uma análise personalizada por email em até 24 horas.
        </p>
        <div className="space-y-3 mt-6">
          <p className="text-white/60 text-xs">
            Enquanto isso, assine nossa newsletter para receber insights semanais:
          </p>
          
            <a href="https://conversasnocorredor.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200"
          >
            Assinar Newsletter Gratuita
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
          <Mail 
            className="w-4 h-4" 
            style={{ color: DESIGN_TOKENS.colors.primary }}
          />
          <span className="text-white/80 text-sm font-medium">
            Plano Detalhado
          </span>
        </div>
        
        <h3 className="text-white font-semibold text-lg mb-2">
          🎯 Quer receber 3 recomendações + 1 hábito?
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          Com base no seu perfil <strong>{profile}</strong>, vamos enviar um plano 
          personalizado para otimizar seu foco.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="seu-email@exemplo.com"
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-orange-500 focus:bg-white/10 transition-all duration-200 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full py-3 px-4 rounded-xl font-semibold text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2"
          style={{
            backgroundColor: DESIGN_TOKENS.colors.primary,
            boxShadow: `0 4px 20px ${DESIGN_TOKENS.colors.primary}40`
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Receber Plano Detalhado
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Benefícios */}
      <div className="mt-6 space-y-3">
        <h4 className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span>📋</span> O que você vai receber:
        </h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-green-400 mt-0.5">✓</span>
            <span>3 recomendações específicas para seu perfil</span>
          </div>
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-green-400 mt-0.5">✓</span>
            <span>1 hábito semanal para manter o foco</span>
          </div>
          <div className="flex items-start gap-2 text-white/70">
  <span className="text-green-400 mt-0.5">✓</span>
  <span>Instruções para ter acesso a plataforma</span>
</div>
          <div className="flex items-start gap-2 text-white/70">
            <span className="text-green-400 mt-0.5">✓</span>
            <span>Insights da metodologia ROI do Foco</span>
          </div>
        </div>
      </div>

      {/* Privacidade */}
      <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
          <p className="text-white/60 text-xs leading-relaxed">
            Usamos seu email apenas para enviar o plano personalizado e insights sobre foco. 
            Você pode se descadastrar a qualquer momento.
          </p>
        </div>
      </div>

      {/* Link alternativo */}
      <div className="mt-4 text-center">
        <button
          onClick={() => onSuccess()}
          className="text-white/50 text-xs hover:text-white/70 transition-colors underline"
        >
          Continuar sem email → Acessar sistema
        </button>
      </div>
    </div>
  );
}