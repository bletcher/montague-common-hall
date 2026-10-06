import type { CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News post', plural: 'News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', '_status'],
    group: 'Content',
  },
  defaultSort: '-publishedDate',
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: { description: 'A short summary shown on the News page and the home page.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
  ],
}
