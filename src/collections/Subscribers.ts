import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Mailing list signup', plural: 'Mailing list signups' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'source', 'addedToGivebutter', 'createdAt'],
    group: 'Inbox',
    description:
      'People who asked for news by email. Copy new signups into Givebutter Contacts, then tick "Added to Givebutter".',
  },
  defaultSort: '-createdAt',
  access: {
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'footer',
      options: [
        { label: 'Signup box', value: 'footer' },
        { label: 'Contact form', value: 'contact' },
        { label: 'Imported', value: 'import' },
      ],
    },
    { name: 'addedToGivebutter', type: 'checkbox', admin: { position: 'sidebar' } },
  ],
}
