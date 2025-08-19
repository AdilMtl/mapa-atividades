// 🧩 COMPONENTES MODULARES - MAPA ATIVIDADES
// Arquivo: src/components/mapa/index.tsx

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
import { Download, Plus, Save, Trash2, Edit, Info, Target } from "lucide-react";
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
const DIAS_UTEIS_MES = 20;
const SEMANAS_MES = 4;

// Funções utilitárias originais
function formatHorasOriginal(num: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(num);
}

export function normalizarParaHorasMes(periodo: Periodo, horasNoPeriodo: number): number {
  const h = Math.max(0, Number(horasNoPeriodo) || 0);
  switch (periodo) {
    case "dia": return h * DIAS_UTEIS_MES;
    case "semana": return h * SEMANAS_MES;
    case "mes":
    default: return h;
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

export function calcScatterData(atividades: Atividade[]) {
  return atividades.map((a) => ({
    x: a.eixoX,
    y: a.eixoY,
    z: Math.max(a.horasMes / DIAS_MES_BASE, 0.01),
    nome: a.nome,
    hMes: a.horasMes,
    ...zonaECor(a.eixoX, a.eixoY),
  }));
}

// ═══════════════════════════════════════════════════════════════════
// 🎛️ COMPONENTE 1: FORMULÁRIO DE ATIVIDADE
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
  const horasMesPreview = useMemo(() => normalizarParaHorasMes(periodo, horasNoPeriodo), [periodo, horasNoPeriodo]);
  const horasDiaPreview = useMemo(() => horasMesPreview / DIAS_MES_BASE, [horasMesPreview]);

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
            placeholder="Ex.: Exercícios físicos" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" 
          />
        </div>

        {/* Sliders Impacto e Clareza */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block mb-1">{ROTULO_X} (1-6)</Label>
            <DiscreteSlider value={eixoX} onChange={setEixoX} />
          </div>
          <div>
            <Label className="block mb-1">{ROTULO_Y} (1-6)</Label>
            <DiscreteSlider value={eixoY} onChange={setEixoY} />
          </div>
        </div>

        {/* Período e Horas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="periodo">Período</Label>
            <select 
              id="periodo" 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as Periodo)} 
              className="w-full rounded-md bg-transparent border border-white/20 px-3 py-2"
            >
              <option value="dia">Dia</option>
              <option value="semana">Semana</option>
              <option value="mes">Mês</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="horasPeriodo">Horas por {periodo}</Label>
            <Input 
              id="horasPeriodo" 
              type="number" 
              min={0} 
              step="0.25" 
              value={horasNoPeriodo} 
              onChange={(e) => setHorasNoPeriodo(Number(e.target.value))} 
              className="bg-transparent border-white/20 focus-visible:ring-[var(--accent)]" 
            />
          </div>
        </div>

        {/* Preview de horas */}
        <p className="text-xs opacity-70">
          Equivale a <strong>{formatHorasOriginal(horasMesPreview)}</strong> h/mês ({formatHorasOriginal(horasDiaPreview)} h/dia).
        </p>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onSubmit} className="accent-bg hover:opacity-90 text-black font-semibold">
            <Plus className="mr-2 h-4 w-4"/>
            {editId ? "Atualizar" : "Adicionar"}
          </Button>
          <Button variant="destructive" onClick={onReset} className="bg-red-600 hover:bg-red-700">
            <Save className="mr-2 h-4 w-4"/>
            Limpar formulário
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📈 COMPONENTE 2: GRÁFICO DE BOLHAS
// ═══════════════════════════════════════════════════════════════════

interface MapaChartProps {
  atividades: Atividade[];
  exportRef: React.RefObject<HTMLDivElement>;
}

export function MapaChart({ atividades, exportRef }: MapaChartProps) {
  const scatterData = useMemo(() => calcScatterData(atividades), [atividades]);
  const TICKS = [1, 2, 3, 4, 5, 6];

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
            <ZAxis dataKey="z" range={[70, 300]} />
            <Tooltip content={<CustomTooltip rotuloX={ROTULO_X} rotuloY={ROTULO_Y} />} />
            <Scatter data={scatterData}>
              {scatterData.map((d: any, idx: number) => (
                <Cell key={`cell-${idx}`} fill={d.cor} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📋 COMPONENTE 3: TABELA DE ATIVIDADES
// ═══════════════════════════════════════════════════════════════════

interface AtividadeTableProps {
  atividades: Atividade[];
  onEdit: (atividade: Atividade) => void;
  onDelete: (id: string) => void;
}

export function AtividadeTable({ atividades, onEdit, onDelete }: AtividadeTableProps) {
  const totalHorasMes = useMemo(() => atividades.reduce((acc, a) => acc + (a.horasMes || 0), 0), [atividades]);

  return (
    <div className="mt-6">
      <h3 className="mono-title text-lg mb-2">Tabela de atividades</h3>
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-white/90">Atividade</TableHead>
            <TableHead className="text-white/90">{ROTULO_X}</TableHead>
            <TableHead className="text-white/90">{ROTULO_Y}</TableHead>
            <TableHead className="text-white/90">Horas/mês</TableHead>
            <TableHead className="text-white/90">Horas/dia</TableHead>
            <TableHead className="text-white/90 text-right">Zona</TableHead>
            <TableHead className="text-white/90 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {atividades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center opacity-70 py-6">
                Nenhuma atividade ainda. Adicione usando o formulário ao lado.
              </TableCell>
            </TableRow>
          ) : (
            atividades.map((a) => {
              const { zona } = zonaECor(a.eixoX, a.eixoY);
              const etiqueta = zona === "distracao" ? "Distração" : 
                             zona === "tactica" ? "Tática" : 
                             zona === "estrategica" ? "Estratégica" : "Essencial";
              return (
                <TableRow key={a.id} className="border-white/10">
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell>{a.eixoX}</TableCell>
                  <TableCell>{a.eixoY}</TableCell>
                  <TableCell>{formatHorasOriginal(a.horasMes)}</TableCell>
                  <TableCell>{formatHorasOriginal(a.horasMes / DIAS_MES_BASE)}</TableCell>
                  <TableCell className="text-right">{etiqueta}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(a)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(a.id!)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <div className="mt-3 text-xs opacity-80">
        Total de horas/mês: <strong>{formatHorasOriginal(totalHorasMes)}</strong>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 🎛️ COMPONENTE 4: CONTROLES E HEADER
// ═══════════════════════════════════════════════════════════════════

interface MapaControlsProps {
  user: any;
  onExport: () => void;
  onLogout: () => void;
}

export function MapaControls({ user, onExport, onLogout }: MapaControlsProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="mono-title text-3xl font-bold tracking-tight">Mapa de Atividades</h1>
        <p className="text-sm opacity-80">
          Logado como: {user?.email} • Impacto × Clareza (1-6)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onExport} className="accent-bg hover:opacity-90 text-black font-semibold">
          <Download className="mr-2 h-4 w-4"/>Exportar PNG
        </Button>
        <Button 
          onClick={() => window.location.href = '/plano-acao'} 
          className="accent-bg hover:opacity-90 text-black font-semibold"
        >
          <Target className="mr-2 h-4 w-4"/>Plano de Ação
        </Button>
        <Button onClick={onLogout} variant="outline">Sair</Button>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📊 COMPONENTE 5: ESTATÍSTICAS RÁPIDAS
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
// 🧩 COMPONENTES AUXILIARES (do código original)
// ═══════════════════════════════════════════════════════════════════

function CustomTooltip({ active, payload, rotuloX, rotuloY }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload as { nome: string; x: number; y: number; z: number };
    return (
      <div style={{ 
        background: "#0f172a", 
        border: "1px solid rgba(255,255,255,0.15)", 
        padding: 10, 
        borderRadius: 8, 
        color: "#fff" 
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.nome}</div>
        <div>{rotuloX}: <strong>{d.x}</strong></div>
        <div>{rotuloY}: <strong>{d.y}</strong></div>
        <div>h/dia: <strong>{formatHorasOriginal(d.z)}</strong></div>
      </div>
    );
  }
  return null;
}

function DiscreteSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [internal, setInternal] = useState<number>(value);
  useEffect(() => setInternal(value), [value]);
  
  function commit(vals: number[]) {
    const v = Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(vals[0] ?? 3)));
    setInternal(v);
    onChange(v);
  }
  
  return (
    <div>
      <div className="flex items-center gap-2">
        <Slider 
          value={[internal]} 
          min={SCALE_MIN} 
          max={SCALE_MAX} 
          step={1} 
          onValueChange={(vals) => setInternal(vals[0] ?? 3)} 
          onValueCommit={commit} 
          className="[&_>.range]:bg-[var(--accent)]" 
        />
        <span className="w-8 text-right font-semibold">{internal}</span>
      </div>
      <div className="flex justify-between text-[10px] mt-1 opacity-70">
        {[1,2,3,4,5,6].map((n) => (<span key={n}>{n}</span>))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 📋 EXEMPLO DE USO - COMO MONTAR O MAPA MODULAR
// ═══════════════════════════════════════════════════════════════════

/*
// src/components/mapa-atividades-modular.tsx

import { 
  AtividadeForm,
  MapaChart, 
  AtividadeTable,
  MapaControls,
  MapaStats 
} from '@/components/mapa';

export default function MapaAtividadesModular() {
  // ... todos os states e functions originais ...

  return (
    <div style={containerStyle} className="text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MapaControls 
          user={user}
          onExport={exportarPNG}
          onLogout={logout}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AtividadeForm
              nome={nome}
              setNome={setNome}
              eixoX={eixoX}
              setEixoX={setEixoX}
              eixoY={eixoY}
              setEixoY={setEixoY}
              periodo={periodo}
              setPeriodo={setPeriodo}
              horasNoPeriodo={horasNoPeriodo}
              setHorasNoPeriodo={setHorasNoPeriodo}
              editId={editId}
              onSubmit={adicionarOuAtualizar}
              onReset={resetForm}
            />
            
            <MapaStats atividades={atividades} />
          </div>

          <Card className="glass border-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className="mono-title">Gráfico de bolhas</CardTitle>
            </CardHeader>
            <CardContent>
              <MapaChart 
                atividades={atividades}
                exportRef={exportRef}
              />
              
              <AtividadeTable
                atividades={atividades}
                onEdit={editar}
                onDelete={excluir}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
*/