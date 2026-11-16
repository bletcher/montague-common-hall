// Saves the old RocketFusion site's history before it goes away: every news post (text and
// images) and the past calendar (titles, dates and times only; event pages can carry renter and
// staff notes, so they are not fetched). Run from the repo root: node archive/old-site/scrape-history.mjs
import fs from 'fs'
import path from 'path'

const SITE = 'https://montaguecommonhall.org'
const OUT = 'archive/old-site'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function get(url) {
  await sleep(1000) // be gentle with Mik's server
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}
const text = async (url) => (await get(url)).text()
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .trim()

// ---- News ----
const list = await text(`${SITE}/news`)
const posts = [...new Set([...list.matchAll(/href="(\/n\/\d+\/[^"]+)"/g)].map((m) => m[1]))]
fs.mkdirSync(`${OUT}/news/images`, { recursive: true })
const news = []
for (const href of posts) {
  const id = href.split('/')[2]
  const html = await text(SITE + href)
  const item = html.match(/<div class="newsPageItemOne[^>]*>([\s\S]*?)<p class="updated">([\s\S]*?)<\/p>/)
  if (!item) throw new Error(`no post body in ${href}`)
  const title = decode(item[1].match(/<h1 class="news">\s*<span>([\s\S]*?)<\/span>/)[1])
  const summary = decode(item[1].match(/<p class="synopsysFull">([\s\S]*?)<\/p>/)?.[1] ?? '')
  const posted = item[2].match(/on (\w{3}, \w{3} \d+, \d{4})/)?.[1]
  const updated = item[2].match(/Updated: (\w{3}, \w{3} \d+, \d{4})/)?.[1]
  let body = item[1]
    .replace(/<h1 class="news">[\s\S]*?<\/h1>/, '')
    .replace(/<p class="synopsysFull">[\s\S]*?<\/p>/, '')
    .trim()

  // Download the post's images and point the archived copy at them.
  for (const src of new Set([...body.matchAll(/src="([^"]+)"/g)].map((m) => m[1]))) {
    const url = new URL(src, SITE)
    if (url.hostname !== new URL(SITE).hostname) continue
    const name = decodeURIComponent(path.basename(url.pathname)).replace(/[^\w.-]+/g, '_')
    const file = `${OUT}/news/images/${name}`
    if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await get(url)).arrayBuffer()))
    body = body.split(`src="${src}"`).join(`src="images/${name}"`)
  }
  // Links to other pages on the old site become absolute, so they still say where they pointed.
  body = body.replace(/href="\/(?!\/)/g, `href="${SITE}/`)

  const slug = href.split('/')[3]
  const file = `${id}-${slug}.html`
  const postedDate = new Date(posted)
  fs.writeFileSync(
    `${OUT}/news/${file}`,
    `<!doctype html>\n<meta charset="utf-8">\n<title>${title}</title>\n<!-- Archived from ${SITE}${href} -->\n<h1>${title}</h1>\n<p><em>${summary}</em></p>\n<p><small>Posted ${posted}${updated ? `; updated ${updated}` : ''}</small></p>\n${body}\n`,
  )
  news.push({ id: +id, title, summary, posted: postedDate.toISOString().slice(0, 10), url: SITE + href, file: `news/${file}` })
  console.log(`news: ${posted}  ${title}`)
}
news.sort((a, b) => a.posted.localeCompare(b.posted))
fs.writeFileSync(`${OUT}/news/index.json`, JSON.stringify(news, null, 2) + '\n')

// ---- Past calendar: walk back month by month from September 2026 (the month before the
// existing archive starts) until the calendar runs out
// (the hall was closed for COVID from 2020 to 2022, so one empty year is not the start). ----
const events = []
let y = 2026
let m = 9
let empty = 0
function parseMonth(html) {
  const cal = html.split('<!-- START CALENDAR -->')[1]?.split('</table>')[0] ?? ''
  const found = []
  for (const cell of cal.split(/<td /).slice(1)) {
    const day = cell.match(/class='calendarDateNumber'>(\d+)</)?.[1]
    if (!day) continue
    for (const it of cell.matchAll(
      /<span class="calendarDateTime">([^<]*)<\/span><br>\s*<a href="([^"]*)">([\s\S]*?)<\/a>/g,
    )) {
      found.push({ year: y, month: m, day: +day, time: decode(it[1]), title: decode(it[3]), href: it[2] })
    }
  }
  return found
}
while (empty < 36) {
  const url = `${SITE}/d/0/?thisMonth=${m}&thisYear=${y}&cid=0&tid=0&showall=1`
  const MONTHS = 'January February March April May June July August September October November December'.split(' ')
  let html = await text(url)
  // Before its first year (2006) the old calendar quietly shows the current year instead, so stop
  // when the page heading is not the month that was asked for.
  if (!html.includes(`${MONTHS[m - 1]} ${y}</h2>`)) break
  let found = parseMonth(html)
  // The server sometimes answers a burst of requests with an empty calendar, so an empty month
  // is fetched again after a pause before it counts as empty.
  for (let retry = 0; !found.length && retry < 2; retry++) {
    await sleep(5000)
    html = await text(url)
    found = parseMonth(html)
  }
  events.unshift(...found)
  empty = found.length ? 0 : empty + 1
  console.log(`calendar ${y}-${String(m).padStart(2, '0')}: ${found.length}`)
  if (--m === 0) {
    m = 12
    y--
  }
}
fs.writeFileSync(`${OUT}/calendar-history-to-2026-09.json`, JSON.stringify(events, null, 2) + '\n')
console.log(`news posts: ${news.length}, past calendar entries: ${events.length}`)
