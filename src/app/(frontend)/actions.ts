'use server'

import { getClient, getSettings } from '@/lib/payload'
import { sendMail } from '@/lib/email'
import { verifyTurnstile } from '@/lib/turnstile'
import { eventTypes, spaces } from '@/lib/options'
import type { RentalInquiry } from '@/payload-types'

export type FormState = { status: 'idle' | 'sent' | 'error'; message?: string }

const text = (form: FormData, key: string, max = 500) => {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const SPAM_MESSAGE = 'We could not confirm you are a person. Please reload the page and try again.'
const adminUrl = (path: string) => `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/collections/${path}`

export async function submitRentalInquiry(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { status: 'error', message: SPAM_MESSAGE }

  const name = text(form, 'name', 120)
  const email = text(form, 'email', 200)
  const preferredDate = text(form, 'preferredDate', 20)
  const eventType = text(form, 'eventType', 40)
  if (!name || !isEmail(email) || !preferredDate || !eventTypes.some((t) => t.value === eventType)) {
    return { status: 'error', message: 'Please fill in your name, a valid email, the type of event, and a preferred date.' }
  }

  const attendance = Number(text(form, 'attendance', 6))
  const chosenSpaces = form.getAll('spaces').filter((s): s is string => typeof s === 'string' && spaces.some((o) => o.value === s))
  const data = {
    status: 'new' as const,
    name,
    email,
    eventType: eventType as RentalInquiry['eventType'],
    preferredDate,
    organization: text(form, 'organization', 200),
    phone: text(form, 'phone', 40),
    isPublic: form.get('isPublic') === 'on',
    alternateDate: text(form, 'alternateDate', 20) || undefined,
    startTime: text(form, 'startTime', 20),
    endTime: text(form, 'endTime', 20),
    attendance: Number.isFinite(attendance) && attendance > 0 ? attendance : undefined,
    spaces: chosenSpaces as RentalInquiry['spaces'],
    needsPA: form.get('needsPA') === 'on',
    alcohol: form.get('alcohol') === 'on',
    message: text(form, 'message', 3000),
  }

  const payload = await getClient()
  const doc = await payload.create({ collection: 'rental-inquiries', data, overrideAccess: true })

  const settings = await getSettings()
  const typeLabel = eventTypes.find((t) => t.value === eventType)?.label ?? eventType
  await sendMail({
    to: settings.notificationEmail,
    replyTo: email,
    subject: `Rental inquiry: ${typeLabel} on ${preferredDate} — ${name}`,
    text: [
      `${name}${data.organization ? ` (${data.organization})` : ''} <${email}>${data.phone ? `, ${data.phone}` : ''}`,
      `Event: ${typeLabel}${data.isPublic ? ' (public)' : ''}`,
      `Preferred date: ${preferredDate}${data.alternateDate ? `, or ${data.alternateDate}` : ''}`,
      `Time: ${data.startTime || '?'} to ${data.endTime || '?'}${data.attendance ? `, about ${data.attendance} people` : ''}`,
      `Spaces: ${chosenSpaces.join(', ') || 'not specified'}${data.needsPA ? '; PA' : ''}${data.alcohol ? '; asking about beer/wine' : ''}`,
      '',
      data.message,
      '',
      `Open in the admin panel: ${adminUrl(`rental-inquiries/${doc.id}`)}`,
      'Reply to this email to answer the renter directly.',
    ].join('\n'),
  })

  return { status: 'sent' }
}

export async function submitMessage(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { status: 'error', message: SPAM_MESSAGE }

  const name = text(form, 'name', 120)
  const email = text(form, 'email', 200)
  const message = text(form, 'message', 3000)
  if (!name || !isEmail(email) || !message) {
    return { status: 'error', message: 'Please fill in your name, a valid email, and a message.' }
  }
  const wantsNewsletter = form.get('wantsNewsletter') === 'on'

  const payload = await getClient()
  const doc = await payload.create({
    collection: 'messages',
    data: { status: 'new', name, email, message, phone: text(form, 'phone', 40), wantsNewsletter },
    overrideAccess: true,
  })
  if (wantsNewsletter) await addSubscriber(email, name, 'contact')

  const settings = await getSettings()
  await sendMail({
    to: settings.notificationEmail,
    replyTo: email,
    subject: `Website message from ${name}`,
    text: `${name} <${email}>\n\n${message}\n\nOpen in the admin panel: ${adminUrl(`messages/${doc.id}`)}`,
  })

  return { status: 'sent' }
}

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await verifyTurnstile(form.get('cf-turnstile-response')))) return { status: 'error', message: SPAM_MESSAGE }
  const email = text(form, 'email', 200)
  if (!isEmail(email)) return { status: 'error', message: 'Please enter a valid email address.' }
  await addSubscriber(email, text(form, 'name', 120), 'footer')
  return { status: 'sent' }
}

async function addSubscriber(email: string, name: string, source: 'footer' | 'contact') {
  const payload = await getClient()
  const existing = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email.toLowerCase() } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) return
  await payload.create({
    collection: 'subscribers',
    data: { email: email.toLowerCase(), name, source },
    overrideAccess: true,
  })
}
