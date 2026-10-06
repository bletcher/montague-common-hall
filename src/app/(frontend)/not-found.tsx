import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Page not found</h1>
        <p>
          That page isn&apos;t here. If you followed a link from the old website, it may have moved — try the{' '}
          <Link href="/calendar">calendar</Link>, <Link href="/rent">rental information</Link>, or the{' '}
          <Link href="/">home page</Link>.
        </p>
      </div>
    </section>
  )
}
