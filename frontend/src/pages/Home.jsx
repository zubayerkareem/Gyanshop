import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import { Loader2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

// ── Coverflow Slider ──────────────────────────────────────
const SLIDES = [
  { bg: 'from-rose-400 via-pink-500 to-purple-600',     label: 'নতুন কালেকশন',     sub: 'এই মৌসুমের সেরা পোশাক' },
  { bg: 'from-amber-400 via-orange-500 to-red-500',     label: 'ঈদ স্পেশাল',       sub: 'বিশেষ ছাড়ে পাচ্ছেন' },
  { bg: 'from-sky-400 via-blue-500 to-indigo-600',      label: 'সামার সেল',         sub: 'গ্রীষ্মকালীন অফার' },
  { bg: 'from-violet-500 via-purple-500 to-fuchsia-600',label: 'বেস্টসেলার',        sub: 'সবচেয়ে বেশি বিক্রিত' },
  { bg: 'from-emerald-400 via-teal-500 to-cyan-600',    label: 'নতুন আরাইভাল',     sub: 'একদম নতুন পণ্য' },
  { bg: 'from-pink-400 via-rose-500 to-orange-400',     label: 'এক্সক্লুসিভ অফার', sub: 'সীমিত সময়ের ডিল' },
]

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

function CoverflowSlider() {
  const [active, setActive] = useState(0)
  const [mobile, setMobile] = useState(false)
  const timerRef = useRef(null)
  const n = SLIDES.length

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

  const cfg = mobile ? CFG_MOB : CFG_DESK
  const maxPos = mobile ? 1 : 2

  return (
    <section className="relative w-full select-none pb-12">
      <div className="relative mx-auto flex items-center justify-center overflow-hidden" style={{ height: mobile ? 340 : 500 }}>
        {SLIDES.map((slide, i) => {
          let p = ((i - active + n) % n)
          if (p > n / 2) p -= n
          if (Math.abs(p) > maxPos) return null
          const c = cfg[String(p)]
          return (
            <div
              key={i}
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
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${slide.bg} shadow-xl`}
                style={{ width: mobile ? 180 : 240, height: mobile ? 300 : 420 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-8 right-8 h-20 w-20 rounded-full bg-white/20 blur-xl" />
                <div className="absolute top-24 left-5 h-12 w-12 rounded-full bg-white/15 blur-lg" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white/75 text-xs font-medium mb-1">{slide.sub}</p>
                  <p className="text-white font-bold text-lg leading-snug">{slide.label}</p>
                </div>
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
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setActive(i); startTimer() }}
            aria-label={`স্লাইড ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
          />
        ))}
      </div>
    </section>
  )
}

// ── Blog posts (static) ───────────────────────────────────
const BLOG_POSTS = [
  {
    id: 1,
    title: 'কীভাবে সঠিক পোশাক বেছে নেবেন — সম্পূর্ণ গাইড',
    excerpt: 'পোশাক কেনার সময় কোন বিষয়গুলো মাথায় রাখতে হয়, কাপড়ের মান যাচাই করার উপায় এবং বাজেটের মধ্যে সেরাটি পাওয়ার কৌশল জানুন।',
    category: 'ফ্যাশন',
    date: '১০ জুন, ২০২৫',
    readTime: '৫ মিনিট',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    id: 2,
    title: 'অনলাইনে শপিং করুন নিরাপদে — ৭টি গুরুত্বপূর্ণ টিপস',
    excerpt: 'অনলাইন শপিংয়ে প্রতারণা থেকে বাঁচতে এবং সঠিক পণ্য পেতে যে বিষয়গুলো অবশ্যই জানা দরকার।',
    category: 'টিপস',
    date: '৫ জুন, ২০২৫',
    readTime: '৪ মিনিট',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 3,
    title: 'গ্রীষ্মকালীন পোশাকের যত্ন — ধোয়া ও সংরক্ষণ পদ্ধতি',
    excerpt: 'গরমের দিনে পোশাক দ্রুত নষ্ট হয়ে যায়। সঠিক পরিচর্যায় পোশাককে দীর্ঘস্থায়ী করুন এবং রং অক্ষুণ্ণ রাখুন।',
    category: 'যত্ন',
    date: '১ জুন, ২০২৫',
    readTime: '৩ মিনিট',
    gradient: 'from-teal-400 to-cyan-600',
  },
]

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">

      <CoverflowSlider />

      {/* Category section — dynamic */}
      {categories.length > 0 && (
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

      {/* Divider */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          সকল পণ্য
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

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

      {!loading && !error && products.length === 0 && (
        <p className="py-24 text-center text-sm text-muted-foreground">
          কোনো পণ্য পাওয়া যায়নি।
        </p>
      )}

      {/* Product grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Blog section */}
      <section className="mt-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            ব্লগ ও টিপস
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map(post => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-primary"
            >
              {/* Cover */}
              <div className={`aspect-[16/9] bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-2">
                  <span className="text-xs font-semibold text-primary">
                    আরো পড়ুন →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
