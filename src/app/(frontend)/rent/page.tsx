import type { Metadata } from 'next'

import { RentalInquiryForm } from '@/components/Forms'
import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'
import { getClient, getSettings } from '@/lib/payload'
import { turnstileSiteKey } from '@/lib/turnstile'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata('rent', {
    title: 'Rent the Hall',
    description: 'Rates, policies, and a request form for renting the Montague Common Hall.',
  })

export default async function RentPage() {
  const payload = await getClient()
  const [page, rentals, settings] = await Promise.all([
    getPage('rent'),
    payload.findGlobal({ slug: 'rentals', depth: 1 }),
    getSettings(),
  ])

  return (
    <>
      <section className="section">
        <PageIntro
          page={page}
          fallbackTitle="Rent the Hall"
          fallbackImage={{ src: '/images/hall-front.jpg', alt: 'Front of the Montague Common Hall with its gothic windows' }}
        />
      </section>

      <section className="band band-blush">
        <div className="container">
          <h2>Rates</h2>
          <div className="rate-grid">
            {rentals.seasons?.map((s) => (
              <div key={s.id} className="rate-card">
                <h3>{s.name}</h3>
                <p className="rate-dates">{s.dates}</p>
                <p className="rate-price">
                  <span className="num">${s.hourly}</span>/hour
                  <span className="rate-sub">for the first {s.hourlyLimit ?? 6} hours</span>
                </p>
                <p className="rate-price">
                  <span className="num">${s.dayRate}</span>/day
                  <span className="rate-sub">for longer events</span>
                </p>
                {s.note && <p className="small">{s.note}</p>}
              </div>
            ))}
          </div>
          {rentals.extras && rentals.extras.length > 0 && (
            <table className="extras">
              <caption>Other charges</caption>
              <tbody>
                {rentals.extras.map((x) => (
                  <tr key={x.id}>
                    <th scope="row">{x.item}</th>
                    <td>{x.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rentals.rateNotes && rentals.rateNotes.length > 0 && (
            <ul className="tick-list">
              {rentals.rateNotes.map((n) => (
                <li key={n.id}>{n.text}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {rentals.faq && rentals.faq.length > 0 && (
        <section className="section">
          <div className="container narrow">
            <h2>Questions renters ask</h2>
            <div className="faq">
              {rentals.faq.map((q) => (
                <details key={q.id}>
                  <summary>{q.question}</summary>
                  <p>{q.answer}</p>
                </details>
              ))}
            </div>
            {rentals.documents && rentals.documents.length > 0 && (
              <>
                <h3>Documents</h3>
                <ul className="doc-list">
                  {rentals.documents.map((d) =>
                    typeof d.file === 'object' && d.file?.url ? (
                      <li key={d.id}>
                        <a href={d.file.url}>{d.label}</a> <span className="small">(PDF)</span>
                      </li>
                    ) : null,
                  )}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <section className="section band-sage-light" id="request">
        <div className="container narrow">
          <h2>Request a date</h2>
          <p>
            Tell us about your event and we&apos;ll get back to you. Questions first? Write to{' '}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>.
          </p>
          <RentalInquiryForm siteKey={turnstileSiteKey()} email={settings.email} />
        </div>
      </section>
    </>
  )
}
