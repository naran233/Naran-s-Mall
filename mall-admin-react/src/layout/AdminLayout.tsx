import { useEffect, useMemo, useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import {
  BarChartOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LockOutlined,
  MoneyCollectOutlined,
  ProfileOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/user'
import { routeTitles } from '../router'

const { Header, Sider, Content } = Layout

const parentOf: Record<string, string> = {
  '/product/list': 'product',
  '/product/category': 'product',
  '/product/brand': 'product',
  '/order/list': 'order',
  '/sys/user': 'sys',
  '/sys/role': 'sys',
  '/sys/menu': 'sys',
  '/sys/resource': 'sys'
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const store = useUserStore()
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const selectedKey = location.pathname === '/' ? '/dashboard' : location.pathname

  useEffect(() => {
    const parent = parentOf[selectedKey]
    if (parent) setOpenKeys((keys) => (keys.includes(parent) ? keys : [...keys, parent]))
  }, [selectedKey])

  const menuItems = useMemo(
    () => [
      { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
      { key: '/report/statistics', icon: <BarChartOutlined />, label: '统计报表' },
      {
        key: 'product',
        icon: <ShoppingOutlined />,
        label: '商品管理',
        children: [
          { key: '/product/list', label: '商品列表' },
          { key: '/product/category', label: '商品分类' },
          { key: '/product/brand', label: '品牌管理' }
        ]
      },
      {
        key: 'order',
        icon: <ProfileOutlined />,
        label: '订单管理',
        children: [{ key: '/order/list', label: '订单列表' }]
      },
      { key: '/member/list', icon: <TeamOutlined />, label: '会员中心' },
      { key: '/service/ticket', icon: <CustomerServiceOutlined />, label: '客户服务' },
      { key: '/cms/help', icon: <FileTextOutlined />, label: '帮助中心' },
      { key: '/finance/list', icon: <MoneyCollectOutlined />, label: '财务管理' },
      {
        key: 'sys',
        icon: <LockOutlined />,
        label: '权限管理',
        children: [
          { key: '/sys/user', label: '用户管理' },
          { key: '/sys/role', label: '角色管理' },
          { key: '/sys/menu', label: '菜单管理' },
          { key: '/sys/resource', label: '资源管理' }
        ]
      },
      { key: '/setting', icon: <SettingOutlined />, label: '系统设置' }
    ],
    []
  )

  const logout = () => {
    store.logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={220} style={{ background: '#1f2d3d' }}>
        <div
          style={{
            height: 60,
            lineHeight: '60px',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            background: '#17232e'
          }}
        >
          mall 商城后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ background: '#1f2d3d', borderInlineEnd: 'none' }}
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,.06)'
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: '#303133' }}>
            {routeTitles[selectedKey] || '仪表盘'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#606266', fontSize: 14 }}>
              <UserOutlined style={{ marginRight: 6 }} />
              {store.nickName || store.username}
            </span>
            <Button type="link" danger onClick={logout}>
              退出登录
            </Button>
          </div>
        </Header>
        <Content style={{ background: '#f5f7fa', padding: 20, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
