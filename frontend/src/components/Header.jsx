import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, Package, Search, Menu, X } from 'lucide-react'
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
  const [query, setQuery]       = useState(() => searchParams.get('q') || '')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

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

            {/* ── Mobile row: [menu] [logo centered] [cart] ── */}
            <div className="flex h-14 items-center sm:hidden">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="মেনু খুলুন"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                to="/"
                className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                আমার শপ
              </Link>

              <Link
                to="/checkout"
                aria-label={`কার্ট, ${count}টি পণ্য`}
                className="relative ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
              >
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
              {searchBar('w-full')}
            </div>

            {/* ── Desktop row: [logo] [search] [cart] ── */}
            <div className="hidden sm:flex h-16 items-center gap-4">
              <Link
                to="/"
                className="shrink-0 text-xl font-bold text-foreground hover:text-primary transition-colors"
              >
                আমার শপ
              </Link>

              <div className="flex flex-1">
                {searchBar('w-full')}
              </div>

              <Link
                to="/checkout"
                aria-label={`কার্ট, ${count}টি পণ্য`}
                className="relative flex shrink-0 items-center gap-1.5 rounded-[6px] border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
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

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
            {/* Drawer header */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-base font-bold text-foreground">মেনু</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ to, label }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Drawer footer */}
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
