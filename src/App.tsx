import AppFooter from '@/components/AppFooter'
import RequireRole from '@/components/RequireRole'
import RequireAuth from '@/components/RequreAuth'
import Checkout from '@/pages/Checkout'
import CheckoutSuccess from '@/pages/CheckoutSucess'
import DashboardProducts from '@/pages/DashboardProducts'
import EditProduct from '@/pages/EditProduct'
import Login from '@/pages/Login'
import ManageOrders from '@/pages/ManageOrders'
import MyOrders from '@/pages/MyOrders'
import OrderDetailPage from '@/pages/OrderDetaill'
import ProductDetail from '@/pages/ProductDetail'
import Register from '@/pages/Register'
import SellerProducts from '@/pages/SellerProducts'
import { Container } from '@chakra-ui/react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import PublishProduct from './pages/PublishProduct'

export default function App() {
  return (
    <>
      <Navbar />
      <Container maxW="7xl" py={6}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route
            path="/publicar"
            element={
              <RequireAuth>
                <PublishProduct />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardProducts />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/editar/:id"
            element={
              <RequireAuth>
                <EditProduct />
              </RequireAuth>
            }
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route
            path="/mis-ordenes"
            element={
              <RequireAuth>
                <MyOrders />
              </RequireAuth>
            }
          />
          <Route
            path="/orden/:id"
            element={
              <RequireAuth>
                <OrderDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/ordenes"
            element={
              <RequireRole roles={['admin']}>
                <ManageOrders mode="admin" />
              </RequireRole>
            }
          />

          <Route
            path="/vendedor/ordenes"
            element={
              <RequireRole roles={['seller', 'admin']}>
                <ManageOrders mode="seller" />
              </RequireRole>
            }
          />
          <Route
            path="/vendedor/productos"
            element={
              <RequireRole roles={['seller', 'admin']}>
                <SellerProducts />
              </RequireRole>
            }
          />
        </Routes>
      </Container>
      <AppFooter />
    </>
  )
}
