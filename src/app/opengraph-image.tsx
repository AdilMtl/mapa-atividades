import { OG_IMAGE_ALT, OG_IMAGE_SIZE, renderBrandOgImage } from '@/lib/og-image'

// Imagem OG estática da marca (ISSUE-110) — gerada em build time (sem parâmetros
// dinâmicos), servida como og:image em páginas que não definirem a própria.
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'
export const alt = OG_IMAGE_ALT

export default function OpengraphImage() {
  return renderBrandOgImage()
}
