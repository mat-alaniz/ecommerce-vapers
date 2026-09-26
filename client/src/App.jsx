import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import AdminRoute from './components/AdminRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const OffersPage = lazy(() => import('./pages/OffersPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Cargando...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </Suspense>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          },
          success: {
            style: {
              background: '#059669',
              color: '#ffffff',
            },
          },
          error: {
            style: {
              background: '#b91c1c',
              color: '#ffffff',
              fontWeight: 'bold',
            },
          },
        }}
      />
    </div>
  )
}

export default App