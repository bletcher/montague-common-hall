import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf, isLoggedIn } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Board member', plural: 'Board members' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
  },
  auth: true,
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: isAdminField },
      options: [
        { label: 'Editor — events, news, pages, inquiries', value: 'editor' },
        { label: 'Admin — also rates, settings, and board members', value: 'admin' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // The very first account created becomes an admin, so the site can't be locked out.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) return { ...data, role: 'admin' }
        return data
      },
    ],
  },
}
