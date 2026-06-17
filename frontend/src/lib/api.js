const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const token = sessionStorage.getItem('admin_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// ── Public ────────────────────────────────────────────────
export const api = {
  getProducts:   ()       => request('/api/products'),
  getProduct:    (id)     => request(`/api/products?id=${id}`),
  createOrder:   (body)   => request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  getPixelId:    ()       => request('/api/public/pixel'),

  // ── Admin ───────────────────────────────────────────────
  login:         (body)   => request('/api/admin/login',    { method: 'POST', body: JSON.stringify(body) }),
  getOrders:         ()           => request('/api/admin/orders'),
  deleteOrder:       (id)         => request(`/api/admin/orders?id=${id}`, { method: 'DELETE' }),
  updateOrderStatus: (id, status) => request(`/api/admin/orders?id=${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addProduct:    (body)   => request('/api/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/api/admin/products?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id)     => request(`/api/admin/products?id=${id}`, { method: 'DELETE' }),
  uploadImage:   (file)   => {
    const token = sessionStorage.getItem('admin_token')
    const form  = new FormData()
    form.append('image', file)
    return fetch(`${BASE}/api/admin/upload`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form,
    }).then(async r => {
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b.error || `HTTP ${r.status}`) }
      return r.json()
    })
  },
  getSettings:    ()       => request('/api/admin/settings'),
  saveSettings:   (body)   => request('/api/admin/settings', { method: 'POST', body: JSON.stringify(body) }),
  getFooterAdmin: ()       => request('/api/admin/settings'),
  saveFooter:     (body)   => request('/api/admin/settings', { method: 'POST', body: JSON.stringify(body) }),
  getFooter:      ()       => fetch(`${BASE}/api/public/footer`, { cache: 'no-store' }).then(r => r.json()),
  getCategories:  ()       => fetch(`${BASE}/api/public/categories`).then(r => r.json()),

  // Categories admin
  adminGetCategories:    ()         => request('/api/admin/categories'),
  adminAddCategory:      (body)     => request('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateCategory:   (id, body) => request(`/api/admin/categories?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteCategory:   (id)       => request(`/api/admin/categories?id=${id}`, { method: 'DELETE' }),

  // Customers admin
  adminGetCustomers: () => request('/api/admin/customers'),

  // Pages admin
  adminGetPages:   ()           => request('/api/admin/pages'),
  adminCreatePage: (body)       => request('/api/admin/pages', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdatePage: (slug, body) => request(`/api/admin/pages?slug=${slug}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeletePage: (slug)       => request(`/api/admin/pages?slug=${slug}`, { method: 'DELETE' }),

  // Moderators admin
  adminGetModerators:   ()     => request('/api/admin/moderators'),
  adminCreateModerator: (body) => request('/api/admin/moderators', { method: 'POST', body: JSON.stringify(body) }),
  adminDeleteModerator: (id)   => request(`/api/admin/moderators?id=${id}`, { method: 'DELETE' }),

  // Blog — public
  getBlogPosts: ()     => fetch(`${BASE}/api/public/blog`, { cache: 'no-store' }).then(r => r.json()),
  getBlogPost:  (slug) => fetch(`${BASE}/api/public/blog?slug=${slug}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : r.json().then(b => Promise.reject(b.error || 'পোস্ট পাওয়া যায়নি'))),

  // Blog — admin
  adminGetBlogPosts:  ()        => request('/api/admin/blog'),
  adminCreateBlogPost:(body)    => request('/api/admin/blog', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateBlogPost:(id, body)=> request(`/api/admin/blog?id=${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteBlogPost:(id)      => request(`/api/admin/blog?id=${id}`, { method: 'DELETE' }),
}
