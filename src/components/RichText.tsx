import { type JSXConvertersFunction, RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import { slugify } from '@/fields/slug'
import type { Media } from '@/payload-types'
import { isMapUrl, MapLink } from './MapLink'
import { PdfEmbed } from './PdfEmbed'

type TextNode = { text?: string; children?: TextNode[] }
const plainText = (nodes: TextNode[] = []): string =>
  nodes.map((n) => n.text ?? plainText(n.children)).join('')

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Headings get an id from their text, so a heading "Parking" can be linked as #parking.
  heading: ({ node, nodesToJSX }) => {
    const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2') as 'h2'
    return <Tag id={slugify(plainText(node.children as TextNode[])) || undefined}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
  // Google Maps links show a small map of the hall.
  link: (args) => {
    if (isMapUrl(args.node.fields.url)) {
      return <MapLink href={args.node.fields.url!}>{args.nodesToJSX({ nodes: args.node.children })}</MapLink>
    }
    const fallback = defaultConverters.link
    return typeof fallback === 'function' ? fallback(args) : null
  },
  // PDFs added to page text show on the page, not as a bare filename link.
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
