import type { Metadata } from 'next'
import { Red_Hat_Display, Roboto } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSettings } from '@/lib/payload'
import { turnstileSiteKey } from '@/lib/turnstile'
import './styles.css'

// Content comes from the admin panel, so every page renders fresh and edits show up immediately.
export const dynamic = 'force-dynamic'

const display = Red_Hat_Display({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--font-display' })
const body = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://montaguecommonhall.org'),
  title: {
    default: 'Montague Common Hall',
    template: '%s — Montague Common Hall',
  },
  description:
    'A historic 1834 meetinghouse on the common in Montague Center, Massachusetts — a volunteer-run community center and performing arts space for dances, concerts, classes, celebrations, and meetings.',
  openGraph: { siteName: 'Montague Common Hall', type: 'website', images: ['/images/hall-front.jpg'] },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const siteKey = turnstileSiteKey()

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {settings.announcementOn && settings.announcementText && (
          <div className="announcement">
            {settings.announcementLink ? (
              <a href={settings.announcementLink}>{settings.announcementText}</a>
            ) : (
              settings.announcementText
            )}
          </div>
        )}
        <Header address={settings.streetAddress} />
        <main id="main">{children}</main>
        <Footer settings={settings} siteKey={siteKey} />
      </body>
    </html>
  )
}
