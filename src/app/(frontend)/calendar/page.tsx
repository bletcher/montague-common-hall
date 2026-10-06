import type { Metadata } from 'next'
import Link from 'next/link'

import {
  dayKey,
  formatDay,
  formatMonth,
  formatTimeRange,
  getEvents,
  subscribeLinks,
  type HallEvent,
} from '@/lib/calendar'
import { PageIntro } from '@/components/PageIntro'
import { getPage, pageMetadata } from '@/lib/pages'
import { getSettings } from '@/lib/payload'

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata('calendar', {
    title: 'Calendar',
    description: 'Dances, concerts, classes, and community events at the Montague Common Hall.',
  })

type Props = { searchParams: Promise<{ month?: string }> }

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Current year and month in the Hall's time zone. */
function thisMonth() {
  const [y, m] = dayKey(new Date()).split('-').map(Number)
  return { y, m }
}

function parseMonth(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})$/)
  if (!match) return thisMonth()
  const y = Number(match[1])
  const m = Number(match[2])
  return m >= 1 && m <= 12 && y > 2000 && y < 2100 ? { y, m } : thisMonth()
}

const pad = (n: number) => String(n).padStart(2, '0')
const monthParam = (y: number, m: number) => {
  const d = new Date(Date.UTC(y, m - 1, 1))
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

export default async function CalendarPage({ searchParams }: Props) {
  const { month } = await searchParams
  const { y, m } = parseMonth(month)
  const [settings, page] = await Promise.all([getSettings(), getPage('calendar')])

  // Plain calendar arithmetic on UTC dates; event times are compared via dayKey in the Hall's time zone.
  const first = new Date(Date.UTC(y, m - 1, 1))
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const lead = first.getUTCDay()
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, (): null => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`),
  ]
  while (cells.length % 7) cells.push(null)

  // Fetch a day either side so events near midnight in other time zones aren't missed.
  const from = new Date(Date.UTC(y, m - 1, 0))
  const to = new Date(Date.UTC(y, m, 2))
  const result = await getEvents(settings.googleCalendarId, from, to)

  const byDay = new Map<string, HallEvent[]>()
  for (const e of result.events) {
    const key = dayKey(e.start)
    if (!key.startsWith(`${y}-${pad(m)}`)) continue
    byDay.set(key, [...(byDay.get(key) ?? []), e])
  }
  const today = dayKey(new Date())
  const monthLabel = formatMonth(new Date(Date.UTC(y, m - 1, 15)))
  const listDays = [...byDay.keys()].sort()
  const links = settings.googleCalendarId ? subscribeLinks(settings.googleCalendarId) : null

  return (
    <section className="section">
      <div className="container">
        <div className="cal-head">
          <h1>{page?.title ?? 'Calendar'}</h1>
          {links && (
            <div className="cal-subscribe">
              <span>Subscribe:</span>
              <a href={links.google}>Google Calendar</a>
              <a href={links.ics}>Apple, Outlook, or other (iCal)</a>
            </div>
          )}
        </div>

        <PageIntro page={page} fallbackTitle="Calendar" bare hideTitle />

        {result.status === 'not-configured' && (
          <p className="notice">
            The calendar isn&apos;t connected to the Hall&apos;s Google Calendar yet.
            {result.events.length > 0 && ' Showing sample events for layout only.'}
          </p>
        )}
        {result.status === 'error' && (
          <p className="notice">The calendar couldn&apos;t be loaded just now. Please try again in a few minutes.</p>
        )}

        <nav className="cal-nav" aria-label="Month">
          <Link href={`/calendar?month=${monthParam(y, m - 1)}`} rel="prev">
            ← Previous
          </Link>
          <h2>{monthLabel}</h2>
          <Link href={`/calendar?month=${monthParam(y, m + 1)}`} rel="next">
            Next →
          </Link>
        </nav>

        <table className="cal-grid">
          <caption className="visually-hidden">Events in {monthLabel}</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} scope="col">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <tr key={row}>
                {cells.slice(row * 7, row * 7 + 7).map((key, i) => (
                  <td key={key ?? `blank-${row}-${i}`} className={key === today ? 'is-today' : undefined}>
                    {key && (
                      <>
                        <span className="cal-day">{Number(key.slice(8))}</span>
                        {byDay.get(key)?.map((e) => (
                          <span key={e.id} className="cal-event">
                            <span className="cal-event-time">{e.allDay ? '' : formatTimeRange(e).split(' – ')[0]}</span>{' '}
                            {e.title}
                          </span>
                        ))}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cal-list">
          <h2 className="visually-hidden">List of events in {monthLabel}</h2>
          {listDays.length === 0 && <p>No events are listed for {monthLabel}.</p>}
          {listDays.map((key) => (
            <div key={key} className="cal-list-day">
              <h3>{formatDay(byDay.get(key)![0].start)}</h3>
              <ul>
                {byDay.get(key)!.map((e) => (
                  <li key={e.id}>
                    <span className="event-time">{formatTimeRange(e)}</span>
                    <span className="event-title">
                      {e.googleLink ? <a href={e.googleLink}>{e.title}</a> : e.title}
                    </span>
                    {e.description && <span className="event-desc">{e.description.replace(/<[^>]+>/g, ' ')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="small">
          Planning an event? <Link href="/rent">See rates and request a date</Link>.
        </p>
      </div>
    </section>
  )
}
