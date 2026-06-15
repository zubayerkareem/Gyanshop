import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react'

export default function Product() {
  const { id }             = useParams()
  const navigate           = useNavigate()
  const { addItem }        = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    api.getProduct(id)
      .then(setProduct)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleOrder() {
    addItem(product, 1)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive">
          <AlertDescription>{error || 'পণ্য পাওয়া যায়নি।'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const inStock = product.stock > 0

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        ফিরে যান
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl border bg-muted aspect-square">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
            <Badge variant={inStock ? 'default' : 'destructive'} className="shrink-0">
              {inStock ? `স্টকে আছে (${product.stock})` : 'স্টক নেই'}
            </Badge>
          </div>

          <p className="mt-3 text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

          <Separator className="my-5" />

          {product.description && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-8">
            <Button
              size="lg"
              className="w-full gap-2 text-base"
              disabled={!inStock}
              onClick={handleOrder}
            >
              <ShoppingBag className="h-5 w-5" />
              এখনই অর্ডার করুন
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
