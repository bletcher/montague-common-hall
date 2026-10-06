import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ReactNode } from 'react'

import type { Page } from '@/payload-types'
import { MediaImage } from './Media'

type Props = {
  page: Page | null
  /** Used if the page document is missing, so the route never breaks. */
  fallbackTitle: string
  fallbackImage?: { src: string; alt: string }
  /** Text only, for pages that lay out their own columns. */
  bare?: boolean
  /** Leave out the heading, for pages that place the title themselves. */
  hideTitle?: boolean
  /** Extra content shown under the page text, inside the same column. */
  children?: ReactNode
}

/** The editable top of a page: title, intro, rich text, and photo, all from Pages in the admin panel. */
export function PageIntro({ page, fallbackTitle, fallbackImage, bare, hideTitle, children }: Props) {
  const text = (
    <div className="prose">
      {!hideTitle && <h1>{page?.title ?? fallbackTitle}</h1>}
      {page?.summary && <p className="lede">{page.summary}</p>}
      {page?.content && <RichText data={page.content} />}
      {children}
    </div>
  )
  if (bare) return text

  const hasImage = Boolean(page?.image || fallbackImage)
  return (
    <div className={hasImage ? 'container page-grid' : 'container narrow'}>
      {text}
      {hasImage && <MediaImage media={page?.image} fallback={fallbackImage} className="page-photo" />}
    </div>
  )
}
