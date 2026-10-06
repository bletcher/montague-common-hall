/**
 * Events come from the Hall's public Google Calendar. Board members add and edit events in
 * Google Calendar (including repeating events); the website only reads them.
 */

export const TIME_ZONE = 'America/New_York'

export type HallEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description?: string
  location?: string
  googleLink?: string
}

type GoogleEvent = {
  id: string
  status?: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start: { date?: string; dateTime?: string }
  end: { date?: string; dateTime?: string }
}

export type CalendarResult =
  | { status: 'ok'; events: HallEvent[] }
  | { status: 'not-configured'; events: HallEvent[] }
  | { status: 'error'; events: HallEvent[] }

/** Parses Google's all-day "YYYY-MM-DD" as local noon so it never slips to the previous day. */
const parseGoogleDate = (value: { date?: string; dateTime?: string }) =>
  value.dateTime ? new Date(value.dateTime) : new Date(`${value.date}T12:00:00`)

export async function getEvents(
  calendarId: string | null | undefined,
  from: Date,
  to: Date,
): Promise<CalendarResult> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  if (!calendarId || !apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      const { sampleEvents } = await import('./calendar-sample')
      return { status: 'not-configured', events: sampleEvents(from, to) }
    }
    return { status: 'not-configured', events: [] }
  }

  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: 'true', // expands repeating events into individual dates
    orderBy: 'startTime',
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    maxResults: '500',
    timeZone: TIME_ZONE,
  })
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      console.error(`Google Calendar request failed: ${res.status} ${await res.text()}`)
      return { status: 'error', events: [] }
    }
    const data = (await res.json()) as { items?: GoogleEvent[] }
    const events = (data.items ?? [])
      .filter((e) => e.status !== 'cancelled')
      .map<HallEvent>((e) => ({
        id: e.id,
        title: e.summary?.trim() || 'Event',
        start: parseGoogleDate(e.start),
        end: parseGoogleDate(e.end),
        allDay: Boolean(e.start.date),
        description: e.description,
        location: e.location,
        googleLink: e.htmlLink,
      }))
    return { status: 'ok', events }
  } catch (err) {
    console.error('Google Calendar request failed', err)
    return { status: 'error', events: [] }
  }
}

export const subscribeLinks = (calendarId: string) => ({
  google: `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`,
  ics: `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`,
})

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, ...opts })

export const formatDay = (d: Date) => fmt({ weekday: 'long', month: 'long', day: 'numeric' }).format(d)
export const formatShortDay = (d: Date) => fmt({ weekday: 'short', month: 'short', day: 'numeric' }).format(d)
export const formatMonth = (d: Date) => fmt({ month: 'long', year: 'numeric' }).format(d)

export const formatTime = (d: Date) =>
  fmt({ hour: 'numeric', minute: '2-digit' }).format(d).replace(':00', '').replace(' AM', ' am').replace(' PM', ' pm')

export const formatTimeRange = (e: HallEvent) =>
  e.allDay ? 'All day' : `${formatTime(e.start)} – ${formatTime(e.end)}`

/** Calendar date key (YYYY-MM-DD) in the Hall's time zone. */
export const dayKey = (d: Date) => fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
