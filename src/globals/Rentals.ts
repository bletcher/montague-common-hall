import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'

export const Rentals: GlobalConfig = {
  slug: 'rentals',
  label: 'Rental rates & FAQ',
  admin: {
    group: 'Content',
    description:
      'The rates, other charges, FAQ, and documents on the Rent the Hall page. Only admins can change these. The page title, introduction, and photo are under Pages → Rent the Hall.',
  },
  access: { read: anyone, update: isAdmin },
  fields: [
    // Retired: the Rent the Hall introduction and photo now live in Pages → Rent the Hall.
    // Kept (hidden, unused) because removing them would rebuild the rentals table, and on D1
    // dropping that table cascades and deletes the rates, FAQ, and documents stored under it.
    { name: 'intro', type: 'textarea', required: true, admin: { hidden: true } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { hidden: true } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Rates',
          fields: [
            {
              name: 'seasons',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'dates', type: 'text', required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'hourly', label: 'Per hour ($)', type: 'number', required: true },
                    { name: 'hourlyLimit', label: 'Hourly rate applies for the first … hours', type: 'number', defaultValue: 6 },
                    { name: 'dayRate', label: 'Full day ($)', type: 'number', required: true },
                  ],
                },
                { name: 'note', type: 'text' },
              ],
            },
            {
              name: 'extras',
              label: 'Other charges',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'item', type: 'text', required: true },
                    { name: 'price', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'rateNotes',
              label: 'Rate notes',
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            {
              name: 'faq',
              label: 'Questions renters ask',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Documents',
          fields: [
            {
              name: 'documents',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'file', type: 'upload', relationTo: 'media', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
