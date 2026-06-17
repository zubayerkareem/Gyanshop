import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import { formatPrice } from '@/lib/utils'
import {
  Loader2, SlidersHorizontal, ChevronLeft, ChevronRight,
  X, Search, Check, LayoutGrid, List,
} from 'lucide-react'

const PAGE_SIZE = 16

const SORT_OPTIONS = [
  { value: 'newest',     label: 'নতুন আগে' },
  { value: 'price_asc',  label: 'দাম: কম থেকে বেশি' },
  { value: 'price_desc', label: 'দাম: বেশি থেকে কম' },
  { value: 'name_asc',   label: 'নাম: অ-ঝ' },
  { value: 'name_desc',  label: 'নাম: ঝ-অ' },
]

function applyFilters(products, { q, categoryId, inStock, minPrice, maxPrice, sort }) {
  let list = [...products]

  if (q) {
    const lq = q.toLowerCase()
    list = list.filter(p =>
      p.name?.toLowerCase().includes(lq) ||
      p.description?.toLowerCase().includes(lq)
    )
  }
  if (categoryId) list = list.filter(p => String(p.category_id) === String(categoryId))
  if (inStock)    list = list.filter(p => p.stock > 0)
  if (minPrice !== '') list = list.filter(p => parseFloat(p.price) >= parseFloat(minPrice))
  if (maxPrice !== '') list = list.filter(p => parseFloat(p.price) <= parseFloat(maxPrice))

  switch (sort) {
    case 'price_asc':  list.sort((a, b) => a.price - b.price); break
    case 'price_desc': list.sort((a, b) => b.price - a.price); break
    case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name, 'bn')); break
    case 'name_desc':  list.sort((a, b) => b.name.localeCompare(a.name, 'bn')); break
    default:           list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return list
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [gridView, setGridView]   = useState(true)

  // URL-driven filter state
  const q          = searchParams.get('q')     || ''
  const categoryId = searchParams.get('cat')   || ''
  const inStock    = searchParams.get('stock') === '1'
  const minPrice   = searchParams.get('min')   || ''
  const maxPrice   = searchParams.get('max')   || ''
  const sort       = searchParams.get('sort')  || 'newest'
  const page       = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  // Local price inputs (not committed to URL until applied)
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function setParam(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.delete('page')
      return next
    })
  }

  function setPageNum(p) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function applyPriceRange() {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      localMin ? next.set('min', localMin) : next.delete('min')
      localMax ? next.set('max', localMax) : next.delete('max')
      next.delete('page')
      return next
    })
  }

  function clearAllFilters() {
    setLocalMin(''); setLocalMax('')
    setSearchParams({})
  }

  const filtered = useMemo(
    () => applyFilters(products, { q, categoryId, inStock, minPrice, maxPrice, sort }),
    [products, q, categoryId, inStock, minPrice, maxPrice, sort]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const activeFilterCount = [
    categoryId, inStock ? '1' : '', minPrice, maxPrice, q
  ].filter(Boolean).length

  const priceRange = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 }
    const prices = products.map(p => parseFloat(p.price))
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
  }, [products])

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-destructive">{error}</div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">

      {/* Page header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">সকল পণ্য</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length}টি পণ্য পাওয়া গেছে
          </p>
        </div>

        {/* Sort + view controls */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring hidden sm:block"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => { setFilterOpen(o => !o); setLocalMin(minPrice); setLocalMax(maxPrice) }}
            className={`relative flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${filterOpen ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:border-primary hover:text-primary'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            ফিল্টার
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-border p-0.5">
            <button onClick={() => setGridView(true)} className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${gridView ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setGridView(false)} className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${!gridView ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={e => setParam('q', e.target.value)}
          placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setParam('cat', '')}
            className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${!categoryId ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
          >
            সব পণ্য
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setParam('cat', String(cat.id))}
              className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors ${categoryId === String(cat.id) ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
            >
              {cat.image_url && <img src={cat.image_url} alt="" className="h-4 w-4 rounded-full object-cover" />}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter panel */}
      {filterOpen && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-6">

            {/* Sort — mobile only */}
            <div className="space-y-2 sm:hidden">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">সর্টিং</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setParam('sort', o.value)}
                    className={`flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors ${sort === o.value ? 'border-primary bg-primary text-white' : 'border-border text-foreground hover:border-primary hover:text-primary'}`}
                  >
                    {sort === o.value && <Check className="h-3 w-3" />}
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">মূল্য সীমা</p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
                  <input
                    type="number" min="0" placeholder={priceRange.min}
                    value={localMin} onChange={e => setLocalMin(e.target.value)}
                    className="h-9 w-28 rounded-lg border border-border bg-background pl-6 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
                  <input
                    type="number" min="0" placeholder={priceRange.max}
                    value={localMax} onChange={e => setLocalMax(e.target.value)}
                    className="h-9 w-28 rounded-lg border border-border bg-background pl-6 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={applyPriceRange}
                  className="h-9 rounded-lg border border-primary bg-primary px-3 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  প্রয়োগ
                </button>
              </div>
              {priceRange.max > 0 && (
                <p className="text-[11px] text-muted-foreground">পণ্যের দাম: {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}</p>
              )}
            </div>

            {/* Stock filter */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">প্রাপ্যতা</p>
              <label className="flex cursor-pointer items-center gap-2.5">
                <div
                  onClick={() => setParam('stock', inStock ? '' : '1')}
                  className={`relative h-5 w-9 rounded-full transition-colors ${inStock ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-foreground">শুধু স্টকে আছে</span>
              </label>
            </div>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />সব ফিল্টার মুছুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {activeFilterCount > 0 && !filterOpen && (
        <div className="mb-4 flex flex-wrap gap-2">
          {q && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
              "{q}"
              <button onClick={() => setParam('q', '')} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {categoryId && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
              {categories.find(c => String(c.id) === categoryId)?.name || 'ক্যাটাগরি'}
              <button onClick={() => setParam('cat', '')} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {inStock && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
              স্টকে আছে
              <button onClick={() => setParam('stock', '')} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
              {minPrice && maxPrice ? `${formatPrice(minPrice)} — ${formatPrice(maxPrice)}` : minPrice ? `সর্বনিম্ন ${formatPrice(minPrice)}` : `সর্বোচ্চ ${formatPrice(maxPrice)}`}
              <button onClick={() => { setLocalMin(''); setLocalMax(''); setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('min'); n.delete('max'); return n }) }} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground mb-3">কোনো পণ্য পাওয়া যায়নি।</p>
          <button onClick={clearAllFilters} className="text-xs font-semibold text-primary hover:underline">
            সব ফিল্টার মুছুন
          </button>
        </div>
      )}

      {/* Product grid */}
      {paginated.length > 0 && (
        gridView ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map(p => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group flex items-center gap-4 rounded-[6px] border border-border bg-card p-3 transition-colors hover:border-primary"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="flex h-full items-center justify-center text-muted-foreground/30 text-2xl">📦</div>
                  }
                </div>
                <div className="flex flex-1 min-w-0 flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{p.name}</p>
                  {p.category_name && <p className="text-xs text-muted-foreground">{p.category_name}</p>}
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-primary">{formatPrice(p.price)}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.stock > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    {p.stock > 0 ? 'স্টকে আছে' : 'স্টক নেই'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPageNum(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {(() => {
            const pages = []
            const delta = 2
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i)
              } else if (pages[pages.length - 1] !== '…') {
                pages.push('…')
              }
            }
            return pages.map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPageNum(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === currentPage ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:border-primary hover:text-primary'}`}
                >
                  {p}
                </button>
              )
            )
          })()}

          <button
            onClick={() => setPageNum(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {filtered.length}টি পণ্য · পেজ {currentPage}/{totalPages}
        </p>
      )}
    </div>
  )
}
