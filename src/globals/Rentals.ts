import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'

export const Rentals: GlobalConfig = {
  slug: 'rentals',
  label: 'Rent the Hall page',
  admin: {
    group: 'Content',
    description: 'Rates and policies. Only admins can change these.',
  },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Introduction',
          fields: [
            { name: 'intro', type: 'textarea', required: true },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
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
