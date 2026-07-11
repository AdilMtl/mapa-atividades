'use client'

import { LogOut } from 'lucide-react'

import { supabase } from '@/lib/supabase'

// Único pedaço client do LabShell: sair limpa o cookie de sessão e volta pra home.
export function LabLogout() {
  const sair = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      onClick={sair}
      className="inline-flex min-h-11 items-center gap-2 rounded-ds2-pill px-3 font-ds2-mono text-xs text-ds2-text-muted transition-colors hover:text-ds2-text-primary"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  )
}
