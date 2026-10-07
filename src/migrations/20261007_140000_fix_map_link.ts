import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

/**
 * Data only: the original map link pointed at 38 Main St, the house next door. Swaps it for the
 * hall's own Google Maps listing in Site settings (the Contact page "Map" link) and in the
 * Directions page text ("Open in Google Maps"). Only replaces the old link, so any other edits
 * the board has made are kept.
 */
const OLD = 'https://goo.gl/maps/eC3YADHxsNxE6qqb7'
const NEW = 'https://maps.app.goo.gl/1Y94fMWp59Ld51Ez7'

const swap = (from: string, to: string) => (value: unknown) => JSON.parse(JSON.stringify(value).split(from).join(to))

async function replaceLink({ payload, req }: MigrateUpArgs, from: string, to: string) {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  if (settings.mapUrl === from) {
    await payload.updateGlobal({ slug: 'site-settings', data: { mapUrl: to }, req })
    payload.logger.info('Updated Site settings map link')
  }

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'directions' } },
    limit: 1,
    depth: 0,
    req,
  })
  const page = docs[0]
  if (page?.content && JSON.stringify(page.content).includes(from)) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { content: swap(from, to)(page.content), _status: 'published' },
      req,
    })
    payload.logger.info('Updated Directions page map link')
  }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  await replaceLink(args, OLD, NEW)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await replaceLink(args, NEW, OLD)
}
