import type { CollectionConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo or file', plural: 'Photos & files' },
  admin: { group: 'Content' },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the photo for visitors who use screen readers, e.g. "The hall seen from the common in spring". For PDFs, use the document title.',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
  },
}
