import AdminLayout from '@/admin/AdminLayout'
import AdminDashboard from '@/admin/pages/AdminDashboard'
import AdminOrders from '@/admin/pages/AdminOrders'
import AdminProducts from '@/admin/pages/AdminProducts'
import AdminUsers from '@/admin/pages/AdminUsers'
import AppFooter from '@/components/AppFooter'
import RequireRole from '@/components/RequireRole'
import Checkout from '@/pages/Checkout'
import CheckoutSuccess from '@/pages/CheckoutSucess'
import Login from '@/pages/Login'
import ProductDetail from '@/pages/ProductDetail'
import Register from '@/pages/Register'
import { Container } from '@chakra-ui/react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'
import Home from './pages/Home'

export default function App() {
  return (
    <>
      <Navbar />
      <Container maxW="7xl" py={6}>
        <Routes>
          {/* públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          {/* admin */}
          <Route
            path="/admin"
            element={
              <RequireRole roles={['admin']}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="usuarios" element={<AdminUsers />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <AppFooter />
    </>
  )
}
