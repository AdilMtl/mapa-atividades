import { ImageResponse } from 'next/og'

// Gerador compartilhado da imagem OG/Twitter da marca (ISSUE-110) — usado por
// src/app/opengraph-image.tsx e src/app/twitter-image.tsx para não duplicar o JSX.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 }
export const OG_IMAGE_ALT = '+ConverSaaS — o ecossistema virtual da newsletter Conversas no Corredor'

export function renderBrandOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundImage:
            'radial-gradient(circle at 10% 0%, rgba(211,76,117,0.22), transparent 30%), radial-gradient(circle at 90% 8%, rgba(217,119,6,0.22), transparent 28%), linear-gradient(135deg,#08110F 0%,#132622 60%,#08110F 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#F0B674',
          }}
        >
          Conversas no Corredor
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            maxWidth: 980,
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: '#F8F0E6',
          }}
        >
          Descubra o que você poderia construir com IA no seu trabalho.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 30,
            fontWeight: 600,
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg,#D97706,#D34C75)',
            backgroundClip: 'text',
          }}
        >
          +ConverSaaS
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  )
}
