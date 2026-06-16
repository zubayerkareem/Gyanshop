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
  ShoppingBag, Settings, Pencil, Upload, ImageIcon, LayoutTemplate,
  LayoutDashboard, ShoppingCart, TrendingUp, Users, DollarSign,
  Menu, X, ChevronRight, ArrowUpRight, Clock, LayoutGrid, FileText,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// ── Mock chart data ───────────────────────────────────────
const REVENUE_DATA = [
  { month: 'জানু', revenue: 42000, orders: 28 },
  { month: 'ফেব্রু', revenue: 55000, orders: 36 },
  { month: 'মার্চ', revenue: 49000, orders: 31 },
  { month: 'এপ্রিল', revenue: 63000, orders: 45 },
  { month: 'মে', revenue: 58000, orders: 40 },
  { month: 'জুন', revenue: 74000, orders: 54 },
  { month: 'জুলাই', revenue: 81000, orders: 60 },
]

// ── Orders Tab ────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [expanded, setExpanded]     = useState({})
  const [deleting, setDeleting]     = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [selected, setSelected]     = useState(new Set())
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const fetchOrders = useCallback(() => {
    setLoading(true); setSelected(new Set())
    api.getOrders()
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  function toggleExpand(id) { setExpanded(prev => ({ ...prev, [id]: !prev[id] })) }

  function toggleSelect(id, e) {
    e.stopPropagation()
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function toggleSelectAll() {
    setSelected(prev => prev.size === orders.length ? new Set() : new Set(orders.map(o => o.id)))
  }

  async function handleDelete() {
    if (!confirmId) return
    setDeleting(confirmId); setConfirmId(null)
    try {
      await api.deleteOrder(confirmId)
      setOrders(prev => prev.filter(o => o.id !== confirmId))
      setSelected(prev => { const next = new Set(prev); next.delete(confirmId); return next })
    } catch (e) { setError(e.message) }
    finally { setDeleting(null) }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true); setBulkConfirm(false)
    const ids = [...selected]
    try {
      await Promise.all(ids.map(id => api.deleteOrder(id)))
      setOrders(prev => prev.filter(o => !ids.includes(o.id)))
      setSelected(new Set())
    } catch (e) { setError(e.message) }
    finally { setBulkDeleting(false) }
  }

  // Status config — value (API key), label (Bangla), colors
  const STATUS_MAP = {
    pending:   { label: 'পেন্ডিং',          cls: 'bg-yellow-100 text-yellow-800 border-yellow-300'    },
    confirmed: { label: 'কনফার্মড',          cls: 'bg-blue-100 text-blue-800 border-blue-300'          },
    packing:   { label: 'প্যাকিং',           cls: 'bg-violet-100 text-violet-800 border-violet-300'    },
    warehouse: { label: 'গুদামে আছে',        cls: 'bg-indigo-100 text-indigo-800 border-indigo-300'    },
    courier:   { label: 'কুরিয়ারে পাঠানো', cls: 'bg-cyan-100 text-cyan-800 border-cyan-300'           },
    delivered: { label: 'ডেলিভারড',          cls: 'bg-green-100 text-green-800 border-green-300'       },
    cancelled: { label: 'বাতিল',             cls: 'bg-red-100 text-red-800 border-red-300'             },
    refunded:  { label: 'রিফান্ড হয়েছে',    cls: 'bg-orange-100 text-orange-800 border-orange-300'    },
    returned:  { label: 'ফেরত এসেছে',        cls: 'bg-slate-100 text-slate-700 border-slate-300'       },
    fraud:     { label: 'ফ্রড',              cls: 'bg-rose-100 text-rose-900 border-rose-400'          },
  }

  const [changingStatus, setChangingStatus] = useState(null)

  async function handleStatusChange(orderId, newStatus) {
    setChangingStatus(orderId)
    try {
      await api.updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (e) { setError(e.message) }
    finally { setChangingStatus(null) }
  }

  const allSelected  = orders.length > 0 && selected.size === orders.length
  const someSelected = selected.size > 0 && !allSelected

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
  if (error)   return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          মোট {orders.length}টি অর্ডার
          {selected.size > 0 && <span className="ml-2 font-semibold text-foreground">· {selected.size}টি নির্বাচিত</span>}
        </p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive" size="sm"
              disabled={bulkDeleting}
              onClick={() => setBulkConfirm(true)}
              className="gap-2"
            >
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {selected.size}টি মুছুন
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchOrders}>রিফ্রেশ</Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">কোনো অর্ডার নেই।</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 px-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                </TableHead>
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
                  <TableRow
                    className={`cursor-pointer transition-colors ${selected.has(order.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => toggleExpand(order.id)}
                  >
                    <TableCell className="px-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={e => toggleSelect(order.id, e)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatPrice(order.total)}</TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block">
                        {changingStatus === order.id
                          ? <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </span>
                          : <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              className={`cursor-pointer appearance-none rounded-full border px-2.5 py-0.5 text-xs font-semibold pr-5 focus:outline-none transition-colors ${(STATUS_MAP[order.status] || STATUS_MAP.pending).cls}`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                            >
                              {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                        }
                      </div>
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
                          variant="ghost" size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={deleting === order.id}
                          onClick={e => { e.stopPropagation(); setConfirmId(order.id) }}
                        >
                          {deleting === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expanded[order.id] && (
                    <TableRow key={`${order.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={8} className="py-3 px-6">
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
                          <p className="mt-2 text-xs text-muted-foreground">{order.address}</p>
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

      {/* Single delete confirmation */}
      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>অর্ডার মুছবেন?</DialogTitle>
            <DialogDescription>অর্ডার #{confirmId} চিরতরে মুছে ফেলা হবে।</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">বাতিল</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>হ্যাঁ, মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation */}
      <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected.size}টি অর্ডার মুছবেন?</DialogTitle>
            <DialogDescription>
              নির্বাচিত {selected.size}টি অর্ডার চিরতরে মুছে ফেলা হবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">বাতিল</Button></DialogClose>
            <Button variant="destructive" onClick={handleBulkDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> হ্যাঁ, {selected.size}টি মুছুন
            </Button>
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
  const [uploadingEdit, setUploadingEdit]     = useState(false)
  const [uploadingReview, setUploadingReview] = useState(false)

  const emptyForm = { name: '', description: '', price: '', image_url: '', video_url: '', stock: '', cross_sell_ids: '', review_type: 'text', review_images: [] }
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
    let reviewImages = []
    try { reviewImages = JSON.parse(product.review_images || '[]') } catch {}
    setEditForm({
      name:           product.name,
      description:    product.description || '',
      price:          product.price,
      image_url:      product.image_url || '',
      video_url:      product.video_url || '',
      stock:          product.stock,
      cross_sell_ids: product.cross_sell_ids || '',
      review_type:    product.review_type || 'text',
      review_images:  Array.isArray(reviewImages) ? reviewImages : [],
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
        price:         parseFloat(editForm.price),
        stock:         parseInt(editForm.stock || '0', 10),
        review_images: JSON.stringify(editForm.review_images || []),
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
              <Label>ভিডিও URL <span className="text-muted-foreground font-normal">(YouTube / সরাসরি লিংক)</span></Label>
              <Input name="video_url" value={form.video_url} onChange={handleFormChange} placeholder="https://youtube.com/watch?v=... অথবা https://..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>বিবরণ</Label>
              <Textarea name="description" value={form.description} onChange={handleFormChange} rows={4} placeholder="পণ্যের বিস্তারিত বিবরণ..." />
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
              <Label>ভিডিও URL <span className="text-muted-foreground font-normal">(YouTube / সরাসরি লিংক)</span></Label>
              <Input name="video_url" value={editForm.video_url} onChange={handleEditFormChange} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>বিবরণ</Label>
              <Textarea name="description" value={editForm.description} onChange={handleEditFormChange} rows={4} />
            </div>
            {/* Cross-sell selects */}
            {(() => {
              const ids = editForm.cross_sell_ids ? editForm.cross_sell_ids.split(',') : ['', '']
              const cs1 = ids[0] || ''; const cs2 = ids[1] || ''
              const setCs = (slot, val) => {
                const next = slot === 0 ? [val, cs2] : [cs1, val]
                setEditForm(prev => ({ ...prev, cross_sell_ids: next.filter(Boolean).join(',') }))
              }
              const opts = products.filter(p => p.id !== editingProduct?.id)
              return (
                <div className="sm:col-span-2 space-y-3">
                  <Label>ক্রস-সেল পণ্য <span className="text-muted-foreground font-normal">(সর্বোচ্চ ২টি)</span></Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map(slot => (
                      <select key={slot}
                        value={slot === 0 ? cs1 : cs2}
                        onChange={e => setCs(slot, e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">— পণ্য {slot + 1} বেছে নিন —</option>
                        {opts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    ))}
                  </div>
                </div>
              )
            })()}
            {/* Review type toggle + image uploads */}
            <div className="sm:col-span-2 space-y-3">
              <Label>রিভিউ টাইপ</Label>
              <div className="flex gap-3">
                {['text', 'image'].map(t => (
                  <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors ${editForm.review_type === t ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border text-muted-foreground'}`}>
                    <input type="radio" name="review_type" value={t} checked={editForm.review_type === t}
                      onChange={handleEditFormChange} className="hidden" />
                    {t === 'text' ? 'টেক্সট রিভিউ' : 'স্ক্রিনশট রিভিউ'}
                  </label>
                ))}
              </div>
              {editForm.review_type === 'image' && (
                <div className="space-y-2">
                  {/* Uploaded images grid */}
                  {editForm.review_images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {editForm.review_images.map((url, i) => (
                        <div key={i} className="relative aspect-[9/16] overflow-hidden rounded-lg border border-border">
                          <img src={url} alt={`review-${i}`} className="h-full w-full object-cover" />
                          <button type="button"
                            onClick={() => setEditForm(prev => ({ ...prev, review_images: prev.review_images.filter((_, j) => j !== i) }))}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white shadow">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload button */}
                  <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors ${uploadingReview ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {uploadingReview ? 'আপলোড হচ্ছে...' : 'স্ক্রিনশট যোগ করুন'}
                    <input type="file" accept="image/*" className="hidden" multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files)
                        if (!files.length) return
                        setUploadingReview(true)
                        try {
                          const urls = await Promise.all(files.map(f => api.uploadImage(f).then(r => r.url)))
                          setEditForm(prev => ({ ...prev, review_images: [...prev.review_images, ...urls] }))
                        } catch (err) { setEditError(err.message) }
                        finally { setUploadingReview(false); e.target.value = '' }
                      }} />
                  </label>
                </div>
              )}
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

// ── Footer Tab ────────────────────────────────────────────
const LINK_COLS = [
  { key: 'footer_links_info',    label: 'তথ্য' },
  { key: 'footer_links_support', label: 'সাপোর্ট' },
  { key: 'footer_links_policy',  label: 'ক্রেতা নীতি' },
]

function normalizeLinkItems(raw) {
  let items = raw
  if (typeof items === 'string') { try { items = JSON.parse(items) } catch { items = [] } }
  if (!Array.isArray(items)) return []
  return items.map(it => typeof it === 'string' ? { label: it, slug: '' } : it)
}

function FooterTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const [fields, setFields] = useState({
    footer_shop_name: '', footer_tagline: '', footer_address: '',
    footer_phone: '', footer_email: '', footer_facebook: '',
    footer_twitter: '', footer_instagram: '', footer_copyright: '',
  })
  const [linkItems, setLinkItems] = useState({
    footer_links_info: [], footer_links_support: [], footer_links_policy: [],
  })

  useEffect(() => {
    api.getFooterAdmin()
      .then(data => {
        setFields(prev => ({ ...prev, ...Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith('footer_links_') && !k.startsWith('meta_'))) }))
        const li = {}
        LINK_COLS.forEach(({ key }) => { li[key] = normalizeLinkItems(data[key]) })
        setLinkItems(li)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleField(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  function updateLink(key, idx, field, val) {
    setLinkItems(prev => ({ ...prev, [key]: prev[key].map((it, i) => i === idx ? { ...it, [field]: val } : it) }))
  }
  function addLink(key) {
    setLinkItems(prev => ({ ...prev, [key]: [...prev[key], { label: '', slug: '' }] }))
  }
  function removeLink(key, idx) {
    setLinkItems(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    try {
      const payload = { ...fields }
      LINK_COLS.forEach(({ key }) => {
        payload[key] = JSON.stringify(linkItems[key].filter(it => it.label.trim()))
      })
      await api.saveFooter(payload)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error   && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-green-200 bg-green-50 text-green-800"><AlertDescription>ফুটার সফলভাবে সংরক্ষিত হয়েছে।</AlertDescription></Alert>}

      {/* Contact info */}
      <Card>
        <CardHeader><CardTitle className="text-base">যোগাযোগ তথ্য</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'footer_shop_name',  label: 'শপের নাম' },
            { name: 'footer_tagline',    label: 'ট্যাগলাইন' },
            { name: 'footer_address',    label: 'ঠিকানা' },
            { name: 'footer_phone',      label: 'ফোন নম্বর' },
            { name: 'footer_email',      label: 'ইমেইল' },
            { name: 'footer_copyright',  label: 'কপিরাইট টেক্সট' },
          ].map(f => (
            <div key={f.name} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input name={f.name} value={fields[f.name] || ''} onChange={handleField} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader><CardTitle className="text-base">সোশ্যাল মিডিয়া লিংক</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'footer_facebook',  label: 'Facebook URL' },
            { name: 'footer_twitter',   label: 'Twitter URL' },
            { name: 'footer_instagram', label: 'Instagram URL' },
          ].map(f => (
            <div key={f.name} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input name={f.name} value={fields[f.name] || ''} onChange={handleField} placeholder="https://..." />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Link columns — label + slug editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ফুটার লিংক কলাম</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            লেবেল = ফুটারে দেখানো নাম। স্লাগ = পেজের URL (যেমন: <code className="bg-muted px-1 rounded text-[11px]">about</code>, <code className="bg-muted px-1 rounded text-[11px]">faq</code>)
          </p>
        </CardHeader>
        <CardContent className="grid gap-8 sm:grid-cols-3">
          {LINK_COLS.map(col => (
            <div key={col.key} className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{col.label}</p>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px_32px] gap-1.5 mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">লেবেল</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">স্লাগ</span>
                  <span />
                </div>
                {linkItems[col.key].map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-1.5 items-center">
                    <Input
                      value={item.label}
                      onChange={e => updateLink(col.key, i, 'label', e.target.value)}
                      placeholder="লেবেল"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={item.slug}
                      onChange={e => updateLink(col.key, i, 'slug', e.target.value)}
                      placeholder="about"
                      className="h-8 text-[11px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(col.key, i)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addLink(col.key)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> লিংক যোগ করুন
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        ফুটার সংরক্ষণ করুন
      </Button>
    </form>
  )
}

// ── Pages Tab ─────────────────────────────────────────────
function PagesTab() {
  const [pages, setPages]     = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.adminGetPages()
      .then(setPages)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    try {
      await api.adminUpdatePage(editing.slug, { title: editing.title, content: editing.content })
      setPages(prev => prev.map(p => p.slug === editing.slug ? { ...p, title: editing.title, content: editing.content } : p))
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
    <div className="space-y-6">
      {error   && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="border-green-200 bg-green-50 text-green-800"><AlertDescription>পেজ সফলভাবে সংরক্ষিত হয়েছে।</AlertDescription></Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map(page => (
          <button
            key={page.slug}
            onClick={() => { setEditing({ ...page }); setSuccess(false); setError(null) }}
            className={`text-left rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${editing?.slug === page.slug ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
          >
            <p className="text-xs font-mono text-muted-foreground mb-1">{page.slug}</p>
            <p className="text-sm font-semibold text-foreground leading-snug">{page.title}</p>
          </button>
        ))}
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing.title} সম্পাদনা</CardTitle>
              <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">/page/{editing.slug}</code>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>পেজ শিরোনাম</Label>
                <Input
                  value={editing.title}
                  onChange={e => setEditing(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>পেজের বিষয়বস্তু</Label>
                <Textarea
                  rows={12}
                  value={editing.content || ''}
                  onChange={e => setEditing(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="পেজের কন্টেন্ট লিখুন..."
                  className="font-sans text-sm leading-relaxed resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  সংরক্ষণ করুন
                </Button>
                <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  বাতিল
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Categories Tab ────────────────────────────────────────
function CategoriesTab() {
  const [cats, setCats]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [editItem, setEditItem]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm]           = useState({ name: '', image_url: '', sort_order: 0 })
  const [editForm, setEditForm]   = useState({ name: '', image_url: '', sort_order: 0 })

  const fetchCats = useCallback(() => {
    setLoading(true)
    api.adminGetCategories()
      .then(setCats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCats() }, [fetchCats])

  async function uploadImg(file, isEdit) {
    setUploading(true)
    try {
      const { url } = await api.uploadImage(file)
      isEdit
        ? setEditForm(prev => ({ ...prev, image_url: url }))
        : setForm(prev => ({ ...prev, image_url: url }))
    } catch (e) { setError(e.message) }
    finally { setUploading(false) }
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.adminAddCategory({ ...form, sort_order: parseInt(form.sort_order) || 0 })
      setForm({ name: '', image_url: '', sort_order: 0 })
      fetchCats()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleUpdate(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.adminUpdateCategory(editItem.id, { ...editForm, sort_order: parseInt(editForm.sort_order) || 0 })
      setEditItem(null); fetchCats()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try { await api.adminDeleteCategory(id); setCats(prev => prev.filter(c => c.id !== id)) }
    catch (e) { setError(e.message) }
    finally { setDeleting(null) }
  }

  function openEdit(cat) {
    setEditItem(cat)
    setEditForm({ name: cat.name, image_url: cat.image_url || '', sort_order: cat.sort_order || 0 })
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {/* Add form */}
      <Card>
        <CardHeader><CardTitle className="text-base">নতুন ক্যাটাগরি যোগ করুন</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>ক্যাটাগরির নাম *</Label>
              <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="যেমন: শার্ট, পাঞ্জাবি..." />
            </div>
            <div className="space-y-1.5">
              <Label>ক্রম (Sort Order)</Label>
              <Input type="number" min="0" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} placeholder="0" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>ক্যাটাগরির ছবি</Label>
              <div className="flex items-center gap-4">
                <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  ছবি আপলোড
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && uploadImg(e.target.files[0], false)} />
                </label>
                {form.image_url && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                    <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving || uploading} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                ক্যাটাগরি যোগ করুন
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      {cats.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">কোনো ক্যাটাগরি নেই।</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted border border-border">
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center"><LayoutGrid className="h-6 w-6 text-muted-foreground/30" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{cat.name}</p>
                <p className="text-[11px] text-muted-foreground">ক্রম: {cat.sort_order}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                  disabled={deleting === cat.id} onClick={() => handleDelete(cat.id)}>
                  {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>ক্যাটাগরি সম্পাদনা</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>নাম *</Label>
              <Input required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>ক্রম</Label>
              <Input type="number" min="0" value={editForm.sort_order} onChange={e => setEditForm(p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>ছবি</Label>
              <div className="flex items-center gap-3">
                <label className={`flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  ছবি পরিবর্তন
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && uploadImg(e.target.files[0], true)} />
                </label>
                {editForm.image_url && (
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border">
                    <img src={editForm.image_url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setEditForm(p => ({ ...p, image_url: '' }))}
                      className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">×</button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">বাতিল</Button></DialogClose>
              <Button type="submit" disabled={saving || uploading} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} সংরক্ষণ করুন
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Overview Section ──────────────────────────────────────
function OverviewSection() {
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.getOrders(), api.getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p) })
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0)
  const pending      = orders.filter(o => o.status === 'pending').length

  const stats = [
    { label: 'মোট রেভিনিউ',   value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', trend: '+12.5%' },
    { label: 'মোট অর্ডার',    value: orders.length,             icon: ShoppingCart, color: 'bg-blue-100 text-blue-600',     trend: '+8.2%'  },
    { label: 'পণ্যের সংখ্যা', value: products.length,           icon: Package,      color: 'bg-orange-100 text-orange-600', trend: '+2'     },
    { label: 'পেন্ডিং',       value: pending,                   icon: Clock,        color: 'bg-yellow-100 text-yellow-600', trend: null     },
  ]

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-black text-foreground">{s.value}</p>
                  {s.trend && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />{s.trend} এই মাসে
                    </p>
                  )}
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Revenue area chart */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">রেভিনিউ ওভারভিউ</CardTitle>
              <span className="text-xs text-muted-foreground">গত ৭ মাস (মক ডেটা)</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatPrice(v)} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders bar chart */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">অর্ডার সংখ্যা</CardTitle>
              <span className="text-xs text-muted-foreground">মাসওয়ারি</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">সাম্প্রতিক অর্ডার</CardTitle>
            <span className="text-xs text-muted-foreground">সর্বশেষ {Math.min(5, orders.length)}টি</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">কোনো অর্ডার নেই।</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>গ্রাহক</TableHead>
                  <TableHead>মোট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="text-muted-foreground text-xs">{o.id}</TableCell>
                    <TableCell className="font-medium text-sm">{o.customer_name}</TableCell>
                    <TableCell className="font-semibold text-primary text-sm">{formatPrice(o.total)}</TableCell>
                    <TableCell>
                      {(() => {
                        const S = { pending:'bg-yellow-100 text-yellow-800', confirmed:'bg-blue-100 text-blue-800', packing:'bg-violet-100 text-violet-800', warehouse:'bg-indigo-100 text-indigo-800', courier:'bg-cyan-100 text-cyan-800', delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800', refunded:'bg-orange-100 text-orange-800', returned:'bg-slate-100 text-slate-700', fraud:'bg-rose-100 text-rose-900' }
                        const L = { pending:'পেন্ডিং', confirmed:'কনফার্মড', packing:'প্যাকিং', warehouse:'গুদামে', courier:'কুরিয়ারে', delivered:'ডেলিভারড', cancelled:'বাতিল', refunded:'রিফান্ড', returned:'ফেরত', fraud:'ফ্রড' }
                        return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${S[o.status] || 'bg-muted text-muted-foreground'}`}>{L[o.status] || o.status}</span>
                      })()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(o.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Nav items config ──────────────────────────────────────
const NAV = [
  { id: 'overview',    label: 'ওভারভিউ',    Icon: LayoutDashboard },
  { id: 'orders',      label: 'অর্ডারসমূহ',  Icon: ShoppingCart    },
  { id: 'products',    label: 'পণ্যসমূহ',    Icon: Package          },
  { id: 'categories',  label: 'ক্যাটাগরি',   Icon: LayoutGrid       },
  { id: 'pages',       label: 'পেজসমূহ',     Icon: FileText         },
  { id: 'footer',      label: 'ফুটার',       Icon: LayoutTemplate  },
  { id: 'settings',    label: 'সেটিংস',     Icon: Settings         },
]

// ── Dashboard Shell ───────────────────────────────────────
export default function Dashboard() {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [active, setActive]       = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() { logout(); navigate('/admin', { replace: true }) }

  const currentNav = NAV.find(n => n.id === active)

  const sections = {
    overview:   <OverviewSection />,
    orders:     <OrdersTab />,
    products:   <ProductsTab />,
    categories: <CategoriesTab />,
    pages:      <PagesTab />,
    footer:     <FooterTab />,
    settings:   <SettingsTab />,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-zinc-900 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-black text-white">গ্যানশপ</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-white focus-visible:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">মেনু</p>
          {NAV.map(({ id, label, Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => { setActive(id); setSidebarOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom user */}
        <div className="shrink-0 border-t border-zinc-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Top header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground focus-visible:outline-none">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{currentNav?.label}</h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">গ্যানশপ অ্যাডমিন প্যানেল</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {sections[active]}
        </main>
      </div>
    </div>
  )
}
