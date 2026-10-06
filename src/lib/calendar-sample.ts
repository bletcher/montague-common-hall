import type { HallEvent } from './calendar'

/**
 * Development-only stand-in until the Hall's Google Calendar is connected. Mirrors the regular
 * events listed on the old website so layouts can be checked against realistic data.
 * Never used in production.
 */
export function sampleEvents(from: Date, to: Date): HallEvent[] {
  const events: HallEvent[] = []
  const at = (day: Date, h: number, m = 0) => {
    const d = new Date(day)
    d.setHours(h, m, 0, 0)
    return d
  }

  for (let day = new Date(from); day < to; day.setDate(day.getDate() + 1)) {
    const dow = day.getDay()
    const nth = Math.ceil(day.getDate() / 7)
    if (dow === 2) {
      events.push({ id: `yoga-${day.toDateString()}`, title: 'Community Yoga', start: at(day, 18), end: at(day, 19), allDay: false })
    }
    if (dow === 3) {
      events.push({ id: `morris-${day.toDateString()}`, title: 'Montague Morris practice', start: at(day, 19), end: at(day, 21), allDay: false })
    }
    if (dow === 6 && nth === 2) {
      events.push({ id: `openmic-${day.toDateString()}`, title: '2nd Saturday Open Mic', start: at(day, 18, 30), end: at(day, 21, 30), allDay: false })
    }
    if (dow === 5 && nth === 3) {
      events.push({ id: `square-${day.toDateString()}`, title: 'Square Dance', start: at(day, 19, 30), end: at(day, 22), allDay: false })
    }
  }
  return events
}
