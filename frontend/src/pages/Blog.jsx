import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'

const PAGE_SIZE = 6

const COVER_GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600',
  'from-indigo-400 to-blue-500',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-teal-500',
]

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const activeCat = searchParams.get('cat') || ''
  const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  useEffect(() => {
    setLoading(true); setError(null)
    api.getBlogPosts()
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]

  const filtered = activeCat
    ? posts.filter(p => p.category === activeCat)
    : posts

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function setPage(p) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setCat(cat) {
    setSearchParams(cat ? { cat } : {})
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">ব্লগ ও টিপস</h1>
        <p className="text-sm text-muted-foreground">পোশাক, ফ্যাশন ও কেনাকাটা সম্পর্কে দরকারী তথ্য ও পরামর্শ</p>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setCat('')}
            className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
              !activeCat
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            সব পোস্ট
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCat(cat)}
              className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
                activeCat === cat
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="py-16 text-center text-sm text-muted-foreground">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          কোনো পোস্ট পাওয়া যায়নি।
        </div>
      )}

      {/* Grid */}
      {!loading && paginated.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((post, i) => {
              const globalIdx = filtered.indexOf(post)
              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-primary hover:shadow-sm"
                >
                  {/* Cover */}
                  <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                    {post.cover_image
                      ? <img
                          src={post.cover_image}
                          alt={post.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      : <div className={`h-full w-full bg-gradient-to-br ${COVER_GRADIENTS[globalIdx % COVER_GRADIENTS.length]}`}>
                          <div className="absolute inset-0 bg-black/10" />
                        </div>
                    }
                    {post.category && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        <Tag className="h-2.5 w-2.5" />
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(post.created_at).toLocaleDateString('bn-BD', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                      {post.read_time && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-1">
                      <span className="text-xs font-semibold text-primary">আরো পড়ুন →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {filtered.length}টি পোস্ট · পেজ {currentPage}/{totalPages}
          </p>
        </>
      )}
    </div>
  )
}
