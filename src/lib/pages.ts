import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { getClient } from './payload'

/** The published version of a page, or the latest draft when previewing. */
export async function getPage(slug: string) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'pages',
    // The local API skips access rules, so filter out unpublished drafts explicitly.
    where: draft ? { slug: { equals: slug } } : { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
    draft,
  })
  return docs[0] ?? null
}

export async function pageMetadata(slug: string, fallback: Metadata = {}): Promise<Metadata> {
  const page = await getPage(slug)
  if (!page) return fallback
  return { title: page.title, description: page.summary ?? fallback.description }
}
