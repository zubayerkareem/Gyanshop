import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, Package, Search, Menu, X, ImageIcon, TrendingUp } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/',     label: 'হোম' },
  { to: '/shop', label: 'শপ' },
  { to: '/blog', label: 'ব্লগ' },
]

const MAX_RESULTS = 8

function SearchBar({ isMobile = false }) {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [results, setResults]         = useState([])
  const [showDrop, setShowDrop]       = useState(false)
  const [dropLoading, setDropLoading] = useState(false)
  const [total, setTotal]             = useState(0)
  const productsCache = useRef(null)
  const wrapRef       = useRef(null)
  const inputRef      = useRef(null)
  const timerRef      = useRef(null)

  // Sync input value when URL ?q changes (e.g. on navigation)
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Fetch product list once and cache
  const ensureProducts = useCallback(async () => {
    if (productsCache.current) return productsCache.current
    const prods = await api.getProducts()
    productsCache.current = prods
    return prods
  }, [])

  // Live search with debounce
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!query.trim()) { setResults([]); setShowDrop(false); return }

    timerRef.current = setTimeout(async () => {
      setDropLoading(true)
      try {
        const prods = await ensureProducts()
        const q = query.trim().toLowerCase()
        const filtered = prods.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        )
        setTotal(filtered.length)
        setResults(filtered.slice(0, MAX_RESULTS))
        setShowDrop(true)
      } catch {}
      finally { setDropLoading(false) }
    }, 220)

    return () => clearTimeout(timerRef.current)
  }, [query, ensureProducts])

  // Click outside → close
  useEffect(() => {
    function onMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setShowDrop(false)
    navigate(`/?q=${encodeURIComponent(query.trim())}`)
  }

  function handleResultClick(id) {
    setShowDrop(false)
    setQuery('')
    navigate(`/product/${id}`)
  }

  function clearQuery() {
    setQuery(''); setResults([]); setShowDrop(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center overflow-hidden rounded-[6px] border-2 border-primary">
        <div className="flex flex-1 items-center min-w-0">
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (results.length) setShowDrop(true) }}
            onKeyDown={e => e.key === 'Escape' && setShowDrop(false)}
            placeholder="পণ্যের নাম দিয়ে অনুসন্ধান করুন"
            aria-label="পণ্য অনুসন্ধান"
            className="flex-1 min-w-0 bg-background px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button type="button" onClick={clearQuery} className="mr-1 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="অনুসন্ধান করুন"
          className="flex shrink-0 items-center bg-primary px-3 py-2.5 text-white transition-colors hover:bg-red-600 focus-visible:outline-none"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Dropdown */}
      {showDrop && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5" />
              পণ্যসমূহ
            </span>
            <span className="text-xs text-muted-foreground">
              {dropLoading ? '...' : `${total}টি পাওয়া গেছে`}
            </span>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {dropLoading && results.length === 0 && (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                খোঁজা হচ্ছে...
              </div>
            )}

            {!dropLoading && results.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                "{query}" এর জন্য কোনো পণ্য পাওয়া যায়নি
              </div>
            )}

            {results.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleResultClick(p.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-0"
              >
                {/* Thumbnail */}
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                  }
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs font-semibold text-primary mt-0.5">{formatPrice(p.price)}</p>
                </div>
              </button>
            ))}

            {/* View all */}
            {total > MAX_RESULTS && (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                সব {total}টি ফলাফল দেখুন →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { items } = useCart()
  const count    = items.reduce((s, i) => s + i.quantity, 0)
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background shadow-sm">

        {/* Top info bar — desktop only */}
        <div className="hidden sm:block border-b border-border">
          <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-5">
              <a href="tel:+8801713429060" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Phone className="h-3 w-3" />+8801713429060
              </a>
              <a href="mailto:care@amarshop.com.bd" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Mail className="h-3 w-3" />care@amarshop.com.bd
              </a>
            </div>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Package className="h-3 w-3" />অর্ডার ট্র্যাক করুন
            </a>
          </div>
        </div>

        {/* Main header */}
        <div className="border-b border-border bg-background">
          <div className="mx-auto max-w-6xl px-4">

            {/* Mobile: [☰] [logo] [cart] */}
            <div className="flex h-14 items-center sm:hidden">
              <button onClick={() => setDrawerOpen(true)} aria-label="মেনু"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>

              <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-foreground hover:text-primary transition-colors">
                আমার শপ
              </Link>

              <Link to="/checkout" aria-label={`কার্ট, ${count}টি পণ্য`}
                className="relative ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile search row */}
            <div className="pb-2.5 sm:hidden">
              <SearchBar isMobile />
            </div>

            {/* Desktop: [logo] [search] [cart] */}
            <div className="hidden sm:flex h-16 items-center gap-4">
              <Link to="/" className="shrink-0 text-xl font-bold text-foreground hover:text-primary transition-colors">
                আমার শপ
              </Link>
              <div className="flex flex-1">
                <SearchBar />
              </div>
              <Link to="/checkout" aria-label={`কার্ট, ${count}টি পণ্য`}
                className="relative flex shrink-0 items-center gap-1.5 rounded-[6px] border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                <span>কার্ট</span>
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-base font-bold">মেনু</span>
              <button onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                return (
                  <Link key={to} to={to}
                    className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border px-4 py-4 space-y-2 text-xs text-muted-foreground">
              <a href="tel:+8801713429060" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-3.5 w-3.5" />+8801713429060
              </a>
              <a href="mailto:care@amarshop.com.bd" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />care@amarshop.com.bd
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
