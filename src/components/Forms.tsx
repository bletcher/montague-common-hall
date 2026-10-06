'use client'

import { useActionState } from 'react'

import { submitMessage, submitRentalInquiry, subscribe, type FormState } from '@/app/(frontend)/actions'
import { eventTypes, spaces } from '@/lib/options'
import { Turnstile } from './Turnstile'

const initial: FormState = { status: 'idle' }

function Status({ state }: { state: FormState }) {
  if (state.status !== 'error') return null
  return (
    <p className="form-error" role="alert">
      {state.message}
    </p>
  )
}

export function RentalInquiryForm({ siteKey, email }: { siteKey: string; email: string }) {
  const [state, action, pending] = useActionState(submitRentalInquiry, initial)

  if (state.status === 'sent') {
    return (
      <div className="form-done" role="status">
        <h3>Thank you — your request is in.</h3>
        <p>
          A board member will reply by email, usually within a few days. The hall is run entirely by volunteers, so
          if you have not heard back in a week, please write to <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="form">
      <div className="form-row">
        <label>
          <span className="label-text">
            Your name <span className="req">required</span>
          </span>
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Group or organization
          <input name="organization" autoComplete="organization" />
        </label>
      </div>
      <div className="form-row">
        <label>
          <span className="label-text">
            Email <span className="req">required</span>
          </span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <div className="form-row">
        <label>
          <span className="label-text">
            Type of event <span className="req">required</span>
          </span>
          <select name="eventType" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Expected attendance
          <input name="attendance" type="number" min={1} max={500} inputMode="numeric" />
        </label>
      </div>
      <div className="form-row">
        <label>
          <span className="label-text">
            Preferred date <span className="req">required</span>
          </span>
          <input name="preferredDate" type="date" required />
        </label>
        <label>
          Alternate date
          <input name="alternateDate" type="date" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Arrive at (including setup)
          <input name="startTime" type="time" />
        </label>
        <label>
          Leave by (including cleanup)
          <input name="endTime" type="time" />
        </label>
      </div>
      <fieldset>
        <legend>Spaces you need</legend>
        {spaces.map((s) => (
          <label key={s.value} className="check">
            <input type="checkbox" name="spaces" value={s.value} /> {s.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Anything else</legend>
        <label className="check">
          <input type="checkbox" name="isPublic" /> The event is open to the public
        </label>
        <label className="check">
          <input type="checkbox" name="needsPA" /> We would like to use the PA system ($20)
        </label>
        <label className="check">
          <input type="checkbox" name="alcohol" /> We would like to serve beer or wine (private events only)
        </label>
      </fieldset>
      <label>
        Tell us about your event
        <textarea name="message" rows={5} maxLength={3000} />
      </label>
      <Turnstile siteKey={siteKey} />
      <Status state={state} />
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Sending…' : 'Send rental request'}
      </button>
      <p className="form-note">
        Sending this form doesn&apos;t reserve the date. A board member will confirm availability with you.
      </p>
    </form>
  )
}

export function ContactForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(submitMessage, initial)

  if (state.status === 'sent') {
    return (
      <div className="form-done" role="status">
        <h3>Thank you — your message is on its way.</h3>
        <p>A board member will reply by email.</p>
      </div>
    )
  }

  return (
    <form action={action} className="form">
      <div className="form-row">
        <label>
          <span className="label-text">
            Your name <span className="req">required</span>
          </span>
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          <span className="label-text">
            Email <span className="req">required</span>
          </span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label>
        Phone
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        <span className="label-text">
          Message <span className="req">required</span>
        </span>
        <textarea name="message" rows={6} required maxLength={3000} />
      </label>
      <label className="check">
        <input type="checkbox" name="wantsNewsletter" /> Send me occasional news and event announcements
      </label>
      <Turnstile siteKey={siteKey} />
      <Status state={state} />
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

export function SubscribeForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(subscribe, initial)

  if (state.status === 'sent') {
    return (
      <p className="subscribe-done" role="status">
        You&apos;re on the list. Thank you!
      </p>
    )
  }

  return (
    <form action={action} className="subscribe">
      <label htmlFor="subscribe-email">Get news and event announcements by email</label>
      <div className="subscribe-row">
        <input id="subscribe-email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        <button type="submit" className="button button-small" disabled={pending}>
          {pending ? 'Adding…' : 'Sign up'}
        </button>
      </div>
      <Turnstile siteKey={siteKey} />
      <Status state={state} />
    </form>
  )
}
