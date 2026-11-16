import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '../access'

/** The board's to-do list, shown on the admin dashboard with checkboxes. */
export const Tasks: CollectionConfig = {
  slug: 'tasks',
  labels: { singular: 'To-do', plural: 'To-do list' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'done', 'owner', 'due'],
    group: 'Board',
    description: 'Open items also appear on the dashboard, where you can tick them off.',
  },
  defaultSort: 'due',
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: 'title', label: 'Task', type: 'text', required: true },
    { name: 'done', type: 'checkbox', defaultValue: false },
    { name: 'owner', label: 'Who', type: 'text' },
    { name: 'due', label: 'Due', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'notes', type: 'textarea' },
    {
      name: 'completedOn',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.done && !originalDoc?.done) data.completedOn = new Date().toISOString()
        if (data.done === false) data.completedOn = null
        return data
      },
    ],
  },
}
