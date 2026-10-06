import { APIError, type CollectionConfig } from 'payload'

import { isLoggedIn, publishedOrLoggedIn } from '../access'
import { slugField } from '../fields/slug'
import { SYSTEM_PAGES } from '../lib/system-pages'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description:
      'Every page on the site except Home (edit that under Home page). On Rent the Hall, Calendar, Donate, News, and Contact, your text appears at the top and the rates, calendar, donation button, news list, or form is added below it automatically.',
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    beforeChange: [
      ({ originalDoc, data }) => {
        const original = originalDoc?.slug
        if (original && SYSTEM_PAGES[original] && data.slug && data.slug !== original) {
          throw new APIError(
            `The web address of "${SYSTEM_PAGES[original]}" can't be changed — the site menu links to /${original}.`,
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({ collection: 'pages', id, depth: 0, req, draft: true })
        if (doc?.slug && SYSTEM_PAGES[doc.slug]) {
          throw new APIError(
            `"${SYSTEM_PAGES[doc.slug]}" is part of the site menu and can't be deleted. You can change its text instead.`,
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'summary',
      label: 'Introduction',
      type: 'textarea',
      admin: { description: 'Shown in larger type under the title, and used by search engines.' },
    },
    { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
    {
      name: 'content',
      label: 'Page text',
      type: 'richText',
      admin: { description: 'Optional on pages that already have a form, calendar, or list below.' },
    },
  ],
}
