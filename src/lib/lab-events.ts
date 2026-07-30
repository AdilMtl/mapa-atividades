// Lista canônica dos eventos de analytics do Lab (ISSUE-318): os 7 nomeados no plano da
// Fase 1A (`13_plano_fase1_lab.md` §8) + 3 da jornada que nasceu depois do plano — conclusão
// real (314B), check-up de resultado (314D) e ramo de Valor & Carreira (316). Decisão do dono
// em 2026-07-29: "ampliar com cirurgia", sem instrumentar cada tela da trilha.
//
// Módulo neutro (sem 'use client') pelo mesmo motivo do radar-events.ts: é importado tanto
// pelo helper client-side (src/lib/analytics.ts) quanto pela rota server-side
// (src/app/api/radar/event/route.ts).
//
// ⚠️ Trilho Supabase: os eventos lab_* gravam na MESMA tabela radar_events (decisão de reusar
// o pipeline — doc 13 §5). A coluna session_id tem FK para radar_sessions: chamadas do Lab
// NUNCA passam session_id (o project_id viaja no payload; se fosse enviado como session_id,
// o INSERT violaria a FK e o evento se perderia em silêncio).

export const LAB_EVENT_NAMES = [
  // Os 7 do plano da Fase 1A (doc 13 §8, ISSUE-318)
  'lab_project_started', //     wizard montou (intenção de criar projeto)
  'lab_wizard_completed', //    wizard terminou → projeto criado no banco
  'lab_diagnosis_viewed', //    página do projeto abriu com diagnóstico visível
  'lab_plan_generated', //      MÉTRICA NORTE: projeto chegou a plano (1ª visualização)
  'lab_step_completed', //      fase da Caminhada fechada (gate "fechei essa fase")
  'lab_asset_opened', //        guia/material aberto na biblioteca
  'lab_profile_completed', //   perfil do builder salvo
  // Jornada pós-plano (decisão do dono 2026-07-29 — "ampliar com cirurgia")
  'lab_project_concluded', //   conclusão REAL do projeto (o prêmio anti-Goodhart)
  'lab_result_submitted', //    check-up de resultado respondido (314D)
  'lab_branch_opened', //       ramo de Valor & Carreira aberto (316)
] as const

export type LabEventName = (typeof LAB_EVENT_NAMES)[number]
