import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Product from '@/pages/Product'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import StaticPage from '@/pages/StaticPage'
import BlogPost from '@/pages/BlogPost'
import Blog from '@/pages/Blog'
import AdminLogin from '@/pages/admin/Login'
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes with header/footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/product/:id" element={<PublicLayout><Product /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
            <Route path="/page/:slug" element={<PublicLayout><StaticPage /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />

            {/* Admin routes — no public layout */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <Dashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
