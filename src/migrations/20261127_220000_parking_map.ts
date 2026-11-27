import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'
import { randomBytes } from 'crypto'

/**
 * Data only: puts the parking map (from the old site's 2018 newsletter, already in Photos & files)
 * under the Parking section of the Directions page, which the home page's "Where do I park?"
 * button links to. Does nothing if the page, the heading, or the photo isn't there, or if the map
 * is already on the page, so board edits are kept.
 */
const FILENAME = 'mch-parking-map.png'

type Node = { type: string; tag?: string; text?: string; value?: unknown; children?: Node[] }
const text = (n: Node): string => n.text ?? (n.children ?? []).map(text).join('')

async function findTargets({ payload, req }: MigrateUpArgs) {
  const media = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: FILENAME } },
      limit: 1,
      req,
    })
  ).docs[0]
  const page = (
    await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'directions' } },
      limit: 1,
      req,
    })
  ).docs[0]
  return { media, page }
}

export async function up(args: MigrateUpArgs): Promise<void> {
  const { payload, req } = args
  const { media, page } = await findTargets(args)
  const blocks = (page?.content?.root?.children ?? []) as Node[]
  if (!media || !page || blocks.some((b) => b.type === 'upload' && b.value === media.id)) return

  const heading = blocks.findIndex(
    (b) => b.type === 'heading' && text(b).trim().toLowerCase() === 'parking',
  )
  if (heading < 0) return
  // After the heading's paragraphs, before the next heading.
  let at = heading + 1
  while (at < blocks.length && blocks[at].type !== 'heading') at++
  // The map link now shows as a small map with its text below, which strands the full stop that
  // followed it ("… Open in Google Maps.") on a line of its own, so drop that.
  for (const block of blocks) {
    const kids = block.children ?? []
    const i = kids.findIndex(
      (k) => k.type === 'link' && JSON.stringify(k).includes('maps.app.goo.gl'),
    )
    if (i >= 0 && kids[i + 1]?.type === 'text' && kids[i + 1].text?.trim() === '.')
      kids.splice(i + 1, 1)
  }
  const upload = {
    type: 'upload',
    version: 3,
    format: '',
    id: randomBytes(12).toString('hex'),
    fields: null as null,
    relationTo: 'media',
    value: media.id,
  }
  const content = {
    ...page.content,
    root: {
      ...page.content!.root,
      children: [...blocks.slice(0, at), upload, ...blocks.slice(at)],
    },
  }
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { content: content as never, _status: 'published' },
    req,
  })
  payload.logger.info('Added the parking map to Directions')
}

export async function down(args: MigrateDownArgs): Promise<void> {
  const { payload, req } = args
  const { media, page } = await findTargets(args as unknown as MigrateUpArgs)
  if (!media || !page?.content) return
  const children = (page.content.root.children as Node[]).filter(
    (b) => !(b.type === 'upload' && b.value === media.id),
  )
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      content: { ...page.content, root: { ...page.content.root, children } } as never,
      _status: 'published',
    },
    req,
  })
}
