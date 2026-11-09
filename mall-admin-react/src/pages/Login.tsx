import { useState } from 'react'
import { Button, Card, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/user'

export default function Login() {
  const navigate = useNavigate()
  const store = useUserStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { username: string; password: string }) => {
    if (!values.username || !values.password) {
      message.warning('请输入用户名和密码')
      return
    }
    setLoading(true)
    try {
      await store.login(values)
      message.success('登录成功')
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2d3d 0%, #409eff 100%)'
      }}
    >
      <Card style={{ width: 380, borderRadius: 12 }} styles={{ body: { padding: 24 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: '#303133' }}>mall 后台管理系统</h2>
          <p style={{ margin: '6px 0 0', color: '#909399', fontSize: 13 }}>React 18 + Spring Boot</p>
        </div>
        <Form
          initialValues={{ username: 'admin', password: '123456' }}
          onFinish={onFinish}
          size="large"
          autoComplete="off"
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Button type="primary" size="large" htmlType="submit" block loading={loading}>
            登 录
          </Button>
        </Form>
        <div style={{ marginTop: 14, textAlign: 'center', color: '#909399', fontSize: 12 }}>
          默认账号：admin / 123456
        </div>
      </Card>
    </div>
  )
}
