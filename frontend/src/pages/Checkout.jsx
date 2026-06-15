import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trash2 } from 'lucide-react'

// Fires the browser-side Meta Pixel Purchase event for server deduplication.
function fireMetaPixelPurchase({ pixelId, eventId, value, contents }) {
  if (!pixelId || typeof window.fbq !== 'function') return

  window.fbq('init', pixelId)
  window.fbq('track', 'Purchase', {
    currency: 'BDT',
    value,
    contents,
    content_type: 'product',
  }, { eventID: eventId })
}

// Inject the Meta Pixel base script once.
function loadMetaPixel(pixelId) {
  if (!pixelId || document.getElementById('fb-pixel-script')) return

  const n = window.fbq = function (...args) { n.callMethod ? n.callMethod(...args) : n.queue.push(args) }
  if (!window._fbq) window._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []

  const s = document.createElement('script')
  s.id = 'fb-pixel-script'
  s.async = true
  s.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(s)

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

export default function Checkout() {
  const { items, removeItem, clearCart, total } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customer_name:  '',
    customer_phone: '',
    customer_email: '',
    address:        '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [pixelId, setPixelId]   = useState('')

  // Fetch pixel ID and initialise the script
  useEffect(() => {
    api.getPixelId()
      .then(({ pixel_id }) => {
        if (pixel_id) {
          setPixelId(pixel_id)
          loadMetaPixel(pixel_id)
        }
      })
      .catch(() => {}) // non-fatal
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return

    setError(null)
    setLoading(true)

    try {
      const body = {
        ...form,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity:   i.quantity,
        })),
      }

      const { order_id, event_id, total: serverTotal } = await api.createOrder(body)

      // Browser-side Pixel event (deduped with server CAPI via event_id)
      fireMetaPixelPurchase({
        pixelId,
        eventId:  event_id,
        value:    serverTotal,
        contents: items.map(i => ({ id: String(i.product_id), quantity: i.quantity })),
      })

      clearCart()
      navigate('/order-success', { state: { order_id, total: serverTotal } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">আপনার কার্ট খালি।</p>
        <Button className="mt-6" onClick={() => navigate('/')}>পণ্য দেখুন</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">চেকআউট</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order summary */}
        <Card>
          <CardHeader>
            <CardTitle>অর্ডার সারসংক্ষেপ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map(item => (
              <div key={item.product_id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.product_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>মোট</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer form */}
        <Card>
          <CardHeader>
            <CardTitle>ডেলিভারি তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer_name">আপনার নাম *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  placeholder="পূর্ণ নাম লিখুন"
                  required
                  value={form.customer_name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_phone">মোবাইল নম্বর *</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  required
                  value={form.customer_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer_email">ইমেইল (ঐচ্ছিক)</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.customer_email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">ডেলিভারি ঠিকানা *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="বাড়ি/ফ্ল্যাট নং, রাস্তা, এলাকা, জেলা"
                  required
                  rows={4}
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                অর্ডার নিশ্চিত করুন
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
