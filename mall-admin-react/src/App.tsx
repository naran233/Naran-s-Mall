import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import { RequireAuth } from './router'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProductList from './pages/product/ProductList'
import CategoryList from './pages/product/CategoryList'
import BrandList from './pages/product/BrandList'
import OrderList from './pages/order/OrderList'
import MemberList from './pages/member/MemberList'
import TicketList from './pages/service/TicketList'
import HelpCenter from './pages/cms/HelpCenter'
import Statistics from './pages/report/Statistics'
import FinanceList from './pages/finance/FinanceList'
import Setting from './pages/setting/Setting'
import UserList from './pages/sys/UserList'
import RoleList from './pages/sys/RoleList'
import MenuList from './pages/sys/MenuList'
import ResourceList from './pages/sys/ResourceList'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="product/list" element={<ProductList />} />
        <Route path="product/category" element={<CategoryList />} />
        <Route path="product/brand" element={<BrandList />} />
        <Route path="order/list" element={<OrderList />} />
        <Route path="member/list" element={<MemberList />} />
        <Route path="service/ticket" element={<TicketList />} />
        <Route path="cms/help" element={<HelpCenter />} />
        <Route path="report/statistics" element={<Statistics />} />
        <Route path="finance/list" element={<FinanceList />} />
        <Route path="setting" element={<Setting />} />
        <Route path="sys/user" element={<UserList />} />
        <Route path="sys/role" element={<RoleList />} />
        <Route path="sys/menu" element={<MenuList />} />
        <Route path="sys/resource" element={<ResourceList />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
