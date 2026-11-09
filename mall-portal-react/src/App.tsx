import { Route, Routes, Navigate } from 'react-router-dom'
import PortalLayout from './layout/PortalLayout'
import { RequireAuth } from './router'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderList from './pages/OrderList'
import Member from './pages/Member'
import Service from './pages/Service'
import Help from './pages/Help'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PortalLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductList />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route
          path="cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAuth>
              <OrderList />
            </RequireAuth>
          }
        />
        <Route
          path="member"
          element={
            <RequireAuth>
              <Member />
            </RequireAuth>
          }
        />
        <Route
          path="service"
          element={
            <RequireAuth>
              <Service />
            </RequireAuth>
          }
        />
        <Route path="help" element={<Help />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
