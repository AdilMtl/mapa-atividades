'use client'

import { LogOut } from 'lucide-react'

import { supabase } from '@/lib/supabase'

// Único pedaço client do LabShell: sair limpa o cookie de sessão e volta pra home.
// `compacto` (AdminShell, v3.11.37): esconde o rótulo no mobile pra casar com o
// botão de voltar, que já é só ícone. O Lab segue com o texto — default false,
// zero mudança lá.
export function LabLogout({ compacto = false }: { compacto?: boolean }) {
  const sair = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      onClick={sair}
      aria-label="Sair da conta"
      className={`inline-flex min-h-11 items-center gap-2 rounded-ds2-pill font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary ${
        compacto ? 'min-w-11 justify-center px-0 sm:px-3' : 'px-3'
      }`}
    >
      <LogOut className="h-4 w-4" />
      <span className={compacto ? 'hidden sm:inline' : undefined}>Sair</span>
    </button>
  )
}
