import type { Metadata } from 'next'
import Script from 'next/script'
import { createElement } from 'react'

import { MediaImage } from '@/components/Media'
import { getClient, getSettings } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support the Montague Common Hall with a one-time gift or a monthly sustaining membership. All gifts are tax-deductible.',
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`

export default async function DonatePage() {
  const payload = await getClient()
  const [settings, home] = await Promise.all([getSettings(), payload.findGlobal({ slug: 'home', depth: 0 })])
  const hasGivebutter = Boolean(settings.givebutterAccountId && settings.givebutterCampaignCode)
  const goal = home.campaignGoal ?? 0
  const raised = Math.min(home.campaignRaised ?? 0, goal)

  return (
    <section className="section">
      <div className="container page-grid">
        <div className="prose">
          <h1>Donate</h1>
          <p className="lede">
            Rent income rarely covers all of our costs, so your donations help keep the hall open and running. We have no
            paid staff — every dollar goes to the hall.
          </p>
          <h2>Two ways to give</h2>
          <ul>
            <li>
              <strong>A one-time gift</strong> toward building projects
              {home.campaignOn && goal > 0 && (
                <>
                  , including this year&apos;s {money(goal)} campaign ({money(raised)} raised so far)
                </>
              )}
              .
            </li>
            <li>
              <strong>A monthly sustaining membership</strong> to cover light, heat, water, and insurance. Members giving
              $10 a month or more receive 4 free rental hours a year after their first year.
            </li>
          </ul>
          <p>
            {hasGivebutter && 'The form below accepts cards, PayPal, Venmo, Apple Pay, and bank transfer. '}
            Gifts to the Friends of the Montague Common Hall, a 501(c)(3) nonprofit, are tax-deductible.
          </p>
          <p>
            Prefer a check? Make it out to <strong>Friends of the Montague Common Hall</strong> and mail it to{' '}
            {settings.mailingAddress}.
          </p>
        </div>
        <MediaImage
          fallback={{ src: '/images/donation-box.jpg', alt: 'The yellow donation box at the hall, stenciled "Donate here"' }}
          className="page-photo"
        />
      </div>

      <div className="container narrow donate-form">
        {hasGivebutter ? (
          <>
            <Script
              src={`https://widgets.givebutter.com/latest.umd.cjs?acct=${encodeURIComponent(settings.givebutterAccountId!)}`}
              strategy="afterInteractive"
            />
            {createElement('givebutter-giving-form', {
              campaign: settings.givebutterCampaignCode,
              'show-goal-bar': 'true',
            })}
            <p className="small">
              Trouble with the form?{' '}
              <a href={`https://givebutter.com/${encodeURIComponent(settings.givebutterCampaignCode!)}`}>
                Give on Givebutter directly
              </a>
              .
            </p>
          </>
        ) : settings.donateUrl ? (
          <div className="donate-cta">
            <a href={settings.donateUrl} className="button button-large">
              Donate online
            </a>
            <p className="small">Opens our secure donation page.</p>
          </div>
        ) : (
          <p className="notice">
            Online giving is being set up. In the meantime, please mail a check to {settings.mailingAddress}, or write to{' '}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>.
          </p>
        )}
      </div>
    </section>
  )
}
