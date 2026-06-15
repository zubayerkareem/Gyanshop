import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  LogOut, Trash2, Plus, Loader2, ChevronDown, ChevronUp, Package,
  ShoppingBag, Settings, Pencil, Upload, ImageIcon,
} from 'lucide-react'

// ── Orders Tab ────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [expanded, setExpanded] = useState({})
  const [deleting, setDeleting] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    api.getOrders()
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(confirmId)
    setConfirmId(null)
    try {
      await api.deleteOrder(confirmId)
      setOrders(prev => prev.filter(o => o.id !== confirmId))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  const statusColor = {
    pending:   'secondary',
    confirmed: 'default',
    delivered: 'outline',
    cancelled: 'destructive',
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
  if (error)   return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">মোট {orders.length}টি অর্ডার</p>
        <Button variant="outline" size="sm" onClick={fetchOrders}>রিফ্রেশ</Button>
      </div>

      {orders.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">কোনো অর্ডার নেই।</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>গ্রাহক</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>মোট</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <React.Fragment key={order.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <TableCell className="font-medium text-muted-foreground">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor[order.status] || 'outline'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {expanded[order.id]
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        }
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === order.id}
                          onClick={e => { e.stopPropagation(); setConfirmId(order.id) }}
                        >
                          {deleting === order.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expanded[order.id] && (
                    <TableRow key={`${order.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={7} className="py-3 px-6">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">অর্ডার আইটেম</p>
                        <div className="space-y-1.5">
                          {(order.items || []).map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        {order.address && (
                          <p className="mt-2 text-xs text-muted-foreground">📍 {order.address}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>অর্ডার মুছবেন?</DialogTitle>
            <DialogDescription>
              অর্ডার #{confirmId} চিরতরে মুছে ফেলা হবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">বাতিল</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>হ্যাঁ, মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Image upload field ────────────────────────────────────
function ImageField({ value, onChange, uploading }) {
  const ref = React.useRef(null)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2"
          disabled={uploading} onClick={() => ref.current?.click()}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          ছবি আপলোড করুন
        </Button>
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files[0] && onChange(e.target.files[0])} />
      </div>
      {value ? (
        <img src={value} alt="preview" className="h-24 w-24 rounded-md object-cover border" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-md border bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}
    </div>
  )
}

// ── Products Tab ──────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [deleting, setDeleting]       = useState(null)
  const [confirmId, setConfirmId]     = useState(null)
  const [adding, setAdding]           = useState(false)
  const [addError, setAddError]       = useState(null)
  const [uploadingAdd, setUploadingAdd] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [editError, setEditError]     = useState(null)
  const [uploadingEdit, setUploadingEdit] = useState(false)

  const emptyForm = { name: '', description: '', price: '', image_url: '', stock: '' }
  const [form, setForm]         = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    api.getProducts()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  function handleEditFormChange(e) {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleImageUpload(file, isEdit) {
    isEdit ? setUploadingEdit(true) : setUploadingAdd(true)
    try {
      const { url } = await api.uploadImage(file)
      isEdit
        ? setEditForm(prev => ({ ...prev, image_url: url }))
        : setForm(prev => ({ ...prev, image_url: url }))
    } catch (err) {
      isEdit ? setEditError(err.message) : setAddError(err.message)
    } finally {
      isEdit ? setUploadingEdit(false) : setUploadingAdd(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setAddError(null)
    setAdding(true)
    try {
      await api.addProduct({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock || '0', 10) })
      setForm(emptyForm)
      fetchProducts()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  function openEdit(product) {
    setEditError(null)
    setEditForm({
      name:        product.name,
      description: product.description || '',
      price:       product.price,
      image_url:   product.image_url || '',
      stock:       product.stock,
    })
    setEditingProduct(product)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setEditError(null)
    setSaving(true)
    try {
      await api.updateProduct(editingProduct.id, {
        ...editForm,
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock || '0', 10),
      })
      setEditingProduct(null)
      fetchProducts()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(confirmId)
    setConfirmId(null)
    try {
      await api.deleteProduct(confirmId)
      setProducts(prev => prev.filter(p => p.id !== confirmId))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>

  return (
    <>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Add product form */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">নতুন পণ্য যোগ করুন</CardTitle></CardHeader>
        <CardContent>
          {addError && <Alert variant="destructive" className="mb-4"><AlertDescription>{addError}</AlertDescription></Alert>}
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>পণ্যের নাম *</Label>
              <Input name="name" required value={form.name} onChange={handleFormChange} placeholder="পণ্যের নাম" />
            </div>
            <div className="space-y-1.5">
              <Label>মূল্য (টাকা) *</Label>
              <Input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={handleFormChange} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>স্টক পরিমাণ</Label>
              <Input name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>পণ্যের ছবি</Label>
              <ImageField value={form.image_url} uploading={uploadingAdd}
                onChange={file => handleImageUpload(file, false)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>বিবরণ</Label>
              <Textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="পণ্যের বিস্তারিত বিবরণ..." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={adding || uploadingAdd} className="gap-2">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                পণ্য যোগ করুন
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Product list */}
      {products.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">কোনো পণ্য নেই।</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ছবি</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>মূল্য</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover border" />
                      : <div className="flex h-10 w-10 items-center justify-center rounded bg-muted"><ImageIcon className="h-5 w-5 text-muted-foreground/40" /></div>
                    }
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    <Badge variant={p.stock > 0 ? 'default' : 'destructive'}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                        disabled={deleting === p.id} onClick={() => setConfirmId(p.id)}>
                        {deleting === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>পণ্য সম্পাদনা করুন</DialogTitle>
          </DialogHeader>
          {editError && <Alert variant="destructive"><AlertDescription>{editError}</AlertDescription></Alert>}
          <form onSubmit={handleSaveEdit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>পণ্যের নাম *</Label>
              <Input name="name" required value={editForm.name} onChange={handleEditFormChange} />
            </div>
            <div className="space-y-1.5">
              <Label>মূল্য (টাকা) *</Label>
              <Input name="price" type="number" min="0" step="0.01" required value={editForm.price} onChange={handleEditFormChange} />
            </div>
            <div className="space-y-1.5">
              <Label>স্টক পরিমাণ</Label>
              <Input name="stock" type="number" min="0" value={editForm.stock} onChange={handleEditFormChange} />
            </div>
            <div className="space-y-1.5">
              <Label>পণ্যের ছবি</Label>
              <ImageField value={editForm.image_url} uploading={uploadingEdit}
                onChange={file => handleImageUpload(file, true)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>বিবরণ</Label>
              <Textarea name="description" value={editForm.description} onChange={handleEditFormChange} rows={3} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <DialogClose asChild><Button type="button" variant="outline">বাতিল</Button></DialogClose>
              <Button type="submit" disabled={saving || uploadingEdit} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                সংরক্ষণ করুন
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>পণ্য মুছবেন?</DialogTitle>
            <DialogDescription>পণ্য #{confirmId} চিরতরে মুছে ফেলা হবে।</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">বাতিল</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>হ্যাঁ, মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Settings Tab ──────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState({
    meta_pixel_id:        '',
    meta_access_token:    '',
    meta_test_event_code: '',
    meta_capi_enabled:    '0',
  })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    api.getSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.saveSettings(settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Meta Conversions API সেটিংস</CardTitle></CardHeader>
      <CardContent>
        {error   && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-4 border-green-200 bg-green-50 text-green-800"><AlertDescription>সেটিংস সফলভাবে সংরক্ষিত হয়েছে।</AlertDescription></Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">CAPI সক্রিয়</p>
              <p className="text-xs text-muted-foreground">সার্ভার-সাইড ইভেন্ট পাঠানো চালু/বন্ধ করুন</p>
            </div>
            <Switch
              checked={settings.meta_capi_enabled === '1'}
              onCheckedChange={checked =>
                setSettings(prev => ({ ...prev, meta_capi_enabled: checked ? '1' : '0' }))
              }
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
            <Input
              id="meta_pixel_id"
              name="meta_pixel_id"
              value={settings.meta_pixel_id}
              onChange={handleChange}
              placeholder="123456789012345"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meta_access_token">Access Token</Label>
            <Input
              id="meta_access_token"
              name="meta_access_token"
              type="password"
              value={settings.meta_access_token}
              onChange={handleChange}
              placeholder="EAAxxxx..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meta_test_event_code">Test Event Code (ঐচ্ছিক)</Label>
            <Input
              id="meta_test_event_code"
              name="meta_test_event_code"
              value={settings.meta_test_event_code}
              onChange={handleChange}
              placeholder="TEST12345"
            />
            <p className="text-xs text-muted-foreground">
              শুধু পরীক্ষার সময় ব্যবহার করুন। লাইভে খালি রাখুন।
            </p>
          </div>

          <Button type="submit" disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            সেটিংস সংরক্ষণ করুন
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Dashboard Shell ───────────────────────────────────────
export default function Dashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          লগআউট
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6 h-auto flex-wrap gap-1">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" /> অর্ডারসমূহ
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <ShoppingBag className="h-4 w-4" /> পণ্যসমূহ
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> সেটিংস
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
