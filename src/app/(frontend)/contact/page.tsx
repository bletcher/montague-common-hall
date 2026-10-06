import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/Forms'
import { getSettings } from '@/lib/payload'
import { turnstileSiteKey } from '@/lib/turnstile'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Friends of the Montague Common Hall.',
}

export default async function ContactPage() {
  const settings = await getSettings()

  return (
    <section className="section">
      <div className="container page-grid">
        <div>
          <h1>Contact</h1>
          <p className="lede">
            The hall is run entirely by volunteers. Send us a note and a board member will reply by email.
          </p>
          <p>
            Want to rent the hall? Use the <Link href="/rent#request">rental request form</Link> so we have the
            details we need.
          </p>
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
          {settings.mapUrl && (
            <p>
              <a href={settings.mapUrl}>Map</a> · <Link href="/directions">Directions</Link>
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}
