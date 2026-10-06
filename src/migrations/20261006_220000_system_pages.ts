import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

import { doc, h, link, ol, p, text } from '../seed/lexical'

/**
 * Data only (no schema change): creates editable Pages documents for the built-in pages that
 * used to have their wording in code, so the board can edit every page from the admin panel.
 * Existing documents are left alone. The text is what the site showed before this change.
 */
const RENT_INTRO_FALLBACK =
  'The Montague Common Hall has a large main hall with a small stage and piano, a spacious cloakroom and entry way, a rustic kitchen and dining hall, and two bathrooms. We are fond of our old hall and love to see it used.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const rentals = await payload.findGlobal({ slug: 'rentals', depth: 0, req })
  const rentIntro = rentals.intro && !rentals.intro.startsWith('(retired') ? rentals.intro : RENT_INTRO_FALLBACK

  const pages = [
    {
      slug: 'rent',
      title: 'Rent the Hall',
      summary: rentIntro,
      image: rentals.image ?? undefined,
      content: doc(
        ol(
          [link('Check the calendar', '/calendar'), ' for open dates.'],
          ['Read the rates and policies below.'],
          [
            link('Send a rental request', '#request'),
            '. A board member will confirm the date and send the rental agreement.',
          ],
        ),
      ),
    },
    {
      slug: 'donate',
      title: 'Donate',
      summary:
        'Rent income rarely covers all of our costs, so your donations help keep the hall open and running. We have no paid staff — every dollar goes to the hall.',
      content: doc(
        h('h2', 'Two ways to give'),
        p(text('A one-time gift', true), ' toward building projects, including this year’s fundraising campaign.'),
        p(
          text('A monthly sustaining membership', true),
          ' to cover light, heat, water, and insurance. Members giving $10 a month or more receive 4 free rental hours a year after their first year.',
        ),
        p('Gifts to the Friends of the Montague Common Hall, a 501(c)(3) nonprofit, are tax-deductible.'),
        p(
          'Prefer a check? Make it out to ',
          text('Friends of the Montague Common Hall', true),
          ' and mail it to PO Box 223, Montague, MA 01351.',
        ),
      ),
    },
    {
      slug: 'contact',
      title: 'Contact',
      summary: 'The hall is run entirely by volunteers. Send us a note and a board member will reply by email.',
      content: doc(
        p(
          'Want to rent the hall? Use the ',
          link('rental request form', '/rent#request'),
          ' so we have the details we need.',
        ),
      ),
    },
    {
      slug: 'calendar',
      title: 'Calendar',
      summary: 'Dances, concerts, classes, and community events at the hall.',
    },
    {
      slug: 'news',
      title: 'News',
      summary: 'News from the Friends of the Montague Common Hall.',
    },
  ]

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      draft: true,
      req,
    })
    if (existing.docs.length) continue
    await payload.create({ collection: 'pages', data: { ...page, _status: 'published' } as never, req })
    payload.logger.info(`Created page: ${page.slug}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'pages',
    where: { slug: { in: ['rent', 'donate', 'contact', 'calendar', 'news'] } },
    req,
  })
}
