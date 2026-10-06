import type { CollectionConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access'
import { eventTypes, spaces } from '../lib/options'

export const RentalInquiries: CollectionConfig = {
  slug: 'rental-inquiries',
  labels: { singular: 'Rental inquiry', plural: 'Rental inquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'eventType', 'preferredDate', 'status', 'createdAt'],
    group: 'Inbox',
    description:
      'Requests sent from the Rent the Hall page. Set the status as you work through each one.',
  },
  defaultSort: '-createdAt',
  access: {
    // Visitors submit through the website form, which writes with server-side checks.
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'In conversation', value: 'in-progress' },
        { label: 'Booked', value: 'booked' },
        { label: 'Declined or withdrawn', value: 'closed' },
      ],
    },
    {
      name: 'boardNotes',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Only board members see these notes.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'organization', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'eventType', type: 'select', required: true, options: eventTypes },
    { name: 'isPublic', label: 'Open to the public', type: 'checkbox' },
    {
      type: 'row',
      fields: [
        { name: 'preferredDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
        { name: 'alternateDate', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startTime', label: 'Start time (incl. setup)', type: 'text' },
        { name: 'endTime', label: 'End time (incl. cleanup)', type: 'text' },
        { name: 'attendance', label: 'Expected attendance', type: 'number', min: 0 },
      ],
    },
    { name: 'spaces', type: 'select', hasMany: true, options: spaces },
    {
      type: 'row',
      fields: [
        { name: 'needsPA', label: 'Wants the PA system', type: 'checkbox' },
        { name: 'alcohol', label: 'Asking about beer or wine', type: 'checkbox' },
      ],
    },
    { name: 'message', type: 'textarea' },
  ],
}
