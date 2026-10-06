import type { CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Simple text pages such as About, Directions, and Get Involved.',
  },
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
      name: 'summary',
      type: 'textarea',
      admin: { description: 'One or two sentences shown under the title and in search results.' },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true },
  ],
}
