import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import { Loader2, ChevronLeft, ChevronRight, LayoutGrid, X, Play } from 'lucide-react'

// ── YouTube helper ────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\s?/]+)/)
  return m ? m[1] : null
}

// ── Coverflow Slider ──────────────────────────────────────
const CFG_DESK = {
  '-2': { x: -430, scale: 0.52, opacity: 0.40, z: 1 },
  '-1': { x: -240, scale: 0.74, opacity: 0.72, z: 5 },
   '0': { x:    0, scale: 1.00, opacity: 1.00, z: 10 },
   '1': { x:  240, scale: 0.74, opacity: 0.72, z: 5 },
   '2': { x:  430, scale: 0.52, opacity: 0.40, z: 1 },
}
const CFG_MOB = {
  '-1': { x: -155, scale: 0.70, opacity: 0.65, z: 5 },
   '0': { x:    0, scale: 1.00, opacity: 1.00, z: 10 },
   '1': { x:  155, scale: 0.70, opacity: 0.65, z: 5 },
}

function CoverflowSlider({ slides }) {
  const [active, setActive]   = useState(0)
  const [mobile, setMobile]   = useState(false)
  const [videoId, setVideoId] = useState(null)
  const timerRef = useRef(null)
  const n = slides.length

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setActive(a => (a + 1) % n), 3400)
  }, [n])

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current) }, [startTimer])

  const go = useCallback((dir) => { setActive(a => (a + dir + n) % n); startTimer() }, [n, startTimer])

  const cfg    = mobile ? CFG_MOB : CFG_DESK
  const maxPos = mobile ? 1 : 2

  return (
    <>
      <section className="relative w-full select-none pb-12">
        <div className="relative mx-auto flex items-center justify-center overflow-hidden" style={{ height: mobile ? 340 : 500 }}>
          {slides.map((slide, i) => {
            let p = ((i - active + n) % n)
            if (p > n / 2) p -= n
            if (Math.abs(p) > maxPos) return null
            const c        = cfg[String(p)]
            const vid      = getYouTubeId(slide.video_url)
            const isCenter = p === 0

            return (
              <div
                key={slide.id}
                onClick={() => { setActive(i); startTimer() }}
                className="absolute cursor-pointer"
                style={{
                  transform: `translateX(${c.x}px) scale(${c.scale})`,
                  opacity: c.opacity,
                  zIndex: c.z,
                  transition: 'transform 0.52s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.52s ease',
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  className="relative overflow-hidden rounded-3xl shadow-xl bg-muted"
                  style={{ width: mobile ? 180 : 240, height: mobile ? 300 : 420 }}
                >
                  <img
                    src={slide.image_url}
                    alt={`স্লাইড ${i + 1}`}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  {vid && isCenter && (
                    <button
                      onClick={e => { e.stopPropagation(); setVideoId(vid) }}
                      aria-label="ভিডিও চালান"
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                        <Play className="h-6 w-6 fill-primary text-primary ml-1" />
                      </div>
                    </button>
                  )}
                  {vid && !isCenter && (
                    <div className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
                      <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => go(-1)} aria-label="আগের স্লাইড"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-8 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => go(1)} aria-label="পরের স্লাইড"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-8 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setActive(i); startTimer() }}
              aria-label={`স্লাইড ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </div>
      </section>

      {/* YouTube modal */}
      {videoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setVideoId(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setVideoId(null)}
              aria-label="বন্ধ করুন"
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const COVER_GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-sky-400 to-blue-600',
  'from-emerald-400 to-green-600',
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [blogPosts, setBlogPosts]   = useState([])
  const [slides, setSlides]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const q = searchParams.get('q')?.trim() || ''

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories(), api.getBlogPosts(), api.getSliders()])
      .then(([prods, cats, posts, sliderData]) => {
        setProducts(prods); setCategories(cats); setBlogPosts(posts)
        setSlides(Array.isArray(sliderData) ? sliderData : [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const displayed = q
    ? products.filter(p =>
        p.name?.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase())
      )
    : products

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">

      {!q && slides.length > 0 && <CoverflowSlider slides={slides} />}

      {/* Category section — dynamic */}
      {!q && categories.length > 0 && (
        <section className="py-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">ক্যাটাগরি</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className={`grid gap-3 ${categories.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-6'}`}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted border border-border group-hover:border-primary/30 transition-colors">
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="flex h-full items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                  }
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search results banner */}
      {q && !loading && (
        <div className="mb-6 mt-4 flex items-center justify-between gap-3 rounded-[6px] border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-semibold">"{q}"</span>
            {' — '}
            {displayed.length > 0
              ? <span>{displayed.length}টি পণ্য পাওয়া গেছে</span>
              : <span className="text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</span>
            }
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            ক্লিয়ার
          </button>
        </div>
      )}

      {/* Divider */}
      {!q && (
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            সকল পণ্য
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex justify-center py-24" role="status" aria-label="লোড হচ্ছে">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div role="alert" className="mx-auto max-w-sm rounded-[6px] border border-destructive/40 bg-destructive/10 px-5 py-4 text-center text-sm text-destructive">
          পণ্য লোড করতে সমস্যা হয়েছে: {error}
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {q ? `"${q}" এর জন্য কোনো পণ্য পাওয়া যায়নি।` : 'কোনো পণ্য পাওয়া যায়নি।'}
          </p>
          {q && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs font-semibold text-primary hover:underline"
            >
              সব পণ্য দেখুন
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayed.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Blog section */}
      {!q && blogPosts.length > 0 && (
        <section className="mt-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              ব্লগ ও টিপস
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          {/* Show only 3 latest, link to full archive */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post, i) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-primary"
              >
                {/* Cover */}
                <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                  {post.cover_image
                    ? <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className={`h-full w-full bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]}`}>
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                  }
                  {post.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(post.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {post.read_time && <><span>·</span><span>{post.read_time}</span></>}
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-2">
                    <span className="text-xs font-semibold text-primary">আরো পড়ুন →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {blogPosts.length > 3 && (
            <div className="mt-8 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-[6px] border border-border px-5 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                সব পোস্ট দেখুন →
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
