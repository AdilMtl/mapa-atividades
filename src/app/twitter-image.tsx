import { OG_IMAGE_ALT, OG_IMAGE_SIZE, renderBrandOgImage } from '@/lib/og-image'

// Imagem Twitter Card estática da marca (ISSUE-110) — mesmo gerador do og:image.
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'
export const alt = OG_IMAGE_ALT

export default function TwitterImage() {
  return renderBrandOgImage()
}
