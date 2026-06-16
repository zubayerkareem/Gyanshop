import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import {
  Loader2, ShoppingBag, Star, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Truck, RefreshCw, ShieldCheck,
  Headphones, Check, ArrowRight,
} from 'lucide-react'

// ── Static placeholders ───────────────────────────────────
const TRUST = [
  { icon: Truck,       label: '১-৫ দিনে ডেলিভারি'  },
  { icon: ShieldCheck, label: '১০০% অরিজিনাল'        },
  { icon: RefreshCw,   label: '৭ দিনে রিটার্ন'      },
  { icon: Headphones,  label: '২৪/৭ সাপোর্ট'        },
]

const FEATURES = [
  { label: 'প্রিমিয়াম কাপড়' },
  { label: 'ফেড-প্রুফ রং'    },
  { label: 'নিখুঁত সেলাই'   },
  { label: 'পরিবেশবান্ধব'    },
  { label: 'দ্রুত শিপমেন্ট' },
]

const WHY_US = [
  'সরাসরি কারখানা থেকে — মধ্যস্থতাকারী নেই, তাই দাম কম',
  'প্রতিটি পণ্য শিপমেন্টের আগে কোয়ালিটি চেক করা হয়',
  'ক্যাশ অন ডেলিভারি — পণ্য দেখে তারপর পেমেন্ট',
  '৭ দিনের রিটার্ন গ্যারান্টি, কোনো প্রশ্ন নেই',
  'সাইজ ভুল হলে বিনামূল্যে এক্সচেঞ্জ করে দেওয়া হয়',
]

const REVIEWS = [
  { name: 'রাহেলা বেগম',    location: 'ঢাকা',      rating: 5, ago: '২ দিন আগে',    text: 'অসাধারণ মানের পণ্য! কাপড়ের কোয়ালিটি এবং ডেলিভারি দুটোই চমৎকার। বারবার কিনতে চাই।' },
  { name: 'মো. করিম',       location: 'চট্টগ্রাম', rating: 5, ago: '১ সপ্তাহ আগে', text: 'দাম অনুযায়ী মান অনেক ভালো। রং এখনো একদম ঠিক আছে। পরিবারের সবাই পছন্দ করেছে।' },
  { name: 'সুমাইয়া আক্তার', location: 'সিলেট',     rating: 4, ago: '২ সপ্তাহ আগে', text: 'খুব ভালো পণ্য। ডেলিভারি দ্রুত ছিলো। কাপড়ের কোয়ালিটি প্রত্যাশার চেয়ে ভালো।' },
  { name: 'তানভীর আহমেদ',   location: 'রাজশাহী',   rating: 5, ago: '৩ সপ্তাহ আগে', text: 'অনলাইনে অনেক জায়গা থেকে কিনেছি, কিন্তু এই শপের মান সবচেয়ে ভালো। আবারো কিনবো।' },
  { name: 'নাফিসা ইসলাম',   location: 'খুলনা',     rating: 5, ago: '১ মাস আগে',    text: 'গিফট হিসেবে নিয়েছিলাম। যাকে দিয়েছি সে অনেক খুশি। প্যাকেজিংও সুন্দর ছিলো।' },
  { name: 'আরিফুল হক',      location: 'বরিশাল',    rating: 5, ago: '১ মাস আগে',    text: 'সত্যিকারের মানসম্পন্ন পণ্য। দাম দিয়ে পুরো মূল্য পাওয়া গেছে। আবার অর্ডার দিয়েছি।' },
]

const FAQS = [
  { q: 'ডেলিভারি কতদিনে পাবো?',        a: 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ৩-৫ কার্যদিবসে ডেলিভারি পৌঁছায়।' },
  { q: 'ক্যাশ অন ডেলিভারি আছে কি?',    a: 'হ্যাঁ! সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা পাওয়া যায়।' },
  { q: 'পণ্য ফেরত দেওয়া কি সম্ভব?',   a: 'পণ্য পাওয়ার ৭ দিনের মধ্যে যেকোনো সমস্যায় রিটার্ন বা এক্সচেঞ্জ করা যাবে।' },
  { q: 'সাইজ সঠিক না হলে?',             a: 'সাইজ ভুল হলে বিনামূল্যে এক্সচেঞ্জ করে দেওয়া হবে — কোনো ঝামেলা নেই।' },
  { q: 'কতদিন টেকসই থাকবে?',           a: 'সঠিক যত্নে কমপক্ষে ২-৩ বছর ভালো থাকে। ফেড-প্রুফ ও এন্টি-শ্রিংক ফ্যাব্রিক।' },
]

// ── Sub-components ────────────────────────────────────────
function Stars({ n = 5 }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? 'fill-amber-400 text-amber-400' : 'fill-border text-border'}`} />
      ))}
    </div>
  )
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors focus-visible:outline-none"
      >
        {q}
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        }
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  )
}

// ── Image review slider (portrait screenshots) ───────────
function ImageReviewSlider({ images }) {
  const [idx, setIdx]   = useState(0)
  const timer           = useRef(null)
  const perView         = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 3
  const max             = Math.max(0, images.length - perView)

  const go = useCallback((dir) => {
    setIdx(i => Math.max(0, Math.min(max, i + dir)))
    clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(i => i >= max ? 0 : i + 1), 3500)
  }, [max])

  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => i >= max ? 0 : i + 1), 3500)
    return () => clearInterval(timer.current)
  }, [max])

  return (
    <div className="relative px-8">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${idx * (100 / perView)}%)` }}
        >
          {images.map((url, i) => (
            <div key={i} className="shrink-0 px-2" style={{ width: `${100 / perView}%` }}>
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm" style={{ aspectRatio: '9/16' }}>
                <img src={url} alt={`রিভিউ ${i + 1}`} className="h-full w-full object-cover object-top" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {max > 0 && (<>
        <button onClick={() => go(-1)} disabled={idx === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-30 focus-visible:outline-none">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => go(1)} disabled={idx >= max}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-30 focus-visible:outline-none">
          <ChevronRight className="h-4 w-4" />
        </button>
      </>)}
      {/* Dots */}
      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: max + 1 }).map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all focus-visible:outline-none ${i === idx ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`} />
        ))}
      </div>
    </div>
  )
}

// ── Text review slider ────────────────────────────────────
function ReviewSlider() {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)
  const perView = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 3
  const max = Math.max(0, REVIEWS.length - perView)

  const go = useCallback((dir) => {
    setIdx(i => Math.max(0, Math.min(max, i + dir)))
    clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(i => i >= max ? 0 : i + 1), 4500)
  }, [max])

  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => i >= max ? 0 : i + 1), 4500)
    return () => clearInterval(timer.current)
  }, [max])

  return (
    <div className="relative">
      {/* Aggregate */}
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-1.5">
          <Stars n={5} />
          <span className="text-sm font-bold text-foreground">৫.০</span>
        </div>
        <p className="text-xs text-muted-foreground">{REVIEWS.length * 48}+ যাচাইকৃত ক্রেতার রিভিউ</p>
      </div>

      <div className="relative px-8">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${idx * (100 / perView)}%)` }}
          >
            {REVIEWS.map((r, i) => (
              <div key={i} className="shrink-0 px-2" style={{ width: `${100 / perView}%` }}>
                <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-background p-5">
                  <Stars n={r.rating} />
                  <p className="flex-1 text-sm text-muted-foreground leading-relaxed">"{r.text}"</p>
                  <div className="flex items-center gap-2.5 border-t border-border pt-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.location} · {r.ago}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => go(-1)} disabled={idx === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-30 focus-visible:outline-none"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => go(1)} disabled={idx >= max}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-30 focus-visible:outline-none"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: max + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all focus-visible:outline-none ${i === idx ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function Product() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct]     = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]       = useState(null)
  const [qty, setQty]           = useState(1)
  const [thumb, setThumb]       = useState(0)
  const [added, setAdded]       = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    setLoading(true); setThumb(0); setShowMore(false)
    Promise.all([api.getProduct(id), api.getProducts()])
      .then(([p, all]) => { setProduct(p); setAllProducts(all) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleAdd() {
    addItem(product, qty); setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }
  function handleBuy() { addItem(product, qty); navigate('/checkout') }

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  if (error || !product) return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-muted-foreground">
      {error || 'পণ্য পাওয়া যায়নি।'}
    </div>
  )

  const inStock   = product.stock > 0
  const images    = product.image_url ? [product.image_url, product.image_url, product.image_url, product.image_url] : []

  // Cross-sells: use admin-selected IDs, else fallback to first 2 other products
  const csIds      = product.cross_sell_ids ? product.cross_sell_ids.split(',').map(Number).filter(Boolean) : []
  const crossSells = csIds.length > 0
    ? allProducts.filter(p => csIds.includes(Number(p.id))).slice(0, 2)
    : allProducts.filter(p => Number(p.id) !== Number(product.id)).slice(0, 2)
  const desc      = product.description || ''
  const shortDesc = desc.length > 160 ? desc.slice(0, 160) + '…' : desc
  const videoUrl  = product.video_url || null

  function getEmbedUrl(url) {
    if (!url) return null
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
    const ytShort = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/)
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&rel=0`
    return url // direct video file
  }
  const embedUrl = getEmbedUrl(videoUrl)
  const isYoutube = embedUrl && embedUrl.includes('youtube.com/embed')

  return (
    <div className="pb-24 sm:pb-0">

      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-4">
        <nav className="flex items-center gap-1.5 py-3 text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>
      </div>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO (the conversion engine)
          ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">

          {/* ── Gallery ── */}
          <div className="lg:sticky lg:top-20 lg:self-start flex flex-col gap-2.5">
            {/* Main display: image or video */}
            <div className="overflow-hidden rounded-xl border border-border bg-muted aspect-square">
              {images.length > 0
                ? <img src={images[thumb]} alt={product.name} className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center"><ShoppingBag className="h-20 w-20 text-muted-foreground/20" /></div>
              }
            </div>

            {/* Thumbnail strip — images only */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i} onClick={() => setThumb(i)}
                    className={`overflow-hidden rounded-lg border-2 aspect-square transition-all ${thumb === i ? 'border-primary scale-95' : 'border-border hover:border-primary/50'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col gap-4">

            {/* Rating + stock */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 group">
                <Stars n={5} />
                <span className="text-xs text-muted-foreground underline-offset-2 group-hover:underline">{REVIEWS.length * 48} রিভিউ</span>
              </button>
              {inStock
                ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5"><Check className="h-3 w-3" />স্টকে আছে</span>
                : <span className="text-[11px] font-semibold text-destructive bg-destructive/10 rounded-full px-2.5 py-0.5">স্টক শেষ</span>
              }
            </div>

            {/* Title */}
            <h1 className="text-xl font-black leading-snug text-foreground sm:text-2xl">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-primary">{formatPrice(product.price)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatPrice(Math.round(product.price * 1.25))}</span>
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-white">২৫% সাশ্রয়</span>
            </div>

            {/* Short desc */}
            {desc && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {showMore ? desc : shortDesc}
                {desc.length > 120 && (
                  <button onClick={() => setShowMore(s => !s)} className="ml-1 text-primary font-medium hover:underline focus-visible:outline-none">
                    {showMore ? 'কম দেখুন' : 'আরো দেখুন'}
                  </button>
                )}
              </div>
            )}

            {/* Key benefits */}
            <ul className="space-y-2">
              {['উন্নত মানের প্রিমিয়াম কাপড়, দীর্ঘস্থায়ী রং', 'ক্যাশ অন ডেলিভারি — পণ্য দেখে তারপর পেমেন্ট', '৭ দিনের ঝামেলামুক্ত রিটার্ন গ্যারান্টি'].map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />{b}
                </li>
              ))}
            </ul>

            {/* Qty */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">পরিমাণ</span>
              <div className="flex items-center overflow-hidden rounded-md border border-border">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3.5 py-2 text-base leading-none hover:bg-muted transition-colors focus-visible:outline-none">−</button>
                <span className="min-w-[2.5rem] border-x border-border text-center text-sm font-bold py-2">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="px-3.5 py-2 text-base leading-none hover:bg-muted transition-colors focus-visible:outline-none">+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleBuy} disabled={!inStock}
                className="w-full rounded-md bg-primary py-4 text-[15px] font-black tracking-wide text-white transition-all hover:bg-destructive active:scale-[.98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                এখনই অর্ডার করুন →
              </button>
              <button
                onClick={handleAdd} disabled={!inStock}
                className="w-full rounded-md border-2 border-primary py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white active:scale-[.98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {added ? 'কার্টে যোগ হয়েছে' : 'কার্টে যোগ করুন'}
              </button>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <a
                  href={`https://m.me/?text=${encodeURIComponent(`আমি এই পণ্যটি অর্ডার করতে চাই: ${product.name} — ${formatPrice(product.price)}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md px-3 py-3.5 text-sm font-bold text-white transition-all active:scale-[.98] focus-visible:outline-none"
                  style={{ background: '#0084ff' }}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.951 1.458 5.579 3.75 7.321V22l3.405-1.869C10.024 20.372 11 20.5 12 20.5c5.523 0 10-4.145 10-9.257S17.523 2 12 2zm1.05 12.47l-2.56-2.73-4.99 2.73 5.49-5.83 2.62 2.73 4.93-2.73-5.49 5.83z"/>
                  </svg>
                  মেসেঞ্জারে অর্ডার করুন
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`আমি এই পণ্যটি অর্ডার করতে চাই: ${product.name} — ${formatPrice(product.price)}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md px-3 py-3.5 text-sm font-bold text-white transition-all active:scale-[.98] focus-visible:outline-none"
                  style={{ background: '#1a6b5a' }}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  হোয়াটসঅ্যাপে অর্ডার করুন
                </a>
              </div>
            </div>

            {/* Urgency */}
            {inStock && product.stock <= 20 && (
              <p className="text-center text-xs font-semibold text-destructive animate-pulse">
                মাত্র {product.stock} টি বাকি — দ্রুত অর্ডার করুন!
              </p>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-4 divide-x divide-border rounded-xl border border-border">
              {TRUST.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 text-center">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="text-[9px] font-medium text-muted-foreground leading-tight">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — PRODUCT DESCRIPTION
          (shown only if description exists)
          ═══════════════════════════════════════ */}
      {desc && (
        <section className="border-y border-border py-10">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-4 text-base font-bold text-foreground">পণ্যের বিবরণ</h2>
              <div className="prose-sm text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {desc}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SECTION 2b — PRODUCT VIDEO
          ═══════════════════════════════════════ */}
      {embedUrl && (
        <section className="bg-foreground py-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-6 flex flex-col items-center gap-1 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">পণ্যের ভিডিও</p>
              <h2 className="text-lg font-black text-white">নিজেই দেখুন, তারপর সিদ্ধান্ত নিন</h2>
            </div>
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: '16/9' }}>
              {isYoutube ? (
                <iframe
                  src={embedUrl.replace('autoplay=1', 'autoplay=0')}
                  title="Product video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={embedUrl} controls className="h-full w-full object-cover" />
              )}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleBuy} disabled={!inStock}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-10 py-4 text-sm font-black text-white hover:bg-destructive transition-colors disabled:opacity-40 focus-visible:outline-none"
              >
                এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SECTION 3 — REVIEWS
          ═══════════════════════════════════════ */}
      {(() => {
        let reviewImgs = []
        try { reviewImgs = JSON.parse(product.review_images || '[]') } catch {}
        const isImageType = product.review_type === 'image' && reviewImgs.length > 0
        return (
          <section className="py-14">
            <div className="mx-auto max-w-5xl px-4">
              <div className="mb-8 text-center">
                <h2 className="text-lg font-bold text-foreground">ক্রেতারা বলছেন</h2>
                {!isImageType && (
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <Stars n={5} />
                    <span className="text-xs text-muted-foreground">{REVIEWS.length * 48}+ যাচাইকৃত রিভিউ</span>
                  </div>
                )}
              </div>
              {isImageType
                ? <ImageReviewSlider images={reviewImgs} />
                : <ReviewSlider />
              }
            </div>
          </section>
        )
      })()}

      {/* ═══════════════════════════════════════
          SECTION 4 — WHY US (short, punchy)
          ═══════════════════════════════════════ */}
      <section className="bg-primary/5 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 items-center">
            {/* Left: checklist */}
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-primary">কেন আমরা?</p>
              <h2 className="mb-5 text-xl font-black leading-tight text-foreground">
                হাজারো ক্রেতার বিশ্বাসের কারণ
              </h2>
              <ul className="space-y-3">
                {WHY_US.map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {/* Right: stat + CTA */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-background p-8 text-center">
              <div className="text-5xl font-black text-primary">১০০০+</div>
              <p className="font-semibold text-foreground">সন্তুষ্ট ক্রেতা</p>
              <div className="flex justify-center"><Stars n={5} /></div>
              <p className="text-sm text-muted-foreground max-w-[220px]">আমাদের ক্রেতারাই আমাদের সেরা পরিচয়। তাদের বিশ্বাসই আমাদের শক্তি।</p>
              <button
                onClick={handleBuy} disabled={!inStock}
                className="w-full rounded-md bg-primary py-3 text-sm font-bold text-white hover:bg-destructive transition-colors disabled:opacity-40 focus-visible:outline-none"
              >
                এখনই কিনুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — CROSS-SELLS (exclusive offer)
          ═══════════════════════════════════════ */}
      {crossSells.length > 0 && (
        <section className="py-12">
          <style>{`
            @keyframes dash-march {
              to { stroke-dashoffset: -20; }
            }
            @keyframes cs-pulse {
              0%,100% { border-color: rgba(239,68,68,0.4); }
              50%      { border-color: rgba(239,68,68,0.9); }
            }
            .cs-card { animation: cs-pulse 2.2s ease-in-out infinite; }
          `}</style>
          <div className="mx-auto max-w-3xl px-4 flex flex-col gap-4">
            {crossSells.map((p, i) => {
              const discounted = Math.round(p.price * 0.85)
              return (
                <div
                  key={p.id}
                  className="cs-card relative rounded-xl border-2 border-dashed border-primary/50 bg-background"
                  style={{ animationDelay: `${i * 1.1}s` }}
                >
                  {/* Label */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-primary bg-background px-3 py-0.5 text-[11px] font-bold tracking-wide text-primary whitespace-nowrap">
                      বিশেষ অফার
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 pt-5">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center"><ShoppingBag className="h-6 w-6 text-muted-foreground/20" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground line-clamp-1">{p.name}</p>
                      {p.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-primary">{formatPrice(discounted)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                        <span className="text-[10px] font-bold text-primary">১৫% ছাড়</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => { addItem(product, qty); addItem(p, 1) }}
                      className="flex w-full items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-destructive active:scale-[.98] focus-visible:outline-none"
                    >
                      <span>হ্যাঁ! "{p.name}" ও নিতে চাই</span>
                      <span className="flex items-center gap-1.5 opacity-90">
                        <span>{formatPrice(discounted)}</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          SECTION 6 — FAQ (handle last objections)
          ═══════════════════════════════════════ */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-6 text-center text-lg font-bold text-foreground">সাধারণ জিজ্ঞাসা</h2>
          <div className="rounded-xl border border-border bg-background px-5 divide-y divide-border">
            {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
          </div>
          {/* Final CTA after objections are handled */}
          <div className="mt-8 text-center">
            <button
              onClick={handleBuy} disabled={!inStock}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-10 py-4 text-sm font-black text-white hover:bg-destructive transition-colors disabled:opacity-40 focus-visible:outline-none"
            >
              এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">ক্যাশ অন ডেলিভারি • ৭ দিনের রিটার্ন • ফ্রি শিপিং</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STICKY MOBILE CTA
          ═══════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex gap-2.5 sm:hidden">
        <button
          onClick={handleAdd} disabled={!inStock}
          className="flex-1 rounded-md border-2 border-primary py-3 text-sm font-bold text-primary transition-colors disabled:opacity-40 focus-visible:outline-none"
        >
          {added ? 'যোগ হয়েছে' : 'কার্টে যোগ'}
        </button>
        <button
          onClick={handleBuy} disabled={!inStock}
          className="flex-1 rounded-md bg-primary py-3 text-sm font-black text-white transition-colors disabled:opacity-40 focus-visible:outline-none"
        >
          অর্ডার করুন
        </button>
      </div>

    </div>
  )
}
