import { useEffect, useState } from 'react'
import { Button, Card, Empty, Modal, Radio, Spin, Tag, message } from 'antd'
import { cancelOrder, confirmOrder, myOrders, payOrder, prepayOrder } from '../api/portal'

const statusMap: Record<number, string> = {
  0: '创建订单',
  1: '确认订单',
  2: '待支付',
  3: '支付成功 · 待发货',
  4: '已发货',
  5: '已取消'
}

const statusText = (s: number) => statusMap[s] || '未知'
const statusColor = (s: number) => {
  if (s === 3) return 'success'
  if (s === 4) return 'blue'
  if (s === 2) return 'warning'
  return 'default'
}

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<number | ''>('')

  const load = async (st: number | '' = status) => {
    setLoading(true)
    try {
      const r = await myOrders({ status: st === '' ? undefined : st })
      setOrders(r.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  const act = async (id: number, type: string) => {
    if (type === 'cancel') {
      Modal.confirm({
        title: '提示',
        content: '确认取消该订单？库存将被释放。',
        onOk: async () => {
          await cancelOrder(id)
          message.success('已取消')
          load()
        }
      })
      return
    }
    if (type === 'confirm') {
      await confirmOrder(id)
      message.success('已确认订单')
    } else if (type === 'prepay') {
      await prepayOrder(id)
      message.success('已进入待支付')
    } else if (type === 'pay') {
      await payOrder(id)
      message.success('模拟支付成功')
    }
    load()
  }

  return (
    <Spin spinning={loading}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b>我的订单</b>
            <Radio.Group
              size="small"
              value={status}
              optionType="button"
              onChange={(e) => {
                setStatus(e.target.value)
                load(e.target.value)
              }}
              options={[
                { label: '全部', value: '' },
                { label: '创建订单', value: 0 },
                { label: '确认订单', value: 1 },
                { label: '待支付', value: 2 },
                { label: '待发货', value: 3 },
                { label: '已发货', value: 4 },
                { label: '已取消', value: 5 }
              ]}
            />
          </div>
        }
      >
        {!loading && !orders.length && <Empty description="暂无订单" />}

        {orders.map((o) => (
          <div
            key={o.id}
            style={{ border: '1px solid #ebeef5', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: '#f5f7fa'
              }}
            >
              <span style={{ color: '#606266', fontSize: 14 }}>订单号：{o.orderSn}</span>
              <Tag color={statusColor(o.status)}>{statusText(o.status)}</Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, gap: 20 }}>
              <div style={{ flex: 1 }}>
                {(o.items || []).map((it: any) => (
                  <div key={it.id} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <img
                      src={it.productPic}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }}
                    />
                    <div>
                      <div style={{ fontSize: 14 }}>{it.productName}</div>
                      <div style={{ fontSize: 12, color: '#909399', marginTop: 4 }}>
                        ￥{it.productPrice} × {it.productQuantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ width: 180, textAlign: 'right', color: '#606266', lineHeight: 1.9, fontSize: 13 }}>
                <div>总额：￥{o.totalAmount}</div>
                <div>优惠：￥{o.couponAmount}</div>
                <div>
                  实付：
                  <span style={{ color: '#f56c6c', fontSize: 18, fontWeight: 700 }}>￥{o.payAmount}</span>
                </div>
              </div>
            </div>

            {o.deliverySn && (
              <div
                style={{
                  padding: '8px 16px',
                  background: '#f0f9eb',
                  color: '#529b2e',
                  fontSize: 13,
                  borderTop: '1px dashed #e1f3d8'
                }}
              >
                物流：{o.deliveryCompany} / {o.deliverySn}
                <span style={{ color: '#909399' }}>（{o.deliveryTime} 已发货）</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderTop: '1px solid #ebeef5'
              }}
            >
              {o.status === 0 && (
                <Button type="primary" size="small" onClick={() => act(o.id, 'confirm')}>
                  确认订单
                </Button>
              )}
              {o.status === 1 && (
                <Button size="small" style={{ background: '#e6a23c', borderColor: '#e6a23c', color: '#fff' }} onClick={() => act(o.id, 'prepay')}>
                  去支付
                </Button>
              )}
              {o.status === 2 && (
                <Button type="primary" danger size="small" onClick={() => act(o.id, 'pay')}>
                  模拟支付
                </Button>
              )}
              {o.status === 3 && (
                <Button size="small" style={{ background: '#67c23a', borderColor: '#67c23a', color: '#fff' }} disabled>
                  已支付 · 待发货
                </Button>
              )}
              {o.status === 4 && (
                <Button type="primary" size="small" disabled>
                  已发货
                </Button>
              )}
              {o.status < 3 && (
                <Button size="small" onClick={() => act(o.id, 'cancel')}>
                  取消订单
                </Button>
              )}
              <span style={{ color: '#c0c4cc', fontSize: 12, marginLeft: 12 }}>{o.createTime}</span>
            </div>
          </div>
        ))}
      </Card>
    </Spin>
  )
}
