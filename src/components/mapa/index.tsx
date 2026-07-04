// 🧩 COMPONENTES MODULARES - MAPA ATIVIDADES (VERSÃO MELHORADA)
// Arquivo: src/components/mapa/index.tsx
// ✅ CORREÇÕES: Conversão de horas + UI dos controles + Gráfico interativo melhorado

'use client'
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scatter, ScatterChart, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { 
  Download, Plus, Save, Trash2, Edit, Info, Target, BarChart3,
  ChevronDown, ChevronUp, Edit2, Clock, Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DESIGN_TOKENS, getZonaInfo, formatHoras, calcularHorasPorDia } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════
// 📊 TIPOS E INTERFACES (do código original)
// ═══════════════════════════════════════════════════════════════════

export interface Atividade {
  id?: string;
  nome: string;
  eixoX: number;
  eixoY: number;
  horasMes: number;
  user_id?: string;
}

type Periodo = "dia" | "semana" | "mes";
export type Zona = "distracao" | "tactica" | "estrategica" | "essencial";

// Constantes originais mantidas
const BG = "#042f2e";
const ACCENT = "#d97706";
const SCALE_MIN = 1;
const SCALE_MAX = 6;
const THRESHOLD_HIGH = 4;
const RED = "#ef4444";
const ORANGE = "#f59e0b";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const ROTULO_X = "Impacto";
const ROTULO_Y = "Clareza";
const DIAS_MES_BASE = 30;
const DIAS_UTEIS_MES = 20; // 
const SEMANAS_MES = 4;   

// Funções utilitárias originais
function formatHorasOriginal(num: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num);
}

// ✅ CORREÇÃO: Função de normalização melhorada
export function normalizarParaHorasMes(periodo: Periodo, horasNoPeriodo: number): number {
  const h = Math.max(0, Number(horasNoPeriodo) || 0);
  switch (periodo) {
    case "dia": 
      // Se trabalha X horas por dia, em 22 dias úteis = X * 22 horas/mês
      return h * DIAS_UTEIS_MES;
    case "semana": 
      // Se trabalha X horas por semana, em 4.33 semanas = X * 4.33 horas/mês
      return h * SEMANAS_MES;
    case "mes":
    default: 
      // Se já está em horas/mês, retorna direto
      return h;
  }
}

export function zonaECor(impacto: number, clareza: number): { zona: Zona; cor: string } {
  const impactoAlto = impacto >= THRESHOLD_HIGH;
  const clarezaAlta = clareza >= THRESHOLD_HIGH;
  if (impactoAlto && clarezaAlta) return { zona: "essencial", cor: GREEN };
  if (!impactoAlto && !clarezaAlta) return { zona: "distracao", cor: RED };
  if (!impactoAlto && clarezaAlta) return { zona: "tactica", cor: ORANGE };
  return { zona: "estrategica", cor: BLUE };
}

// ✅ MELHORADO: Função com jitter para evitar sobreposição
export function calcScatterDataComJitter(atividades: Atividade[]) {
  const pontosPorPosicao = new Map<string, number>();
  
  return atividades.map((a, index) => {
    const key = `${a.eixoX}-${a.eixoY}`;
    const count = pontosPorPosicao.get(key) || 0;
    pontosPorPosicao.set(key, count + 1);
    
    // Adiciona pequeno deslocamento circular se houver sobreposição
    let offsetX = 0;
    let offsetY = 0;
    if (count > 0) {
      const angle = (count - 1) * (Math.PI / 3); // Distribui em círculo
      offsetX = Math.cos(angle) * 0.08;
      offsetY = Math.sin(angle) * 0.08;
    }
    
    return {
      x: a.eixoX + offsetX,
      y: a.eixoY + offsetY,
      z: Math.max(a.horasMes / 10, 0.5), // ✅ MELHORADO: Bolhas maiores
      nome: a.nome,
      hMes: a.horasMes,
      id: a.id,
      originalX: a.eixoX,
      originalY: a.eixoY,
      ...zonaECor(a.eixoX, a.eixoY),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// 🎛️ COMPONENTE 1: FORMULÁRIO DE ATIVIDADE (CORRIGIDO)
// ═══════════════════════════════════════════════════════════════════

interface AtividadeFormProps {
  nome: string;
  setNome: (nome: string) => void;
  eixoX: number;
  setEixoX: (valor: number) => void;
  eixoY: number;
  setEixoY: (valor: number) => void;
  periodo: Periodo;
  setPeriodo: (periodo: Periodo) => void;
  horasNoPeriodo: number;
  setHorasNoPeriodo: (horas: number) => void;
  editId: string | null;
  onSubmit: () => void;
  onReset: () => void;
}

export function AtividadeForm({
  nome,
  setNome,
  eixoX,
  setEixoX,
  eixoY,
  setEixoY,
  periodo,
  setPeriodo,
  horasNoPeriodo,
  setHorasNoPeriodo,
  editId,
  onSubmit,
  onReset
}: AtividadeFormProps) {
  // ✅ CORREÇÃO: Cálculos melhorados
  const horasMesPreview = useMemo(() => normalizarParaHorasMes(periodo, horasNoPeriodo), [periodo, horasNoPeriodo]);
  const horasDiaPreview = useMemo(() => horasMesPreview / DIAS_UTEIS_MES, [horasMesPreview]);

  return (
    <Card className="glass border-0">
      <CardHeader>
        <CardTitle className="mono-title">Atividade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Campo Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input 
            id="nome" 
            placeholder="Ex.: Relatório de resultados" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" 
          />
        </div>

        {/* ✅ NOVO: Controles de Impacto e Clareza com Botões */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <Label className="block mb-2 text-sm sm:text-base">{ROTULO_X} (1-6)</Label>
    <NumberSelector value={eixoX} onChange={setEixoX} />
  </div>
  <div>
    <Label className="block mb-2 text-sm sm:text-base">{ROTULO_Y} (1-6)</Label>
    <NumberSelector value={eixoY} onChange={setEixoY} />
  </div>
</div>

        {/* Período e Horas */}
<div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <select 
              id="periodo" 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as Periodo)} 
              className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2 hover:border-white/40 focus:border-orange-500 transition-colors"
            >
              <option value="dia" className="bg-gray-900">Dia</option>
              <option value="semana" className="bg-gray-900">Semana</option>
              <option value="mes" className="bg-gray-900">Mês</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="horasPeriodo">
              Horas por {periodo === "mes" ? "mês" : periodo}
            </Label>
            <Input 
              id="horasPeriodo" 
              type="number" 
              min={0} 
              step="0.5" 
              value={horasNoPeriodo} 
              onChange={(e) => setHorasNoPeriodo(Number(e.target.value))} 
              className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" 
            />
          </div>
        </div>

        {/* ✅ CORREÇÃO: Preview de horas melhorado */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/70 mb-1">Conversão automática:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-white/50">Horas/mês:</span>
              <span className="ml-2 font-bold text-orange-400">
                {formatHorasOriginal(horasMesPreview)}h
              </span>
            </div>
            <div>
              <span className="text-white/50">Horas/dia:</span>
              <span className="ml-2 font-bold text-blue-400">
                {formatHorasOriginal(horasDiaPreview)}h
              </span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
<div className="flex flex-col sm:flex-row gap-2 pt-2">
  <Button onClick={onSubmit} className="accent-bg hover:opacity-90 text-black font-semibold flex-1 sm:flex-initial">
    <Plus className="mr-2 h-4 w-4"/>
    {editId ? "Atualizar" : "Adicionar"}
  </Button>
  <Button variant="destructive" onClick={onReset} className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-initial">
    <Save className="mr-2 h-4 w-4"/>
    Limpar formulário
  </Button>
</div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ✅ NOVO COMPONENTE: Seletor de Números (Substitui o Slider)
// ═══════════════════════════════════════════════════════════════════

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

function NumberSelector({ value, onChange }: NumberSelectorProps) {
  const numbers = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="flex gap-1 justify-between">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`
            w-full aspect-square rounded-lg font-bold text-sm transition-all
            ${value === num 
              ? 'bg-orange-500 text-black shadow-lg scale-110' 
              : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            }
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );
}// ═══════════════════════════════════════════════════════════════════
// 📈 COMPONENTE 2: GRÁFICO DE BOLHAS (MELHORADO)
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// 📱 COMPONENTES MOBILE - CARDS POR ZONA COM MINI-MATRIZ
// Adicionar no arquivo: src/components/mapa/index.tsx
// Localização: Adicionar ANTES do export function MapaChart
// ═══════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════
// 🗺️ MINI-MATRIZ VISUAL (Não interativa, apenas referência)
// ═══════════════════════════════════════════════════════════════════

interface MiniMatrizVisualProps {
  atividades: Atividade[];
}

function MiniMatrizVisual({ atividades }: MiniMatrizVisualProps) {
  // Criar grid 6x6 simplificado
  const grid = Array(6).fill(null).map(() => Array(6).fill(0));
  
  // Contar atividades por posição
  atividades.forEach(a => {
    const x = a.eixoX - 1; // Converter para índice 0-5
    const y = a.eixoY - 1;
    if (x >= 0 && x < 6 && y >= 0 && y < 6) {
      grid[5 - y][x]++; // Inverter Y para display correto
    }
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-xs text-white/60 mb-2 text-center">Visão Geral da Matriz</div>
      
      <div className="flex-1 relative">
        {/* Grid de fundo */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-px bg-white/10 rounded-lg overflow-hidden">
          {grid.map((row, rowIdx) => 
            row.map((count, colIdx) => {
              const x = colIdx + 1;
              const y = 6 - rowIdx;
              const { cor } = zonaECor(x, y);
              
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="relative flex items-center justify-center"
                  style={{ backgroundColor: count > 0 ? `${cor}20` : 'rgba(255,255,255,0.02)' }}
                >
                  {count > 0 && (
                    <div 
                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold"
                      style={{ backgroundColor: cor, color: '#000' }}
                    >
                      {count}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Labels dos eixos */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-white/50">
          Impacto →
        </div>
        <div className="absolute -left-8 top-0 bottom-0 flex items-center text-xs text-white/50">
          <span className="transform -rotate-90">Clareza →</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📇 CARD DE ATIVIDADE MOBILE
// ═══════════════════════════════════════════════════════════════════

interface CardAtividadeMobileProps {
  atividade: Atividade;
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: string) => void;
  cor: string;
}

function CardAtividadeMobile({ atividade, onEdit, onDelete, cor }: CardAtividadeMobileProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const newX = e.touches[0].clientX - startX;
    setCurrentX(Math.max(-100, Math.min(100, newX)));
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 60) {
      if (currentX > 0) {
        onEdit(atividade);
      } else {
        if (confirm('Excluir esta atividade?')) {
          onDelete(atividade.id!);
        }
      }
    }
    setCurrentX(0);
    setSwiping(false);
  };

  // Mostrar indicador apenas quando está deslizando
  const showEditIndicator = currentX > 30;
  const showDeleteIndicator = currentX < -30;

  return (
    <div className="relative overflow-hidden rounded-lg mb-2">
      {/* Fundo que aparece ao deslizar para EDITAR */}
      {showEditIndicator && (
        <div className="absolute inset-0 bg-orange-500 flex items-center justify-start pl-4 rounded-lg">
          <Edit2 className="w-5 h-5 text-white" />
          <span className="ml-2 text-white font-medium">Editar</span>
        </div>
      )}
      
      {/* Fundo que aparece ao deslizar para EXCLUIR */}
      {showDeleteIndicator && (
        <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-lg">
          <span className="mr-2 text-white font-medium">Excluir</span>
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Card principal */}
      <div 
        className="relative bg-gray-900/95 border border-white/10 p-4 rounded-lg"
        style={{
          transform: `translateX(${currentX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-white flex-1">{atividade.nome}</h4>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(atividade)}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            >
              <Edit2 className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => onDelete(atividade.id!)}
              className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-white/50">Impacto: </span>
            <span className="text-white font-medium">{atividade.eixoX}</span>
          </div>
          <div>
            <span className="text-white/50">Clareza: </span>
            <span className="text-white font-medium">{atividade.eixoY}</span>
          </div>
          <div>
            <span className="text-white/50">Horas: </span>
            <span className="text-white font-medium">{formatHorasOriginal(atividade.horasMes)}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// 📁 ZONA COLAPSÁVEL
// ═══════════════════════════════════════════════════════════════════

interface ZonaCollapsivelProps {
  titulo: string;
  cor: string;
  atividades: Atividade[];
  defaultOpen?: boolean;
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: string) => void;
}

function ZonaCollapsivel({ 
  titulo, 
  cor, 
  atividades, 
  defaultOpen = false,
  onEdit,
  onDelete
}: ZonaCollapsivelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const totalHoras = atividades.reduce((acc, a) => acc + a.horasMes, 0);
  
  const emoji = 
    titulo === "Essencial" ? "✅" :
    titulo === "Estratégica" ? "🎯" :
    titulo === "Tática" ? "⚡" : "⚠️";
    
  const mensagem = 
    titulo === "Essencial" ? "Foque aqui! Alto impacto" :
    titulo === "Estratégica" ? "Esclareça para executar" :
    titulo === "Tática" ? "Otimize ou delegue" : "Elimine ou reduza";

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 rounded-lg flex items-center justify-between transition-all"
        style={{ 
          backgroundColor: `${cor}15`,
          borderLeft: `4px solid ${cor}`
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{titulo}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cor}30`, color: cor }}>
                {atividades.length} {atividades.length === 1 ? 'atividade' : 'atividades'}
              </span>
            </div>
            <div className="text-xs text-white/60 mt-0.5">
              {mensagem} • {formatHorasOriginal(totalHoras)}h/mês
            </div>
          </div>
        </div>
        
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-white/60" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/60" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 pl-2">
          {atividades.length === 0 ? (
            <div className="text-center py-4 text-white/50 text-sm">
              Nenhuma atividade nesta zona
            </div>
          ) : (
            atividades.map(atividade => (
              <CardAtividadeMobile
                key={atividade.id}
                atividade={atividade}
                onEdit={onEdit}
                onDelete={onDelete}
                cor={cor}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL MOBILE
// ═══════════════════════════════════════════════════════════════════

interface MatrizMobileProps {
  atividades: Atividade[];
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: string) => void;
}

export function MatrizMobile({ atividades, onEdit, onDelete }: MatrizMobileProps) {
  // Agrupar por zona
  const atividadesPorZona = useMemo(() => {
    const grupos = {
      essencial: [] as Atividade[],
      estrategica: [] as Atividade[],
      tatica: [] as Atividade[],
      distracao: [] as Atividade[]
    };

    atividades.forEach(a => {
      const { zona } = zonaECor(a.eixoX, a.eixoY);
      if (zona === 'essencial') grupos.essencial.push(a);
      else if (zona === 'estrategica') grupos.estrategica.push(a);
      else if (zona === 'tactica') grupos.tatica.push(a);
      else grupos.distracao.push(a);
    });

    return grupos;
  }, [atividades]);

  return (
    <div className="md:hidden w-full"> {/* Só aparece no mobile */}
      
      {/* Mini-matriz visual */}
      <div className="h-[25vh] bg-white/5 rounded-lg p-6 mb-4 relative">
        <MiniMatrizVisual atividades={atividades} />
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{atividades.length}</div>
          <div className="text-xs text-white/60">Total de Atividades</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {formatHorasOriginal(atividades.reduce((acc, a) => acc + a.horasMes, 0))}h
          </div>
          <div className="text-xs text-white/60">Horas por Mês</div>
        </div>
      </div>

      {/* Cards por zona */}
      <div className="space-y-2">
        <ZonaCollapsivel
          titulo="Essencial"
          cor={GREEN}
          atividades={atividadesPorZona.essencial}
          defaultOpen={true}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        <ZonaCollapsivel
          titulo="Estratégica"
          cor={BLUE}
          atividades={atividadesPorZona.estrategica}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        <ZonaCollapsivel
          titulo="Tática"
          cor={ORANGE}
          atividades={atividadesPorZona.tatica}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        <ZonaCollapsivel
          titulo="Distração"
          cor={RED}
          atividades={atividadesPorZona.distracao}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Dica de uso */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          💡 <strong>Dica:</strong> Deslize os cards para editar (→) ou excluir (←)
        </p>
      </div>

      {/* 🔬 CARD DIAGNÓSTICO - Agora no final no mobile */}
      {atividades.length > 2 && (
        <div className="mt-6 p-4 bg-gradient-to-br from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Search className="w-5 h-5 text-orange-300" />
            </div>
            <h3 className="text-base font-semibold text-orange-200">Descubra seu Foco</h3>
          </div>
          
          <p className="text-orange-100 text-sm leading-relaxed mb-4">
            Agora que mapeou suas atividades, descubra se está investindo energia no que gera resultado!
          </p>
          
          <button 
            onClick={() => window.location.href = '/diagnostico'}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-all"
          >
            Executar Diagnóstico →
          </button>
        </div>
      )}
    </div>
  );
}

interface MapaChartProps {
  atividades: Atividade[];
  exportRef: React.RefObject<HTMLDivElement | null>;
  onEdit?: (atividade: Atividade) => void; // ✅ NOVO: Callback para edição
}

export function MapaChart({ atividades, exportRef, onEdit }: MapaChartProps) {
  const scatterData = useMemo(() => calcScatterDataComJitter(atividades), [atividades]);
  const TICKS = [1, 2, 3, 4, 5, 6];

  // ✅ NOVO: Handler para clique na bolha
  const handleBubbleClick = (data: any) => {
    if (data && onEdit) {
      const atividade = atividades.find(a => a.id === data.id);
      if (atividade) {
        onEdit(atividade);
      }
    }
  };

  return (
    <div ref={exportRef} className="rounded-xl p-4" style={{ background: "rgba(4,47,46,0.6)" }}>
      <div className="h-[380px] w-full">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.15)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[SCALE_MIN, SCALE_MAX]} 
              ticks={TICKS} 
              allowDecimals={false} 
              label={{ value: ROTULO_X, position: "insideBottom", offset: -8, fill: "#fff" }} 
              stroke="#fff" 
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[SCALE_MIN, SCALE_MAX]} 
              ticks={TICKS} 
              allowDecimals={false} 
              label={{ value: ROTULO_Y, angle: -90, position: "insideLeft", fill: "#fff" }} 
              stroke="#fff" 
            />
            <ZAxis dataKey="z" range={[200, 600]} /> {/* ✅ MELHORADO: Bolhas maiores */}
            <Tooltip content={<CustomTooltipMelhorado rotuloX={ROTULO_X} rotuloY={ROTULO_Y} atividades={atividades} />} />
            <Scatter 
              data={scatterData}
              onClick={handleBubbleClick}
              style={{ cursor: 'pointer' }}
            >
              {scatterData.map((d: any, idx: number) => (
                <Cell 
                  key={`cell-${idx}`} 
                  fill={d.cor}
                  fillOpacity={0.75}  /* ✅ MELHORADO: Transparência para ver sobreposições */
                  stroke={d.cor}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📋 COMPONENTE 3: TABELA DE ATIVIDADES (MANTIDO ORIGINAL)
// ═══════════════════════════════════════════════════════════════════

interface AtividadeTableProps {
  atividades: Atividade[];
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: string) => void;
}

export function AtividadeTable({ atividades, onEdit, onDelete }: AtividadeTableProps) {
  const totalHorasMes = useMemo(() => atividades.reduce((acc, a) => acc + (a.horasMes || 0), 0), [atividades]);

  // Agrupar atividades por zona
  const atividadesPorZona = useMemo(() => {
    const grupos = {
      essencial: [] as Atividade[],
      estrategica: [] as Atividade[],
      tatica: [] as Atividade[],
      distracao: [] as Atividade[]
    };

    atividades.forEach(a => {
      const { zona } = zonaECor(a.eixoX, a.eixoY);
      if (zona === 'essencial') grupos.essencial.push(a);
      else if (zona === 'estrategica') grupos.estrategica.push(a);
      else if (zona === 'tactica') grupos.tatica.push(a);
      else grupos.distracao.push(a);
    });

    return grupos;
  }, [atividades]);

  return (
    <div className="mt-6">
      <h3 className="mono-title text-lg mb-4">Lista de Atividades</h3>
      
      {atividades.length === 0 ? (
        <div className="text-center opacity-70 py-6 bg-white/5 rounded-lg">
          Nenhuma atividade ainda. Adicione usando o formulário acima.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Zona Essencial */}
          {atividadesPorZona.essencial.length > 0 && (
            <div className="bg-green-500/10 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                <span className="text-xl">✅</span>
                Essencial ({atividadesPorZona.essencial.length})
                <span className="text-xs opacity-70 ml-auto">
                  {formatHorasOriginal(atividadesPorZona.essencial.reduce((acc, a) => acc + a.horasMes, 0))}h/mês
                </span>
              </h4>
              <div className="grid gap-2">
                {atividadesPorZona.essencial.map(a => (
                  <CardAtividadeDesktop key={a.id} atividade={a} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Zona Estratégica */}
          {atividadesPorZona.estrategica.length > 0 && (
            <div className="bg-blue-500/10 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Estratégica ({atividadesPorZona.estrategica.length})
                <span className="text-xs opacity-70 ml-auto">
                  {formatHorasOriginal(atividadesPorZona.estrategica.reduce((acc, a) => acc + a.horasMes, 0))}h/mês
                </span>
              </h4>
              <div className="grid gap-2">
                {atividadesPorZona.estrategica.map(a => (
                  <CardAtividadeDesktop key={a.id} atividade={a} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Zona Tática */}
          {atividadesPorZona.tatica.length > 0 && (
            <div className="bg-orange-500/10 rounded-lg p-4 border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Tática ({atividadesPorZona.tatica.length})
                <span className="text-xs opacity-70 ml-auto">
                  {formatHorasOriginal(atividadesPorZona.tatica.reduce((acc, a) => acc + a.horasMes, 0))}h/mês
                </span>
              </h4>
              <div className="grid gap-2">
                {atividadesPorZona.tatica.map(a => (
                  <CardAtividadeDesktop key={a.id} atividade={a} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Zona Distração */}
          {atividadesPorZona.distracao.length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Distração ({atividadesPorZona.distracao.length})
                <span className="text-xs opacity-70 ml-auto">
                  {formatHorasOriginal(atividadesPorZona.distracao.reduce((acc, a) => acc + a.horasMes, 0))}h/mês
                </span>
              </h4>
              <div className="grid gap-2">
                {atividadesPorZona.distracao.map(a => (
                  <CardAtividadeDesktop key={a.id} atividade={a} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total de horas */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg flex items-center justify-between">
        <span className="text-sm opacity-70">Total geral:</span>
        <strong className="text-lg">{formatHorasOriginal(totalHorasMes)} horas/mês</strong>
      </div>
    </div>
  );
}

// Novo componente de Card para Desktop
function CardAtividadeDesktop({ atividade, onEdit, onDelete }: { 
  atividade: Atividade; 
  onEdit: (a: Atividade) => void; 
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
      <div className="flex-1 min-w-0">
       <h5 className="font-medium text-white break-words pr-2">
  {atividade.nome}
</h5>
        <div className="flex gap-4 text-xs text-white/60 mt-1">
          <span>Impacto: {atividade.eixoX}</span>
          <span>Clareza: {atividade.eixoY}</span>
          <span>{formatHorasOriginal(atividade.horasMes)}h/mês</span>
          <span>{formatHorasOriginal(atividade.horasMes / DIAS_UTEIS_MES)}h/dia</span>
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        <button 
          onClick={() => onEdit(atividade)}
          className="p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(atividade.id!)}
          className="p-2 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🎛️ COMPONENTE 4: CONTROLES E HEADER (MANTIDO ORIGINAL)
// ═══════════════════════════════════════════════════════════════════

interface MapaControlsProps {
  user: any;
  onExport: () => void;
  onLogout: () => void;
}

export function MapaControls({ user, onExport, onLogout }: MapaControlsProps) {
  const [mostrarOrientacao, setMostrarOrientacao] = useState(false);

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="mono-title text-3xl font-bold tracking-tight">Mapa de Atividades</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarOrientacao(!mostrarOrientacao)}
              className="p-1.5 hover:bg-white/10 text-white"
              title="Como usar o Mapa"
            >
              <Info size={18} />
            </Button>
          </div>
          <p className="text-sm opacity-80">
            Logado como: {user?.email} • Impacto × Clareza (1-6)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão Diagnóstico */}
          <Button 
            onClick={() => window.location.href = '/diagnostico'} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            title="Gerar diagnóstico baseado no ROI do Foco"
          >
            <BarChart3 className="mr-2 h-4 w-4"/>Diagnóstico
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/plano-acao'} 
            className="accent-bg hover:opacity-90 text-black font-semibold"
          >
            <Target className="mr-2 h-4 w-4"/>Plano de Ação
          </Button>
          
          <Button onClick={onExport} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
            <Download className="mr-2 h-4 w-4"/>Exportar PNG
          </Button>
          
          {/* Botão Sair */}
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white">
            Sair
          </Button>
        </div>
      </header>

      {/* Painel de Orientação - ROI do Foco */}
      {mostrarOrientacao && (
        <div className="mb-6 p-4 rounded-lg bg-teal-800/50 border border-teal-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info size={20} />
            Como usar o Mapa de Atividades (Método ROI do Foco)
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded">
              <h4 className="font-medium mb-2 text-yellow-200">📋 1. Mapeie suas atividades</h4>
              <p className="text-xs opacity-90 mb-2">
                Liste todas as atividades da sua rotina e posicione no gráfico:
              </p>
              <ul className="space-y-1 text-xs opacity-80">
                <li>• <strong>Impacto (Y):</strong> Contribuição para resultados</li>
                <li>• <strong>Clareza (X):</strong> Você entende o porquê/como</li>
              </ul>
            </div>

            <div className="bg-white/5 p-3 rounded">
              <h4 className="font-medium mb-2 text-yellow-200">🎯 2. Entenda as 4 zonas</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Essencial:</strong> FOQUE aqui!</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>Estratégica:</strong> EXPLORE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span><strong>Tática:</strong> OTIMIZE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span><strong>Distração:</strong> ELIMINE</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded">
              <h4 className="font-medium mb-2 text-yellow-200">🚀 3. Próximos passos</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-blue-600/30 px-2 py-1 rounded text-center">
                  1️⃣ <strong>Diagnóstico</strong> para análise
                </div>
                <div className="bg-orange-600/30 px-2 py-1 rounded text-center">
                  2️⃣ <strong>Plano de Ação</strong> baseado no mapa
                </div>
                <div className="bg-green-600/30 px-2 py-1 rounded text-center">
                  3️⃣ <strong>Exportar</strong> evolução
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-600">
            <h4 className="font-medium mb-2 text-yellow-200">💡 Conceito ROI do Foco</h4>
            <p className="text-xs opacity-90">
              <strong>Explorar:</strong> Mapear todas atividades → <strong>Eliminar:</strong> Cortar baixo impacto → <strong>Executar:</strong> Focar no essencial e estratégico. 
              O objetivo é investir seu tempo onde ele gera mais retorno.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📊 COMPONENTE 5: ESTATÍSTICAS RÁPIDAS (MANTIDO ORIGINAL)
// ═══════════════════════════════════════════════════════════════════

interface MapaStatsProps {
  atividades: Atividade[];
}

export function MapaStats({ atividades }: MapaStatsProps) {
  const stats = useMemo(() => {
    const total = atividades.length;
    const totalHoras = atividades.reduce((acc, a) => acc + a.horasMes, 0);
    const zonas = atividades.reduce((acc, a) => {
      const { zona } = zonaECor(a.eixoX, a.eixoY);
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalHoras,
      essencial: zonas.essencial || 0,
      estrategica: zonas.estrategica || 0,
      tactica: zonas.tactica || 0,
      distracao: zonas.distracao || 0,
    };
  }, [atividades]);

  if (atividades.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
      <h4 className="text-sm font-semibold mb-2">Resumo</h4>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="opacity-70">Total:</span> <strong>{stats.total} atividades</strong>
        </div>
        <div>
          <span className="opacity-70">Horas/mês:</span> <strong>{formatHorasOriginal(stats.totalHoras)}h</strong>
        </div>
        <div>
          <span style={{ color: GREEN }}>●</span> Essencial: <strong>{stats.essencial}</strong>
        </div>
        <div>
          <span style={{ color: BLUE }}>●</span> Estratégica: <strong>{stats.estrategica}</strong>
        </div>
        <div>
          <span style={{ color: ORANGE }}>●</span> Tática: <strong>{stats.tactica}</strong>
        </div>
        <div>
          <span style={{ color: RED }}>●</span> Distração: <strong>{stats.distracao}</strong>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🧩 COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

// ✅ MELHORADO: Tooltip que mostra todas as atividades no ponto
function CustomTooltipMelhorado({ active, payload, rotuloX, rotuloY, atividades }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    
    // Busca todas as atividades no mesmo ponto (ou próximas)
    const atividadesNoPonto = atividades.filter((a: Atividade) => 
      a.eixoX === d.originalX && a.eixoY === d.originalY
    );
    
    return (
      <div style={{ 
        background: "#0f172a", 
        border: "1px solid rgba(255,255,255,0.15)", 
        padding: 12, 
        borderRadius: 8, 
        color: "#fff",
        maxWidth: 250
      }}>
        {atividadesNoPonto.length > 1 ? (
          <>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#fbbf24" }}>
              {atividadesNoPonto.length} atividades neste ponto:
            </div>
            {atividadesNoPonto.map((a: Atividade, idx: number) => (
              <div key={idx} style={{ marginBottom: 4, fontSize: 12 }}>
                • {a.nome} ({formatHorasOriginal(a.horasMes)}h/mês)
              </div>
            ))}
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div>{rotuloX}: <strong>{d.originalX}</strong></div>
              <div>{rotuloY}: <strong>{d.originalY}</strong></div>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.nome}</div>
            <div>{rotuloX}: <strong>{d.originalX}</strong></div>
            <div>{rotuloY}: <strong>{d.originalY}</strong></div>
            <div>Horas/mês: <strong>{formatHorasOriginal(d.hMes)}</strong></div>
            <div>Horas/dia: <strong>{formatHorasOriginal(d.hMes / DIAS_UTEIS_MES)}</strong></div>
          </>
        )}
        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
          💡 Clique na bolha para editar
        </div>
      </div>
    );
  }
  return null;
}

