/**
 * Minimal builders for Payload's rich-text (Lexical) JSON, used only by the seed script.
 * Board members edit this content in the admin panel afterwards.
 */
type Node = Record<string, unknown>

const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

export const text = (value: string, bold = false): Node => ({
  type: 'text',
  text: value,
  format: bold ? 1 : 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

type Inline = string | Node
const inline = (parts: Inline[]) => parts.map((p) => (typeof p === 'string' ? text(p) : p))

export const link = (label: string, url: string): Node => ({
  ...base,
  type: 'link',
  version: 3,
  fields: { linkType: 'custom', url, newTab: false },
  children: [text(label)],
})

export const p = (...parts: Inline[]): Node => ({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(parts) })

export const h = (tag: 'h2' | 'h3', value: string): Node => ({ ...base, type: 'heading', tag, children: [text(value)] })

export const ul = (...items: Inline[][]): Node => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((parts, i) => ({ ...base, type: 'listitem', value: i + 1, children: inline(parts) })),
})

export const doc = (...children: Node[]) => ({
  root: { ...base, type: 'root', children },
})
