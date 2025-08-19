// 🧠 MOTOR DE DIAGNÓSTICO - ENGINE SIMPLIFICADO
// Arquivo: src/lib/diagnostico-engine.ts

import { getZonaInfo } from './design-system';

// ═══════════════════════════════════════════════════════════════════
// 📊 TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface AtividadeDiagnostico {
  nome: string;
  eixoX: number;      // Impacto (1-6)
  eixoY: number;      // Clareza (1-6)
  horasMes: number;
}

export interface MixZonas {
  essencial: number;     // %
  estrategica: number;   // %
  tatica: number;        // %
  distracao: number;     // %
}

export type Cenario = 'saudavel' | 'ajustes' | 'critico';
export type TipoFoco = 'REDUZIR_DISTRACAO' | 'COMPRIMIR_TATICO' | 'FORTALECER_ESSENCIAL' | 'DAR_FORMA_ESTRATEGICO' | 'MANTER_PADRAO';

export interface ResultadoDiagnostico {
  mix: MixZonas;
  cenario: Cenario;
  focoPrimario: TipoFoco;
  focoSecundario?: TipoFoco;
  metaTexto: string;
  relatorioHtml: string;
  totalHoras: number;
  totalAtividades: number;
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 ALVOS SIMPLIFICADOS (PADRÃO ÚNICO)
// ═══════════════════════════════════════════════════════════════════

const ALVOS_IDEAIS = {
  essencial: { min: 40, max: 55 },      // 40-55%
  estrategica: { min: 20, max: 30 },    // 20-30%
  tatica: { min: 0, max: 25 },          // 0-25%
  distracao: { min: 0, max: 15 }        // 0-15%
};

const TOLERANCIA = 5; // ±5% de tolerância

// ═══════════════════════════════════════════════════════════════════
// 🧮 FUNÇÕES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════════

function calcularMixZonas(atividades: AtividadeDiagnostico[]): MixZonas {
  const somasPorZona = {
    essencial: 0,
    estrategica: 0,
    tatica: 0,
    distracao: 0
  };

  let totalHoras = 0;

  atividades.forEach(atividade => {
    const horas = atividade.horasMes || 0;
    totalHoras += horas;

    const { zona } = getZonaInfo(atividade.eixoX, atividade.eixoY);
    somasPorZona[zona] += horas;
  });

  // Converter para percentuais
  if (totalHoras === 0) {
    return { essencial: 0, estrategica: 0, tatica: 0, distracao: 0 };
  }

  return {
    essencial: Math.round((somasPorZona.essencial / totalHoras) * 100),
    estrategica: Math.round((somasPorZona.estrategica / totalHoras) * 100),
    tatica: Math.round((somasPorZona.tatica / totalHoras) * 100),
    distracao: Math.round((somasPorZona.distracao / totalHoras) * 100)
  };
}

function calcularDesvios(mix: MixZonas) {
  return {
    excessoDistracao: Math.max(0, mix.distracao - ALVOS_IDEAIS.distracao.max),
    excessoTatico: Math.max(0, mix.tatica - ALVOS_IDEAIS.tatica.max),
    faltaEssencial: Math.max(0, ALVOS_IDEAIS.essencial.min - mix.essencial),
    faltaEstrategica: Math.max(0, ALVOS_IDEAIS.estrategica.min - mix.estrategica)
  };
}

function determinarFoco(mix: MixZonas): { primario: TipoFoco; secundario?: TipoFoco } {
  const desvios = calcularDesvios(mix);
  
  // Heurística: ordem de prioridade baseada no PRD
  const prioridades: Array<{ tipo: TipoFoco; intensidade: number }> = [
    { tipo: 'REDUZIR_DISTRACAO', intensidade: desvios.excessoDistracao },
    { tipo: 'COMPRIMIR_TATICO', intensidade: desvios.excessoTatico },
    { tipo: 'FORTALECER_ESSENCIAL', intensidade: desvios.faltaEssencial },
    { tipo: 'DAR_FORMA_ESTRATEGICO', intensidade: desvios.faltaEstrategica }
  ];

  // Ordenar por intensidade (maior primeiro)
  prioridades.sort((a, b) => b.intensidade - a.intensidade);

  const primario = prioridades[0].intensidade > 0 ? prioridades[0].tipo : 'MANTER_PADRAO';
  const secundario = prioridades[1].intensidade >= prioridades[0].intensidade * 0.5 
    ? prioridades[1].tipo 
    : undefined;

  return { primario, secundario };
}

function determinarCenario(mix: MixZonas): Cenario {
  const desvios = calcularDesvios(mix);
  const leakage = mix.tatica + mix.distracao; // "Vazamento"

  // CRÍTICO: vazamento alto ou distração/tático excessivos
  if (leakage >= 50 || mix.distracao > 25 || mix.tatica > 40 || mix.essencial < 25) {
    return 'critico';
  }

  // SAUDÁVEL: tudo dentro da tolerância
  const dentroTolerancia = (
    Math.abs(mix.essencial - 47.5) <= TOLERANCIA &&
    Math.abs(mix.estrategica - 25) <= TOLERANCIA &&
    mix.tatica <= ALVOS_IDEAIS.tatica.max + TOLERANCIA &&
    mix.distracao <= ALVOS_IDEAIS.distracao.max + TOLERANCIA
  );

  if (dentroTolerancia) {
    return 'saudavel';
  }

  // AJUSTES: casos intermediários
  return 'ajustes';
}

// ═══════════════════════════════════════════════════════════════════
// 📝 TEMPLATES DE RELATÓRIO
// ═══════════════════════════════════════════════════════════════════

function gerarRelatorio(resultado: Omit<ResultadoDiagnostico, 'relatorioHtml'>): string {
  const { mix, cenario, focoPrimario, focoSecundario, metaTexto } = resultado;
  
  const mixTexto = `Essencial ${mix.essencial}%, Estratégica ${mix.estrategica}%, Tática ${mix.tatica}%, Distração ${mix.distracao}%`;
  
  const focoTexto = focoSecundario 
    ? `Foco primário: ${getFocoLabel(focoPrimario)}. Secundário: ${getFocoLabel(focoSecundario)}.`
    : `Foco primário: ${getFocoLabel(focoPrimario)}.`;

  const templates = {
    saudavel: `
      <div class="diagnostico-relatorio">
        <h2>🟢 Seu Perfil</h2>
        <p>Seu mapeamento mostra uma semana equilibrada — ${mixTexto}. Há espaço para respirar e transformar esforço em resultado sem depender de horas extras.</p>
        
        <h2>🎯 Foco</h2>
        <p>${focoTexto} Mesmo com o mix saudável, pequenos ajustes mantêm a roda girando no ritmo certo.</p>
        
        <h2>📋 O que fazer agora</h2>
        <p>A meta é simples: ${metaTexto} Na prática, proteja os blocos que já funcionam e apare as arestas que crescem quando a agenda aperta.</p>
        
        <h2>🚀 Próximos passos</h2>
        <p>Crie seu plano com três a cinco tarefas curtas e três a quatro rotinas semanais fáceis de marcar. Comece pelo básico que muda seu dia.</p>
        
        <h2>📅 Daqui a 30 dias</h2>
        <p>Refaça este diagnóstico em 30 dias e compare seu mix. A ideia é manter a consistência — menos urgências inventadas, mais avanço tranquilo no que importa.</p>
      </div>
    `,
    
    ajustes: `
      <div class="diagnostico-relatorio">
        <h2>🟡 Seu Perfil</h2>
        <p>Seu mapa indica um desvio pontual — ${mixTexto}. É o tipo de coisa que acontece quando a semana acumula pedidos e a gente só vai respondendo.</p>
        
        <h2>🎯 Foco</h2>
        <p>${focoTexto} É um ajuste fino, não uma virada de mesa.</p>
        
        <h2>📋 O que fazer agora</h2>
        <p>A meta é ${metaTexto} Com pequenas decisões de agenda e dois ou três rituais, o ponteiro volta ao lugar.</p>
        
        <h2>🚀 Próximos passos</h2>
        <p>Monte um plano curto: tarefas com prazo que caibam em 60–90 minutos e hábitos observáveis para sustentar o ritmo. Use o Plano de Ação para organizar suas próximas semanas.</p>
        
        <h2>📅 Daqui a 30 dias</h2>
        <p>Refaça este diagnóstico em 30 dias e compare. Se o ruído não subir, você consolida um padrão que poupa energia nos momentos exigentes.</p>
      </div>
    `,
    
    critico: `
      <div class="diagnostico-relatorio">
        <h2>🔴 Seu Perfil</h2>
        <p>O mapa acende um sinal vermelho — ${mixTexto}. Esse padrão costuma gerar desgaste alto e pouca entrega relevante.</p>
        
        <h2>🎯 Foco</h2>
        <p>${focoTexto} É uma ação de curto prazo para recuperar controle e proteger o que é inegociável.</p>
        
        <h2>📋 O que fazer agora</h2>
        <p>A meta das próximas quatro semanas é ${metaTexto} Regrinha simples: menos portas abertas para urgências, mais blocos protegidos para o que paga a conta.</p>
        
        <h2>🚀 Próximos passos</h2>
        <p>Escreva um plano direto: poucas tarefas com prazo curto e rotinas semanais fáceis de marcar. Use nosso Plano de Ação para estruturar blocos de 60-90 minutos e decidir quais convites recusar.</p>
        
        <h2>📅 Daqui a 30 dias</h2>
        <p>Refaça este diagnóstico em 30 dias. O objetivo é virar a linha: reduzir Distração/Tático e crescer Essencial/Estratégico.</p>
      </div>
    `
  };

  return templates[cenario];
}

function getFocoLabel(foco: TipoFoco): string {
  const labels = {
    'REDUZIR_DISTRACAO': 'Reduzir Distração',
    'COMPRIMIR_TATICO': 'Comprimir Tático', 
    'FORTALECER_ESSENCIAL': 'Fortalecer Essencial',
    'DAR_FORMA_ESTRATEGICO': 'Dar Forma ao Estratégico',
    'MANTER_PADRAO': 'Manter Padrão'
  };
  return labels[foco];
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 FUNÇÃO PRINCIPAL DO DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════════

export function gerarDiagnostico(atividades: AtividadeDiagnostico[]): ResultadoDiagnostico {
  // Validação básica
  if (!atividades || atividades.length === 0) {
    throw new Error('Nenhuma atividade encontrada para análise');
  }

  const atividadesComHoras = atividades.filter(a => a.horasMes > 0);
  if (atividadesComHoras.length < 3) {
    throw new Error('Mínimo de 3 atividades com horas preenchidas necessário');
  }

  // Cálculos principais
  const mix = calcularMixZonas(atividades);
  const cenario = determinarCenario(mix);
  const { primario: focoPrimario, secundario: focoSecundario } = determinarFoco(mix);
  
  const metaTexto = "Distração ≤15%, Tático ≤25%, Essencial ~45%, Estratégico ~25%";
  
  const totalHoras = atividades.reduce((sum, a) => sum + (a.horasMes || 0), 0);
  const totalAtividades = atividades.length;

  // Resultado parcial para gerar relatório
  const resultadoParcial = {
    mix,
    cenario,
    focoPrimario,
    focoSecundario,
    metaTexto,
    totalHoras,
    totalAtividades
  };

  const relatorioHtml = gerarRelatorio(resultadoParcial);

  return {
    ...resultadoParcial,
    relatorioHtml
  };
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 UTILITÁRIOS PARA UI
// ═══════════════════════════════════════════════════════════════════

export function getCenarioColor(cenario: Cenario): string {
  const cores = {
    saudavel: '#22c55e',    // Verde
    ajustes: '#eab308',     // Amarelo
    critico: '#ef4444'      // Vermelho
  };
  return cores[cenario];
}

export function getCenarioIcon(cenario: Cenario): string {
  const icones = {
    saudavel: '🟢',
    ajustes: '🟡', 
    critico: '🔴'
  };
  return icones[cenario];
}

export function formatarPercentual(valor: number): string {
  return `${valor}%`;
}

export function validarDadosParaDiagnostico(atividades: AtividadeDiagnostico[]): { valido: boolean; erro?: string } {
  if (!atividades || atividades.length === 0) {
    return { valido: false, erro: 'Nenhuma atividade cadastrada' };
  }

  const comHoras = atividades.filter(a => a.horasMes > 0);
  if (comHoras.length < 3) {
    return { 
      valido: false, 
      erro: `Mínimo 3 atividades com horas necessárias. Você tem ${comHoras.length}.` 
    };
  }

  const percentualComHoras = (comHoras.length / atividades.length) * 100;
  if (percentualComHoras < 70) {
    return {
      valido: false,
      erro: `Preencha horas em pelo menos 70% das atividades. Atual: ${Math.round(percentualComHoras)}%`
    };
  }

  return { valido: true };
}