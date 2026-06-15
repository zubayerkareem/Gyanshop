import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product }) {
  const inStock = product.stock > 0

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {!inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-white">
            স্টক নেই
          </span>
        )}
        {inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            ইন স্টক
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-destructive">
            দেখুন
          </span>
        </div>
      </div>
    </Link>
  )
}
