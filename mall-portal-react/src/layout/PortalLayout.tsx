import { useState } from 'react'
import { Button, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMemberStore } from '../store/member'

const navs = [
  { to: '/', label: '首页', end: true },
  { to: '/products', label: '全部商品' },
  { to: '/cart', label: '购物车' },
  { to: '/orders', label: '我的订单' },
  { to: '/member', label: '会员中心' },
  { to: '/service', label: '客户服务' },
  { to: '/help', label: '帮助中心' }
]

export default function PortalLayout() {
  const navigate = useNavigate()
  const store = useMemberStore()
  const [kw, setKw] = useState('')

  const doSearch = (value = kw) => {
    navigate({ pathname: '/products', search: value ? `?keyword=${encodeURIComponent(value)}` : '' })
  }

  const logout = () => {
    store.logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: '#fff',
          boxShadow: '0 1px 6px rgba(0,0,0,.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '0 16px'
          }}
        >
          <Link to="/" style={{ fontSize: 20, fontWeight: 700, color: '#409eff' }}>
            mall 商城
          </Link>
          <nav style={{ display: 'flex', gap: 18, flex: 1 }}>
            {navs.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                style={({ isActive }) => ({
                  color: isActive ? '#409eff' : '#606266',
                  fontSize: 15,
                  padding: '4px 0',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '2px solid #409eff' : '2px solid transparent'
                })}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Input
            style={{ width: 240 }}
            placeholder="搜索商品"
            allowClear
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            onPressEnter={() => doSearch()}
            suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => doSearch()} />}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {store.token ? (
              <>
                <span style={{ color: '#303133', fontSize: 14 }}>{store.nickname || store.username}</span>
                <Button type="link" onClick={logout}>
                  退出
                </Button>
              </>
            ) : (
              <>
                <Button type="link" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button type="link" onClick={() => navigate('/login?tab=register')}>
                  注册
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', color: '#909399', fontSize: 12, padding: 20 }}>
        mall 商城 · React 18 + Spring Boot 演示项目
      </footer>
    </div>
  )
}
