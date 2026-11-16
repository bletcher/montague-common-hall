type Props = { url: string; title: string; className?: string }

/** Shows a PDF on the page where the browser can, always with a link to open it. */
export function PdfEmbed({ url, title, className }: Props) {
  return (
    <figure className={['pdf', className].filter(Boolean).join(' ')}>
      <object data={url} type="application/pdf" className="pdf-frame" aria-label={title}>
        {/* Shown instead on phones and browsers that can't display PDFs in a page. */}
        <a href={url} className="pdf-fallback">
          View “{title}” (PDF)
        </a>
      </object>
      <figcaption>
        <a href={url} target="_blank" rel="noopener">
          Open “{title}” (PDF)
        </a>
      </figcaption>
    </figure>
  )
}
