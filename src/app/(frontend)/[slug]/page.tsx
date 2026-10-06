import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/Media'
import { getClient } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

async function getPage(slug: string) {
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
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug)
  return page ? { title: page.title, description: page.summary ?? undefined } : {}
}

export default async function Page({ params }: Props) {
  const page = await getPage((await params).slug)
  if (!page) notFound()

  return (
    <article className="section">
      <div className="container page-grid">
        <div className="prose">
          <h1>{page.title}</h1>
          {page.summary && <p className="lede">{page.summary}</p>}
          <RichText data={page.content} />
        </div>
        {page.image && <MediaImage media={page.image} className="page-photo" />}
      </div>
    </article>
  )
}
