'use client'

import { useEffect, useSyncExternalStore } from 'react'

// =============================================================================
// SUPRESSÃO PONTUAL DO FAB (ISSUE-318D)
// A lista de ROTAS suprimidas é pura (`lib/feedback/supressao.ts`). Aqui mora o
// caso que rota não resolve: dentro dos radares, pergunta e gate de e-mail são
// ESTADO da mesma URL. Quem está nessas telas monta <SuprimirFeedback /> e o
// widget some enquanto o componente estiver na árvore.
// Contador (não booleano) porque duas telas podem suprimir ao mesmo tempo — a
// que desmonta primeiro não pode reacender o FAB da outra.
// =============================================================================

let supressoes = 0
const ouvintes = new Set<() => void>()

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function estaSuprimido() {
  return supressoes > 0
}

// No servidor nunca há supressão ativa: o efeito abaixo só roda no cliente,
// então o snapshot inicial bate com o do servidor e não há erro de hidratação.
function estaSuprimidoNoServidor() {
  return false
}

export function useFeedbackSuprimido(): boolean {
  return useSyncExternalStore(inscrever, estaSuprimido, estaSuprimidoNoServidor)
}

export function SuprimirFeedback() {
  useEffect(() => {
    supressoes += 1
    ouvintes.forEach((ouvinte) => ouvinte())
    return () => {
      supressoes -= 1
      ouvintes.forEach((ouvinte) => ouvinte())
    }
  }, [])

  return null
}
