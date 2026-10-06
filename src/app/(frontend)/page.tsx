import Link from 'next/link'

import { MediaImage } from '@/components/Media'
import { formatShortDay, formatTimeRange, getEvents } from '@/lib/calendar'
import { getClient, getSettings } from '@/lib/payload'

const money = (n: number) => `$${n.toLocaleString('en-US')}`

export default async function HomePage() {
  const payload = await getClient()
  const [home, settings, news] = await Promise.all([
    payload.findGlobal({ slug: 'home', depth: 1 }),
    getSettings(),
    payload.find({
      collection: 'news',
      where: { _status: { equals: 'published' } },
      limit: 3,
      sort: '-publishedDate',
      depth: 0,
    }),
  ])

  const now = new Date()
  const in6Weeks = new Date(now.getTime() + 42 * 24 * 3600 * 1000)
  const { events, status: calendarStatus } = await getEvents(settings.googleCalendarId, now, in6Weeks)
  const upcoming = events.filter((e) => e.end >= now).slice(0, 6)

  const goal = home.campaignGoal ?? 0
  const raised = Math.min(home.campaignRaised ?? 0, goal)
  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>{home.heroHeading}</h1>
            <p className="lede">{home.heroText}</p>
            <div className="button-row">
              <Link href="/rent" className="button">
                Rent the hall
              </Link>
              <Link href="/calendar" className="button button-quiet">
                See what&apos;s on
              </Link>
            </div>
          </div>
          <MediaImage
            media={home.heroImage}
            fallback={{ src: '/images/hall-crocus.jpg', alt: 'The Montague Common Hall in spring, crocuses on the lawn' }}
            className="hero-photo"
            priority
          />
        </div>
      </section>

      {home.campaignOn && home.campaignHeading && (
        <section className="band band-blush">
          <div className="container campaign">
            <div>
              <p className="eyebrow">Fundraising campaign</p>
              <h2>{home.campaignHeading}</h2>
              {home.campaignText && <p>{home.campaignText}</p>}
              {goal > 0 && (
                <div className="progress" aria-label={`${money(raised)} raised of ${money(goal)} goal`}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="progress-label">
                    <strong>{money(raised)}</strong> raised of {money(goal)}
                  </p>
                </div>
              )}
              {home.campaignProjects && home.campaignProjects.length > 0 && (
                <ul className="tick-list">
                  {home.campaignProjects.map((p) => (
                    <li key={p.id}>{p.item}</li>
                  ))}
                </ul>
              )}
              {home.campaignRecognition && <p className="small">{home.campaignRecognition}</p>}
              <Link href="/donate" className="button">
                Donate now
              </Link>
            </div>
            <MediaImage
              media={home.campaignImage}
              fallback={{
                src: '/images/entrance-terrace-plan.jpg',
                alt: 'Architectural drawing of the planned accessible entrance ramp, terrace, and garden',
              }}
              className="campaign-photo"
            />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container two-col">
          <div>
            <h2>Coming up at the hall</h2>
            {calendarStatus === 'not-configured' && events.length > 0 && (
              <p className="notice">Sample events — the Google Calendar isn&apos;t connected yet.</p>
            )}
            {upcoming.length === 0 ? (
              <p>No events are listed for the next few weeks. Check the full calendar for later dates.</p>
            ) : (
              <ul className="event-list">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <span className="event-date">{formatShortDay(e.start)}</span>
                    <span className="event-title">{e.title}</span>
                    <span className="event-time">{formatTimeRange(e)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/calendar">Full calendar →</Link>
          </div>
          <div>
            <h2>The hall</h2>
            {home.spaces && home.spaces.length > 0 && (
              <dl className="space-list">
                {home.spaces.map((s) => (
                  <div key={s.id}>
                    <dt>{s.title}</dt>
                    {s.text && <dd>{s.text}</dd>}
                  </div>
                ))}
              </dl>
            )}
            <Link href="/about">About the hall →</Link>
          </div>
        </div>
      </section>

      {news.docs.length > 0 && (
        <section className="section section-tight">
          <div className="container">
            <h2>News</h2>
            <ul className="card-list">
              {news.docs.map((n) => (
                <li key={n.id} className="card">
                  <p className="card-meta">{new Date(n.publishedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                  <h3>
                    <Link href={`/news/${n.slug}`}>{n.title}</Link>
                  </h3>
                  {n.excerpt && <p>{n.excerpt}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
