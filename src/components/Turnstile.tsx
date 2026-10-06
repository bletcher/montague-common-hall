'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
    }
    __turnstileLoading?: Promise<void>
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  window.__turnstileLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })
  return window.__turnstileLoading
}

/**
 * Cloudflare's spam check. Adds a hidden "cf-turnstile-response" field to the surrounding form.
 * Rendered explicitly so it also works after client-side page navigation.
 */
export function Turnstile({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    let widgetId: string | undefined
    let cancelled = false
    loadTurnstile()
      .then(() => {
        if (cancelled || !el || !window.turnstile) return
        widgetId = window.turnstile.render(el, { sitekey: siteKey, theme: 'light', size: 'flexible' })
      })
      .catch((err) => console.error(err))
    return () => {
      cancelled = true
      // When a form is swapped for its thank-you message the container is already gone;
      // Turnstile then throws while tidying up, which is harmless.
      if (!widgetId || !window.turnstile) return
      try {
        window.turnstile.remove(widgetId)
      } catch {
        // ignore
      }
    }
  }, [siteKey])

  return <div ref={ref} className="turnstile" />
}
