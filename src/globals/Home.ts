import type { GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '../access'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: { group: 'Content' },
  access: { read: anyone, update: isLoggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Welcome',
          fields: [
            { name: 'heroHeading', type: 'text', required: true },
            { name: 'heroText', type: 'textarea', required: true },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'spaces',
              label: 'What the hall offers',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Fundraising campaign',
          fields: [
            { name: 'campaignOn', label: 'Show the campaign on the home page', type: 'checkbox', defaultValue: true },
            { name: 'campaignHeading', type: 'text' },
            { name: 'campaignText', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'campaignGoal', label: 'Goal ($)', type: 'number', min: 0 },
                {
                  name: 'campaignRaised',
                  label: 'Raised so far ($)',
                  type: 'number',
                  min: 0,
                  admin: { description: 'Update from the Givebutter dashboard.' },
                },
              ],
            },
            {
              name: 'campaignProjects',
              label: 'What the money pays for',
              type: 'array',
              fields: [{ name: 'item', type: 'text', required: true }],
            },
            { name: 'campaignRecognition', label: 'Donor recognition', type: 'textarea' },
            { name: 'campaignImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
