import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/site-config'

// Layout raiz = Server Component (ISSUE-101): só html/body, GTM e metadata.
// Gate de auth + sidebar da plataforma logada vivem em (app)/layout.tsx.
// ⚠️ Os 2 blocos GTM abaixo são trava crítica (docs/revamp/07_mapa_tracking_ads.md):
// devem permanecer byte-idênticos e ser o primeiro conteúdo do <body>.

// Fontes do Design System v2 (ISSUE-102) — expostas como CSS vars no <html>.
// O body legado define font-family própria (system-ui), então nada muda visualmente
// nas páginas existentes; só páginas/componentes ds2/* referenciam estas vars.
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '+Conversas no Corredor',
  description: 'Mapeie, diagnostique e otimize seu foco profissional',
  applicationName: '+Conversas no Corredor',
  manifest: '/pwa/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '+ConverSaaS',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/pwa/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/pwa/icons/apple-touch-icon.png',
  },
  other: {
    // appleWebApp.capable já emite a variante moderna mobile-web-app-capable;
    // esta repõe a tag apple- legada que o head antigo tinha (iOS antigo só lê esta).
    'apple-mobile-web-app-capable': 'yes',
  },
  // ISSUE-110: OG/Twitter base — cada página herda a imagem de opengraph-image.tsx/
  // twitter-image.tsx e sobrescreve title/description via seu próprio `metadata`.
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d97706',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body>
{/* Google Tag Manager */}
<Script id="google-tag-manager" strategy="afterInteractive">
  {`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PDJ2K5BX');
  `}
</Script>

{/* Google Tag Manager (noscript) */}
<noscript>
  <iframe 
    src="https://www.googletagmanager.com/ns.html?id=GTM-PDJ2K5BX"
    height="0" 
    width="0" 
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>

        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
