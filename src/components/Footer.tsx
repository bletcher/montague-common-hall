import Link from 'next/link'

import type { SiteSetting } from '@/payload-types'
import { SubscribeForm } from './Forms'

export function Footer({ settings, siteKey }: { settings: SiteSetting; siteKey: string }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">Montague Common Hall</p>
          <p>{settings.streetAddress}</p>
          <p>Mail: {settings.mailingAddress}</p>
          <p>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </p>
          {settings.facebookUrl && (
            <p>
              <a href={settings.facebookUrl}>Facebook</a>
            </p>
          )}
        </div>
        <div>
          <p className="footer-title">Get involved</p>
          <ul className="footer-links">
            <li>
              <Link href="/donate">Donate or become a sustaining member</Link>
            </li>
            <li>
              <Link href="/get-involved">Volunteer</Link>
            </li>
            <li>
              <Link href="/rent">Rent the hall</Link>
            </li>
          </ul>
        </div>
        <div>
          <SubscribeForm siteKey={siteKey} />
        </div>
      </div>
      <div className="container footer-legal">
        <p>
          The Friends of the Montague Common Hall is a volunteer-run 501(c)(3) nonprofit. Gifts are tax-deductible.
        </p>
        <p>
          <Link href="/admin">Board login</Link>
        </p>
      </div>
    </footer>
  )
}
