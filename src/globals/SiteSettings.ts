import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Admin' },
  access: { read: anyone, update: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact details',
          fields: [
            { name: 'streetAddress', type: 'text', required: true, defaultValue: '34 Main Street, Montague Center, MA 01351' },
            { name: 'mailingAddress', type: 'text', required: true, defaultValue: 'PO Box 223, Montague, MA 01351' },
            { name: 'email', label: 'Public email address', type: 'email', required: true, defaultValue: 'info@montaguecommonhall.org' },
            {
              name: 'notificationEmail',
              label: 'Send website form submissions to',
              type: 'email',
              required: true,
              defaultValue: 'info@montaguecommonhall.org',
            },
            { name: 'facebookUrl', type: 'text', defaultValue: 'https://www.facebook.com/MontagueCommonHall/' },
            { name: 'mapUrl', label: 'Map link', type: 'text', defaultValue: 'https://goo.gl/maps/eC3YADHxsNxE6qqb7' },
          ],
        },
        {
          label: 'Calendar',
          fields: [
            {
              name: 'googleCalendarId',
              type: 'text',
              admin: {
                description:
                  'From Google Calendar → Settings → this calendar → "Integrate calendar" → Calendar ID. The calendar must be set to public.',
              },
            },
          ],
        },
        {
          label: 'Donations',
          fields: [
            {
              name: 'givebutterAccountId',
              type: 'text',
              admin: { description: 'Givebutter Dashboard → Settings → Account ID.' },
            },
            {
              name: 'givebutterCampaignCode',
              type: 'text',
              admin: {
                description:
                  'The code at the end of the campaign link, e.g. the "mch2026" in givebutter.com/mch2026.',
              },
            },
          ],
        },
        {
          label: 'Announcement bar',
          fields: [
            { name: 'announcementOn', label: 'Show announcement', type: 'checkbox' },
            { name: 'announcementText', type: 'text' },
            { name: 'announcementLink', type: 'text' },
          ],
        },
      ],
    },
  ],
}
