/**
 * Loads the starting content carried over from the old montaguecommonhall.org site.
 *
 *   npm run seed            # local development database
 *
 * Safe to re-run: pages and news are matched by slug, files by filename, and globals are
 * overwritten with the seed text. Do not run against production once the board has edited
 * content there.
 */
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { doc, h, link, p, text, ul } from './lexical'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const archive = path.resolve(dirname, '../../archive/old-site')

const payload = await getPayload({ config })

async function upload(file: string, alt: string) {
  const filename = path.basename(file)
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection: 'media', data: { alt }, filePath: path.join(archive, file) })
}

async function upsert(collection: 'pages' | 'news', slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, draft: true })
  const fields = { ...data, slug, _status: 'published' as const }
  if (existing.docs[0]) {
    await payload.update({ collection, id: existing.docs[0].id, data: fields as never })
  } else {
    await payload.create({ collection, data: fields as never })
  }
  payload.logger.info(`${collection}: ${slug}`)
}

// ---------- Files ----------
const agreement = await upload('files/MCH-Rental-Agreement-2026.pdf', 'Rental agreement 2026')
const checklist = await upload('files/MCH-Renter-Checklist-2026.pdf', 'Renter checklist 2026')
const heating = await upload('files/hall_heating_2026.pdf', 'Heating instructions 2026')
const cooling = await upload('files/hall_cooling_2026.pdf', 'Cooling instructions 2026')
const hallPhoto = await upload('images/page_page_63_small.jpg', 'The Montague Common Hall in spring, crocuses on the lawn')
const terracePlan = await upload(
  'images/section_TextImage-13_small.jpg',
  'Architectural drawing of the planned accessible entrance ramp, terrace, and garden',
)

// ---------- Site settings ----------
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    streetAddress: '34 Main Street, Montague Center, MA 01351',
    mailingAddress: 'PO Box 223, Montague, MA 01351',
    email: 'info@montaguecommonhall.org',
    notificationEmail: 'info@montaguecommonhall.org',
    facebookUrl: 'https://www.facebook.com/MontagueCommonHall/',
    mapUrl: 'https://maps.app.goo.gl/1Y94fMWp59Ld51Ez7',
  },
})

// ---------- Home ----------
await payload.updateGlobal({
  slug: 'home',
  data: {
    heroHeading: 'A historic hall on the Montague common, kept open for everyone',
    heroText:
      'Built in 1834 as a Unitarian meetinghouse and long the home of the Montague Grange, the Common Hall is a volunteer-run community center for dances, concerts, classes, celebrations, and meetings.',
    heroImage: hallPhoto.id,
    spaces: [
      { title: 'Main hall', text: 'A large hall with a small stage, a piano, and a refinished maple dance floor.' },
      { title: 'Cloakroom and entry', text: 'A spacious cloakroom that can also be rented on its own.' },
      { title: 'Kitchen and dining hall', text: 'A rustic kitchen and dining hall downstairs.' },
      { title: 'Two bathrooms', text: null },
    ],
    campaignOn: true,
    campaignHeading: '2026 Fundraiser: $100,000 for the hall',
    campaignText:
      'We need to raise $100,000 by the end of the year to move forward with some much-needed building repairs and updates. Donations of any size are welcome, and all donations are tax-deductible.',
    campaignGoal: 100000,
    campaignRaised: 0,
    campaignProjects: [
      { item: 'Energy-efficient heat pump system' },
      { item: 'ADA-accessible landscaped ramp' },
      { item: 'Robust dehumidification system' },
      { item: 'Tree pruning' },
      { item: 'Rain skirt repairs' },
    ],
    campaignRecognition:
      'Top supporters will be recognized in a mural on the stairway, and donors of $500 can have a brick placed in the new walkway.',
    campaignImage: terracePlan.id,
  },
})

// ---------- Rentals ----------
await payload.updateGlobal({
  slug: 'rentals',
  data: {
    intro: '(retired: edit the introduction under Pages, Rent the Hall)',
    seasons: [
      { name: 'Spring and summer', dates: 'May 1 – October 1', hourly: 30, hourlyLimit: 6, dayRate: 200 },
      { name: 'Fall and winter', dates: 'October 2 – April 30', hourly: 40, hourlyLimit: 6, dayRate: 275, note: 'Heat included.' },
    ],
    extras: [
      { item: 'PA system (for music performances)', price: '$20 per event' },
      { item: 'Cloakroom only', price: '$20 for the first hour, $10 each additional hour' },
      { item: 'Cloakroom heating surcharge (Oct 2 – Apr 30)', price: '$10 per event' },
      { item: 'Security and cleaning deposit (separate check)', price: '$100' },
    ],
    rateNotes: [
      { text: 'The minimum rental is 2 hours.' },
      { text: 'Include time for setup and cleanup — typically at least half an hour before and after your event.' },
      { text: 'Recurring events and events with unusually low impact on the hall can sometimes have a lower rate. Ask us.' },
      {
        text: 'Sustaining members who give at least $10 a month receive 4 free rental hours a year, after their first year.',
      },
    ],
    faq: [
      {
        question: 'How many people does the hall hold?',
        answer: 'Upstairs capacity is 100 in the main hall and 120 in total. The downstairs holds 80.',
      },
      {
        question: 'Can we bring food and drink?',
        answer:
          'Food and drink are not allowed in the main hall except by special arrangement; water in a closed container is fine. The kitchen and dining hall downstairs are available for meals.',
      },
      {
        question: 'Can we serve beer or wine?',
        answer:
          'Only by special arrangement, and only wine and beer at private events. If we approve alcohol for your event, you must get liability insurance (usually a one-day rider on a homeowner’s policy) naming the Friends of the Montague Common Hall as additional insured, and send us a copy. Alcohol can never be sold or made on the premises.',
      },
      {
        question: 'Is there a time limit on music?',
        answer:
          'All amplified sound must stop by 10:00 PM, and we may ask for an earlier stop on weekday evenings. Please leave quietly at night — the hall has close neighbors.',
      },
      {
        question: 'Who cleans up?',
        answer:
          'We have no paid custodian, so renters leave the hall as they found it: complete the renter’s checklist, pack out all garbage and recycling, and return the checklist and key to the mailbox at 17 Main Street, Montague Center.',
      },
      {
        question: 'How does the security deposit work?',
        answer:
          'Include a separate $100 check. We shred it once we’re satisfied the hall was left in good order, or mail it back if you include a stamped, self-addressed envelope. If the hall is a mess when you arrive, tell us right away with photos.',
      },
      {
        question: 'Do we need insurance?',
        answer:
          'We urge every renter to carry their own liability insurance, typically a rider on a homeowner’s policy. It is required if you serve alcohol.',
      },
      {
        question: 'Can we use candles?',
        answer: 'No open flames or candles, and no smoking anywhere on the premises.',
      },
      {
        question: 'How do we pay?',
        answer:
          'Once we confirm your date, mail the signed rental agreement with two separate checks — one for the rent and one for the deposit — to Friends of the Montague Common Hall, PO Box 223, Montague, MA 01351.',
      },
    ],
    documents: [
      { label: 'Rental agreement (2026)', file: agreement.id },
      { label: 'Renter checklist (2026)', file: checklist.id },
      { label: 'Heating instructions', file: heating.id },
      { label: 'Cooling instructions', file: cooling.id },
    ],
  },
})

// ---------- Pages ----------
await upsert('pages', 'about', {
  title: 'About the Hall',
  summary: 'A neo-gothic meetinghouse on the Montague Center common, cared for by volunteers since 2013.',
  image: hallPhoto.id,
  content: doc(
    p(
      'The Montague Common Hall is a beautiful example of neo-gothic architecture, next to the town common at 34 Main Street in Montague Center, Massachusetts. Built in 1834 as a Unitarian church, it served for many years as the home of the Montague Grange.',
    ),
    p(
      'The Friends of the Montague Common Hall, a volunteer-based 501(c)(3) nonprofit founded in 2013, works to preserve this historic building and to offer a reasonably priced and attractive venue for a wide range of events: dances, weddings, art exhibits, film screenings, classes, rehearsals, community meetings, and children’s activities.',
    ),
    h('h2', 'Recent restoration'),
    p(
      'Thanks to donations and institutional grants, we have been able to maintain and extensively upgrade the building over the past few years, including:',
    ),
    ul(
      ['Replacing the entire roof'],
      ['Stabilizing the cupola'],
      ['Insulating the walls and ceilings'],
      ['Repainting the exterior'],
      ['Renovating interior walls'],
      ['Refinishing the maple dance floor'],
      ['Reglazing the large windows'],
    ),
    h('h2', 'How you can help'),
    p(
      'The hall depends on donations and volunteers. ',
      link('Make a donation', '/donate'),
      ', ',
      link('volunteer your time', '/get-involved'),
      ', or ',
      link('rent the hall', '/rent'),
      ' for your next event.',
    ),
  ),
})

await upsert('pages', 'directions', {
  title: 'Directions',
  summary: '34 Main Street, Montague Center, MA — on the town common.',
  content: doc(
    p(text('34 Main Street, Montague, MA 01351', true), ' (mail: PO Box 223). ', link('Open in Google Maps', 'https://maps.app.goo.gl/1Y94fMWp59Ld51Ez7'), '.'),
    h('h2', 'Parking'),
    p(
      'Parking is no longer permitted directly in front of the hall on Main Street. There is plenty of on-street parking just south of the hall and around the town common.',
    ),
    h('h2', 'From Route 2 (east)'),
    p(
      'Take Route 63 south from Route 2 in Erving. Follow Route 63 through all the turns in Millers Falls, then continue about 5 miles until you see the Montague Center sign at Center Street. Turn right and go one mile into the village; the hall is diagonally to the left across the common.',
    ),
    h('h2', 'From Greenfield'),
    p(
      'Follow Main Street east to the blinking light, then continue through the turns and up the long hill on Mountain Road and Greenfield Road to the town common. The hall is on the right.',
    ),
    h('h2', 'From I-91'),
    p(
      'Take exit 24 and follow Routes 5 and 10 north, then Route 116 south. Turn left on Route 47 north and travel about 4 miles. Where Route 47 turns, continue straight (do not take the connector to Route 63). As you enter Montague Center and the road bears left, the hall is on your left.',
    ),
    h('h2', 'From Amherst (Route 63)'),
    p(
      'Drive about 18 minutes north on Route 63 to the Route 47 junction. Take the connector, turn right toward Montague Center, and look for the hall on the left side of the common.',
    ),
  ),
})

await upsert('pages', 'get-involved', {
  title: 'Get Involved',
  summary: 'There’s a job for anyone willing to pitch in.',
  content: doc(
    p(
      'The Montague Common Hall Corporation, formerly the Montague Grange Hall Corporation and owner of the hall since 1936, is committed to keeping the hall open and available at a reasonable cost. To fulfill that commitment, we need all the help we can get.',
    ),
    p(
      'An architect has evaluated the building and made recommendations for stabilizing the structure, improving the interior, and making the building accessible. It’s a daunting prospect, but exciting, too, and necessary if the hall is to survive as a community resource.',
    ),
    p(
      'Want to know what you can do to help? Truly, there’s a job for anyone willing to pitch in. A sampling from the endless list: raking leaves, trimming shrubs, cleaning, more cleaning, window-washing, minor miscellaneous repairs, major miscellaneous repairs, paperwork of various sorts, decision-making large and small, and, in a big way, fundraising. Oh, and did we mention cleaning?',
    ),
    p(
      'If you’re interested in helping, please ',
      link('contact us', '/contact'),
      '. We’ll find something that fits your skills, your interests, and your schedule.',
    ),
  ),
})

// ---------- News ----------
await upsert('news', '2026-fundraiser', {
  title: 'Our 2026 fundraiser: $100,000 for the hall',
  excerpt:
    'We need to raise $100,000 by the end of the year for a heat pump system, an accessible ramp, dehumidification, and repairs.',
  image: terracePlan.id,
  content: doc(
    p(
      'We need to raise $100,000 by the end of the year to move forward with some much-needed building repairs and updates:',
    ),
    ul(
      ['An energy-efficient heat pump system'],
      ['An ADA-accessible landscaped ramp'],
      ['A robust dehumidification system'],
      ['Tree pruning'],
      ['Rain skirt repairs'],
    ),
    p(
      'Donations of any size are welcome — $50,000, $25,000, $10,000, $5,000, $2,000, $1,000, or $500. Top supporters will be recognized in a mural on the stairway, and donors of $500 can have a brick placed in the new walkway.',
    ),
    p('As a 501(c)(3) nonprofit, all donations are tax-deductible. ', link('Donate now', '/donate'), '.'),
  ),
})

// ---------- Local admin account (development only) ----------
if (process.env.NODE_ENV !== 'production') {
  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Local admin', email: 'admin@localhost.test', password: 'local-dev-only', role: 'admin' },
    })
    payload.logger.info('Created local admin: admin@localhost.test / local-dev-only')
  }
}

payload.logger.info('Seed complete.')
process.exit(0)
