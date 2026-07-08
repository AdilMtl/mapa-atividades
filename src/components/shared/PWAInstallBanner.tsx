'use client'

import * as React from 'react'
import { Download, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

// Evento não padronizado (Chrome/Edge) — sem tipo no lib.dom.d.ts.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Extraído de src/app/(publico)/page.tsx na ISSUE-107 (reposicionamento da home) —
// lógica intocada, só mudou de arquivo para sobreviver à substituição da landing antiga.
export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showPWABanner, setShowPWABanner] = React.useState(false)
  const [showPWAByScroll, setShowPWAByScroll] = React.useState(false)

  React.useEffect(() => {
    const handlePWAScroll = () => setShowPWAByScroll(window.scrollY > 200)
    window.addEventListener('scroll', handlePWAScroll)
    return () => window.removeEventListener('scroll', handlePWAScroll)
  }, [])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const hoursSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60)
      if (hoursSince < 1) return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPWABanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  React.useEffect(() => {
    if (deferredPrompt && showPWAByScroll) {
      setShowPWABanner(true)
    } else if (!showPWAByScroll) {
      setShowPWABanner(false)
    }
  }, [showPWAByScroll, deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPWABanner(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    setShowPWABanner(false)
  }

  return showPWABanner && deferredPrompt && showPWAByScroll ? (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 z-40 p-4">
      <div className="glass rounded-xl p-4 border border-accent/30 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight mb-1">
                📱 Instalar +ConverSaaS
              </p>
              <p className="text-xs text-white/70 leading-tight">
                Instalar cria um atalho na sua tela inicial.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-gradient-to-r from-accent to-orange-500 hover:from-orange-500 hover:to-accent"
          >
            Instalar Agora
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  ) : null
}
