// ═══════════════════════════════════════════════════════════════════
// ⌨️ TYPING DOTS - INDICADOR DE "DIGITANDO..."
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/TypingDots.tsx

import React from 'react';
import { Bot } from 'lucide-react';

interface TypingDotsProps {
  message?: string;
}

export function TypingDots({ message = "digitando..." }: TypingDotsProps) {
  return (
    <div className="flex gap-3 chat-message mb-6 mt-4">
      {/* Avatar do Bot */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Bubble com dots animados */}
      <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md max-w-sm">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
            />
            <div 
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
            />
            <div 
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
            />
          </div>
          <span className="ml-2 text-white/50 text-xs">{message}</span>
        </div>
      </div>

      {/* Espaço para balanceamento */}
      <div className="w-10 flex-shrink-0"></div>
    </div>
  );
}