import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata((await params).slug)
}

export default async function Page({ params }: Props) {
  const page = await getPage((await params).slug)
  if (!page) notFound()

  return (
    <article className="section">
      <PageIntro page={page} fallbackTitle={page.title} />
    </article>
  )
}
