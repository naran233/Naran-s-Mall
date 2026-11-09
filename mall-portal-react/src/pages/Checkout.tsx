import { useEffect, useState } from 'react'
import { Button, Card, Col, Input, Radio, Row, Select, Spin, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  calculateCoupon,
  createOrder,
  getAddresses,
  getCart,
  myCoupons
} from '../api/portal'

const labelStyle: React.CSSProperties = { color: '#606266', marginRight: 8, whiteSpace: 'nowrap' }

export default function Checkout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [cartItemIds, setCartItemIds] = useState<number[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(undefined)
  const [memberCouponId, setMemberCouponId] = useState<number | undefined>(undefined)
  const [discount, setDiscount] = useState(0)
  const [receiver, setReceiver] = useState<any>({
    receiverName: '',
    receiverPhone: '',
    receiverProvince: '',
    receiverCity: '',
    receiverRegion: '',
    receiverDetailAddress: '',
    note: ''
  })

  const totalAmount = items.reduce((s, r) => s + Number(r.price) * r.quantity, 0)
  const payAmount = Math.max(0, totalAmount - discount)

  const setField = (key: string, value: string) => setReceiver((r: any) => ({ ...r, [key]: value }))

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const ids: number[] = JSON.parse(localStorage.getItem('checkout_items') || '[]')
        if (!ids.length) {
          message.warning('请先在购物车选择商品')
          navigate('/cart', { replace: true })
          return
        }
        setCartItemIds(ids)
        const [cart, addr, cou] = await Promise.all([
          getCart(),
          getAddresses(),
          myCoupons({ useStatus: 0 })
        ])
        setItems((cart.data || []).filter((c: any) => ids.includes(c.id)))
        setAddresses(addr.data || [])
        setCoupons(cou.data || [])
        const def = (addr.data || [])[0]
        if (def) {
          setSelectedAddressId(def.id)
          applyAddress(def.id, addr.data || [])
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const applyAddress = (id: number, list = addresses) => {
    const a = list.find((x) => x.id === id)
    if (!a) return
    setReceiver((r: any) => ({
      ...r,
      receiverName: a.name,
      receiverPhone: a.phoneNumber,
      receiverProvince: a.province,
      receiverCity: a.city,
      receiverRegion: a.region,
      receiverDetailAddress: a.detailAddress
    }))
  }

  const calc = async (id?: number) => {
    setDiscount(0)
    if (!id) return
    const r = await calculateCoupon({ memberCouponId: id, totalAmount })
    setDiscount(Number(r.data) || 0)
  }

  const submit = async () => {
    if (!receiver.receiverName || !receiver.receiverPhone || !receiver.receiverDetailAddress) {
      message.warning('请完善收货信息')
      return
    }
    setSubmitting(true)
    try {
      await createOrder({ cartItemIds, couponId: memberCouponId, ...receiver })
      message.success('下单成功，请前往我的订单完成后续流程')
      localStorage.removeItem('checkout_items')
      navigate('/orders')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Spin spinning={loading}>
      <Card title={<b>确认订单</b>}>
        <h4 style={{ margin: '4px 0 12px' }}>收货地址</h4>
        <Radio.Group
          value={selectedAddressId}
          onChange={(e) => {
            setSelectedAddressId(e.target.value)
            applyAddress(e.target.value)
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
        >
          {addresses.map((a) => (
            <Radio key={a.id} value={a.id} style={{ border: '1px solid #dcdfe6', borderRadius: 6, padding: '8px 12px' }}>
              {a.name} {a.phoneNumber} ｜ {a.province}
              {a.city}
              {a.region}
              {a.detailAddress}
            </Radio>
          ))}
          {!addresses.length && <span style={{ color: '#909399', fontSize: 13 }}>暂无地址，可在下方手动填写</span>}
        </Radio.Group>

        <div style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>收货人</span>
                <Input value={receiver.receiverName} onChange={(e) => setField('receiverName', e.target.value)} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>电话</span>
                <Input value={receiver.receiverPhone} onChange={(e) => setField('receiverPhone', e.target.value)} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>省</span>
                <Input value={receiver.receiverProvince} onChange={(e) => setField('receiverProvince', e.target.value)} />
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>市</span>
                <Input value={receiver.receiverCity} onChange={(e) => setField('receiverCity', e.target.value)} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>区</span>
                <Input value={receiver.receiverRegion} onChange={(e) => setField('receiverRegion', e.target.value)} />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={labelStyle}>详细地址</span>
                <Input
                  value={receiver.receiverDetailAddress}
                  onChange={(e) => setField('receiverDetailAddress', e.target.value)}
                />
              </div>
            </Col>
          </Row>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={labelStyle}>备注</span>
            <Input value={receiver.note} onChange={(e) => setField('note', e.target.value)} />
          </div>
        </div>

        <h4 style={{ margin: '20px 0 12px' }}>商品清单</h4>
        <Table
          rowKey="id"
          bordered
          pagination={false}
          dataSource={items}
          columns={[
            { title: '商品', dataIndex: 'productName' },
            { title: '单价', dataIndex: 'price', width: 120, render: (v: any) => `￥${v}` },
            { title: '数量', dataIndex: 'quantity', width: 90 },
            {
              title: '小计',
              key: 'subtotal',
              width: 120,
              render: (_: any, row: any) => `￥${(Number(row.price) * row.quantity).toFixed(2)}`
            }
          ]}
        />

        <h4 style={{ margin: '20px 0 12px' }}>优惠券</h4>
        <Select
          placeholder="不使用优惠券"
          allowClear
          style={{ width: 400 }}
          value={memberCouponId}
          onChange={(v) => {
            setMemberCouponId(v)
            calc(v)
          }}
          options={coupons.map((c) => ({
            label: `${c.name}（${
              c.type === 1 ? (c.amount * 10).toFixed(1) + '折' : '减' + c.amount
            }，满${c.minPoint}可用）`,
            value: c.memberCouponId
          }))}
        />

        <div style={{ marginTop: 24, textAlign: 'right', lineHeight: 2, color: '#606266' }}>
          <div>商品总额：￥{totalAmount.toFixed(2)}</div>
          <div>
            优惠金额：<span style={{ color: '#67c23a' }}>- ￥{discount.toFixed(2)}</span>
          </div>
          <div>
            应付：
            <span style={{ color: '#f56c6c', fontSize: 24, fontWeight: 700 }}>￥{payAmount.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button size="large" onClick={() => navigate('/cart')}>
            返回购物车
          </Button>
          <Button type="primary" danger size="large" loading={submitting} onClick={submit}>
            提交订单
          </Button>
        </div>
      </Card>
    </Spin>
  )
}
