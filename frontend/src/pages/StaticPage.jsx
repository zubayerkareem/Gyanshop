import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ChevronLeft } from 'lucide-react'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export default function StaticPage() {
  const { slug } = useParams()
  const [page, setPage]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${BASE}/api/public/page?slug=${slug}`)
      .then(r => r.ok ? r.json() : r.json().then(b => Promise.reject(b.error || 'পেজ পাওয়া যায়নি')))
      .then(setPage)
      .catch(e => setError(typeof e === 'string' ? e : e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
      {error}
    </div>
  )

  if (!page) return null

  const isHtml = page.content?.trimStart().startsWith('<')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        হোম পেজে ফিরুন
      </Link>

      <article>
        <h1 className="mb-6 text-2xl font-bold text-foreground border-b border-border pb-4">
          {page.title}
        </h1>

        {isHtml ? (
          <div
            className="text-sm leading-relaxed text-foreground/80
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-foreground
              [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-foreground
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-foreground
              [&_p]:mb-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul>li]:mb-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol>li]:mb-1
              [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3
              [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80
              [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
            {page.content}
          </div>
        )}
      </article>
    </div>
  )
}
