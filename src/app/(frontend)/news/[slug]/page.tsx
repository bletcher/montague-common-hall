import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/Media'
import { getClient } from '@/lib/payload'

type Props = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })
  return docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  return post ? { title: post.title, description: post.excerpt ?? undefined } : {}
}

export default async function NewsPost({ params }: Props) {
  const post = await getPost((await params).slug)
  if (!post) notFound()

  return (
    <article className="section">
      <div className="container narrow prose">
        <p className="card-meta">
          <Link href="/news">News</Link> · {new Date(post.publishedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}
        </p>
        <h1>{post.title}</h1>
        {post.image && <MediaImage media={post.image} className="post-photo" />}
        <RichText data={post.content} />
      </div>
    </article>
  )
}
