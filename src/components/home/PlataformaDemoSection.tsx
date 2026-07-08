'use client'

import * as React from 'react'
import { Play } from 'lucide-react'

import { Badge, Eyebrow, Module, ModuleHead, SectionTitle } from '@/components/ds2'
import { cn } from '@/lib/utils'

const VIDEOS = [
  {
    slug: 'mapeamento',
    label: '01 / Mapa de Atividades',
    titulo: 'Enxergue onde seu tempo rende',
    descricao: 'Impacto × clareza, quatro zonas, zero achismo.',
  },
  {
    slug: 'diagnostico',
    label: '02 / Diagnóstico de Foco',
    titulo: 'Análise automática do seu mix',
    descricao: 'Relatório do seu perfil de foco com recomendações específicas.',
  },
  {
    slug: 'taticas',
    label: '03 / Plano de Ação',
    titulo: 'Do diagnóstico à tática',
    descricao: 'O framework DAR CERTO transforma análise em ação — uma tática por vez.',
  },
  {
    slug: 'kanban',
    label: '04 / Fluxo Semanal',
    titulo: 'Da intenção à execução',
    descricao: 'Arraste táticas na semana e veja o que de fato saiu do papel.',
  },
]

// Progressive loading (padrão herdado da home antiga): só o primeiro vídeo carrega/toca
// sozinho; os demais só renderizam o <video> depois de um clique — economiza dados móveis.
export function PlataformaDemoSection() {
  const [playing, setPlaying] = React.useState<Record<number, boolean>>({ 0: true })

  return (
    <section>
      <div className="rounded-ds2-panel border border-ds2-border-subtle bg-ds2-surface-glass p-6 md:p-8">
        <Eyebrow>O ecossistema em funcionamento</Eyebrow>
        <SectionTitle className="mt-3">A plataforma em ação</SectionTitle>
        <p className="mt-2 max-w-[680px] font-ds2-sans text-sm text-ds2-text-secondary">
          Isso não é maquete: assinantes usam todos os dias. O método ROI do Foco já roda aqui
          dentro — mapear onde o tempo vai, diagnosticar o que rende, agir no que importa. A
          mesma engenharia que recebe os radares de IA.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {VIDEOS.map((video, index) => (
            <Module key={video.slug}>
              <ModuleHead>
                <span>{video.label}</span>
                <Badge>no ar</Badge>
              </ModuleHead>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/40">
                {playing[index] ? (
                  <video
                    className="h-full w-full object-cover"
                    src={`/videos/${video.slug}.mp4`}
                    muted={index === 0}
                    loop={index === 0}
                    autoPlay={index === 0}
                    controls={index !== 0}
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying((prev) => ({ ...prev, [index]: true }))}
                    className={cn(
                      'flex h-full w-full flex-col items-center justify-center gap-2',
                      'font-ds2-mono text-xs text-ds2-text-secondary transition-colors hover:text-ds2-text-primary'
                    )}
                    aria-label={`Assistir vídeo: ${video.titulo}`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ds2-border-medium">
                      <Play className="h-5 w-5" />
                    </span>
                    Assistir
                  </button>
                )}
              </div>
              <h3 className="mt-4 font-ds2-sans text-lg font-semibold tracking-[-0.03em] text-ds2-text-primary">
                {video.titulo}
              </h3>
              <p className="mt-1 font-ds2-sans text-sm text-ds2-text-secondary">
                {video.descricao}
              </p>
            </Module>
          ))}
        </div>
        <p className="mt-5 font-ds2-mono text-xs text-ds2-text-muted">
          acesso_completo = assinatura paga da newsletter · autorização por e-mail
        </p>
      </div>
    </section>
  )
}
