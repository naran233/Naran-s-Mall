import { Card, Col, Row } from 'antd'
import { ProfileOutlined, ShoppingOutlined, TeamOutlined } from '@ant-design/icons'

const cards = [
  { title: '商品管理', desc: '商品的增删改查与上下架', icon: <ShoppingOutlined />, color: '#409eff' },
  { title: '订单管理', desc: '订单查询、详情与发货', icon: <ProfileOutlined />, color: '#67c23a' },
  { title: '权限管理', desc: '用户 / 角色 / 菜单 / 资源', icon: <TeamOutlined />, color: '#e6a23c' }
]

export default function Dashboard() {
  return (
    <div>
      <Row gutter={16}>
        {cards.map((c) => (
          <Col span={8} key={c.title}>
            <Card hoverable style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 36, color: c.color }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#303133' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: '#909399', marginTop: 4 }}>{c.desc}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card style={{ marginTop: 8 }}>
        <h3 style={{ marginTop: 0 }}>欢迎使用 mall 商城后台管理系统</h3>
        <p style={{ color: '#606266', lineHeight: 1.8 }}>
          技术栈：React 18 + Vite + Ant Design 5 + Zustand + Axios ｜ Spring Boot 3 + MyBatis-Plus + MySQL + JWT
        </p>
        <p style={{ color: '#606266', lineHeight: 1.8 }}>
          左侧菜单可进入商品管理、订单管理、权限管理（用户 / 角色 / 菜单 / 资源）。
        </p>
        <p style={{ color: '#606266', lineHeight: 1.8 }}>
          同一后端同时服务 Vue 版与 React 版前端：Vue 版 5173 / 5174，React 版 5175 / 5176。
        </p>
      </Card>
    </div>
  )
}
