/**
 * Cloudflare Turnstile spam check. In development the official always-pass test keys are used
 * (https://developers.cloudflare.com/turnstile/troubleshooting/testing/).
 */
const TEST_SITE_KEY = '1x00000000000000000000AA'
const TEST_SECRET = '1x0000000000000000000000000000000AA'

export const turnstileSiteKey = () => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY

export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false
  const secret = process.env.TURNSTILE_SECRET_KEY || (process.env.NODE_ENV !== 'production' ? TEST_SECRET : '')
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set')
    return false
  }
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = (await res.json()) as { success?: boolean }
  return Boolean(data.success)
}
