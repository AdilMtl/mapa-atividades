// 🧱 COMPONENTES BASE REUTILIZÁVEIS - CORRIGIDOS
// Arquivo: src/components/base/index.tsx

'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DESIGN_TOKENS, 
  cn
} from '@/lib/design-system';

// ═══════════════════════════════════════════════════════════════════
// 🏗️ PAGE CONTAINER - Estrutura base para todas as páginas
// ═══════════════════════════════════════════════════════════════════

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function PageContainer({ 
  children, 
  className,
  maxWidth = 'xl' 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-4xl',
    lg: 'max-w-6xl', 
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'min-h-screen w-full',
      `bg-[${DESIGN_TOKENS.colors.background}]`,
      'text-white p-6'
    )}>
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        className
      )}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📋 PAGE HEADER - Cabeçalho padrão com título e subtítulo
// ═══════════════════════════════════════════════════════════════════

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon,
  action,
  className 
}: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-8 flex items-center justify-between', className)}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={cn(
            'p-3 rounded-lg',
            `bg-[${DESIGN_TOKENS.colors.primary}]/20`,
            `text-[${DESIGN_TOKENS.colors.primary}]`
          )}>
            <Icon size={24} />
          </div>
        )}
        
        <div>
          <h1 className={cn(
            DESIGN_TOKENS.typography.h1,
            'text-white mb-1'
          )}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={cn(
              DESIGN_TOKENS.typography.body,
              'text-white/70'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📊 METRIC CARD - Card para exibir métricas e estatísticas
// ═══════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  color = 'primary',
  className,
  onClick
}: MetricCardProps) {
  const colorMap = {
    primary: DESIGN_TOKENS.colors.primary,
    success: DESIGN_TOKENS.colors.essencial,
    warning: DESIGN_TOKENS.colors.tatica,
    error: DESIGN_TOKENS.colors.distracao,
  };

  const trendColors = {
    up: DESIGN_TOKENS.colors.essencial,
    down: DESIGN_TOKENS.colors.distracao,
    neutral: DESIGN_TOKENS.colors.tatica,
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      <Card className={cn(
        'bg-white/5 border-white/10 backdrop-blur-sm',
        DESIGN_TOKENS.effects.transition.normal,
        'hover:bg-white/10'
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className={cn(
              DESIGN_TOKENS.typography.bodySmall,
              'text-white/70 font-medium'
            )}>
              {title}
            </p>
            
            {Icon && (
              <Icon 
                size={20} 
                style={{ color: colorMap[color] }}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <p className={cn(
              DESIGN_TOKENS.typography.h2,
              'text-white font-bold'
            )}>
              {value}
            </p>
            
            {subtitle && (
              <p className={cn(
                DESIGN_TOKENS.typography.bodySmall,
                'text-white/60'
              )}>
                {subtitle}
              </p>
            )}
            
            {trend && (
              <p 
                className={cn(
                  DESIGN_TOKENS.typography.caption,
                  'font-medium'
                )}
                style={{ color: trendColors[trendDirection] }}
              >
                {trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🗂️ EMPTY STATE - Estado vazio elegante com call-to-action
// ═══════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center py-12 px-6',
        className
      )}
    >
      <div className={cn(
        'p-4 rounded-full mb-6',
        'bg-white/5 border border-white/10'
      )}>
        <Icon 
          size={48} 
          className="text-white/40"
        />
      </div>
      
      <h3 className={cn(
        DESIGN_TOKENS.typography.h3,
        'text-white mb-2'
      )}>
        {title}
      </h3>
      
      <p className={cn(
        DESIGN_TOKENS.typography.body,
        'text-white/60 mb-6 max-w-md'
      )}>
        {subtitle}
      </p>
      
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className={cn(
            `bg-[${DESIGN_TOKENS.colors.primary}]`,
            'text-white hover:opacity-90',
            DESIGN_TOKENS.effects.transition.normal
          )}
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ⏳ LOADING SPINNER - Loading consistente e elegante
// ═══════════════════════════════════════════════════════════════════

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text,
  className 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        'py-8',
        className
      )}
    >
      <Loader2 
        size={sizeMap[size]} 
        className={cn(
          'animate-spin',
          `text-[${DESIGN_TOKENS.colors.primary}]`
        )}
      />
      
      {text && (
        <p className={cn(
          DESIGN_TOKENS.typography.bodySmall,
          'text-white/70'
        )}>
          {text}
        </p>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🔢 METRIC GRID - Grid responsivo para métricas
// ═══════════════════════════════════════════════════════════════════

interface MetricGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ 
  children, 
  columns = 3,
  className 
}: MetricGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-6',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📱 SECTION - Seção com título e conteúdo
// ═══════════════════════════════════════════════════════════════════

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function Section({ 
  title, 
  subtitle, 
  children, 
  className,
  headerAction 
}: SectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn(
            DESIGN_TOKENS.typography.h2,
            'text-white'
          )}>
            {title}
          </h2>
          
          {subtitle && (
            <p className={cn(
              DESIGN_TOKENS.typography.body,
              'text-white/60 mt-1'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
      
      <div>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📋 STATUS BADGE - Badge para mostrar status
// ═══════════════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    success: `bg-[${DESIGN_TOKENS.colors.essencial}]/20 text-[${DESIGN_TOKENS.colors.essencial}] border-[${DESIGN_TOKENS.colors.essencial}]/30`,
    warning: `bg-[${DESIGN_TOKENS.colors.tatica}]/20 text-[${DESIGN_TOKENS.colors.tatica}] border-[${DESIGN_TOKENS.colors.tatica}]/30`,
    error: `bg-[${DESIGN_TOKENS.colors.distracao}]/20 text-[${DESIGN_TOKENS.colors.distracao}] border-[${DESIGN_TOKENS.colors.distracao}]/30`,
    info: `bg-[${DESIGN_TOKENS.colors.estrategica}]/20 text-[${DESIGN_TOKENS.colors.estrategica}] border-[${DESIGN_TOKENS.colors.estrategica}]/30`,
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full',
      'text-xs font-medium border',
      statusStyles[status],
      className
    )}>
      {children}
    </span>
  );
}