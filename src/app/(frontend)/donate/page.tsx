import type { Metadata } from 'next'
import Script from 'next/script'
import { createElement } from 'react'

import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'
import { getClient, getSettings } from '@/lib/payload'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata('donate', {
    title: 'Donate',
    description:
      'Support the Montague Common Hall with a one-time gift or a monthly sustaining membership. All gifts are tax-deductible.',
  })

const money = (n: number) => `$${n.toLocaleString('en-US')}`

export default async function DonatePage() {
  const payload = await getClient()
  const [page, settings, home] = await Promise.all([
    getPage('donate'),
    getSettings(),
    payload.findGlobal({ slug: 'home', depth: 0 }),
  ])
  const hasGivebutter = Boolean(settings.givebutterAccountId && settings.givebutterCampaignCode)
  const goal = home.campaignOn ? (home.campaignGoal ?? 0) : 0
  const raised = Math.min(home.campaignRaised ?? 0, goal)
  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0

  return (
    <section className="section">
      <PageIntro
        page={page}
        fallbackTitle="Donate"
        fallbackImage={{ src: '/images/donation-box.jpg', alt: 'The yellow donation box at the hall, stenciled "Donate here"' }}
      >
        {goal > 0 && (
          <div className="progress" aria-label={`${money(raised)} raised of ${money(goal)} goal`}>
            <p className="eyebrow">{home.campaignHeading || 'Fundraising campaign'}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="progress-label">
              <strong>{money(raised)}</strong> raised of {money(goal)}
            </p>
          </div>
        )}
      </PageIntro>

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
              Accepts cards, PayPal, Venmo, Apple Pay, and bank transfer. Trouble with the form?{' '}
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
