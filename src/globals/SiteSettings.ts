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
              name: 'donateUrl',
              label: 'Donation link',
              type: 'text',
              admin: {
                description:
                  'Where the Donate button goes, e.g. the Givebutter campaign link once it is published, or a PayPal donate link. Leave blank to show only the mail-a-check instructions.',
              },
              validate: (value: unknown) =>
                !value || /^https:\/\/\S+$/.test(String(value)) || 'Use a full link starting with https://',
            },
            {
              name: 'givebutterAccountId',
              type: 'text',
              admin: {
                description:
                  'Optional. Fill in both Givebutter fields to show the donation form on the page itself instead of the button.',
              },
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
