import { useEffect, useState } from 'react'
import { Button, Card, Divider, Form, Input, InputNumber, Spin, message } from 'antd'
import { getSettings, saveSettings } from '../../api/admin'

const tipStyle: React.CSSProperties = { marginLeft: 10, color: '#909399', fontSize: 12 }

export default function Setting() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getSettings()
      const map: Record<string, string> = {}
      ;(r.data || []).forEach((s: any) => {
        map[s.settingKey] = s.settingValue ?? ''
      })
      form.setFieldsValue({
        ...map,
        free_freight_threshold: Number(map.free_freight_threshold || 0),
        order_auto_cancel_minutes: Number(map.order_auto_cancel_minutes || 0)
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await saveSettings({
        ...values,
        free_freight_threshold: String(values.free_freight_threshold ?? 0),
        order_auto_cancel_minutes: String(values.order_auto_cancel_minutes ?? 0)
      })
      message.success('设置已保存')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Spin spinning={loading}>
      <Card title={<b>系统设置</b>}>
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          style={{ maxWidth: 720 }}
        >
          <Divider orientation="left">站点信息</Divider>
          <Form.Item label="站点名称" name="site_name">
            <Input placeholder="mall 商城" />
          </Form.Item>
          <Form.Item label="站点 Logo" name="site_logo">
            <Input placeholder="图片地址，如 /images/brands/xiaomi.svg" />
          </Form.Item>
          <Form.Item label="站点简介" name="site_description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="备案号" name="icp">
            <Input />
          </Form.Item>

          <Divider orientation="left">客服信息</Divider>
          <Form.Item label="客服电话" name="service_phone">
            <Input />
          </Form.Item>
          <Form.Item label="客服邮箱" name="service_email">
            <Input />
          </Form.Item>

          <Divider orientation="left">交易设置</Divider>
          <Form.Item label="包邮门槛（元）" name="free_freight_threshold">
            <InputNumber min={0} precision={2} />
          </Form.Item>
          <div style={{ marginTop: -16, marginBottom: 12, paddingLeft: '29%' }}>
            <span style={tipStyle}>满该金额订单包邮</span>
          </div>
          <Form.Item label="未支付自动取消（分钟）" name="order_auto_cancel_minutes">
            <InputNumber min={0} />
          </Form.Item>
          <div style={{ marginTop: -16, marginBottom: 12, paddingLeft: '29%' }}>
            <span style={tipStyle}>0 表示不自动取消</span>
          </div>

          <Form.Item wrapperCol={{ offset: 7 }}>
            <Button type="primary" loading={saving} onClick={save}>
              保存设置
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={load}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  )
}
