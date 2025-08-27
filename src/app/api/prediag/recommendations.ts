// ═══════════════════════════════════════════════════════════════════
// 🧠 HEURÍSTICA DE RECOMENDAÇÕES EMAIL - ROI DO FOCO
// ═══════════════════════════════════════════════════════════════════
// Arquivo: src/app/api/prediag/recommendations.ts

export type Categoria = "HABITO" | "TAREFA" | "MINDSET";
export type Impacto = "ALTO" | "MEDIO" | "BAIXO";

export interface RecomendacaoEmail {
  titulo: string;
  descricao: string;
  acao: string;
  categoria: Categoria;
  impacto: Impacto;
}

// Utilitários
const isBusy = (agenda: string) => agenda === "sempre_lotada" || agenda === "freq_cheia";

function impactoFromAgenda(agenda: string): Impacto {
  if (agenda === "sempre_lotada") return "ALTO";
  if (agenda === "freq_cheia") return "ALTO";
  if (agenda === "equilibrada") return "MEDIO";
  return "MEDIO";
}

// Base de sugestões por dor
const SUG_PAIN: Record<string, Record<Categoria, Omit<RecomendacaoEmail, 'categoria' | 'impacto'>>> = {
  urgencias: {
    HABITO: {
      titulo: "Checagens programadas",
      descricao: "Defina janelas fixas para lidar com pedidos e mensagens. Evita reatividade o dia todo e preserva blocos de foco.",
      acao: "Faça 2 checagens/dia (11h e 16h) com temporizador de 15 min."
    },
    TAREFA: {
      titulo: "Acordo de prioridade (SLA)",
      descricao: "Padronize o que é urgente, prazos e canal de acionamento. Reduz interrupções e alinha expectativas do time.",
      acao: "Publique um SLA simples (o que é urgente, quem aciona, em quanto tempo)."
    },
    MINDSET: {
      titulo: "Não confunda barulho com prioridade",
      descricao: "Nem toda mensagem merece resposta imediata. Proteja o essencial antes de reagir ao que é ruidoso.",
      acao: "Comece o dia pela Top 1 essencial antes de abrir e-mails/mensagens."
    }
  },
  operacional_demais: {
    HABITO: {
      titulo: "Revisão semanal de 30 min",
      descricao: "Um checkpoint curto para consolidar entregas, ajustar prioridades e identificar automações/delegações.",
      acao: "Bloqueie 30 min toda sexta-feira para revisar o quadro e decidir 1 automação."
    },
    TAREFA: {
      titulo: "Automatizar relatórios",
      descricao: "Padronize dados e reduza trabalhos manuais. Templates e integrações cortam horas táticas.",
      acao: "Crie 1 template de relatório com campos automáticos e checklist de coleta."
    },
    MINDSET: {
      titulo: "80/20 nas entregas",
      descricao: "Entregue o valor crítico primeiro. Refine depois só se gerar impacto real para o objetivo do seu goal.",
      acao: "Defina o 'resultado mínimo valioso' da próxima entrega e pare no 80/20."
    }
  },
  reunioes: {
    HABITO: {
      titulo: "Reuniões 25/50",
      descricao: "Reduza calendários de 30→25 min e 60→50 min; ganhe respiros e foque em decisões objetivas.",
      acao: "Ajuste a duração padrão do calendário e adote pauta com decisão esperada."
    },
    TAREFA: {
      titulo: "Status assíncrono",
      descricao: "Transforme reuniões de status em atualização escrita. Só mantenha encontros para decisões.",
      acao: "Implemente um doc/kanban semanal e cancele 1 recorrência de status."
    },
    MINDSET: {
      titulo: "Reunião é último recurso",
      descricao: "Sincronize apenas quando assíncrono não resolve. Definir 'por quê/resultado' antes de agendar.",
      acao: "Inclua 'decisão esperada' no convite ou recuse com alternativa assíncrona."
    }
  },
  falta_clareza: {
    HABITO: {
      titulo: "Planejamento diário de 15 min",
      descricao: "Antes do trabalho, defina Top 3 do dia conectadas ao seu objetivo principal (goal).",
      acao: "Liste Top 3 às 9h e faça a primeira por 30 min sem notificações."
    },
    TAREFA: {
      titulo: "Brief padrão",
      descricao: "Padronize escopo, critérios de pronto e prazo. Evita retrabalhos e acelera decisões.",
      acao: "Crie 1 template de brief com 'problema, done, prazo, donos'."
    },
    MINDSET: {
      titulo: "Clareza precede velocidade",
      descricao: "Ir rápido no vago aumenta retrabalho. Pare 10 min para clarificar antes de executar.",
      acao: "Antes de iniciar, escreva em 1 linha o resultado esperado da tarefa."
    }
  },
  falta_energia: {
    HABITO: {
      titulo: "Hábito âncora de 5 min",
      descricao: "Um micro-início diário para romper inércia e construir consistência alinhada ao seu goal.",
      acao: "Faça 5 min da atividade essencial antes de qualquer outra."
    },
    TAREFA: {
      titulo: "Higiene de sono/ambiente",
      descricao: "Rotina simples de sono e ambiente de foco aumentam energia e constância.",
      acao: "Defina horário fixo de dormir e deixe o espaço de trabalho pronto na noite anterior."
    },
    MINDSET: {
      titulo: "Consistência > intensidade",
      descricao: "Resultados estáveis vêm de pequenas repetições, não de explosões esporádicas.",
      acao: "Prefira sessões curtas diárias em vez de maratonas ocasionais."
    }
  }
};

// Complementos por atividade dominante
const SUG_ACTIVITY: Record<string, Record<Categoria, Omit<RecomendacaoEmail, 'categoria' | 'impacto'>>> = {
  emails: {
    HABITO: {
      titulo: "Top 3 antes do e-mail",
      descricao: "Evite começar o dia reagindo. Programe seu foco essencial antes da caixa de entrada.",
      acao: "Faça 30 min na sua Top 1 antes de abrir e-mails."
    },
    TAREFA: {
      titulo: "Triagem 2×/dia + filtros",
      descricao: "Lotes de leitura com filtros/labels reduzem dispersão e aceleram respostas.",
      acao: "Crie 3 filtros úteis e processe e-mails só 11h e 16h."
    },
    MINDSET: {
      titulo: "Inbox ≠ lista de tarefas",
      descricao: "Mensagens são fluxo, não backlog. Transfira ações para seu sistema.",
      acao: "Mova qualquer ação >2 min para seu quadro/todo e arquive o e-mail."
    }
  },
  reunioes_status: {
    HABITO: {
      titulo: "Pauta objetiva",
      descricao: "Defina objetivo e decisão esperada antes da reunião. Encontros mais curtos e úteis.",
      acao: "Envie pauta com 3 itens e encaminhe pré-leitura."
    },
    TAREFA: {
      titulo: "Resumos assíncronos",
      descricao: "Atualizações por escrito liberam horas na agenda e mantêm histórico.",
      acao: "Substitua 1 recorrência por resumo em doc/kanban."
    },
    MINDSET: {
      titulo: "Tempo é restrição",
      descricao: "Trate reuniões como custo alto de foco. Questione valor antes de aceitar.",
      acao: "Recuse convites sem pauta/resultado e proponha alternativa."
    }
  },
  urgencias_demandas: {
    HABITO: {
      titulo: "Buffers diários",
      descricao: "Janelas de 30 min para absorver imprevistos sem invadir blocos essenciais.",
      acao: "Reserve 30 min às 12h e 17h como buffer."
    },
    TAREFA: {
      titulo: "Roteiro de escalonamento",
      descricao: "Defina quem aciona o quê e em qual canal. Menos interrupções difusas.",
      acao: "Publique o fluxograma de escalonamento no time."
    },
    MINDSET: {
      titulo: "Do urgente ao importante",
      descricao: "Nem tudo que queima agrega valor. Proteja o estratégico diariamente.",
      acao: "Bloqueie 90 min diários de foco mesmo em semanas críticas."
    }
  },
  relatorios: {
    HABITO: {
      titulo: "Compilação semanal",
      descricao: "Junte dados uma vez por semana para evitar micro-coletas diárias.",
      acao: "Bloqueie 45 min na sexta para consolidar dados."
    },
    TAREFA: {
      titulo: "Template + automação",
      descricao: "Campos automáticos e planilhas conectadas cortam horas táticas.",
      acao: "Padronize o relatório e conecte 1 fonte de dados automática."
    },
    MINDSET: {
      titulo: "Documente uma vez, reutilize",
      descricao: "Evite refazer do zero. Crie ativos reaproveitáveis.",
      acao: "Crie um repositório de gráficos/modelos prontos."
    }
  },
  atendimento_interno: {
    HABITO: {
      titulo: "Janela de atendimento",
      descricao: "Concentre atendimentos em blocos e evite ping-pong o dia todo.",
      acao: "Defina 2 janelas/dia e responda fora delas só por exceção."
    },
    TAREFA: {
      titulo: "FAQ/Respostas padrão",
      descricao: "Textos prontos reduzem tempo e aumentam qualidade das respostas.",
      acao: "Crie 5 respostas padrão para dúvidas repetidas."
    },
    MINDSET: {
      titulo: "Serviço sem servilismo",
      descricao: "Atenda bem sem abrir mão de foco. Expectativas claras geram satisfação.",
      acao: "Envie tempos de resposta claros no primeiro contato."
    }
  },
  projetos: {
    HABITO: {
      titulo: "Ritual de prospecção",
      descricao: "Toques diários previsíveis alimentam pipeline e reduzem picos de esforço.",
      acao: "Faça 10 toques/dia antes das 11h."
    },
    TAREFA: {
      titulo: "Bloco de follow-up",
      descricao: "Organize retornos em lote, com roteiro e CRM atualizado.",
      acao: "Bloqueie 45 min/dia para follow-ups no CRM."
    },
    MINDSET: {
      titulo: "Pipeline primeiro",
      descricao: "Sem topo de funil, não há meta. Proteja prospecção como atividade essencial.",
      acao: "Mantenha 2h/semana intocáveis para gerar novas oportunidades."
    }
  },
  treinamentos: {
    HABITO: {
      titulo: "Pomodoro de foco",
      descricao: "Ciclos curtos e sem notificação aumentam retenção e constância.",
      acao: "Faça 4 pomodoros/dia (25/5) na matéria prioritária."
    },
    TAREFA: {
      titulo: "Plano de estudo",
      descricao: "Quebre objetivos por matéria, capítulos e prazos realistas.",
      acao: "Monte um cronograma com metas semanais mensuráveis."
    },
    MINDSET: {
      titulo: "Aprender é investimento",
      descricao: "Trate estudo como atividade essencial, não 'quando der'.",
      acao: "Bloqueie 90 min fixos no calendário para estudo profundo."
    }
  }
};

// Ajustes orientados ao goal
const GOAL_TWEAKS: Record<string, (rec: RecomendacaoEmail) => RecomendacaoEmail> = {
  vender_mais: (rec) => ({
    ...rec,
    descricao: rec.descricao + " Foque em ações que aumentem conversas qualificadas.",
    acao: rec.categoria === "TAREFA" ? "Agende 2h/semana para prospecção + 45 min/dia de follow-ups." : rec.acao,
  }),
  tempo_planejamento: (rec) => ({
    ...rec,
    descricao: rec.descricao + " Proteja blocos para decidir rumos e prioridades.",
    acao: rec.categoria === "HABITO" ? "Bloqueie 2h na terça para planejamento com telefone no modo foco." : rec.acao,
  }),
  entregas_prazo: (rec) => ({
    ...rec,
    descricao: rec.descricao + " Garanta visibilidade e marcos de acompanhamento.",
    acao: rec.categoria === "TAREFA" ? "Crie um workback schedule com marcos e donos antes de iniciar." : rec.acao,
  }),
  melhorar_notas: (rec) => ({
    ...rec,
    descricao: rec.descricao + " Direcione esforço para conteúdos de maior peso na prova.",
    acao: rec.categoria === "HABITO" ? "Faça 4 pomodoros/dia na disciplina com menor nota." : rec.acao,
  }),
  escalar_processos: (rec) => ({
    ...rec,
    descricao: rec.descricao + " Padronize e delegue para ganhar escala.",
    acao: rec.categoria === "TAREFA" ? "Mapeie 1 processo crítico e crie SOP + vídeo de treinamento." : rec.acao,
  }),
};

function pickRecommendations(profile: string, agenda: string, pain: string, topActivity: string, goal: string): RecomendacaoEmail[] {
  const candidates: Record<Categoria, Array<{ score: number; rec: RecomendacaoEmail }>> = { 
    HABITO: [], 
    TAREFA: [], 
    MINDSET: [] 
  };

  const painPack = SUG_PAIN[pain] || null;
  const actPack = SUG_ACTIVITY[topActivity] || null;

  const pushCand = (src: Record<Categoria, Omit<RecomendacaoEmail, 'categoria' | 'impacto'>> | null, tag: string) => {
    if (!src) return;
    Object.entries(src).forEach(([categoria, rec]) => {
      const base: RecomendacaoEmail = { 
        ...rec, 
        categoria: categoria as Categoria, 
        impacto: impactoFromAgenda(agenda) 
      };
      let score = 0;
      if (tag === "pain") score += 3;
      if (tag === "activity") score += 2;
      if (GOAL_TWEAKS[goal]) score += 1;
      candidates[categoria as Categoria].push({ score, rec: base });
    });
  };

  pushCand(painPack, "pain");
  pushCand(actPack, "activity");

  // Fallbacks para garantir 1 opção por categoria
  const fallback: Record<Categoria, Omit<RecomendacaoEmail, 'categoria' | 'impacto'>> = {
    HABITO: {
      titulo: "Primeira hora essencial",
      descricao: "Comece o dia protegendo o que move o ponteiro do seu goal.",
      acao: "Trabalhe 60 min na tarefa essencial antes de abrir e-mails/mensagens."
    },
    TAREFA: {
      titulo: "Cancelar 1 recorrência",
      descricao: "Liberar espaço rápido na agenda aumenta foco e energia.",
      acao: "Cancele ou reduza em 50% 1 reunião recorrente esta semana."
    },
    MINDSET: {
      titulo: "Menos, porém melhor",
      descricao: "Escolha poucas coisas vitais e elimine o resto com elegância.",
      acao: "Diga não a 1 demanda de baixo impacto e explique o porquê."
    }
  };

  (["HABITO", "TAREFA", "MINDSET"] as const).forEach((cat) => {
    if (candidates[cat].length === 0) {
      candidates[cat].push({ 
        score: 0, 
        rec: { 
          ...fallback[cat], 
          categoria: cat, 
          impacto: impactoFromAgenda(agenda) 
        } 
      });
    }
  });

  // Seleciona o de maior score por categoria
  const selected = (["HABITO", "TAREFA", "MINDSET"] as const).map((cat) => {
    const best = candidates[cat].sort((a, b) => b.score - a.score)[0].rec;
    const tweaker = GOAL_TWEAKS[goal];
    const tweaked = tweaker ? tweaker(best) : best;
    const impacto = isBusy(agenda) ? "ALTO" : tweaked.impacto;
    return { ...tweaked, impacto };
  });

  return selected;
}

export function gerarRecomendacoes(
  profile: string,
  agenda: string,
  pain: string,
  topActivity: string,
  goal: string
): RecomendacaoEmail[] {
  return pickRecommendations(profile, agenda, pain, topActivity, goal);
}