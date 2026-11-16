import { type JSXConvertersFunction, RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import type { Media } from '@/payload-types'
import { PdfEmbed } from './PdfEmbed'

// PDFs added to page text show on the page, not as a bare filename link.
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: (args) => {
    const doc = args.node.value as Media | number
    if (typeof doc === 'object' && doc.mimeType === 'application/pdf' && doc.url) {
      return <PdfEmbed url={doc.url} title={doc.alt || doc.filename || 'PDF'} />
    }
    const fallback = defaultConverters.upload
    return typeof fallback === 'function' ? fallback(args) : null
  },
})

/** Payload's rich text renderer with the site's converters. */
export function RichText(props: Omit<ComponentProps<typeof PayloadRichText>, 'converters'>) {
  return <PayloadRichText {...props} converters={converters} />
}
