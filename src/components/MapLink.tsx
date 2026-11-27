import type { ReactNode } from 'react'

/** Google Maps links, written any of the ways Google shares them. */
export const isMapUrl = (url?: string | null) =>
  Boolean(url && /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.[a-z.]+\/maps|maps\.google\.)/i.test(url))

type Props = { href: string; children?: ReactNode; className?: string; textFirst?: boolean }

/** A Google Maps link with a small street map of the hall next to the link text. */
export function MapLink({ href, children = 'Open in Google Maps', className, textFirst }: Props) {
  // A saved OpenStreetMap image (scripts/make-map-thumb.mjs), so no map service is called.
  const map = (
    <img
      src="/images/map-thumb.png"
      alt="Street map of Montague Center with the hall marked"
      width={400}
      height={200}
      loading="lazy"
    />
  )
  return (
    <a href={href} className={['map-link', textFirst && 'map-link-text-first', className].filter(Boolean).join(' ')}>
      {!textFirst && map}
      <span>{children}</span>
      {textFirst && map}
    </a>
  )
}
