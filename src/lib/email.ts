/**
 * Sends notification email through Resend (https://resend.com). Without RESEND_API_KEY the
 * message is logged instead, so forms still work in development. Submissions are always saved
 * in the admin panel first, so a failed email never loses a request.
 */
type Mail = { to: string; subject: string; text: string; replyTo?: string }

export async function sendMail({ to, subject, text, replyTo }: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Montague Common Hall <website@mail.montaguecommonhall.org>'

  if (!apiKey) {
    console.log(`[email not configured] to=${to} subject=${subject}\n${text}`)
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
    })
    if (!res.ok) console.error(`Resend failed: ${res.status} ${await res.text()}`)
    return res.ok
  } catch (err) {
    console.error('Resend failed', err)
    return false
  }
}
