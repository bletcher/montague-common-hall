// Builds a Google Calendar import file from the events scraped off the old RocketFusion calendar.
// Repeating events become real repeating series; descriptions keep only public text (no renter or
// staff notes). Verifies that each series expands to exactly the dates on the old calendar.
import fs from 'fs'

const repo = 'C:/Users/bletcher/dev/montague-common-hall'
const events = JSON.parse(fs.readFileSync(`${repo}/archive/old-site/calendar-2026-10-to-2031.json`, 'utf8'))
for (const e of events) {
  if (!e.title && e.day === '31' && e.month === 10) Object.assign(e, { title: 'MCH Halloween', href: '/d/25373/MCH-Halloween' })
  if (!e.title && e.month === 11) Object.assign(e, { title: 'On hold for possible concert', href: `/d/${e.day === '23' ? 25379 : 25380}/On-hold-for-possible-concert` })
}

const LOCATION = 'Montague Common Hall, 34 Main St, Montague, MA 01351'
const DESCRIPTIONS = {
  'Montague Morris weekly practice': 'Montague Morris weekly practice.',
  '2nd Saturday Open Mic':
    'Monthly open mic, usually the 2nd Saturday of the month. Doors and performer sign-ups start at 6:15. All types of performers welcome: musicians, poets, singers, dancers, storytellers. Names are drawn for a random order; expect 2–4 songs (10–15 minutes) depending on turnout. BYO food and beverage. Voluntary donations.\nhttps://www.facebook.com/montagueCommonHallOpenMic/',
  'Community Yoga':
    'Heart-centered yoga. All levels of experience welcome. Sliding scale $7–$20; no one will be turned away for lack of funds.',
  'Montague Square Dance!':
    'Square dances with a live band and a guest caller every month. All dances are taught. 6:30–8 are simpler dances great for beginners, families, and kids; after 8 they get more complex, but everyone is still welcome. Bring clean, non-marking shoes and a water bottle. Suggested donation $7–$20.\nQuestions: montaguesquaredance@gmail.com\nhttps://www.facebook.com/profile.php?id=100038849593692',
  'Andrew & Noah VanNorstrand with Rachel Bell concert':
    'Andrew and Noah VanNorstrand, with Rachel Bell. Guitar, fiddle, mandolin, feet, vocals, piano accordion: trad-grounded music with pizazz! $20 in advance or at the door. Reservations: commonhallconcert@gmail.com',
  'Montague marching band rehearsal!':
    'Montague marching band rehearsal, preparing for Halloween. New members welcome. Contact Jesse at tangledmusic@gmail.com for tunes and sheet music.',
  'dance practice': 'Grange clogging practice.',
  'Indivisible Montague Potluck & Meeting': '6–7 pm community potluck, 7–9 pm meeting.',
  'Montague Swing Dance':
    'Come dance the night away at this winter solstice event! A social swing dance with live music from the Butterfly Swing Band, 7–9 pm. Beginners and experienced dancers all welcome. Cozy winter treats provided; special outfits and costumes encouraged. Sliding scale $5–$35 to support the band and the Common Hall.',
  'Sawmill Run': 'Annual Sawmill Run.',
}
const TENTATIVE = new Set(['On hold for possible concert', 'Private party w/PA (times tentative)'])

const SERIES = [
  { title: 'Montague Morris weekly practice', rule: 'FREQ=WEEKLY;BYDAY=WE' },
  { title: '2nd Saturday Open Mic', rule: 'FREQ=MONTHLY;BYDAY=2SA' },
  { title: 'Community Yoga', rule: 'FREQ=WEEKLY;BYDAY=TU' },
  { title: 'Montague Square Dance!', rule: 'FREQ=MONTHLY;BYDAY=2FR' },
  { title: 'Sawmill Run', rule: 'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1' },
]

const pad = (n) => String(n).padStart(2, '0')
const ymd = (e) => `${e.year}${pad(e.month)}${pad(+e.day)}`
const to24 = (t) => {
  const [, h, m, ap] = t.match(/(\d+):(\d+)\s*([ap])m/i)
  return `${pad((+h % 12) + (ap.toLowerCase() === 'p' ? 12 : 0))}${m}00`
}
const times = (e) => {
  const [a, b] = e.time.split(' - ')
  return { start: to24(a), end: to24(b) }
}

// Expand a series rule ourselves and compare with the scraped dates.
function expand(rule, first, until) {
  const out = []
  const d = new Date(first)
  const nth = (x) => Math.ceil(x.getDate() / 7)
  const byday = rule.match(/BYDAY=([^;]+)/)?.[1]
  while (d <= until) {
    const dow = 'SU,MO,TU,WE,TH,FR,SA'.split(',')[d.getDay()]
    const ok =
      (rule.includes('FREQ=WEEKLY') && byday === dow) ||
      (rule.includes('FREQ=MONTHLY') && byday === `${nth(d)}${dow}`) ||
      (rule.includes('FREQ=YEARLY') && d.getMonth() === 0 && d.getDate() === 1)
    if (ok) out.push(`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`)
    d.setDate(d.getDate() + 1)
  }
  return out
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
const fold = (line) => {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const parts = []
  let cur = ''
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > (parts.length ? 74 : 75)) {
      parts.push(cur)
      cur = ''
    }
    cur += ch
  }
  parts.push(cur)
  return parts.join('\r\n ')
}

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
const vevents = []
const used = new Set()
let checks = 0

function vevent(e, extra = []) {
  const { start, end } = times(e)
  const id = e.href.match(/\/d\/(\d+)\//)?.[1] ?? `${ymd(e)}-${start}`
  const lines = [
    'BEGIN:VEVENT',
    `UID:mch-old-${id}@montaguecommonhall.org`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${ymd(e)}T${start}`,
    `DTEND;TZID=America/New_York:${ymd(e)}T${end}`,
    ...extra,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(LOCATION)}`,
  ]
  if (DESCRIPTIONS[e.title]) lines.push(`DESCRIPTION:${esc(DESCRIPTIONS[e.title])}`)
  if (TENTATIVE.has(e.title)) lines.push('STATUS:TENTATIVE')
  lines.push('END:VEVENT')
  return lines.map(fold).join('\r\n')
}

for (const s of SERIES) {
  const xs = events.filter((e) => e.title === s.title)
  const timesSet = new Set(xs.map((e) => e.time))
  if (timesSet.size !== 1) throw new Error(`${s.title}: times vary`)
  const first = new Date(xs[0].year, xs[0].month - 1, +xs[0].day)
  const last = xs.at(-1)
  const lastDate = new Date(last.year, last.month - 1, +last.day)
  const expected = expand(s.rule, first, lastDate)
  const actual = xs.map(ymd)
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`${s.title}: rule does not match the old calendar`)
  checks += actual.length
  // UNTIL must be UTC when DTSTART has a time zone. 03:59:59Z the next day is 10:59 or 11:59 pm
  // Eastern on the last date, after every event on it.
  const next = new Date(lastDate)
  next.setDate(next.getDate() + 1)
  const untilUtc = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}T035959Z`
  vevents.push(vevent(xs[0], [`RRULE:${s.rule};UNTIL=${untilUtc}`]))
  xs.forEach((e) => used.add(e))
}
for (const e of events) if (!used.has(e)) vevents.push(vevent(e))

const VTIMEZONE = `BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`.split('\n').join('\r\n')

const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Friends of the Montague Common Hall//Calendar import//EN',
  'CALSCALE:GREGORIAN',
  'X-WR-CALNAME:Montague Common Hall',
  'X-WR-TIMEZONE:America/New_York',
  VTIMEZONE,
  ...vevents,
  'END:VCALENDAR',
  '',
].join('\r\n')

for (const out of [`${repo}/archive/old-site/montague-common-hall-calendar-import.ics`, 'C:/Users/bletcher/Downloads/montague-common-hall-calendar-import.ics']) {
  fs.writeFileSync(out, ics, 'utf8')
}
console.log(`old calendar entries: ${events.length}`)
console.log(`series: ${SERIES.length} (checked ${checks} dates, all match), one-off events: ${events.length - used.size}`)
console.log(`VEVENTs written: ${vevents.length}, bytes: ${Buffer.byteLength(ics)}`)
const leaked = ['Becky', 'Sachs', 'Acelridge', 'Adam Z', 'HFB', 'Addie', 'Laurel', 'Judith', 'Robert', 'Charlie', 'Dobosz', 'Staff only', 'MCH Use'].filter((w) => ics.includes(w))
console.log('internal names/notes found:', leaked.length ? leaked : 'none')
