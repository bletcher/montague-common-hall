import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/Forms'
import { MapLink } from '@/components/MapLink'
import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'
import { getSettings } from '@/lib/payload'
import { turnstileSiteKey } from '@/lib/turnstile'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata('contact', {
    title: 'Contact',
    description: 'Get in touch with the Friends of the Montague Common Hall.',
  })

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()])

  return (
    <section className="section">
      <div className="container page-grid">
        <div>
          <PageIntro page={page} fallbackTitle="Contact" bare />
          <ContactForm siteKey={turnstileSiteKey()} />
        </div>
        <aside className="contact-card">
          <h2>Montague Common Hall</h2>
          <p>{settings.streetAddress}</p>
          <p>
            <strong>Mail:</strong> {settings.mailingAddress}
          </p>
          <p>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
          {settings.mapUrl && <MapLink href={settings.mapUrl} />}
          <p>
            <Link href="/directions">Directions and parking</Link>
          </p>
        </aside>
      </div>
    </section>
  )
}
