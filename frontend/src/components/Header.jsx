import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, Package, Search } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const NAV_LINKS = [
  { to: '/',     label: 'হোম' },
  { to: '/blog', label: 'ব্লগ' },
]

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const navigate       = useNavigate()
  const location       = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/?q=${encodeURIComponent(query.trim())}`)
  }

  const searchBar = (cls = '') => (
    <form onSubmit={handleSearch} className={`flex items-center overflow-hidden rounded-[6px] border-2 border-primary ${cls}`}>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="পণ্যের নাম দিয়ে অনুসন্ধান করুন"
        aria-label="পণ্য অনুসন্ধান"
        className="flex-1 min-w-0 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="submit"
        aria-label="অনুসন্ধান করুন"
        className="flex shrink-0 items-center bg-primary px-3 py-2.5 text-white transition-colors hover:bg-destructive focus-visible:outline-none"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )

  return (
    <header className="sticky top-0 z-40 w-full bg-background shadow-sm">

      {/* Top bar — desktop only */}
      <div className="hidden sm:block border-b border-border bg-background">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <a href="tel:+8801713429060" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone className="h-3 w-3" />
              +8801713429060
            </a>
            <a href="mailto:care@amarshop.com.bd" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail className="h-3 w-3" />
              care@amarshop.com.bd
            </a>
          </div>
          <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Package className="h-3 w-3" />
            অর্ডার ট্র্যাক করুন
          </a>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4">

          {/* Single row on desktop: logo + search + cart */}
          <div className="flex h-14 items-center gap-3 sm:h-16 sm:gap-4">

            {/* Logo */}
            <Link
              to="/"
              className="shrink-0 text-lg font-bold text-foreground hover:text-primary transition-colors focus-visible:outline-none sm:text-xl"
            >
              আমার শপ
            </Link>

            {/* Search — visible on sm+ inline */}
            <div className="hidden sm:flex flex-1">
              {searchBar('w-full')}
            </div>

            {/* Cart */}
            <Link
              to="/checkout"
              aria-label={`কার্ট, ${count}টি পণ্য`}
              className="relative ml-auto flex shrink-0 items-center gap-1.5 rounded-[6px] border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">কার্ট</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>

          {/* Search bar — mobile only, below logo row */}
          <div className="pb-2.5 sm:hidden">
            {searchBar('w-full')}
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-8 max-w-6xl items-center gap-1 px-4">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
