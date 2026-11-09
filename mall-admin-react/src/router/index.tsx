import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const routeTitles: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/product/list': '商品列表',
  '/product/category': '商品分类',
  '/product/brand': '品牌管理',
  '/order/list': '订单列表',
  '/member/list': '会员管理',
  '/service/ticket': '客户服务',
  '/cms/help': '帮助中心',
  '/report/statistics': '统计报表',
  '/finance/list': '财务管理',
  '/setting': '系统设置',
  '/sys/user': '用户管理',
  '/sys/role': '角色管理',
  '/sys/menu': '菜单管理',
  '/sys/resource': '资源管理'
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
