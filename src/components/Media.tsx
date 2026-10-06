import type { Media } from '@/payload-types'

type Props = {
  media?: number | Media | null
  fallback?: { src: string; alt: string }
  className?: string
  priority?: boolean
}

/** Shows an uploaded photo, or a built-in photo when nothing has been uploaded yet. */
export function MediaImage({ media, fallback, className, priority }: Props) {
  const doc = typeof media === 'object' && media ? media : null
  const src = doc?.url ?? fallback?.src
  if (!src) return null
  return (
    // Plain <img>: Next's image optimizer isn't available on Cloudflare Workers.
    <img
      src={src}
      alt={doc?.alt ?? fallback?.alt ?? ''}
      width={doc?.width ?? undefined}
      height={doc?.height ?? undefined}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
