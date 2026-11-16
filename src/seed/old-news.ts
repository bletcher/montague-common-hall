/**
 * Loads the old site's newsletters (saved in archive/old-site/news) into News, with their photos.
 *
 *   npm run seed:old-news                        # local development database
 *   NODE_ENV=production npm run seed:old-news    # the live site (needs `wrangler login`)
 *
 * Safe to re-run: posts that already exist (matched by slug) are left alone, so edits made in
 * the admin panel are kept. Photos are matched by filename.
 */
import { randomBytes } from 'crypto'
import fs from 'fs'
import { JSDOM } from 'jsdom'
import path from 'path'
import { getPayload } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { slugify } from '../fields/slug'

type Post = { id: number; title: string; summary: string; posted: string; url: string; file: string }
type Node = { type: string; text?: string; children?: Node[]; [key: string]: unknown }

const dirname = path.dirname(fileURLToPath(import.meta.url))
const archive = path.resolve(dirname, '../../archive/old-site')
const OLD = 'https?://(?:www\\.)?montaguecommonhall\\.org'

// Old-site links, pointed at the new pages.
const LINKS: [RegExp, string][] = [
  [new RegExp(`${OLD}/p/55[^"]*`, 'g'), '/calendar'],
  [new RegExp(`${OLD}/p/60[^"]*`, 'g'), '/donate'],
  [new RegExp(`${OLD}/d/[^"]*`, 'g'), '/calendar'],
  [new RegExp(`${OLD}/contact`, 'g'), '/contact'],
  [new RegExp(`${OLD}/?(?=")`, 'g'), '/'],
]

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const posts: Post[] = JSON.parse(fs.readFileSync(path.join(archive, 'news/index.json'), 'utf8'))

async function upload(file: string, alt: string) {
  const filename = path.basename(file)
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0].id
  return (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(archive, 'news', file) })).id
}

const MARK = /⟦IMG:(\d+)⟧/g
const hasMark = (node: Node): boolean =>
  Boolean(node.text?.match(MARK)) || Boolean(node.children?.some(hasMark))
function takeMarks(node: Node, ids: number[]) {
  if (node.text) node.text = node.text.replace(MARK, (_, id) => (ids.push(+id), '')).trim()
  node.children?.forEach((child) => takeMarks(child, ids))
  if (node.children) node.children = node.children.filter((c) => c.type !== 'text' || c.text)
}

for (const post of posts) {
  const slug = slugify(post.url.split('/').pop()!)
  const existing = await payload.find({ collection: 'news', where: { slug: { equals: slug } }, limit: 1, draft: true })
  if (existing.docs[0]) {
    payload.logger.info(`news: ${slug} already exists, skipped`)
    continue
  }

  // The archived file starts with a heading, summary and date added when it was saved.
  let html = fs.readFileSync(path.join(archive, post.file), 'utf8').split(/<p><small>Posted[^\n]*\n/)[1]
  for (const [pattern, to] of LINKS) html = html.replace(pattern, to)

  // Photos: upload each one and leave a marker where it was, swapped for an upload node below.
  for (const img of html.match(/<img[^>]*>/g) ?? []) {
    const src = img.match(/src="([^"]+)"/)![1]
    let alt = img.match(/alt="([^"]*)"/)?.[1] ?? ''
    if (!alt || /\.(jpe?g|png)$/i.test(alt)) alt = `Photo from the ${post.title}`
    html = html.replace(img, `⟦IMG:${await upload(src, alt)}⟧`)
  }

  const state = convertHTMLToLexical({ editorConfig, html, JSDOM })
  const children: Node[] = []
  for (const block of state.root.children as Node[]) {
    if (hasMark(block)) {
      const ids: number[] = []
      takeMarks(block, ids)
      for (const id of ids) {
        children.push({
          type: 'upload',
          id: randomBytes(12).toString('hex'),
          version: 3,
          format: '',
          relationTo: 'media',
          value: id,
          fields: null,
        })
      }
      if (block.children?.length === 0 && block.type === 'paragraph') continue
    }
    children.push(block)
  }
  state.root.children = children as never

  await payload.create({
    collection: 'news',
    data: {
      title: post.title,
      slug,
      publishedDate: new Date(`${post.posted}T12:00:00-05:00`).toISOString(),
      excerpt: post.summary || undefined,
      content: state as never,
      _status: 'published',
    },
  })
  payload.logger.info(`news: ${slug}`)
}
process.exit(0)
