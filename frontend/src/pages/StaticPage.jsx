import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ChevronLeft } from 'lucide-react'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export default function StaticPage() {
  const { slug } = useParams()
  const [page, setPage]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

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
        <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line space-y-4">
          {page.content}
        </div>
      </article>
    </div>
  )
}
