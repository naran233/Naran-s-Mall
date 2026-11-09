import { useEffect, useState } from 'react'
import { Button, Card, Col, Divider, Empty, Input, Radio, Row, Select, Spin, Tag, message } from 'antd'
import { Link } from 'react-router-dom'
import { createTicket, getSiteSettings, myOrders, myTickets } from '../api/portal'

const typeMap: Record<number, string> = { 1: '咨询', 2: '投诉', 3: '退换货', 4: '售后' }
const statusMap: Record<number, string> = { 0: '待处理', 1: '处理中', 2: '已回复', 3: '已关闭' }
const typeText = (t: number) => typeMap[t] || '其他'
const statusText = (s: number) => statusMap[s] || '未知'
const statusColor = (s: number) => {
  if (s === 0) return 'warning'
  if (s === 1) return 'blue'
  if (s === 2) return 'success'
  return 'default'
}

export default function Service() {
  const [form, setForm] = useState<any>({ type: 1, orderId: '', title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})

  const loadTickets = async () => {
    setLoading(true)
    try {
      const r = await myTickets()
      setTickets(r.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
    ;(async () => {
      try {
        const r = await myOrders()
        setOrders(r.data || [])
      } catch {
        /* 未登录时忽略 */
      }
      try {
        const s = await getSiteSettings()
        setSettings(s.data || {})
      } catch {
        /* ignore */
      }
    })()
  }, [])

  const reset = () => setForm({ type: 1, orderId: '', title: '', content: '' })

  const submit = async () => {
    if (!String(form.title).trim()) {
      message.warning('请填写问题标题')
      return
    }
    if (!String(form.content).trim()) {
      message.warning('请填写问题描述')
      return
    }
    setSubmitting(true)
    try {
      await createTicket({ ...form })
      message.success('工单已提交，客服会尽快处理')
      reset()
      loadTickets()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={14}>
          <Card title={<b>提交服务工单</b>}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ width: 90, color: '#606266' }}>问题类型</span>
              <Radio.Group
                value={form.type}
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: '咨询', value: 1 },
                  { label: '投诉', value: 2 },
                  { label: '退换货', value: 3 },
                  { label: '售后', value: 4 }
                ]}
                onChange={(e) => setForm((f: any) => ({ ...f, type: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ width: 90, color: '#606266' }}>关联订单</span>
              <Select
                style={{ flex: 1 }}
                placeholder="可不选"
                allowClear
                value={form.orderId || undefined}
                onChange={(v) => setForm((f: any) => ({ ...f, orderId: v || '' }))}
                options={orders.map((o) => ({
                  label: `${o.orderSn}（￥${o.payAmount}）`,
                  value: String(o.id)
                }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ width: 90, color: '#606266' }}>问题标题</span>
              <Input
                value={form.title}
                maxLength={80}
                showCount
                placeholder="一句话描述问题"
                onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ width: 90, color: '#606266', lineHeight: '32px' }}>问题描述</span>
              <Input.TextArea
                rows={5}
                placeholder="请详细描述遇到的问题"
                value={form.content}
                onChange={(e) => setForm((f: any) => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div style={{ paddingLeft: 90 }}>
              <Button type="primary" loading={submitting} onClick={submit}>
                提交工单
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={reset}>
                重置
              </Button>
            </div>
          </Card>
        </Col>

        <Col span={10}>
          <Card title={<b>联系客服</b>}>
            {[
              { label: '客服电话', value: settings.service_phone || '400-800-8888' },
              { label: '客服邮箱', value: settings.service_email || 'service@mall.com' },
              { label: '服务时间', value: '每日 09:00 - 21:00' }
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  color: '#606266',
                  fontSize: 14
                }}
              >
                <span>{r.label}</span>
                <b style={{ color: '#303133' }}>{r.value}</b>
              </div>
            ))}
            <Divider />
            <div style={{ color: '#909399', fontSize: 13, lineHeight: 1.9 }}>
              <p>· 提交工单后客服会在 1 个工作日内回复，可在「我的工单」查看进度。</p>
              <p>· 退换货请先保留商品包装与凭证。</p>
              <p>
                · 常见问题可先查看
                <Link to="/help" style={{ color: '#409eff' }}>
                  帮助中心
                </Link>
                。
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={<b>我的工单</b>} style={{ marginTop: 16 }}>
        <Spin spinning={loading}>
          {!tickets.length && <Empty description="暂无工单记录" />}
          {tickets.map((t) => (
            <div
              key={t.id}
              style={{ border: '1px solid #ebeef5', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#909399', fontSize: 13 }}>
                  {t.ticketSn} · {typeText(t.type)}
                </span>
                <Tag color={statusColor(t.status)}>{statusText(t.status)}</Tag>
              </div>
              <div style={{ margin: '10px 0 6px', fontWeight: 600, color: '#303133' }}>{t.title}</div>
              <div style={{ color: '#606266', fontSize: 14, lineHeight: 1.8 }}>{t.content}</div>
              {t.replyContent && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    background: '#f0f9eb',
                    borderRadius: 6,
                    color: '#529b2e',
                    fontSize: 14,
                    lineHeight: 1.8
                  }}
                >
                  <b>客服回复：</b>
                  {t.replyContent}
                  <span style={{ color: '#c0c4cc', fontSize: 12, marginLeft: 8 }}>{t.replyTime}</span>
                </div>
              )}
              <div style={{ marginTop: 10, color: '#c0c4cc', fontSize: 12 }}>{t.createTime}</div>
            </div>
          ))}
        </Spin>
      </Card>
    </div>
  )
}
