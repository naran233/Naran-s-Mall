import { useState } from 'react'
import { Button, Card, Form, Input, Tabs, message } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMemberStore } from '../store/member'
import { memberRegister } from '../api/portal'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const store = useMemberStore()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const [loginForm] = Form.useForm()
  const [regForm] = Form.useForm()

  const doLogin = async () => {
    const values = await loginForm.validateFields()
    setLoading(true)
    try {
      await store.login(values)
      message.success('登录成功')
      navigate(params.get('redirect') || '/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const doRegister = async () => {
    const values = await regForm.validateFields()
    setLoading(true)
    try {
      await memberRegister(values)
      message.success('注册成功，请登录')
      loginForm.setFieldsValue({ username: values.username, password: '' })
      setTab('login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #409eff 0%, #67c23a 100%)'
      }}
    >
      <Card style={{ width: 400, borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, color: '#409eff' }}>mall 商城</h2>
          <p style={{ margin: '6px 0 0', color: '#909399', fontSize: 13 }}>登录 / 注册</p>
        </div>

        <Tabs
          activeKey={tab}
          onChange={setTab}
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form
                  form={loginForm}
                  size="large"
                  initialValues={{ username: 'demo', password: '123456' }}
                  onFinish={doLogin}
                >
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                  <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                    登 录
                  </Button>
                  <div style={{ marginTop: 14, textAlign: 'center', color: '#909399', fontSize: 12 }}>
                    演示账号：demo / 123456
                  </div>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form form={regForm} size="large" onFinish={doRegister}>
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                  <Form.Item name="nickname">
                    <Input placeholder="昵称（可选）" />
                  </Form.Item>
                  <Form.Item name="phone">
                    <Input placeholder="手机号（可选）" />
                  </Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={loading}
                    style={{ background: '#67c23a', borderColor: '#67c23a' }}
                  >
                    注 册
                  </Button>
                </Form>
              )
            }
          ]}
        />

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Button type="link" onClick={() => navigate('/')}>
            ← 返回商城首页
          </Button>
        </div>
      </Card>
    </div>
  )
}
