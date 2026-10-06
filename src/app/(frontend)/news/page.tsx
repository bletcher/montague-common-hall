import type { Metadata } from 'next'
import Link from 'next/link'

import { MediaImage } from '@/components/Media'
import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'
import { getClient } from '@/lib/payload'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata('news', {
    title: 'News',
    description: 'News from the Friends of the Montague Common Hall.',
  })

export default async function NewsPage() {
  const payload = await getClient()
  const page = await getPage('news')
  const { docs } = await payload.find({
    collection: 'news',
    where: { _status: { equals: 'published' } },
    sort: '-publishedDate',
    limit: 50,
    depth: 1,
  })

  return (
    <section className="section">
      <div className="container narrow">
        <PageIntro page={page} fallbackTitle="News" bare />
        {docs.length === 0 && <p>No news yet.</p>}
        <ul className="news-list">
          {docs.map((n) => (
            <li key={n.id}>
              {n.image && <MediaImage media={n.image} className="news-thumb" />}
              <div>
                <p className="card-meta">{new Date(n.publishedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                <h2>
                  <Link href={`/news/${n.slug}`}>{n.title}</Link>
                </h2>
                {n.excerpt && <p>{n.excerpt}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
