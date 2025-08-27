// ═══════════════════════════════════════════════════════════════════
// 💬 MESSAGE BUBBLE - MENSAGENS DO CHAT
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/components/prediagnostico/MessageBubble.tsx

import React from 'react';
import { Bot, User } from 'lucide-react';
import { DESIGN_TOKENS } from '@/lib/design-system';

interface MessageBubbleProps {
  texto: string;
  emoji?: string;
  isBot?: boolean;
  isUser?: boolean;
}

export function MessageBubble({ 
  texto, 
  emoji, 
  isBot = false, 
  isUser = false 
}: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} chat-message`}>
      {/* Avatar */}
      <div 
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
          isBot 
            ? 'bg-white/10 text-white border border-white/20' 
            : 'text-white border border-white/20'
        }`}
        style={{ 
          backgroundColor: isUser ? DESIGN_TOKENS.colors.primary : undefined 
        }}
      >
        {emoji ? (
          <span className="text-base">{emoji}</span>
        ) : isBot ? (
          <Bot className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {/* Bubble */}
      <div 
        className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'rounded-br-md text-black font-medium'
            : 'rounded-bl-md bg-white/5 border border-white/10 text-white'
        }`}
        style={{
          backgroundColor: isUser ? DESIGN_TOKENS.colors.primary : undefined
        }}
      >
        <p className="text-sm leading-relaxed">
          {texto}
        </p>
      </div>

      {/* Espaço para balanceamento visual */}
      <div className="w-10 flex-shrink-0"></div>
    </div>
  );
}